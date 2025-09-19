// CORS绕过工具类
// 提供多种纯前端的跨域解决方案

import iframeProxy from './iframeProxy';
import dynamicProxy from './dynamicProxy';

class CorsWorkarounds {
  constructor() {
    this.callbackCounter = 0;
  }

  // 方案1: 动态脚本注入（类似JSONP，但用于任何API）
  async scriptInjection(url, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const callbackName = `corsCallback_${Date.now()}_${++this.callbackCounter}`;
      
      // 设置全局回调函数
      window[callbackName] = (data) => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve(data);
      };
      
      // 构建URL（如果服务器支持JSONP回调）
      const separator = url.includes('?') ? '&' : '?';
      script.src = `${url}${separator}callback=${callbackName}`;
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('Script injection failed'));
      };
      
      document.head.appendChild(script);
      
      // 超时处理
      setTimeout(() => {
        if (window[callbackName]) {
          document.head.removeChild(script);
          delete window[callbackName];
          reject(new Error('Script injection timeout'));
        }
      }, options.timeout || 10000);
    });
  }

  // 方案2: 使用img标签进行简单的GET请求（仅用于触发请求，无法获取响应）
  async imagePixelRequest(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ success: true, method: 'image' });
      img.onerror = () => reject(new Error('Image request failed'));
      img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    });
  }

  // 方案3: 使用WebWorker + importScripts（如果目标支持）
  async webWorkerRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const workerCode = `
          try {
            importScripts('${url}');
            self.postMessage({ success: true, data: 'Script loaded successfully' });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = (event) => {
          worker.terminate();
          URL.revokeObjectURL(blob);
          
          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error));
          }
        };
        
        worker.onerror = (error) => {
          worker.terminate();
          URL.revokeObjectURL(blob);
          reject(error);
        };
        
        // 超时处理
        setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(blob);
          reject(new Error('WebWorker request timeout'));
        }, options.timeout || 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // 方案4: 使用iframe + postMessage（需要目标站点配合）
  async iframePostMessage(url, data, options = {}) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      const messageHandler = (event) => {
        // 验证来源
        if (event.origin !== new URL(url).origin) {
          return;
        }
        
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(iframe);
        
        resolve(event.data);
      };
      
      iframe.onload = () => {
        // 发送消息到iframe
        iframe.contentWindow.postMessage(data, new URL(url).origin);
      };
      
      iframe.onerror = () => {
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(iframe);
        reject(new Error('Iframe loading failed'));
      };
      
      window.addEventListener('message', messageHandler);
      document.body.appendChild(iframe);
      
      // 超时处理
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(new Error('Iframe postMessage timeout'));
      }, options.timeout || 15000);
    });
  }

  // 方案5: 使用fetch with no-cors mode（只能发送请求，无法读取响应）
  async noCorsRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        mode: 'no-cors',
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body
      });
      
      // no-cors模式下无法读取响应内容，但可以知道请求是否成功发送
      return {
        success: true,
        method: 'no-cors',
        status: 'opaque', // no-cors响应总是opaque
        message: 'Request sent successfully (response not readable)'
      };
    } catch (error) {
      throw new Error(`No-CORS request failed: ${error.message}`);
    }
  }

  // 方案6: 使用Service Worker代理（需要注册Service Worker）
  async serviceWorkerProxy(url, options = {}) {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    // 检查是否已有Service Worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      throw new Error('No active Service Worker found');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.response);
        } else {
          reject(new Error(event.data.error));
        }
      };
      
      // 发送请求到Service Worker
      registration.active.postMessage({
        type: 'CORS_PROXY_REQUEST',
        url: url,
        options: options
      }, [channel.port2]);
      
      // 超时处理
      setTimeout(() => {
        reject(new Error('Service Worker proxy timeout'));
      }, options.timeout || 30000);
    });
  }

  // 智能选择最佳方案
  async smartRequest(url, options = {}) {
    const methods = [
      { name: 'direct', method: () => this.directRequest(url, options) },
      { name: 'dynamic-proxy', method: () => dynamicProxy.sendRequest(url, options) },
      { name: 'iframe-proxy', method: () => iframeProxy.sendRequest(url, options) },
      { name: 'no-cors', method: () => this.noCorsRequest(url, options) },
      { name: 'script-injection', method: () => this.scriptInjection(url, options) }
    ];

    let lastError;
    
    for (const { name, method } of methods) {
      try {
        console.log(`🔄 尝试CORS绕过方案: ${name}`);
        const result = await method();
        console.log(`✅ 方案 ${name} 成功:`, result);
        return { ...result, method: name };
      } catch (error) {
        console.log(`❌ 方案 ${name} 失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw lastError || new Error('所有CORS绕过方案都失败了');
  }

  // 直接请求（作为基准）
  async directRequest(url, options = {}) {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      credentials: options.credentials || 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data, method: 'direct' };
  }
}

export default new CorsWorkarounds();
