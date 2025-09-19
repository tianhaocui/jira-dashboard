// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项
  CORS_PROXIES: [
    // 方案1: 自定义代理服务器
    {
      name: '自定义代理服务器',
      url: 'https://cors-proxy.fringe.zone/https://jira.logisticsteam.com',
      description: '公共CORS代理服务器'
    },
    // 方案2: 备用代理
    {
      name: 'AllOrigins代理',
      url: 'https://api.allorigins.win/raw?url=',
      description: '备用公共代理服务器',
      needsEncoding: true
    },
    // 方案3: 直接连接
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器（需要CORS扩展）'
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
      // 生产环境：使用公共CORS代理
      const proxy = this.CORS_PROXIES[0]; // 使用第一个代理
      return {
        baseURL: proxy.url,
        useCorsProxy: true,
        proxyName: proxy.name,
        description: `生产环境 - 使用${proxy.name}`
      };
    }
  },
  
  // 切换CORS代理
  switchCorsProxy(proxyIndex = 0) {
    if (proxyIndex >= 0 && proxyIndex < this.CORS_PROXIES.length) {
      const proxy = this.CORS_PROXIES[proxyIndex];
      
      if (proxy.directConnect) {
        return {
          baseURL: this.JIRA_BASE_URL,
          useCorsProxy: false,
          proxyName: proxy.name,
          description: `使用${proxy.name} - ${proxy.description}`
        };
      } else {
        let baseURL;
        if (proxy.needsEncoding) {
          baseURL = proxy.url + encodeURIComponent(this.JIRA_BASE_URL);
        } else {
          baseURL = proxy.url;
        }
        
        return {
          baseURL: baseURL,
          useCorsProxy: true,
          proxyName: proxy.name,
          description: `使用${proxy.name}代理`
        };
      }
    }
    return this.getApiConfig();
  }
};

// 导出常用配置
export const { JIRA_BASE_URL, CORS_PROXIES } = API_CONFIG;
