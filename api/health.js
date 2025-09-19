// 健康检查端点
export default function handler(req, res) {
  console.log(`健康检查请求: ${req.method} ${req.url}`);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', 'https://tianhaocui.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ 健康检查OPTIONS预检请求');
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'ok',
    message: 'Jira代理服务器运行中 (Vercel)',
    timestamp: new Date().toISOString()
  });
}
