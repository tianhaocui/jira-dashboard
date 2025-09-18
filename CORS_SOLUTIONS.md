# CORS 跨域问题解决方案

## 问题描述

当从 `http://localhost:3001` 访问 `https://jira.logisticsteam.com` 时，会遇到CORS（跨源资源共享）错误：

```
Failed to load resource: Origin http://localhost:3001 is not allowed by Access-Control-Allow-Origin
```

## 解决方案

### 方案一：开发环境代理（已实现）

项目已配置了开发环境代理，通过 `src/setupProxy.js` 文件：

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/rest', createProxyMiddleware({
    target: 'https://jira.logisticsteam.com',
    changeOrigin: true,
    secure: true
  }));
};
```

**优点**：
- 开发环境完美解决CORS问题
- 不需要修改Jira服务器配置
- 保持生产环境的安全性

**缺点**：
- 仅适用于开发环境

### 方案二：浏览器CORS扩展（临时方案）

安装浏览器扩展来禁用CORS检查：

**Chrome扩展**：
- "CORS Unblock"
- "Disable CORS"
- "CORS Toggle"

**使用步骤**：
1. 安装扩展
2. 启用扩展
3. 刷新页面

**优点**：
- 快速解决问题
- 不需要代码修改

**缺点**：
- 仅限开发测试
- 降低浏览器安全性
- 不适用于生产环境

### 方案三：Jira服务器CORS配置（推荐生产方案）

需要Jira管理员在服务器端配置CORS白名单。

**Jira 6.x配置方法**：

1. **通过Jira管理界面**：
   - 登录Jira管理后台
   - 进入 `System` → `General Configuration`
   - 添加 `CORS` 相关配置

2. **通过配置文件**：
   在 `$JIRA_HOME/conf/server.xml` 中添加：
   ```xml
   <filter>
     <filter-name>CorsFilter</filter-name>
     <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
     <init-param>
       <param-name>cors.allowed.origins</param-name>
       <param-value>https://yourdomain.github.io</param-value>
     </init-param>
     <init-param>
       <param-name>cors.allowed.methods</param-name>
       <param-value>GET,POST,HEAD,OPTIONS,PUT</param-value>
     </init-param>
   </filter>
   ```

**优点**：
- 生产环境可用
- 安全可控
- 支持多域名

**缺点**：
- 需要管理员权限
- 需要重启Jira服务

### 方案四：反向代理（生产环境）

在生产环境中使用Nginx等反向代理：

```nginx
server {
    listen 80;
    server_name your-dashboard.com;
    
    location /api/ {
        proxy_pass https://jira.logisticsteam.com/;
        proxy_set_header Host jira.logisticsteam.com;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**优点**：
- 生产环境完美解决
- 可以添加额外的安全层
- 支持负载均衡

**缺点**：
- 需要额外的服务器配置
- 增加部署复杂度

## 当前项目配置

### 开发环境
- 使用 `setupProxy.js` 代理配置
- API请求会自动代理到 `https://jira.logisticsteam.com`
- 无需额外配置

### 生产环境
- 需要配置CORS或反向代理
- 建议联系Jira管理员配置CORS白名单
- 或者使用CDN/反向代理服务

## 测试步骤

1. **启动开发服务器**：
   ```bash
   npm start
   ```

2. **检查代理是否工作**：
   - 打开浏览器开发者工具
   - 查看Network标签
   - API请求应该显示为 `localhost:3001/rest/api/2/...`

3. **测试登录**：
   - 输入Jira用户名和密码
   - 检查是否能成功连接

## 故障排除

### 代理不工作
1. 确认 `setupProxy.js` 文件存在
2. 重启开发服务器
3. 检查控制台是否有代理错误信息

### 认证失败
1. 确认用户名密码正确
2. 检查Jira服务器是否可访问
3. 确认Jira版本支持基本认证

### 网络错误
1. 检查网络连接
2. 确认Jira服务器地址正确
3. 检查防火墙设置

## 联系管理员

如需在生产环境部署，请联系Jira管理员：

1. **配置CORS白名单**：
   - 添加部署域名到CORS允许列表
   - 配置允许的HTTP方法和头部

2. **提供部署信息**：
   - 部署域名
   - 需要访问的API端点
   - 预期的用户群体

3. **安全考虑**：
   - 建议使用专门的服务账号
   - 配置适当的权限级别
   - 定期更新密码
