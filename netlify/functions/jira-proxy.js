// Netlify Function for Jira Proxy
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 使用Node.js原生模块发送HTTP请求
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // 如果有请求体，写入
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

exports.handler = async (event, context) => {
  console.log(`收到请求: ${event.httpMethod} ${event.path}`);
  console.log('查询参数:', event.queryStringParameters);

  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
      body: ''
    };
  }

  try {
    // 从查询参数或路径中获取目标路径
    const { path } = event.queryStringParameters || {};
    let targetPath = path;
    
    // 如果查询参数中没有路径，尝试从URL路径中提取
    if (!targetPath) {
      targetPath = event.path;
      const functionPrefix = '/.netlify/functions/jira-proxy';
      if (targetPath.startsWith(functionPrefix)) {
        targetPath = targetPath.substring(functionPrefix.length);
      }
    }
    
    // 确保路径以/开头
    if (targetPath && !targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }
    
    // 如果没有路径，默认为serverInfo
    if (!targetPath || targetPath === '/') {
      targetPath = '/rest/api/2/serverInfo';
    }
    
    const targetUrl = `https://jira.logisticsteam.com${targetPath}`;
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

    // 使用Node.js原生模块发送请求到Jira
    const response = await makeRequest(targetUrl, requestOptions);
    
    console.log('Jira响应状态:', response.statusCode);

    // 返回响应
    return {
      statusCode: response.statusCode,
      headers,
      body: response.body
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
