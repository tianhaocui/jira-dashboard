// API配置文件
export const API_CONFIG = {
  // Jira基础URL
  JIRA_BASE_URL: 'https://jira.logisticsteam.com',
  
  // CORS代理选项
  CORS_PROXIES: [
    // 方案1: 本地开发使用本地代理
    {
      name: '本地代理服务器',
      url: 'http://localhost:3001',
      description: '本地Node.js代理服务器',
      localOnly: true
    },
    // 方案2: 生产环境使用Netlify Functions
    {
      name: 'Netlify代理',
      url: 'https://melodic-cocada-438aaf.netlify.app',
      description: '生产环境Netlify代理'
    },
    // 方案3: 备用代理
    {
      name: '备用代理',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: '备用CORS代理（需要激活）'
    },
    // 方案4: 直接连接
    {
      name: '直接连接',
      url: '',
      directConnect: true,
      description: '直接连接Jira服务器（需要CORS扩展）'
    }
  ],
  
  // 获取当前环境的API配置
  getApiConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 根据环境选择合适的代理
    let proxy;
    if (isProduction) {
      // 生产环境：跳过本地代理，使用公共代理
      proxy = this.CORS_PROXIES.find(p => !p.localOnly) || this.CORS_PROXIES[1];
    } else {
      // 开发环境：优先使用本地代理
      proxy = this.CORS_PROXIES[0];
    }
    
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
        description: `使用${proxy.name} - ${proxy.description}`
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
