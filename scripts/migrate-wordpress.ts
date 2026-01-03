/**
 * WordPress 到新 CMS 数据迁移脚本
 *
 * 使用方法:
 * 1. 将 WordPress SQL 导出文件放到指定位置
 * 2. 运行: npm run migrate:wp
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// SQL 文件路径
const SQL_FILE = 'F:/kaifa/147227.xyz_bRmpz/147227.xyz/147227_2026-01-03_01-30-01_mysql_data.sql/147227_2026-01-03_01-30-01_mysql_data.sql'

interface WPPost {
  ID: number
  post_author: number
  post_date: string
  post_content: string
  post_title: string
  post_excerpt: string
  post_status: string
  post_name: string
  post_type: string
  post_parent: number
}

interface WPTerm {
  term_id: number
  name: string
  slug: string
  term_group: number
}

interface WPTermTaxonomy {
  term_taxonomy_id: number
  term_id: number
  taxonomy: string
  description: string
  parent: number
}

// 简单的 SQL INSERT 解析器
function parseInsertValues(sql: string, tableName: string): any[] {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES\\s*(.+?);`, 'gis')
  const results: any[] = []

  let match
  while ((match = regex.exec(sql)) !== null) {
    const valuesStr = match[1]
    // 解析 VALUES 中的每一行
    const rowMatches = valuesStr.matchAll(/\(([^)]+)\)/g)

    for (const rowMatch of rowMatches) {
      const values = parseRow(rowMatch[1])
      results.push(values)
    }
  }

  return results
}

function parseRow(row: string): string[] {
  const values: string[] = []
  let current = ''
  let inString = false
  let stringChar = ''
  let escaped = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      current += char
      continue
    }

    if (inString) {
      if (char === stringChar) {
        inString = false
      }
      current += char
    } else {
      if (char === "'" || char === '"') {
        inString = true
        stringChar = char
        current += char
      } else if (char === ',') {
        values.push(cleanValue(current.trim()))
        current = ''
      } else {
        current += char
      }
    }
  }

  if (current.trim()) {
    values.push(cleanValue(current.trim()))
  }

  return values
}

function cleanValue(value: string): string {
  if (value === 'NULL') return ''
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
  }
  return value
}

async function migrateCategories(sql: string) {
  console.log('📁 迁移分类...')

  // 解析 wp_terms 表
  const terms = parseInsertValues(sql, 'wp_terms')
  const termMap = new Map<number, WPTerm>()

  for (const row of terms) {
    termMap.set(parseInt(row[0]), {
      term_id: parseInt(row[0]),
      name: row[1],
      slug: row[2],
      term_group: parseInt(row[3]) || 0,
    })
  }

  // 解析 wp_term_taxonomy 表获取分类
  const taxonomies = parseInsertValues(sql, 'wp_term_taxonomy')

  for (const row of taxonomies) {
    const taxonomy: WPTermTaxonomy = {
      term_taxonomy_id: parseInt(row[0]),
      term_id: parseInt(row[1]),
      taxonomy: row[2],
      description: row[3] || '',
      parent: parseInt(row[4]) || 0,
    }

    if (taxonomy.taxonomy === 'category') {
      const term = termMap.get(taxonomy.term_id)
      if (term) {
        // 生成唯一 slug
        let slug = term.slug || `category-${term.term_id}`
        const existingBySlug = await prisma.category.findUnique({ where: { slug } })
        if (existingBySlug && existingBySlug.wpId !== term.term_id) {
          slug = `${slug}-${term.term_id}`
        }

        await prisma.category.upsert({
          where: { wpId: term.term_id },
          update: {
            name: term.name,
            slug: slug,
            description: taxonomy.description,
          },
          create: {
            name: term.name,
            slug: slug,
            description: taxonomy.description,
            wpId: term.term_id,
          },
        })
        console.log(`  ✓ 分类: ${term.name}`)
      }
    }
  }
}

async function migrateTags(sql: string) {
  console.log('🏷️ 迁移标签...')

  const terms = parseInsertValues(sql, 'wp_terms')
  const termMap = new Map<number, WPTerm>()

  for (const row of terms) {
    termMap.set(parseInt(row[0]), {
      term_id: parseInt(row[0]),
      name: row[1],
      slug: row[2],
      term_group: parseInt(row[3]) || 0,
    })
  }

  const taxonomies = parseInsertValues(sql, 'wp_term_taxonomy')

  for (const row of taxonomies) {
    const taxonomy = row[2]
    if (taxonomy === 'post_tag') {
      const termId = parseInt(row[1])
      const term = termMap.get(termId)
      if (term) {
        // 生成唯一 slug
        let slug = term.slug || `tag-${term.term_id}`
        const existingBySlug = await prisma.tag.findUnique({ where: { slug } })
        if (existingBySlug && existingBySlug.wpId !== term.term_id) {
          slug = `${slug}-${term.term_id}`
        }

        await prisma.tag.upsert({
          where: { wpId: term.term_id },
          update: {
            name: term.name,
            slug: slug,
          },
          create: {
            name: term.name,
            slug: slug,
            wpId: term.term_id,
          },
        })
        console.log(`  ✓ 标签: ${term.name}`)
      }
    }
  }
}

async function migratePosts(sql: string, authorId: string) {
  console.log('📝 迁移文章...')

  const posts = parseInsertValues(sql, 'wp_posts')
  let count = 0

  for (const row of posts) {
    const postType = row[20] // post_type
    const postStatus = row[7] // post_status

    // 只迁移已发布的文章和页面
    if (postType === 'post' && (postStatus === 'publish' || postStatus === 'draft')) {
      const wpPost: WPPost = {
        ID: parseInt(row[0]),
        post_author: parseInt(row[1]),
        post_date: row[2],
        post_content: row[4],
        post_title: row[5],
        post_excerpt: row[6],
        post_status: postStatus,
        post_name: row[13],
        post_type: postType,
        post_parent: parseInt(row[17]) || 0,
      }

      // 跳过空标题或修订版本
      if (!wpPost.post_title || wpPost.post_title.startsWith('Auto Draft')) {
        continue
      }

      // 生成唯一 slug
      let slug = wpPost.post_name || `post-${wpPost.ID}`
      const existingBySlug = await prisma.post.findUnique({ where: { slug } })
      if (existingBySlug && existingBySlug.wpId !== wpPost.ID) {
        slug = `${slug}-${wpPost.ID}`
      }

      const status = wpPost.post_status === 'publish' ? 'PUBLISHED' : 'DRAFT'

      await prisma.post.upsert({
        where: { wpId: wpPost.ID },
        update: {
          title: wpPost.post_title,
          content: wpPost.post_content,
          excerpt: wpPost.post_excerpt || null,
          status: status,
          slug: slug,
          publishedAt: wpPost.post_status === 'publish' ? new Date(wpPost.post_date) : null,
        },
        create: {
          title: wpPost.post_title,
          slug: slug,
          content: wpPost.post_content,
          excerpt: wpPost.post_excerpt || null,
          status: status,
          authorId: authorId,
          wpId: wpPost.ID,
          publishedAt: wpPost.post_status === 'publish' ? new Date(wpPost.post_date) : null,
          createdAt: new Date(wpPost.post_date),
        },
      })

      count++
      if (count % 10 === 0) {
        console.log(`  已迁移 ${count} 篇文章...`)
      }
    }
  }

  console.log(`  ✓ 共迁移 ${count} 篇文章`)
}

async function migratePages(sql: string, authorId: string) {
  console.log('📄 迁移页面...')

  const posts = parseInsertValues(sql, 'wp_posts')
  let count = 0

  for (const row of posts) {
    const postType = row[20]
    const postStatus = row[7]

    if (postType === 'page' && (postStatus === 'publish' || postStatus === 'draft')) {
      const wpPost = {
        ID: parseInt(row[0]),
        post_date: row[2],
        post_content: row[4],
        post_title: row[5],
        post_status: postStatus,
        post_name: row[13],
        menu_order: parseInt(row[19]) || 0,
      }

      if (!wpPost.post_title) continue

      // 生成唯一 slug
      let slug = wpPost.post_name || `page-${wpPost.ID}`
      const existingBySlug = await prisma.page.findUnique({ where: { slug } })
      if (existingBySlug && existingBySlug.wpId !== wpPost.ID) {
        slug = `${slug}-${wpPost.ID}`
      }

      const status = wpPost.post_status === 'publish' ? 'PUBLISHED' : 'DRAFT'

      await prisma.page.upsert({
        where: { wpId: wpPost.ID },
        update: {
          title: wpPost.post_title,
          content: wpPost.post_content,
          status: status,
          slug: slug,
        },
        create: {
          title: wpPost.post_title,
          slug: slug,
          content: wpPost.post_content,
          status: status,
          menuOrder: wpPost.menu_order,
          wpId: wpPost.ID,
          createdAt: new Date(wpPost.post_date),
        },
      })

      count++
    }
  }

  console.log(`  ✓ 共迁移 ${count} 个页面`)
}

async function createDefaultAdmin() {
  console.log('👤 创建管理员账号...')

  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '管理员',
      role: 'ADMIN',
    },
  })

  console.log(`  ✓ 管理员: admin@example.com / admin123`)
  console.log(`  ⚠️ 请登录后立即修改密码!`)

  return admin.id
}

async function createDefaultSettings() {
  console.log('⚙️ 创建默认设置...')

  const settings = [
    { key: 'site_name', value: '147227 CMS', type: 'string' },
    { key: 'site_description', value: '现代化内容管理系统', type: 'string' },
    { key: 'posts_per_page', value: '10', type: 'number' },
    { key: 'date_format', value: 'YYYY-MM-DD', type: 'string' },
    { key: 'timezone', value: 'Asia/Shanghai', type: 'string' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    })
    console.log(`  ✓ ${setting.key}: ${setting.value}`)
  }
}

async function main() {
  console.log('🚀 开始 WordPress 数据迁移...\n')

  try {
    // 检查 SQL 文件是否存在
    if (!fs.existsSync(SQL_FILE)) {
      console.log(`❌ 找不到 SQL 文件: ${SQL_FILE}`)
      console.log('请修改脚本中的 SQL_FILE 路径')
      process.exit(1)
    }

    console.log(`📂 读取 SQL 文件: ${SQL_FILE}`)
    const sql = fs.readFileSync(SQL_FILE, 'utf-8')
    console.log(`   文件大小: ${(sql.length / 1024).toFixed(2)} KB\n`)

    // 创建管理员
    const adminId = await createDefaultAdmin()
    console.log('')

    // 创建默认设置
    await createDefaultSettings()
    console.log('')

    // 迁移分类
    await migrateCategories(sql)
    console.log('')

    // 迁移标签
    await migrateTags(sql)
    console.log('')

    // 迁移文章
    await migratePosts(sql, adminId)
    console.log('')

    // 迁移页面
    await migratePages(sql, adminId)
    console.log('')

    console.log('✅ 迁移完成!')
    console.log('')
    console.log('下一步:')
    console.log('1. 运行 npm run dev 启动开发服务器')
    console.log('2. 访问 http://localhost:3000/admin 登录后台')
    console.log('3. 使用 admin@example.com / admin123 登录')
    console.log('4. 立即修改管理员密码!')

  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
