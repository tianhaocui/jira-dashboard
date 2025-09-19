const axios = require('axios');

// 测试本地代理服务器
async function testLocalProxy() {
  console.log('🔍 测试本地代理服务器...');
  
  try {
    // 测试健康检查
    console.log('1. 测试健康检查端点...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 健康检查成功:', healthResponse.data);
    
    // 测试认证
    console.log('2. 测试Jira认证...');
    const authResponse = await axios.get('http://localhost:3001/rest/api/2/myself', {
      headers: {
        'Authorization': 'Basic dGlhbmhhby5jdWlAaXRlbS5jb206V3VsaW5nQHJlbg==',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ 认证成功:', authResponse.data.displayName);
    
    console.log('🎉 本地代理测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testLocalProxy();
