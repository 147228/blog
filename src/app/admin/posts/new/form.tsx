'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPostAction } from '../../actions'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Props {
  categories: { id: string; name: string }[]
  authorId: string
}

export default function NewPostForm({ categories, authorId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    // 自动生成 slug (如果用户没有手动修改过)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('authorId', authorId)

    const result = await createPostAction(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('文章创建成功')
      router.push('/admin/posts')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">写新文章</h1>
            <p className="text-muted-foreground">创建一篇新的文章</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            name="status"
            value="DRAFT"
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            保存草稿
          </button>
          <button
            type="submit"
            name="status"
            value="PUBLISHED"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            发布文章
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">文章标题</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="输入文章标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL 别名</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/posts/</span>
                  <input
                    type="text"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="flex-1 px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="url-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">文章内容</label>
                <textarea
                  name="content"
                  required
                  rows={20}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  placeholder="支持 HTML 格式..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-medium mb-4">文章设置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <select
                  name="categoryId"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">无分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">摘要</label>
                <textarea
                  name="excerpt"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="文章简短描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">特色图片 URL</label>
                <input
                  type="url"
                  name="featuredImage"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-medium mb-4">SEO 设置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SEO 标题</label>
                <input
                  type="text"
                  name="seoTitle"
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="留空使用文章标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SEO 描述</label>
                <textarea
                  name="seoDesc"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="留空使用摘要"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
