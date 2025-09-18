// 测试数据获取的脚本
const axios = require('axios');

async function testDataFetch() {
  console.log('🔍 测试Jira数据获取...');
  
  // 基本认证信息（请替换为实际的用户名和密码）
  const username = 'tianhao.cui@item.com';
  const password = 'WulingRen'; // 请替换为实际密码
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  try {
    // 测试1: 获取用户信息
    console.log('1. 测试用户认证...');
    const userResponse = await axios.get('https://jira.logisticsteam.com/rest/api/2/myself', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   ✅ 用户认证成功: ${userResponse.data.displayName}`);
    
    // 测试2: 获取项目列表
    console.log('2. 测试项目列表...');
    const projectsResponse = await axios.get('https://jira.logisticsteam.com/rest/api/2/project', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   ✅ 找到 ${projectsResponse.data.length} 个项目:`);
    projectsResponse.data.slice(0, 5).forEach(project => {
      console.log(`      - ${project.key}: ${project.name}`);
    });
    
    // 测试3: 获取工单数据（第一页）
    console.log('3. 测试工单数据获取...');
    const issuesResponse = await axios.get('https://jira.logisticsteam.com/rest/api/2/search', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      params: {
        jql: '',
        startAt: 0,
        maxResults: 50,
        fields: 'key,summary,status,assignee,project,created'
      }
    });
    
    console.log(`   ✅ 总共有 ${issuesResponse.data.total} 条工单`);
    console.log(`   📊 本次获取 ${issuesResponse.data.issues.length} 条`);
    console.log('   前5条工单:');
    issuesResponse.data.issues.slice(0, 5).forEach(issue => {
      console.log(`      - ${issue.key}: ${issue.fields.summary.substring(0, 50)}...`);
    });
    
    // 测试4: 测试特定项目的工单
    if (projectsResponse.data.length > 0) {
      const firstProject = projectsResponse.data[0];
      console.log(`4. 测试项目 ${firstProject.key} 的工单...`);
      
      const projectIssuesResponse = await axios.get('https://jira.logisticsteam.com/rest/api/2/search', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        params: {
          jql: `project = "${firstProject.key}"`,
          startAt: 0,
          maxResults: 50,
          fields: 'key,summary,status,assignee,project,created'
        }
      });
      
      console.log(`   ✅ 项目 ${firstProject.key} 有 ${projectIssuesResponse.data.total} 条工单`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.status, error.response?.statusText);
    console.error('   错误详情:', error.message);
  }
}

testDataFetch();
