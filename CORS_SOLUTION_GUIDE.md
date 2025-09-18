# CORS 解决方案指南

## 问题描述
由于浏览器的同源策略，前端应用无法直接访问 `https://jira.logisticsteam.com` 的API，会出现CORS错误。

## 解决方案

### 方案1：浏览器扩展（推荐用于开发测试）
安装CORS浏览器扩展来临时禁用CORS检查：

**Chrome:**
- [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
- [Allow CORS](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

**Safari:**
- 开发菜单 > 禁用跨域限制

**使用步骤：**
1. 安装扩展
2. 启用扩展
3. 刷新页面
4. 尝试登录

### 方案2：Chrome 启动参数（临时解决）
使用特殊参数启动Chrome来禁用安全检查：

```bash
# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security --disable-features=VizDisplayCompositor

# Windows
chrome.exe --user-data-dir="c:/temp/chrome_dev_test" --disable-web-security --disable-features=VizDisplayCompositor
```

### 方案3：代理服务器（生产环境推荐）
在生产环境中，需要配置反向代理：

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass https://jira.logisticsteam.com/rest/;
        proxy_set_header Host jira.logisticsteam.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    location / {
        root /path/to/your/built/react/app;
        try_files $uri $uri/ /index.html;
    }
}
```

### 方案4：开发代理（当前尝试的方案）
React开发服务器的代理配置（在 `src/setupProxy.js` 中）：

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/rest',
    createProxyMiddleware({
      target: 'https://jira.logisticsteam.com',
      changeOrigin: true,
      secure: false,
    })
  );
};
```

## 当前状态
- 代理配置已设置但可能未正确工作
- 建议先使用**方案1（浏览器扩展）**进行测试
- 确认功能正常后再解决代理问题

## 测试步骤
1. 安装CORS扩展
2. 启用扩展
3. 访问 http://localhost:3003/jira-dashboard
4. 尝试登录测试

## 注意事项
- 浏览器扩展方案仅用于开发测试
- 生产环境必须使用代理服务器方案
- 不要在生产环境中禁用CORS检查
