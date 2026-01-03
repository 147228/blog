import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewPostForm from './form'

async function getCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export default async function NewPostPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const categories = await getCategories()

  return <NewPostForm categories={categories} authorId={user.id} />
}
