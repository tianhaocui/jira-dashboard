// Vercel Serverless Function for Jira Proxy
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', 'https://tianhaocui.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, User-Agent, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求 - 直接返回，不代理到Jira
  if (req.method === 'OPTIONS') {
    console.log('处理OPTIONS预检请求');
    res.status(200).json({ message: 'CORS preflight OK' });
    return;
  }

  // 获取路径参数
  const { path } = req.query;
  let targetPath = '';
  
  if (path) {
    if (Array.isArray(path)) {
      targetPath = `/${path.join('/')}`;
    } else {
      targetPath = `/${path}`;
    }
  }
  
  const targetUrl = `https://jira.logisticsteam.com/rest${targetPath}`;
  
  console.log(`代理请求: ${req.method} ${targetUrl}`);
  console.log('请求头:', req.headers);

  try {
    // 构建请求头，确保传递认证信息
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || 'application/json',
      'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy/1.0'
    };

    // 传递Authorization头
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
      console.log('传递认证头:', req.headers.authorization.substring(0, 20) + '...');
    } else {
      console.log('⚠️ 警告: 没有找到Authorization头');
    }

    console.log('所有请求头:', Object.keys(req.headers));

    // 构建请求选项
    const options = {
      method: req.method,
      headers: headers,
    };

    // 如果有请求体，添加到选项中
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    console.log('发送请求到:', targetUrl);
    console.log('请求选项:', { method: options.method, headers: Object.keys(options.headers) });

    // 发送请求到Jira
    const response = await fetch(targetUrl, options);
    
    console.log('Jira响应状态:', response.status);
    console.log('Jira响应头:', Object.fromEntries(response.headers.entries()));

    // 获取响应数据
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 设置响应状态
    res.status(response.status);
    
    // 复制重要的响应头
    const headersToForward = ['content-type', 'cache-control', 'etag'];
    headersToForward.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    });

    // 返回响应数据
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('代理错误:', error);
    res.status(500).json({ 
      error: '代理服务器错误', 
      message: error.message,
      targetUrl: targetUrl
    });
  }
}