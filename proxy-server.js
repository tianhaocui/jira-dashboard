const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));

// 代理所有/rest请求到Jira服务器
app.use('/rest', createProxyMiddleware({
  target: 'https://jira.logisticsteam.com',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 代理请求: ${req.method} ${req.url}`);
    console.log(`🎯 目标: https://jira.logisticsteam.com${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ 代理响应: ${proxyRes.statusCode} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ 代理错误:', err.message);
    res.status(500).send('代理错误: ' + err.message);
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 代理目标: https://jira.logisticsteam.com`);
  console.log(`🔧 使用方法: 将前端API baseURL设置为 http://localhost:${PORT}`);
});
