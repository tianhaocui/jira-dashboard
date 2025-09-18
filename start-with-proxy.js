#!/usr/bin/env node

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const app = express();
const PROXY_PORT = 3001;

console.log('🚀 启动Jira Dashboard代理服务器...');

// 设置CORS头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 代理所有/rest请求到Jira服务器
app.use('/rest', createProxyMiddleware({
  target: 'https://jira.logisticsteam.com',
  changeOrigin: true,
  secure: false,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 代理请求: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ 代理响应: ${proxyRes.statusCode} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ 代理错误:', err.message);
    res.status(500).send('代理错误');
  }
}));

// 启动代理服务器
app.listen(PROXY_PORT, () => {
  console.log(`✅ 代理服务器运行在 http://localhost:${PROXY_PORT}`);
  console.log(`📡 代理目标: https://jira.logisticsteam.com`);
  
  // 启动React应用
  console.log('🚀 启动React应用...');
  const reactApp = spawn('npm', ['start'], {
    stdio: 'inherit',
    env: { ...process.env, REACT_APP_API_BASE_URL: `http://localhost:${PROXY_PORT}` }
  });
  
  reactApp.on('close', (code) => {
    console.log(`React应用退出，代码: ${code}`);
    process.exit(code);
  });
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});
