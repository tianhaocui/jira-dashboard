# 🚀 Vercel代理服务器部署指南

## ❌ GitHub Pages不支持代理服务器
GitHub Pages只能托管静态文件，不能运行Node.js代理服务器。

## ✅ 使用Vercel（完全免费）

### 📋 部署步骤：

#### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录Vercel
```bash
vercel login
```

#### 3. 部署项目
```bash
# 在项目根目录下
vercel --prod
```

#### 4. 记录部署URL
部署成功后，Vercel会给你一个URL，比如：
```
https://jira-dashboard-abc123.vercel.app
```

#### 5. 更新前端配置
修改 `src/config/api.js` 中的代理URL：
```javascript
{
  name: 'Vercel代理服务器',
  url: 'https://你的实际URL.vercel.app/api/proxy',
  description: 'Vercel部署的代理服务器'
}
```

#### 6. 重新部署前端
```bash
npm run build
git add .
git commit -m "Update proxy URL"
git push origin main
```

### 🎯 优势：

✅ **完全免费** - Vercel免费套餐足够使用  
✅ **自动HTTPS** - 安全连接  
✅ **全球CDN** - 访问速度快  
✅ **自动部署** - 连接GitHub自动更新  
✅ **无服务器** - 按需运行，无需管理服务器

### 🔧 测试：

部署后访问：`https://你的URL.vercel.app/api/health`

应该返回：
```json
{
  "status": "ok",
  "message": "Jira代理服务器运行中 (Vercel)",
  "timestamp": "2025-01-XX..."
}
```

### 💡 完整流程：

1. **部署代理** → Vercel
2. **获取URL** → 记录代理服务器地址  
3. **更新配置** → 修改前端代理URL
4. **重新部署** → GitHub Pages更新前端

**这样就能完全复制本地开发的成功体验！** 🎊
