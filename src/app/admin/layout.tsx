import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { logoutAction } from './actions'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Image,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'

interface Props {
  children: React.ReactNode
}

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/posts', label: '文章', icon: FileText },
  { href: '/admin/categories', label: '分类', icon: FolderOpen },
  { href: '/admin/tags', label: '标签', icon: Tags },
  { href: '/admin/media', label: '媒体', icon: Image },
  { href: '/admin/settings', label: '设置', icon: Settings },
]

export default async function AdminLayout({ children }: Props) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r shadow-sm z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="text-xl font-bold text-primary-600">
            147227 CMS
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b flex items-center justify-between px-6">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            target="_blank"
            className="text-sm text-primary-600 hover:underline"
          >
            访问网站 →
          </Link>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
