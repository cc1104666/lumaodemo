# Cloudflare Pages 部署指南

## 1. 准备工作

### 安装 Wrangler CLI
\`\`\`bash
npm install -g wrangler
\`\`\`

### 登录 Cloudflare
\`\`\`bash
wrangler login
\`\`\`

## 2. 创建 D1 数据库

### 创建生产数据库
\`\`\`bash
wrangler d1 create anni-lumao-diary-db
\`\`\`

### 创建预览数据库
\`\`\`bash
wrangler d1 create anni-lumao-diary-db-preview
\`\`\`

### 更新 wrangler.toml
将创建数据库时返回的 database_id 填入 `wrangler.toml` 文件中。

## 3. 初始化数据库

### 执行 SQL 脚本
\`\`\`bash
# 生产环境
wrangler d1 execute anni-lumao-diary-db --file=./schema.sql

# 预览环境
wrangler d1 execute anni-lumao-diary-db-preview --file=./schema.sql
\`\`\`

## 4. 本地开发

### 启动本地开发服务器
\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器（使用本地 D1）
wrangler pages dev npm run dev --d1 DB=anni-lumao-diary-db
\`\`\`

## 5. 部署到 Cloudflare Pages

### 方法一：通过 Git 连接

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Dashboard 中：
   - 进入 Pages
   - 点击 "Create a project"
   - 连接 GitHub 仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Build output directory: `out`
   - 添加环境变量：
     - `CF_PAGES=1`
   - 绑定 D1 数据库

### 方法二：直接部署

\`\`\`bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy out --project-name=anni-lumao-diary
\`\`\`

## 6. 配置环境变量

在 Cloudflare Pages 项目设置中添加：
- `CF_PAGES=1`
- 其他必要的环境变量

## 7. 绑定 D1 数据库

在 Cloudflare Pages 项目设置中：
1. 进入 "Functions" 标签
2. 添加 D1 数据库绑定：
   - Variable name: `DB`
   - D1 database: 选择你创建的数据库

## 8. 自定义域名（可选）

在 Cloudflare Pages 项目设置中：
1. 进入 "Custom domains" 标签
2. 添加你的域名
3. 配置 DNS 记录

## 9. 数据库管理

### 查看数据库内容
\`\`\`bash
wrangler d1 execute anni-lumao-diary-db --command="SELECT * FROM records"
\`\`\`

### 备份数据库
\`\`\`bash
wrangler d1 export anni-lumao-diary-db --output=backup.sql
\`\`\`

### 恢复数据库
\`\`\`bash
wrangler d1 execute anni-lumao-diary-db --file=backup.sql
\`\`\`

## 10. 监控和日志

在 Cloudflare Dashboard 中：
- 查看 Pages 部署日志
- 监控 D1 数据库使用情况
- 查看 Functions 执行日志

## 费用说明

Cloudflare 免费计划包括：
- Pages: 无限静态请求
- D1: 每天 100,000 次读取，1,000 次写入
- Functions: 每天 100,000 次请求

对于个人项目来说，免费额度通常足够使用。

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 wrangler.toml 配置
   - 确认数据库绑定正确

2. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖已安装

3. **API 路由不工作**
   - 确认 Functions 已启用
   - 检查路由配置

### 调试命令

\`\`\`bash
# 查看本地 D1 数据库
wrangler d1 execute anni-lumao-diary-db --local --command="SELECT * FROM admin_config"

# 查看部署日志
wrangler pages deployment list

# 查看 Functions 日志
wrangler pages functions tail
