// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项（按优先级排序）
  CORS_PROXIES: [
    // 方案1: AllOrigins (推荐，稳定性好)
    {
      name: 'AllOrigins',
      url: 'https://api.allorigins.win/raw?url=',
      description: '免费CORS代理服务，稳定性较好'
    },
    // 方案2: CORS Anywhere (需要临时访问)
    {
      name: 'CORS Anywhere',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: '需要先访问 https://cors-anywhere.herokuapp.com/corsdemo 激活'
    },
    // 方案3: ThingProxy
    {
      name: 'ThingProxy',
      url: 'https://thingproxy.freeboard.io/fetch/',
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
      // 生产环境：使用CORS代理
      const selectedProxy = this.CORS_PROXIES[0]; // 默认使用第一个
      return {
        baseURL: selectedProxy.url + encodeURIComponent(this.JIRA_BASE_URL),
        useCorsProxy: true,
        proxyName: selectedProxy.name,
        description: `生产环境 - 使用${selectedProxy.name}代理`
      };
    }
  },
  
  // 切换CORS代理
  switchCorsProxy(proxyIndex = 0) {
    if (proxyIndex >= 0 && proxyIndex < this.CORS_PROXIES.length) {
      const proxy = this.CORS_PROXIES[proxyIndex];
      return {
        baseURL: proxy.url + encodeURIComponent(this.JIRA_BASE_URL),
        useCorsProxy: true,
        proxyName: proxy.name,
        description: `使用${proxy.name}代理`
      };
    }
    return this.getApiConfig();
  }
};

// 导出常用配置
export const { JIRA_BASE_URL, CORS_PROXIES } = API_CONFIG;
