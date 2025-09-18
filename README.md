# 🎯 Jira Dashboard

一个现代化的Jira数据可视化看板，支持多维度数据分析和交互式图表展示。

## ✨ 功能特性

### 📊 **数据可视化**
- **饼图分析**: 工单状态分布、优先级分布、工单类型分布
- **柱状图分析**: 开发者工作量、Sprint进度、模块分布
- **趋势图**: 工单创建趋势分析
- **统计卡片**: 工单总数、已解决、待处理、故事点统计

### 🎛️ **多维度筛选**
- **项目筛选**: 支持模糊搜索的项目选择
- **Sprint筛选**: 按Sprint维度分析数据
- **开发者筛选**: 按负责人筛选工单
- **状态筛选**: 多选状态过滤（支持多选）
- **类型筛选**: 多选工单类型过滤（支持多选）
- **时间范围**: 自定义日期范围筛选

### 🔗 **交互功能**
- **可点击统计**: 点击统计卡片查看详细工单列表
- **Jira集成**: 直接跳转到Jira工单详情页
- **实时数据**: 连接Jira API获取最新数据
- **响应式设计**: 适配桌面和移动设备

## 🚀 在线访问

**GitHub Pages**: [https://tianhaocui.github.io/jira-dashboard](https://tianhaocui.github.io/jira-dashboard)

## 🛠️ 技术栈

- **前端框架**: React 18
- **UI组件库**: Ant Design 5
- **图表库**: Recharts
- **HTTP客户端**: Axios
- **日期处理**: Day.js
- **构建工具**: Create React App
- **部署**: GitHub Pages + GitHub Actions

## 📋 系统要求

- **Jira版本**: 支持Jira 6.x+ (使用REST API v2)
- **认证方式**: 用户名/密码 (Basic Auth)
- **浏览器**: Chrome, Firefox, Safari, Edge (现代浏览器)

## 🔧 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

### 构建生产版本
```bash
npm run build
```

### 部署到GitHub Pages
```bash
npm run deploy
```

## ⚙️ 配置说明

### Jira连接配置
- **Base URL**: `https://jira.logisticsteam.com` (已硬编码)
- **认证方式**: Basic Authentication (用户名 + 密码)
- **API版本**: REST API v2

### 自定义字段支持
项目支持以下Jira自定义字段：
- `customfield_10005`: Sprint信息
- `customfield_10002`: 故事点
- `customfield_11103`: 模块信息
- `customfield_11102`: 优先级扩展
- `customfield_11104`: 标签信息
- 更多自定义字段...

## 📱 使用指南

### 1. 登录系统
- 输入Jira用户名和密码
- 系统会自动验证并获取权限

### 2. 选择项目
- 从项目下拉框选择要分析的项目
- 支持模糊搜索快速定位

### 3. 设置筛选条件
- **Sprint**: 选择特定Sprint或查看全部
- **开发者**: 按负责人筛选
- **状态**: 多选工单状态
- **类型**: 多选工单类型
- **日期**: 设置时间范围

### 4. 查看数据分析
- **统计概览**: 查看核心指标
- **分布图表**: 分析各维度数据分布
- **趋势分析**: 了解工单创建趋势

### 5. 深入分析
- **点击统计卡片**: 查看详细工单列表
- **点击工单标题**: 跳转Jira详情页
- **导出数据**: 表格支持分页和搜索

## 🎨 界面预览

### 主要功能界面
- 📊 **仪表板**: 多维度数据可视化
- 🔍 **筛选面板**: 灵活的数据筛选
- 📋 **工单列表**: 详细的工单信息展示
- 🔗 **Jira集成**: 无缝跳转到Jira系统

## 🔐 安全说明

- **本地存储**: 认证信息存储在浏览器本地
- **HTTPS连接**: 所有API请求使用HTTPS加密
- **权限控制**: 基于Jira用户权限访问数据
- **无服务器**: 纯前端应用，无后端数据存储

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发流程
1. Fork本仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- **作者**: tianhaocui
- **邮箱**: tianhao.cui@item.com
- **GitHub**: [https://github.com/tianhaocui](https://github.com/tianhaocui)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！