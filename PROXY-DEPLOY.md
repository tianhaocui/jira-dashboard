# 🚀 自建代理服务器部署指南

## 💡 为什么需要自建代理？

Jira服务器只允许 `logisticsteam.com` 域名的请求，拒绝所有第三方代理。
自建代理服务器可以完全模拟本地开发环境，实现：

```
GitHub Pages → 自建代理服务器 → Jira服务器
```

## 📋 部署步骤

### 1. 准备代理服务器文件
- `proxy-server.js` - 代理服务器代码
- `package-proxy.json` - 依赖配置

### 2. 部署到Heroku（推荐）

```bash
# 创建新的Heroku应用
heroku create your-jira-proxy

# 设置Node.js环境
echo 'web: node proxy-server.js' > Procfile

# 复制package.json
cp package-proxy.json package.json

# 部署
git add .
git commit -m "Deploy proxy server"
git push heroku main
```

### 3. 部署到Vercel（备选）

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 4. 更新前端配置

将 `src/config/api.js` 中的代理URL更新为你的服务器地址：

```javascript
{
  name: '自建代理服务器',
  url: 'https://your-actual-proxy-server.herokuapp.com',
  description: '自建代理服务器，完全模拟本地开发环境'
}
```

## 🎯 优势

✅ **完全模拟本地环境** - 服务器到服务器请求，无CORS限制  
✅ **最高成功率** - 绕过所有浏览器限制  
✅ **最佳性能** - 直接代理，无第三方依赖  
✅ **完全控制** - 可以自定义日志、错误处理等

## 🔧 测试

部署后访问：`https://your-proxy-server.herokuapp.com/health`

应该返回：
```json
{
  "status": "ok", 
  "message": "Jira代理服务器运行中"
}
```
