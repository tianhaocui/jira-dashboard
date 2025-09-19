# 🌐 CORS浏览器扩展使用指南

由于你的Jira服务器在内网环境，外部代理服务无法访问。推荐使用CORS浏览器扩展来解决跨域问题。

## 📥 推荐的CORS扩展

### Chrome浏览器
1. **CORS Unblock** (推荐)
   - [Chrome商店链接](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
   - 简单易用，一键开启/关闭

2. **Allow CORS**
   - [Chrome商店链接](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
   - 功能全面，可自定义规则

### Firefox浏览器
1. **CORS Everywhere**
   - [Firefox商店链接](https://addons.mozilla.org/zh-CN/firefox/addon/cors-everywhere/)

### Safari浏览器
1. **CORS Unblock**
   - 在Safari扩展商店搜索"CORS"

## 🚀 使用步骤

1. **安装扩展**
   - 点击上面的链接安装对应浏览器的CORS扩展

2. **启用扩展**
   - 安装后，在浏览器工具栏会出现扩展图标
   - 点击图标，选择"启用"或"开启"

3. **访问应用**
   - 打开 [https://tianhaocui.github.io/jira-dashboard](https://tianhaocui.github.io/jira-dashboard)
   - 现在应该可以正常登录和使用了

4. **使用完毕后关闭**
   - 为了安全，使用完毕后记得关闭CORS扩展

## ⚠️ 安全提醒

- CORS扩展会降低浏览器的安全性
- 只在使用Jira Dashboard时开启
- 使用完毕后及时关闭扩展
- 不要在开启CORS扩展时访问其他敏感网站

## 🔧 替代方案

如果不想使用CORS扩展，你也可以：

1. **本地代理服务器**
   ```bash
   # 在项目目录运行
   node proxy-server.js
   ```
   然后访问 `http://localhost:3000/jira-dashboard`

2. **Chrome启动参数**（仅限开发测试）
   ```bash
   # macOS
   open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security --disable-features=VizDisplayCompositor
   
   # Windows
   chrome.exe --user-data-dir="c:/temp/chrome_dev_test" --disable-web-security --disable-features=VizDisplayCompositor
   ```

## 📞 技术支持

如果遇到问题，请检查：
1. CORS扩展是否正确安装和启用
2. Jira服务器地址是否正确：`https://jira.logisticsteam.com`
3. 用户名和密码是否正确
4. 网络连接是否正常
