import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Jira API配置
class JiraApiService {
  constructor() {
    // 获取API配置
    this.apiConfig = API_CONFIG.getApiConfig();
    this.baseUrl = this.apiConfig.baseURL;
    
    console.log(`🔧 Jira API 配置: ${this.apiConfig.description}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV}`);
    console.log(`📡 BaseURL: ${this.baseUrl || '(使用本地代理)'}`);
    
    // 存储当前代理索引（用于切换）
    this.currentProxyIndex = 0;
    this.username = localStorage.getItem('jira_username') || '';
    this.password = localStorage.getItem('jira_password') || '';
    
    // 创建axios实例
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    // 设置认证拦截器
    this.client.interceptors.request.use((config) => {
      if (this.username && this.password) {
        // 使用Basic Auth (用户名 + 密码)
        const auth = btoa(`${this.username}:${this.password}`);
        config.headers.Authorization = `Basic ${auth}`;
      }
      return config;
    });

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Jira API Error:', error);
        if (error.response?.status === 401) {
          // 认证失败，清除本地存储的凭据
          this.clearCredentials();
        }
        return Promise.reject(error);
      }
    );
  }

  // 设置认证信息
  setCredentials(username, password) {
    this.username = username;
    this.password = password;
    
    // 保存到localStorage
    localStorage.setItem('jira_username', username);
    localStorage.setItem('jira_password', password);
    
    console.log('🔐 认证信息已更新');
  }

  // 切换CORS代理
  switchCorsProxy(proxyIndex) {
    const newConfig = API_CONFIG.switchCorsProxy(proxyIndex);
    this.apiConfig = newConfig;
    this.baseUrl = newConfig.baseURL;
    this.currentProxyIndex = proxyIndex;
    
    // 重新创建axios实例
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    // 重新设置认证
    if (this.username && this.password) {
      const authString = btoa(`${this.username}:${this.password}`);
      this.client.defaults.headers.common['Authorization'] = `Basic ${authString}`;
    }
    
    console.log(`🔄 已切换到代理: ${newConfig.description}`);
    return newConfig;
  }

  // 获取可用的代理列表
  getAvailableProxies() {
    return API_CONFIG.CORS_PROXIES;
  }

  // 清除认证信息
  clearCredentials() {
    localStorage.removeItem('jira_username');
    localStorage.removeItem('jira_password');
    this.username = '';
    this.password = '';
  }

  // 检查是否已配置认证
  isConfigured() {
    return !!(this.username && this.password);
  }

  // 测试连接
  async testConnection() {
    try {
      console.log('🔍 测试连接到Jira API...');
      console.log('📡 请求URL:', `${this.baseUrl}/rest/api/2/myself`);
      
      const response = await this.client.get('/rest/api/2/myself');
      console.log('✅ 连接测试成功:', response.data.displayName);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('❌ 连接测试失败:', error.response?.status, error.response?.statusText);
      console.error('   错误详情:', error.message);
      
      // 如果使用CORS代理，不尝试备用端点，直接返回错误
      if (this.apiConfig.useCorsProxy) {
        console.log('🚫 使用CORS代理时跳过备用端点测试');
        return { success: false, error: `连接失败: ${error.message}` };
      }
      
      // 只在非代理环境下尝试备用端点
      try {
        console.log('🔄 尝试备用端点: /rest/auth/1/session');
        const sessionResponse = await this.client.get('/rest/auth/1/session');
        console.log('✅ 备用端点成功');
        return { success: true, user: sessionResponse.data };
      } catch (sessionError) {
        console.error('❌ 备用端点也失败:', sessionError.message);
        return { success: false, error: error.message };
      }
    }
  }

  // 获取项目列表
  async getProjects() {
    try {
      console.log('🔍 获取项目列表...');
      
      // 方法1: 尝试使用Jira内部API（你发现的接口）
      try {
        console.log('📋 尝试方法1: 使用内部browse-project API');
        const browseResponse = await this.client.post('/rest/api/1.0/browse-project/project-type/active', 'all', {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (browseResponse.data && Array.isArray(browseResponse.data)) {
          console.log(`✅ 方法1成功: 找到 ${browseResponse.data.length} 个项目`);
          
          // 显示项目详情
          browseResponse.data.forEach((project, index) => {
            console.log(`📋 项目 ${index + 1}: ${project.key || project.projectKey} - ${project.name || project.projectName}`);
          });
          
          return browseResponse.data;
        }
      } catch (browseError) {
        console.log('❌ 方法1失败:', browseError.message);
      }
      
      // 方法2: 使用标准API作为备用
      console.log('📋 尝试方法2: 使用标准API');
      const response = await this.client.get('/rest/api/2/project');
      console.log(`✅ 方法2成功: 找到 ${response.data.length} 个项目`);
      
      // 显示项目详情
      response.data.forEach((project, index) => {
        console.log(`📋 项目 ${index + 1}: ${project.key} - ${project.name}`);
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ 获取项目列表失败:', error);
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  }

  // 检查用户权限和可访问的项目
  async checkUserPermissions() {
    try {
      console.log('🔍 检查用户权限...');
      
      // 获取用户信息
      const userResponse = await this.client.get('/rest/api/2/myself');
      console.log(`👤 当前用户: ${userResponse.data.displayName} (${userResponse.data.name})`);
      
      // 获取项目列表
      const projects = await this.getProjects();
      
      // 测试每个项目的访问权限
      console.log('🔍 测试项目访问权限...');
      const projectPermissions = [];
      
      for (const project of projects.slice(0, 5)) { // 只测试前5个项目
        try {
          const testResponse = await this.client.get(`/rest/api/2/search?jql=project="${project.key}"&maxResults=1`);
          projectPermissions.push({
            key: project.key,
            name: project.name,
            accessible: true,
            issueCount: testResponse.data.total
          });
          console.log(`✅ ${project.key}: 可访问，有 ${testResponse.data.total} 条工单`);
        } catch (error) {
          projectPermissions.push({
            key: project.key,
            name: project.name,
            accessible: false,
            error: error.message
          });
          console.log(`❌ ${project.key}: 无法访问 - ${error.message}`);
        }
      }
      
      return {
        user: userResponse.data,
        projects: projects,
        permissions: projectPermissions
      };
    } catch (error) {
      console.error('❌ 权限检查失败:', error);
      throw new Error(`权限检查失败: ${error.message}`);
    }
  }

  // 获取工单数据 - 支持JQL查询
  async getIssues(jql = '', startAt = 0, maxResults = 100, fields = null) {
    try {
      const params = {
        jql,
        startAt,
        maxResults,
        fields: fields || [
          'key',
          'summary',
          'status',
          'assignee',
          'reporter',
          'priority',
          'issuetype',
          'created',
          'updated',
          'resolutiondate',
          'project',
          'sprint',
          'storypoints',
          'customfield_10005', // Sprint
          'customfield_10002', // Story Points
          'customfield_11103', // Developer
          'customfield_11102', // QA
          'customfield_11104', // BA
          'customfield_10105', // Module
          'customfield_12000', // Product
          'customfield_12300', // Demand Type
          'customfield_10800', // Request User
          'customfield_10801', // app
          'customfield_10802', // module
          'customfield_11000', // Developer(single)
        ].join(',')
      };

      const response = await this.client.get('/rest/api/2/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取工单数据失败: ${error.message}`);
    }
  }

  // 获取项目工单统计（按需调用）
  async getProjectStatistics(projectKey, jql = '') {
    try {
      console.log(`📊 获取项目 ${projectKey} 的统计数据...`);
      const projectJql = jql ? `project = "${projectKey}" AND (${jql})` : `project = "${projectKey}"`;
      const result = await this.getIssues(projectJql, 0, 1, 'key');
      return {
        key: projectKey,
        count: result.total || 0
      };
    } catch (error) {
      console.error(`❌ 获取项目 ${projectKey} 统计失败:`, error);
      return { key: projectKey, count: 0 };
    }
  }

  // 获取筛选条件下的统计数据 - 优化版本
  async getFilteredStatistics(filters) {
    try {
      console.log('📊 获取筛选条件下的统计数据...', filters);
      
      // 构建基础JQL
      let jqlParts = [];
      
      if (filters.project && filters.project !== 'all') {
        jqlParts.push(`project = "${filters.project}"`);
      }
      
      if (filters.sprint && filters.sprint !== 'all') {
        jqlParts.push(`sprint = "${filters.sprint}"`);
      }
      
      if (filters.developer && filters.developer !== 'all') {
        jqlParts.push(`assignee = "${filters.developer}"`);
      }
      
      if (filters.status && filters.status !== 'all') {
        jqlParts.push(`status = "${filters.status}"`);
      }
      
      if (filters.issueType && filters.issueType !== 'all') {
        jqlParts.push(`issuetype = "${filters.issueType}"`);
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        jqlParts.push(`created >= "${filters.dateRange[0]}" AND created <= "${filters.dateRange[1]}"`);
      }
      
      const baseJql = jqlParts.length > 0 ? jqlParts.join(' AND ') : '';
      
      // 使用Promise.allSettled并行调用，避免串行等待，设置较短超时
      const promises = [
        // 总数
        this.getIssues(baseJql, 0, 1, 'key').catch(() => ({ total: 0 })),
        // 已解决
        this.getIssues(
          [...jqlParts, 'status in ("Done", "Closed", "Resolved", "Fixed", "Completed", "Finished")'].join(' AND '), 
          0, 1, 'key'
        ).catch(() => ({ total: 0 })),
        // 进行中  
        this.getIssues(
          [...jqlParts, 'status in ("In Progress", "Development", "In Development", "Coding", "Active", "Working")'].join(' AND '), 
          0, 1, 'key'
        ).catch(() => ({ total: 0 })),
        // 待处理
        this.getIssues(
          [...jqlParts, 'status in ("To Do", "Open", "New", "Created", "Backlog", "Ready", "Pending", "Waiting")'].join(' AND '), 
          0, 1, 'key'
        ).catch(() => ({ total: 0 }))
      ];
      
      // 设置10秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Statistics API timeout')), 10000);
      });
      
      const results = await Promise.race([
        Promise.allSettled(promises),
        timeoutPromise
      ]);
      
      const [totalResult, resolvedResult, inProgressResult, pendingResult] = results;
      
      const totalCount = totalResult.status === 'fulfilled' ? (totalResult.value.total || 0) : 0;
      const resolvedCount = resolvedResult.status === 'fulfilled' ? (resolvedResult.value.total || 0) : 0;
      const inProgressCount = inProgressResult.status === 'fulfilled' ? (inProgressResult.value.total || 0) : 0;
      const pendingCount = pendingResult.status === 'fulfilled' ? (pendingResult.value.total || 0) : 0;
      
      console.log(`📊 统计结果: 总数=${totalCount}, 已解决=${resolvedCount}, 进行中=${inProgressCount}, 待处理=${pendingCount}`);
      
      return {
        total: totalCount,
        resolved: resolvedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        baseJql: baseJql
      };
      
    } catch (error) {
      console.error('❌ 获取筛选统计失败:', error);
      return {
        total: 0,
        resolved: 0,
        inProgress: 0,
        pending: 0,
        baseJql: ''
      };
    }
  }

  // 获取所有工单数据 - 自动分页获取（限制版本）
  async getAllIssues(jql = '', fields = null) {
    try {
      let allIssues = [];
      let startAt = 0;
      const maxResults = 100; // 每次获取100条
      const maxTotalIssues = 5000; // 最多获取5000条工单，避免无限循环
      let currentIteration = 0;
      const maxIterations = 50; // 最大50次请求
      const seenIssueKeys = new Set(); // 用于检测重复数据

      console.log('🔍 开始获取工单数据...');
      console.log(`📋 限制: 最多获取 ${maxTotalIssues} 条工单，最多 ${maxIterations} 次请求`);

      while (currentIteration < maxIterations && allIssues.length < maxTotalIssues) {
        console.log(`🔄 第 ${currentIteration + 1} 次请求，startAt: ${startAt}`);
        
        const result = await this.getIssues(jql, startAt, maxResults, fields);
        
        // 检查API响应
        if (!result || !result.issues) {
          console.log('❌ API响应无效，停止获取');
          break;
        }
        
        // 如果没有返回数据，停止
        if (result.issues.length === 0) {
          console.log('📋 没有更多数据，停止获取');
          break;
        }
        
        // 检查重复数据并添加唯一数据
        const newIssues = result.issues;
        let duplicateCount = 0;
        let newUniqueIssues = [];
        
        // 检查重复数据
        for (const issue of newIssues) {
          if (seenIssueKeys.has(issue.key)) {
            duplicateCount++;
          } else {
            seenIssueKeys.add(issue.key);
            newUniqueIssues.push(issue);
          }
        }
        
        console.log(`📊 本次获取 ${newIssues.length} 条，其中 ${duplicateCount} 条重复，${newUniqueIssues.length} 条新数据`);
        
        // 如果全部都是重复数据，说明API在重复返回，停止获取
        if (duplicateCount === newIssues.length && duplicateCount > 0) {
          console.log('🔄 检测到API返回重复数据，停止获取');
          break;
        }
        
        // 如果没有新的唯一数据，也停止获取
        if (newUniqueIssues.length === 0) {
          console.log('📋 没有新的唯一数据，停止获取');
          break;
        }
        
        allIssues = allIssues.concat(newUniqueIssues);
        
        console.log(`📈 累计 ${allIssues.length} 条唯一工单`);
        console.log(`📊 API报告总数: ${result.total || '未知'}`);
        
        // 如果获取的数据少于请求的数量，说明已到最后一页
        if (newIssues.length < maxResults) {
          console.log('📋 已到最后一页，停止获取');
          break;
        }
        
        // 如果API报告的总数已知，检查是否还有更多数据
        if (result.total) {
          console.log(`📊 API总数: ${result.total}, 当前startAt: ${startAt}, 已获取: ${allIssues.length}`);
          
          // 如果startAt已经超过或等于总数，说明没有更多数据了
          if (startAt >= result.total) {
            console.log('📋 startAt已达到总数，停止获取');
            break;
          }
          
          // 如果我们已获取的数据量已经等于或超过API报告的总数，停止获取
          if (allIssues.length >= result.total) {
            console.log('📋 已获取所有可用数据，停止获取');
            break;
          }
        }
        
        startAt += maxResults;
        currentIteration++;
        
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (currentIteration >= maxIterations) {
        console.warn('⚠️ 达到最大请求次数，停止获取');
      }
      
      if (allIssues.length >= maxTotalIssues) {
        console.warn('⚠️ 达到最大工单数量限制，停止获取');
      }

      console.log(`✅ 完成！总共获取 ${allIssues.length} 条唯一工单`);

      return {
        issues: allIssues,
        total: allIssues.length,
        startAt: 0,
        maxResults: allIssues.length
      };
    } catch (error) {
      console.error('❌ 获取工单数据失败:', error);
      throw new Error(`获取所有工单数据失败: ${error.message}`);
    }
  }

  // 获取Sprint信息
  async getSprints(boardId) {
    try {
      const response = await this.client.get(`/rest/agile/1.0/board/${boardId}/sprint`);
      return response.data.values;
    } catch (error) {
      throw new Error(`获取Sprint信息失败: ${error.message}`);
    }
  }

  // 获取看板列表
  async getBoards() {
    try {
      const response = await this.client.get('/rest/agile/1.0/board');
      return response.data.values;
    } catch (error) {
      throw new Error(`获取看板列表失败: ${error.message}`);
    }
  }

  // 根据项目获取工单
  async getIssuesByProject(projectKey, additionalJql = '') {
    const jql = `project = "${projectKey}"${additionalJql ? ` AND ${additionalJql}` : ''}`;
    return this.getAllIssues(jql);
  }

  // 根据Sprint获取工单
  async getIssuesBySprint(sprintId) {
    const jql = `sprint = ${sprintId}`;
    return this.getAllIssues(jql);
  }

  // 根据开发者获取工单
  async getIssuesByDeveloper(developerName) {
    const jql = `assignee = "${developerName}" OR "Developer(single)" ~ "${developerName}" OR "Developer" ~ "${developerName}"`;
    return this.getAllIssues(jql);
  }

  // 获取自定义字段映射
  getCustomFieldMapping() {
    return {
      "10000": "Flagged",
      "10001": "Epic/Theme", 
      "10002": "Story Points",
      "10003": "Business Value",
      "10004": "Rank (Obsolete)",
      "10005": "Sprint",
      "10006": "Epic Link",
      "10007": "Epic Name",
      "10008": "Epic Status",
      "10009": "Epic Color",
      "10100": "Rank",
      "10101": "Release Version History",
      "10102": "Need Check?",
      "10105": "Module",
      "10106": "Claim Submit Date",
      "10109": "Hub Location",
      "10110": "Claim Detail",
      "10111": "Invoice Amount",
      "10112": "Order Shipped Date",
      "10114": "Approved Amount",
      "10115": "Customer Invoice #",
      "10116": "Carrier Invoice #",
      "10117": "Ship to Retail",
      "10119": "Customer",
      "10120": "Ship to PO #",
      "10121": "Ship to Load #",
      "10122": "Claim Type",
      "10123": "CM #",
      "10200": "Version",
      "10300": "ETA",
      "10400": "Priority#",
      "10501": "Test Type",
      "10502": "Cucumber Test Type",
      "10503": "Cucumber Scenario",
      "10504": "Generic Test Definition",
      "10505": "Manual Test Steps",
      "10506": "Manual Test Steps (Export)",
      "10507": "Steps Count",
      "10508": "Test Sets association with a Test",
      "10509": "Pre-Conditions association with a Test",
      "10510": "Test Plans associated with a Test",
      "10511": "TestRunStatus",
      "10512": "Tests association with a Test Set",
      "10513": "Test Count",
      "10514": "Test Set Status",
      "10515": "Tests association with a Test Execution",
      "10516": "Test Execution Defects",
      "10517": "Begin Date",
      "10518": "End Date",
      "10519": "Revision",
      "10520": "Test Execution Status",
      "10521": "Pre-Condition Type",
      "10522": "Conditions",
      "10524": "Tests association with a Pre-Condition",
      "10525": "Test Environments",
      "10526": "Tests associated with a Test Plan",
      "10527": "Test Plan",
      "10528": "Test Plan Status",
      "10600": "End Date",
      "10601": "Version",
      "10700": "url",
      "10800": "Request User",
      "10801": "app",
      "10802": "module",
      "10804": "Quality assurance (QA)",
      "10805": "commit url",
      "10806": "level of effort",
      "10807": "Release Date",
      "10808": "company",
      "10900": "Operational categorization",
      "10901": "Approvers",
      "10902": "Impact",
      "10903": "Source",
      "10904": "Urgency",
      "10905": "Product categorization",
      "11000": "Developer(single)",
      "11100": "Test Repository Path",
      "11101": "Test Plan Root Folders Custom Field",
      "11102": "QA",
      "11103": "Developer",
      "11104": "BA",
      "11105": "Customer",
      "11106": "Facility",
      "11200": "Approvals",
      "11201": "Request participants",
      "11202": "Customer Request Type",
      "11203": "Organizations",
      "11300": "Satisfaction",
      "11301": "Satisfaction date",
      "11302": "Pending reason",
      "11303": "Approvers",
      "11304": "Impact",
      "11305": "Change type",
      "11306": "Change risk",
      "11307": "Change reason",
      "11308": "Change start date",
      "11309": "Change completion date",
      "11310": "Urgency",
      "11311": "Change managers",
      "11312": "CAB",
      "11313": "Product categorization",
      "11314": "Operational categorization",
      "11315": "Source",
      "11316": "Investigation reason",
      "11317": "Root cause",
      "11318": "Workaround",
      "11319": "Time to resolution",
      "11320": "Time to first response",
      "11321": "Time to close after resolution",
      "11322": "Time to approve normal change",
      "11600": "ETA2",
      "11601": "Test Hours",
      "11602": "Dev Hours",
      "11700": "Actual Dev Hours",
      "11701": "Expected Testing Time",
      "11800": "Customer Type",
      "11801": "Function",
      "11802": "Root Cause Category",
      "11901": "Story Points for BA",
      "12000": "Product",
      "12001": "DN/RN/TASK ID",
      "12100": "Test Points",
      "12201": "Pending",
      "12300": "Demand Type",
      "12303": "Category",
      "12304": "Reporter Contact Phone Number",
      "12305": "Warehouse",
      "12402": "Code Change",
      "12404": "Escalated Assingee",
      "12501": "Bug Env",
      "12504": "Case Points",
      "12505": "Case Hours",
      "12506": "Release Test Points",
      "12507": "Release Test Hours",
      "12600": "Demand From",
      "12601": "Actual Start",
      "12602": "Actual End",
      "12603": "Planned Start",
      "12604": "Planned End",
      "12605": "Latest Start",
      "12606": "Latest End",
      "12607": "Gantt Options",
      "12608": "Baseline Start",
      "12609": "Baseline End",
      "12610": "Date of Baselining",
      "12611": "Baseline Effort",
      "12612": "Velocity %",
      "12614": "MS-Project ID",
      "12616": "AI Rate",
      "12617": "Coding",
      "12620": "WMS Version",
      "12621": "Saving"
    };
  }

  // 解析自定义字段值
  parseCustomField(issue, fieldId) {
    const customFieldKey = `customfield_${fieldId}`;
    const value = issue.fields[customFieldKey];
    
    if (!value) return null;
    
    // 处理不同类型的自定义字段
    if (Array.isArray(value)) {
      return value.map(item => item.name || item.value || item).join(', ');
    }
    
    if (typeof value === 'object') {
      return value.name || value.value || value.displayName || JSON.stringify(value);
    }
    
    return value;
  }
}

// 创建并导出单例实例
const jiraApiService = new JiraApiService();
export default jiraApiService;
