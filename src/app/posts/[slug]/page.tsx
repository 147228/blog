import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { name: true, avatar: true } },
      category: { select: { name: true, slug: true } },
      tags: {
        include: { tag: { select: { name: true, slug: true } } },
      },
    },
  })
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: '文章未找到' }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // 增加浏览量
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
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
          </nav>
        </div>
      </header>

      {/* Article */}
      <article className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{post.author.name}</span>
              </div>
              {post.publishedAt && (
                <>
                  <span>·</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </>
              )}
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
              <span>·</span>
              <span>{post.viewCount} 次阅读</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary-100 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Link href="/posts" className="text-primary-600 hover:underline">
            ← 返回文章列表
          </Link>
        </div>
      </footer>
    </div>
  )
}
