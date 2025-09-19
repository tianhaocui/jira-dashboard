// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项
  CORS_PROXIES: [
    // Vercel代理服务器 (唯一代理方案)
    {
      name: 'Vercel代理服务器',
      url: 'https://jira-proxy-dofllbg70-tianhaocuis-projects.vercel.app',
      description: 'Vercel部署的代理服务器，完全模拟本地开发环境',
      isVercelProxy: true
    }
  ],
  
  // 获取当前环境的API配置
  getApiConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 开发环境：使用本地代理
      return {
        baseURL: '',
        useCorsProxy: false,
        description: '开发环境 - 使用本地代理'
      };
    } else {
      // 生产环境：使用Vercel代理服务器
      const proxy = this.CORS_PROXIES[0];
      return {
        baseURL: proxy.url,
        useCorsProxy: true,
        proxyName: proxy.name,
        description: `生产环境 - 使用${proxy.name}代理`
      };
    }
  },
  
  // 切换CORS代理（简化版，只有Vercel代理）
  switchCorsProxy(proxyIndex = 0) {
    // 只有一个Vercel代理选项
    const proxy = this.CORS_PROXIES[0];
    return {
      baseURL: proxy.url,
      useCorsProxy: true,
      proxyName: proxy.name,
      description: `使用${proxy.name}代理`
    };
  }
};

// 导出常用配置
export const { JIRA_BASE_URL, CORS_PROXIES } = API_CONFIG;
