# 147227 CMS

一个现代化的内容管理系统，基于 Next.js 14 + Prisma + Tailwind CSS 构建。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **样式**: Tailwind CSS
- **认证**: JWT
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库并初始化数据
npx prisma db push
npm run db:seed
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 登录管理后台

访问 http://localhost:3000/admin

默认账号:
- 邮箱: `admin@example.com`
- 密码: `admin123`

⚠️ **请及时修改默认密码!**

## 从 WordPress 迁移数据

1. 将 WordPress SQL 导出文件放到项目目录
2. 修改 `scripts/migrate-wordpress.ts` 中的 `SQL_FILE` 路径
3. 运行迁移:

```bash
npm run migrate:wp
```

## 项目结构

```
147227-cms/
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.ts            # 初始化数据
├── scripts/
│   └── migrate-wordpress.ts   # WordPress 迁移脚本
├── src/
│   ├── app/
│   │   ├── admin/         # 管理后台
│   │   ├── posts/         # 文章页面
│   │   ├── layout.tsx     # 根布局
│   │   └── page.tsx       # 首页
│   └── lib/
│       ├── auth.ts        # 认证工具
│       ├── db.ts          # 数据库连接
│       └── utils.ts       # 通用工具
├── .env                   # 环境变量
└── package.json
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 设置环境变量:
   - `DATABASE_URL`: 数据库连接字符串 (推荐使用 Vercel Postgres 或 PlanetScale)
   - `JWT_SECRET`: JWT 密钥 (使用强随机字符串)
   - `NEXT_PUBLIC_SITE_URL`: 网站 URL
   - `NEXT_PUBLIC_SITE_NAME`: 网站名称
4. 部署

## 生产环境数据库

建议使用:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [PlanetScale](https://planetscale.com/)
- [Supabase](https://supabase.com/)

修改 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

## License

MIT
