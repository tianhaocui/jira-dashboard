// iframe代理方案 - 利用iframe的同源策略绕过
class IframeProxy {
  constructor() {
    this.iframes = new Map();
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  // 创建或获取iframe
  getOrCreateIframe(origin) {
    if (this.iframes.has(origin)) {
      return this.iframes.get(origin);
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    // 创建一个简单的HTML页面，用于在目标域中执行请求
    const proxyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CORS Proxy</title>
      </head>
      <body>
        <script>
          // 监听来自父窗口的消息
          window.addEventListener('message', async function(event) {
            // 验证来源（在生产环境中应该更严格）
            if (event.origin !== '${window.location.origin}') {
              return;
            }
            
            const { requestId, url, options } = event.data;
            
            try {
              // 在iframe的域中执行fetch请求
              const response = await fetch(url, {
                method: options.method || 'GET',
                headers: options.headers || {},
                body: options.body,
                credentials: 'include'
              });
              
              const data = await response.json();
              
              // 发送响应回父窗口
              event.source.postMessage({
                requestId: requestId,
                success: true,
                data: data,
                status: response.status,
                statusText: response.statusText
              }, event.origin);
              
            } catch (error) {
              // 发送错误回父窗口
              event.source.postMessage({
                requestId: requestId,
                success: false,
                error: error.message
              }, event.origin);
            }
          });
          
          // 通知父窗口iframe已准备就绪
          window.parent.postMessage({ type: 'iframe-ready' }, '${window.location.origin}');
        </script>
      </body>
      </html>
    `;

    // 使用blob URL创建iframe内容
    const blob = new Blob([proxyHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    
    const iframeData = {
      element: iframe,
      ready: false,
      blobUrl: blobUrl
    };
    
    // 监听iframe准备就绪
    const readyHandler = (event) => {
      if (event.data.type === 'iframe-ready' && event.source === iframe.contentWindow) {
        iframeData.ready = true;
        window.removeEventListener('message', readyHandler);
      }
    };
    
    window.addEventListener('message', readyHandler);
    
    this.iframes.set(origin, iframeData);
    return iframeData;
  }

  // 通过iframe发送请求
  async sendRequest(url, options = {}) {
    const urlObj = new URL(url);
    const origin = urlObj.origin;
    
    const iframeData = this.getOrCreateIframe(origin);
    
    // 等待iframe准备就绪
    await this.waitForIframeReady(iframeData);
    
    const requestId = ++this.requestId;
    
    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Iframe request timeout'));
      }, options.timeout || 30000);
      
      // 存储pending请求
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });
      
      // 监听响应
      const responseHandler = (event) => {
        if (event.data.requestId === requestId) {
          window.removeEventListener('message', responseHandler);
          
          const pending = this.pendingRequests.get(requestId);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(requestId);
            
            if (event.data.success) {
              resolve({
                data: event.data.data,
                status: event.data.status,
                statusText: event.data.statusText,
                method: 'iframe-proxy'
              });
            } else {
              reject(new Error(event.data.error));
            }
          }
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送请求到iframe
      iframeData.element.contentWindow.postMessage({
        requestId: requestId,
        url: url,
        options: options
      }, '*');
    });
  }

  // 等待iframe准备就绪
  async waitForIframeReady(iframeData, maxWait = 5000) {
    const startTime = Date.now();
    
    while (!iframeData.ready && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!iframeData.ready) {
      throw new Error('Iframe not ready within timeout');
    }
  }

  // 清理资源
  cleanup() {
    for (const [origin, iframeData] of this.iframes) {
      if (document.body.contains(iframeData.element)) {
        document.body.removeChild(iframeData.element);
      }
      URL.revokeObjectURL(iframeData.blobUrl);
    }
    
    this.iframes.clear();
    
    // 清理pending请求
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Proxy cleanup'));
    }
    
    this.pendingRequests.clear();
  }
}

export default new IframeProxy();
