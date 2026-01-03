import prisma from '@/lib/db'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { deletePostAction } from '../actions'

async function getPosts() {
  return prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="text-muted-foreground">管理您网站的所有文章</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          写新文章
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">暂无文章</p>
            <Link
              href="/admin/posts/new"
              className="text-primary-600 hover:underline"
            >
              创建第一篇文章 →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left px-6 py-4 font-medium">标题</th>
                <th className="text-left px-6 py-4 font-medium">作者</th>
                <th className="text-left px-6 py-4 font-medium">分类</th>
                <th className="text-left px-6 py-4 font-medium">状态</th>
                <th className="text-left px-6 py-4 font-medium">浏览</th>
                <th className="text-left px-6 py-4 font-medium">日期</th>
                <th className="text-right px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium hover:text-primary-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{post.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {post.author.name}
                  </td>
                  <td className="px-6 py-4">
                    {post.category ? (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {formatDateTime(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="查看"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <form
                        action={async () => {
                          'use server'
                          await deletePostAction(post.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="删除"
                          onClick={(e) => {
                            if (!confirm('确定要删除这篇文章吗？')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
