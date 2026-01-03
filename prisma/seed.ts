import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始初始化数据库...\n')

  // 创建管理员账号
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

  console.log('✓ 管理员账号已创建:')
  console.log('  邮箱: admin@example.com')
  console.log('  密码: admin123')
  console.log('')

  // 创建默认分类
  const defaultCategory = await prisma.category.upsert({
    where: { slug: 'uncategorized' },
    update: {},
    create: {
      name: '未分类',
      slug: 'uncategorized',
      description: '默认分类',
    },
  })

  console.log('✓ 默认分类已创建: 未分类')

  // 创建示例文章
  await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: '欢迎使用 147227 CMS',
      slug: 'hello-world',
      content: `
<p>欢迎使用 <strong>147227 CMS</strong> - 一个现代化的内容管理系统！</p>

<h2>特性</h2>

<ul>
  <li>🚀 基于 Next.js 14 App Router</li>
  <li>🎨 Tailwind CSS 样式</li>
  <li>📦 Prisma ORM 数据库</li>
  <li>🔐 JWT 身份认证</li>
  <li>📱 完全响应式设计</li>
  <li>🌙 支持暗色模式</li>
</ul>

<h2>快速开始</h2>

<ol>
  <li>登录管理后台: <code>/admin</code></li>
  <li>使用默认账号登录</li>
  <li>开始创建您的内容</li>
</ol>

<blockquote>
  <p>提示: 请及时修改默认管理员密码!</p>
</blockquote>

<h2>技术栈</h2>

<p>本项目采用了最新的前端技术栈:</p>

<pre><code>
Next.js 14
React 18
Tailwind CSS 3
Prisma 5
TypeScript 5
</code></pre>

<p>祝您使用愉快! 🎉</p>
      `.trim(),
      excerpt: '欢迎使用 147227 CMS - 一个基于 Next.js 的现代化内容管理系统。',
      status: 'PUBLISHED',
      authorId: admin.id,
      categoryId: defaultCategory.id,
      publishedAt: new Date(),
    },
  })

  console.log('✓ 示例文章已创建: 欢迎使用 147227 CMS')

  // 创建默认设置
  const settings = [
    { key: 'site_name', value: '147227 CMS', type: 'string' },
    { key: 'site_description', value: '现代化内容管理系统', type: 'string' },
    { key: 'posts_per_page', value: '10', type: 'number' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✓ 默认设置已创建')
  console.log('')
  console.log('🎉 数据库初始化完成!')
  console.log('')
  console.log('下一步:')
  console.log('  1. 运行 npm run dev 启动开发服务器')
  console.log('  2. 访问 http://localhost:3000')
  console.log('  3. 访问 http://localhost:3000/admin 登录后台')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
