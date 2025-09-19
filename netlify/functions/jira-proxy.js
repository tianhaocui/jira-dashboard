// Netlify Function for Jira Proxy
exports.handler = async (event, context) => {
  console.log(`收到请求: ${event.httpMethod} ${event.path}`);
  console.log('查询参数:', event.queryStringParameters);
  console.log('请求头:', event.headers);

  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': 'https://tianhaocui.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, User-Agent, Cache-Control',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ 处理OPTIONS预检请求');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight OK' })
    };
  }

  try {
    // 获取路径参数
    const { path } = event.queryStringParameters || {};
    let targetPath = '';
    
    if (path) {
      targetPath = `/${path}`;
    }
    
    const targetUrl = `https://jira.logisticsteam.com/rest${targetPath}`;
    console.log(`代理请求到: ${targetUrl}`);

    // 构建请求头
    const requestHeaders = {
      'Content-Type': event.headers['content-type'] || 'application/json',
      'Accept': event.headers['accept'] || 'application/json',
      'User-Agent': event.headers['user-agent'] || 'Netlify-Proxy/1.0'
    };

    // 传递Authorization头
    if (event.headers.authorization) {
      requestHeaders.Authorization = event.headers.authorization;
      console.log('传递认证头:', event.headers.authorization.substring(0, 20) + '...');
    } else {
      console.log('⚠️ 警告: 没有找到Authorization头');
    }

    // 构建请求选项
    const requestOptions = {
      method: event.httpMethod,
      headers: requestHeaders,
    };

    // 如果有请求体，添加到选项中
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
      requestOptions.body = event.body;
    }

    console.log('发送请求选项:', { method: requestOptions.method, headers: Object.keys(requestOptions.headers) });

    // 发送请求到Jira
    const response = await fetch(targetUrl, requestOptions);
    
    console.log('Jira响应状态:', response.status);

    // 获取响应数据
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 返回响应
    return {
      statusCode: response.status,
      headers,
      body: typeof data === 'object' ? JSON.stringify(data) : data
    };

  } catch (error) {
    console.error('代理错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '代理服务器错误', 
        message: error.message 
      })
    };
  }
};
