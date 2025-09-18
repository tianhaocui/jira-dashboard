// 测试Jira连接的独立脚本
const axios = require('axios');

async function testJiraConnection() {
  console.log('🔍 测试Jira连接...');
  
  // 测试基本连接
  try {
    console.log('1. 测试基本连接到 https://jira.logisticsteam.com');
    const response = await axios.get('https://jira.logisticsteam.com', {
      timeout: 10000,
      validateStatus: () => true // 接受所有状态码
    });
    console.log(`   ✅ 连接成功，状态码: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return;
  }

  // 测试API端点
  try {
    console.log('2. 测试API端点 /rest/api/2/serverInfo');
    const response = await axios.get('https://jira.logisticsteam.com/rest/api/2/serverInfo', {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`   状态码: ${response.status}`);
    if (response.status === 200) {
      console.log(`   ✅ API可访问，Jira版本: ${response.data.version}`);
    } else {
      console.log(`   ⚠️  API返回状态码 ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ API测试失败: ${error.message}`);
  }

  // 测试认证端点
  try {
    console.log('3. 测试认证端点 /rest/api/2/myself (无认证)');
    const response = await axios.get('https://jira.logisticsteam.com/rest/api/2/myself', {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`   状态码: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ 认证端点正常 (返回401未授权，符合预期)');
    } else if (response.status === 200) {
      console.log('   ⚠️  无需认证即可访问 (可能配置了匿名访问)');
    } else {
      console.log(`   ⚠️  意外的状态码: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 认证端点测试失败: ${error.message}`);
  }

  console.log('\n📋 测试完成！');
  console.log('如果看到连接成功，说明Jira服务器可以访问。');
  console.log('如果API端点返回401，说明需要认证，这是正常的。');
}

testJiraConnection().catch(console.error);
