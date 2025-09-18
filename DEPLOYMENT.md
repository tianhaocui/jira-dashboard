# 部署指南

## GitHub Pages 部署

### 方法一：自动部署（推荐）

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库 jira-dashboard
   # 然后在本地初始化 git
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/jira-dashboard.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库设置 (Settings)
   - 滚动到 Pages 部分
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages"
   - 点击 Save

3. **配置自动部署**
   - 项目已包含 `.github/workflows/deploy.yml`
   - 每次推送到 main 分支会自动触发部署
   - 部署完成后可通过 `https://yourusername.github.io/jira-dashboard` 访问

### 方法二：手动部署

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **更新 package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/jira-dashboard",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **执行部署**
   ```bash
   npm run deploy
   ```

## 其他部署平台

### Vercel 部署

1. 安装 Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. 登录并部署
   ```bash
   vercel login
   vercel --prod
   ```

### Netlify 部署

1. 构建项目
   ```bash
   npm run build
   ```

2. 将 `build` 文件夹拖拽到 Netlify 部署页面

### 自托管部署

1. 构建生产版本
   ```bash
   npm run build
   ```

2. 将 `build` 文件夹内容上传到 Web 服务器

3. 配置 Web 服务器支持 SPA 路由（可选）

## 环境变量配置

### 开发环境

创建 `.env.local` 文件：
```bash
REACT_APP_JIRA_BASE_URL=https://your-company.atlassian.net
REACT_APP_JIRA_USER=your-email@example.com
REACT_APP_JIRA_API_TOKEN=your-api-token
```

### 生产环境

#### GitHub Pages
- 在仓库 Settings → Secrets and variables → Actions 中添加：
  - `REACT_APP_JIRA_BASE_URL`
  - `REACT_APP_JIRA_USER` 
  - `REACT_APP_JIRA_API_TOKEN`

#### Vercel
```bash
vercel env add REACT_APP_JIRA_BASE_URL
vercel env add REACT_APP_JIRA_USER
vercel env add REACT_APP_JIRA_API_TOKEN
```

#### Netlify
- 在 Site settings → Environment variables 中添加环境变量

## 安全考虑

### 1. API Token 安全
- 使用专门的只读 API Token
- 定期轮换 Token
- 不要在代码中硬编码敏感信息

### 2. CORS 配置
如果遇到 CORS 问题，可以：
- 使用 Jira 的 CORS 白名单功能
- 部署到与 Jira 相同的域名下
- 使用代理服务器

### 3. 访问控制
- 考虑在 Web 服务器层面添加访问控制
- 使用 HTTPS 确保数据传输安全

## 性能优化

### 1. 构建优化
```bash
# 生产构建时禁用 source map
GENERATE_SOURCEMAP=false npm run build
```

### 2. 缓存策略
- 配置适当的 HTTP 缓存头
- 使用 CDN 加速静态资源

### 3. 代码分割
项目已配置 React 的代码分割，会自动优化加载性能。

## 监控和维护

### 1. 错误监控
可以集成 Sentry 等错误监控服务：
```bash
npm install @sentry/react @sentry/tracing
```

### 2. 性能监控
使用 Web Vitals 监控页面性能：
```javascript
// 在 src/index.js 中
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. 定期更新
- 定期更新依赖包
- 关注安全漏洞通知
- 测试新版本兼容性

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖都已安装
   - 查看构建日志中的错误信息

2. **页面空白**
   - 检查 `homepage` 配置是否正确
   - 确认路由配置
   - 查看浏览器控制台错误

3. **API 连接失败**
   - 验证 Jira 服务器地址
   - 检查 API Token 有效性
   - 确认网络连接和 CORS 设置

### 调试技巧

1. **本地调试**
   ```bash
   # 使用生产构建本地测试
   npm run build
   npx serve -s build
   ```

2. **网络调试**
   - 使用浏览器开发者工具查看网络请求
   - 检查 API 响应状态和内容

3. **日志分析**
   - 查看浏览器控制台日志
   - 分析服务器访问日志
