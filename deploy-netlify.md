# Netlify Functions 部署指南

## 1. 安装 Netlify CLI
```bash
npm install -g netlify-cli
```

## 2. 登录 Netlify
```bash
netlify login
```

## 3. 初始化项目
```bash
netlify init
```

## 4. 部署
```bash
netlify deploy --prod
```

## 5. 配置域名
部署成功后，Netlify会提供一个域名，类似：
`https://your-site-name.netlify.app`

## 6. 更新前端配置
将 `src/config/api.js` 中的 Netlify 代理 URL 更新为实际的域名。

## 文件结构
```
netlify/
  functions/
    jira-proxy.js    # 主要代理函数
    health.js        # 健康检查
netlify.toml         # Netlify 配置
```
