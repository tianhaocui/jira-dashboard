// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项
  CORS_PROXIES: [
    // 直接连接Jira服务器
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器'
    }
  ],
  
  // 获取当前环境的API配置
  getApiConfig() {
    // 直接使用Jira服务器地址
    return {
      baseURL: this.JIRA_BASE_URL,
      useCorsProxy: false,
      proxyName: '直接连接',
      description: '直接连接Jira服务器'
    };
  },
  
  // 切换CORS代理（简化版）
  switchCorsProxy(proxyIndex = 0) {
    // 只有一个代理选项，直接返回
    return this.getApiConfig();
  }
};

// 导出常用配置
export const { JIRA_BASE_URL, CORS_PROXIES } = API_CONFIG;
