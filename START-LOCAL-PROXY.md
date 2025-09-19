# 🚀 本地代理启动指南

如果CORS扩展不工作，可以使用本地代理服务器。

## 启动步骤

### 1. 打开终端
- macOS: 按 `Cmd + Space`，输入 "Terminal"
- Windows: 按 `Win + R`，输入 "cmd"

### 2. 进入项目目录
```bash
cd /Users/wulingren/Desktop/jira-dashboard
```

### 3. 启动代理服务器
```bash
node proxy-server.js
```

看到以下信息说明启动成功：
```
🚀 Jira代理服务器启动在端口 3001
📡 代理目标: https://jira.logisticsteam.com
🌐 允许的源: https://tianhaocui.github.io
```

### 4. 保持终端运行
- **重要**: 不要关闭这个终端窗口
- 代理服务器需要一直运行

### 5. 访问应用
现在可以正常访问：
- GitHub Pages: https://tianhaocui.github.io/jira-dashboard
- 本地开发: http://localhost:3000/jira-dashboard

应用会自动检测并使用本地代理服务器。

## 停止代理
使用完毕后，在终端按 `Ctrl + C` 停止代理服务器。

## 故障排除

### 端口被占用
如果看到 "EADDRINUSE" 错误：
```bash
lsof -i :3001
kill -9 <PID>
```

### 权限问题
如果遇到权限错误，尝试：
```bash
sudo node proxy-server.js
```

### 网络问题
确保可以访问：
```bash
curl https://jira.logisticsteam.com/rest/api/2/serverInfo
```

