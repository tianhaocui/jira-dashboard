// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项（按优先级排序）
  CORS_PROXIES: [
    // 方案1: 直接连接 (优先尝试，最快最稳定)
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器，最快最稳定的方式'
    },
    // 方案2: 简单可靠的代理
    {
      name: 'CORS Proxy API',
      url: 'https://api.codetabs.com/v1/proxy?quest=',
      description: '简单稳定的CORS代理服务'
    },
    // 方案3: 备用代理
    {
      name: 'Heroku CORS',
      url: 'https://cors-proxy-server.herokuapp.com/',
      description: '基于Heroku的CORS代理'
    },
    // 方案4: 公共代理
    {
      name: 'CORS.SH',
      url: 'https://cors.sh/',
      description: '简单的CORS代理服务'
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
      // 生产环境：默认尝试直接连接（最快最稳定）
      const selectedProxy = this.CORS_PROXIES[0]; // 默认使用第一个（直接连接）
      
      if (selectedProxy.directConnect) {
        return {
          baseURL: this.JIRA_BASE_URL,
          useCorsProxy: false,
          proxyName: selectedProxy.name,
          description: `生产环境 - ${selectedProxy.description}`
        };
      } else {
        return {
          baseURL: selectedProxy.url + encodeURIComponent(this.JIRA_BASE_URL),
          useCorsProxy: true,
          proxyName: selectedProxy.name,
          description: `生产环境 - 使用${selectedProxy.name}代理`
        };
      }
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
        return {
          baseURL: proxy.url + encodeURIComponent(this.JIRA_BASE_URL),
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
