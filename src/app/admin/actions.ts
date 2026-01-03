'use server'

import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '请输入邮箱和密码' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: '用户不存在' }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { error: '密码错误' }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  revalidatePath('/admin')
  return { success: true }
}

export async function createPostAction(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED'
  const categoryId = formData.get('categoryId') as string
  const authorId = formData.get('authorId') as string

  if (!title || !slug || !content) {
    return { error: '请填写必要字段' }
  }

  // 检查 slug 是否已存在
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    return { error: '该 URL 别名已被使用' }
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      status,
      categoryId: categoryId || null,
      authorId,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  })

  revalidatePath('/admin/posts')
  revalidatePath('/')

  return { success: true, postId: post.id }
}

export async function updatePostAction(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED'
  const categoryId = formData.get('categoryId') as string

  if (!title || !slug || !content) {
    return { error: '请填写必要字段' }
  }

  // 检查 slug 是否已被其他文章使用
  const existing = await prisma.post.findFirst({
    where: { slug, NOT: { id } },
  })
  if (existing) {
    return { error: '该 URL 别名已被使用' }
  }

  const currentPost = await prisma.post.findUnique({ where: { id } })

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      status,
      categoryId: categoryId || null,
      publishedAt:
        status === 'PUBLISHED' && currentPost?.status !== 'PUBLISHED'
          ? new Date()
          : currentPost?.publishedAt,
    },
  })

  revalidatePath('/admin/posts')
  revalidatePath('/')
  revalidatePath(`/posts/${slug}`)

  return { success: true }
}

export async function deletePostAction(id: string) {
  await prisma.post.delete({ where: { id } })

  revalidatePath('/admin/posts')
  revalidatePath('/')

  return { success: true }
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string

  if (!name || !slug) {
    return { error: '请填写必要字段' }
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return { error: '该别名已被使用' }
  }

  await prisma.category.create({
    data: { name, slug, description: description || null },
  })

  revalidatePath('/admin/categories')

  return { success: true }
}
