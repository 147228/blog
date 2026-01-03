export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 登录页面不使用管理后台的布局
  return children
}
