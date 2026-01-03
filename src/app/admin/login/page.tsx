'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '../actions'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await loginAction(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('登录成功')
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-600 mb-2">147227 CMS</h1>
            <p className="text-muted-foreground">登录管理后台</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">邮箱地址</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>默认账号: admin@example.com</p>
            <p>默认密码: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
