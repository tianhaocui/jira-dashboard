const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS，允许GitHub Pages访问
app.use(cors({
  origin: [
    'https://tianhaocui.github.io',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

// 代理所有/rest请求到Jira服务器
app.use('/rest', createProxyMiddleware({
  target: 'https://jira.logisticsteam.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`代理请求: ${req.method} ${req.url} -> https://jira.logisticsteam.com${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`代理响应: ${proxyRes.statusCode} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err.message);
    res.status(500).json({ error: '代理服务器错误' });
  }
}));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jira代理服务器运行中' });
});

app.listen(PORT, () => {
  console.log(`🚀 Jira代理服务器启动在端口 ${PORT}`);
  console.log(`📡 代理目标: https://jira.logisticsteam.com`);
  console.log(`🌐 允许的源: https://tianhaocui.github.io`);
});