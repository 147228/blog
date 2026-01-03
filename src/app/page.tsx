import Link from 'next/link'
import prisma from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getPosts() {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      author: {
        select: { name: true },
      },
      category: {
        select: { name: true, slug: true },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 10,
  })
}

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            {process.env.NEXT_PUBLIC_SITE_NAME || '147227 CMS'}
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary-600 transition-colors">
              首页
            </Link>
            <Link href="/posts" className="text-sm hover:text-primary-600 transition-colors">
              文章
            </Link>
            <Link
              href="/admin"
              className="text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              管理后台
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            欢迎来到 147227 CMS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            一个现代化的内容管理系统，基于 Next.js 14 + Prisma + Tailwind CSS 构建
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">最新文章</h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>暂无文章</p>
              <Link href="/admin" className="text-primary-600 hover:underline mt-2 inline-block">
                去后台创建第一篇文章 →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/posts/${post.slug}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                    {post.category && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/categories/${post.category.slug}`}
                          className="text-primary-600 hover:underline"
                        >
                          {post.category.name}
                        </Link>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 text-primary-600 hover:underline"
              >
                查看所有文章 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Next.js
            </a>{' '}
            +{' '}
            <a
              href="https://www.prisma.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Prisma
            </a>{' '}
            +{' '}
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Tailwind CSS
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
