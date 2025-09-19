// Vercel Serverless Function for Jira Proxy
import { createProxyMiddleware } from 'http-proxy-middleware';

// 创建代理中间件
const proxy = createProxyMiddleware({
  target: 'https://jira.logisticsteam.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '', // 移除 /api/proxy 前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`代理请求: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err.message);
    res.status(500).json({ error: '代理服务器错误' });
  }
});

export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', 'https://tianhaocui.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 构建目标URL
  const targetUrl = `https://jira.logisticsteam.com${req.url.replace('/api/proxy', '')}`;
  
  console.log(`代理请求: ${req.method} ${targetUrl}`);

  // 使用代理中间件
  return proxy(req, res);
}
