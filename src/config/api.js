// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项（按优先级排序）
  CORS_PROXIES: [
    // 方案1: AllOrigins (最稳定，直接可用)
    {
      name: 'AllOrigins',
      url: 'https://api.allorigins.win/raw?url=',
      description: '稳定的免费CORS代理服务'
    },
    // 方案2: CORS Anywhere (备用，需要激活但很稳定)
    {
      name: 'CORS Anywhere',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: '稳定的代理服务，可能需要激活'
    },
    // 方案3: 公共代理服务
    {
      name: 'CORS.SH',
      url: 'https://cors.sh/',
      description: '简单的CORS代理服务'
    },
    // 方案4: 直接连接 (通常会失败，但保留作为选项)
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器，通常会有CORS问题'
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
      // 生产环境：默认使用AllOrigins（最稳定）
      const selectedProxy = this.CORS_PROXIES[0]; // 默认使用第一个（AllOrigins）
      
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
