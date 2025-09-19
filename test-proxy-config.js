const axios = require('axios');

// 测试不同的代理配置
async function testProxyConfigs() {
  console.log('🔍 测试代理配置...');
  
  const proxies = [
    {
      name: 'AllOrigins代理',
      url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://jira.logisticsteam.com'),
      description: '稳定的公共代理服务器'
    },
    {
      name: 'CORS.SH代理',
      url: 'https://cors.sh/https://jira.logisticsteam.com',
      description: '备用公共代理服务器'
    }
  ];

  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i];
    console.log(`\n${i + 1}. 测试 ${proxy.name}...`);
    console.log(`   URL: ${proxy.url}`);
    
    try {
      // 测试健康检查 - 尝试获取服务器信息
      const response = await axios.get(`${proxy.url}/rest/api/2/serverInfo`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Test-Agent/1.0'
        }
      });
      
      console.log(`   ✅ 成功! 状态: ${response.status}`);
      if (response.data && response.data.serverTitle) {
        console.log(`   📋 服务器: ${response.data.serverTitle}`);
        console.log(`   🔢 版本: ${response.data.version}`);
      }
      
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      if (error.response) {
        console.log(`   📊 状态码: ${error.response.status}`);
        console.log(`   📝 响应: ${error.response.statusText}`);
      }
    }
  }
  
  console.log('\n🏁 测试完成!');
}

testProxyConfigs();
