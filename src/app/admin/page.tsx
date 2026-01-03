import prisma from '@/lib/db'
import Link from 'next/link'
import { FileText, FolderOpen, Tags, Eye, TrendingUp } from 'lucide-react'

async function getStats() {
  const [postsCount, publishedCount, categoriesCount, tagsCount, totalViews] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
    ])

  return {
    postsCount,
    publishedCount,
    draftsCount: postsCount - publishedCount,
    categoriesCount,
    tagsCount,
    totalViews: totalViews._sum.viewCount || 0,
  }
}

async function getRecentPosts() {
  return prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewCount: true,
      createdAt: true,
    },
  })
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentPosts = await getRecentPosts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">欢迎回来，这是您网站的概览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总文章"
          value={stats.postsCount}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="已发布"
          value={stats.publishedCount}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="分类"
          value={stats.categoriesCount}
          icon={FolderOpen}
          color="purple"
        />
        <StatCard
          title="总浏览"
          value={stats.totalViews}
          icon={Eye}
          color="orange"
        />
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近文章</h2>
          <Link
            href="/admin/posts"
            className="text-sm text-primary-600 hover:underline"
          >
            查看全部 →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>暂无文章</p>
            <Link
              href="/admin/posts/new"
              className="text-primary-600 hover:underline mt-2 inline-block"
            >
              创建第一篇文章 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium hover:text-primary-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.viewCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/posts/new"
          className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 transition-colors"
        >
          <FileText className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">写新文章</h3>
          <p className="text-sm opacity-80">创建一篇新的文章</p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border hover:border-primary-300 transition-colors"
        >
          <FolderOpen className="w-8 h-8 mb-3 text-primary-600" />
          <h3 className="font-semibold mb-1">管理分类</h3>
          <p className="text-sm text-muted-foreground">整理文章分类</p>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border hover:border-primary-300 transition-colors"
        >
          <Tags className="w-8 h-8 mb-3 text-primary-600" />
          <h3 className="font-semibold mb-1">网站设置</h3>
          <p className="text-sm text-muted-foreground">配置网站信息</p>
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
