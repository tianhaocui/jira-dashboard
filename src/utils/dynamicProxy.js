// 动态代理方案 - 在用户的域中创建临时代理
class DynamicProxy {
  constructor() {
    this.proxyWindow = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  // 创建代理窗口
  async createProxyWindow() {
    if (this.proxyWindow && !this.proxyWindow.closed) {
      return this.proxyWindow;
    }

    // 创建一个新的窗口或标签页
    const proxyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CORS Proxy</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5;
          }
          .status { 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0;
          }
          .ready { background: #d4edda; color: #155724; }
          .working { background: #fff3cd; color: #856404; }
          .error { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <h3>🔧 Jira Dashboard CORS 代理</h3>
        <div id="status" class="status ready">代理已准备就绪</div>
        <div id="log"></div>
        
        <script>
          const statusEl = document.getElementById('status');
          const logEl = document.getElementById('log');
          
          function log(message, type = 'info') {
            const time = new Date().toLocaleTimeString();
            const color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
            logEl.innerHTML = \`<div style="color: \${color}; margin: 5px 0;">[\${time}] \${message}</div>\` + logEl.innerHTML;
            
            if (type === 'error') {
              statusEl.textContent = '❌ 请求失败';
              statusEl.className = 'status error';
            } else if (type === 'working') {
              statusEl.textContent = '⏳ 处理请求中...';
              statusEl.className = 'status working';
            } else if (type === 'success') {
              statusEl.textContent = '✅ 请求成功';
              statusEl.className = 'status ready';
            }
          }
          
          // 监听来自父窗口的消息
          window.addEventListener('message', async function(event) {
            const { requestId, url, options } = event.data;
            
            log(\`收到请求: \${options.method || 'GET'} \${url}\`, 'working');
            
            try {
              // 构建请求选项
              const fetchOptions = {
                method: options.method || 'GET',
                headers: options.headers || {},
                credentials: 'include'
              };
              
              if (options.body && options.method !== 'GET') {
                fetchOptions.body = options.body;
              }
              
              // 执行请求
              const response = await fetch(url, fetchOptions);
              
              if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
              }
              
              const contentType = response.headers.get('content-type');
              let data;
              
              if (contentType && contentType.includes('application/json')) {
                data = await response.json();
              } else {
                data = await response.text();
              }
              
              log(\`请求成功: \${response.status} \${response.statusText}\`, 'success');
              
              // 发送响应回父窗口
              event.source.postMessage({
                requestId: requestId,
                success: true,
                data: data,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
              }, event.origin);
              
            } catch (error) {
              log(\`请求失败: \${error.message}\`, 'error');
              
              // 发送错误回父窗口
              event.source.postMessage({
                requestId: requestId,
                success: false,
                error: error.message
              }, event.origin);
            }
          });
          
          // 通知父窗口代理已准备就绪
          if (window.opener) {
            window.opener.postMessage({ type: 'proxy-ready' }, '*');
            log('代理窗口已准备就绪');
          }
          
          // 页面关闭时清理
          window.addEventListener('beforeunload', function() {
            if (window.opener) {
              window.opener.postMessage({ type: 'proxy-closing' }, '*');
            }
          });
        </script>
      </body>
      </html>
    `;

    // 创建blob URL
    const blob = new Blob([proxyHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    // 打开新窗口
    this.proxyWindow = window.open(
      blobUrl, 
      'cors-proxy', 
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    if (!this.proxyWindow) {
      URL.revokeObjectURL(blobUrl);
      throw new Error('无法打开代理窗口，请检查弹窗阻止设置');
    }

    // 等待代理窗口准备就绪
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('代理窗口准备超时'));
      }, 10000);

      const messageHandler = (event) => {
        if (event.data.type === 'proxy-ready' && event.source === this.proxyWindow) {
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          resolve(this.proxyWindow);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  // 通过代理窗口发送请求
  async sendRequest(url, options = {}) {
    // 确保代理窗口存在且可用
    if (!this.proxyWindow || this.proxyWindow.closed) {
      await this.createProxyWindow();
    }

    const requestId = ++this.requestId;

    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('代理请求超时'));
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
                headers: event.data.headers,
                method: 'dynamic-proxy'
              });
            } else {
              reject(new Error(event.data.error));
            }
          }
        } else if (event.data.type === 'proxy-closing') {
          // 代理窗口正在关闭
          this.proxyWindow = null;
        }
      };

      window.addEventListener('message', responseHandler);

      // 发送请求到代理窗口
      this.proxyWindow.postMessage({
        requestId: requestId,
        url: url,
        options: options
      }, '*');
    });
  }

  // 检查代理是否可用
  isAvailable() {
    return this.proxyWindow && !this.proxyWindow.closed;
  }

  // 清理资源
  cleanup() {
    if (this.proxyWindow && !this.proxyWindow.closed) {
      this.proxyWindow.close();
    }
    this.proxyWindow = null;

    // 清理pending请求
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('代理已清理'));
    }

    this.pendingRequests.clear();
  }
}

export default new DynamicProxy();
