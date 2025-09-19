// Netlify Function for Health Check
exports.handler = async (event, context) => {
  console.log(`健康检查请求: ${event.httpMethod} ${event.path}`);
  
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': 'https://tianhaocui.github.io',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ 健康检查OPTIONS预检请求');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      message: 'Jira代理服务器运行中 (Netlify)',
      timestamp: new Date().toISOString()
    })
  };
};
