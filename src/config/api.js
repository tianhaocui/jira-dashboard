// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项（按优先级排序）
  CORS_PROXIES: [
    // 方案1: Vercel代理服务器 (最可靠，像本地一样)
    {
      name: 'Vercel代理服务器',
      url: 'https://jira-proxy-fkp96ojl5-tianhaocuis-projects.vercel.app',
      description: 'Vercel部署的代理服务器，完全模拟本地开发环境'
    },
    // 方案2: 直接连接 (备用尝试)
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器'
    },
    // 方案3: 公共代理备用
    {
      name: 'AllOrigins Raw',
      url: 'https://api.allorigins.win/raw?url=',
      description: '公共代理服务备用'
    },
    // 方案4: 最后备用
    {
      name: 'CORS Anywhere',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: '最后备用代理'
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
      // 生产环境：默认使用Vercel代理服务器（最可靠）
      const selectedProxy = this.CORS_PROXIES[0]; // 默认使用第一个（Vercel代理）
      
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
