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

export default async function handler(req, res) {
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

  // 获取路径参数
  const { path } = req.query;
  const targetPath = path ? `/${Array.isArray(path) ? path.join('/') : path}` : '';
  const targetUrl = `https://jira.logisticsteam.com/rest${targetPath}`;
  
  console.log(`代理请求: ${req.method} ${targetUrl}`);

  try {
    // 构建请求选项
    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'jira.logisticsteam.com',
      },
    };

    // 如果有请求体，添加到选项中
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    // 发送请求到Jira
    const response = await fetch(targetUrl, options);
    const data = await response.text();

    // 设置响应状态和头
    res.status(response.status);
    
    // 复制响应头
    response.headers.forEach((value, key) => {
      if (key !== 'access-control-allow-origin') {
        res.setHeader(key, value);
      }
    });

    // 返回响应数据
    res.send(data);
  } catch (error) {
    console.error('代理错误:', error);
    res.status(500).json({ error: '代理服务器错误', message: error.message });
  }
}
