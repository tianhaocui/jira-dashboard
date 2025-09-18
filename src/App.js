import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Spin } from 'antd';
import './App.css';

// 组件导入
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import CorsErrorHandler from './components/CorsErrorHandler';
import QuickCorsGuide from './components/QuickCorsGuide';

// 服务导入
import jiraApi from './services/jiraApi';
import { DataProcessor } from './utils/dataProcessor';

const { Content } = Layout;

function App() {
  // 状态管理
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [rawIssues, setRawIssues] = useState([]); // 暂时注释掉未使用的状态
  const [processedIssues, setProcessedIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]); // 单独存储项目列表
  const [totalIssueCount, setTotalIssueCount] = useState(0); // API返回的总数
  const [statistics, setStatistics] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0
  }); // 筛选条件下的统计数据

  // CORS错误处理状态
  const [showCorsError, setShowCorsError] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(true); // 默认显示简单指导
  const [corsRetryCount, setCorsRetryCount] = useState(0);

  const [filters, setFilters] = useState({
    project: 'all',
    sprint: 'all',
    developer: 'all',
    status: [], // 改为数组，支持多选
    issueType: [], // 改为数组，支持多选
    dateRange: null
  });

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      if (jiraApi.isConfigured()) {
        setLoading(true);
        try {
          const result = await jiraApi.testConnection();
          if (result.success) {
            setIsAuthenticated(true);
            message.success(`欢迎回来，${result.user.displayName}！`);
            await loadData();
          } else {
            message.error('认证失败，请重新登录');
            jiraApi.clearCredentials();
          }
        } catch (error) {
          message.error('连接失败，请检查网络或重新登录');
          jiraApi.clearCredentials();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新统计数据 - 回到简单可靠的本地计算方式
  const updateStatistics = useCallback(async () => {
    if (!isAuthenticated) return;
    
    // 使用本地数据计算统计，避免API超时问题
    const localStats = {
      total: filteredIssues.length,
      resolved: filteredIssues.filter(issue => issue.isResolved).length,
      inProgress: filteredIssues.filter(issue => 
        issue.status && (
          issue.status.toLowerCase().includes('progress') ||
          issue.status.toLowerCase().includes('development') ||
          issue.status.toLowerCase().includes('coding') ||
          issue.status.toLowerCase().includes('active') ||
          issue.status.toLowerCase().includes('working')
        )
      ).length,
      pending: filteredIssues.filter(issue => 
        issue.status && (
          issue.status.toLowerCase().includes('to do') ||
          issue.status.toLowerCase().includes('open') ||
          issue.status.toLowerCase().includes('new') ||
          issue.status.toLowerCase().includes('backlog') ||
          issue.status.toLowerCase().includes('pending') ||
          issue.status.toLowerCase().includes('waiting')
        )
      ).length
    };
    
    setStatistics(localStats);
    console.log('✅ 本地统计数据更新完成:', localStats);
  }, [isAuthenticated, filteredIssues]);

  // 处理过滤器变化
  useEffect(() => {
    if (processedIssues.length > 0) {
      const filtered = DataProcessor.filterIssues(processedIssues, filters);
      setFilteredIssues(filtered);
    }
    // 当筛选条件变化时，更新统计数据
    updateStatistics();
  }, [processedIssues, filters, updateStatistics]);

  // 登录处理
  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      jiraApi.setCredentials(credentials.username, credentials.password);
      
      const result = await jiraApi.testConnection();
      if (result.success) {
        setIsAuthenticated(true);
        message.success(`登录成功，欢迎 ${result.user.displayName || result.user.name || credentials.username}！`);
        
        // 检查用户权限
        try {
          console.log('🔍 开始权限检查...');
          const permissions = await jiraApi.checkUserPermissions();
          console.log('✅ 权限检查完成', permissions);
        } catch (permError) {
          console.warn('⚠️ 权限检查失败:', permError.message);
        }
        
        await loadData();
        return true;
      } else {
        message.error('登录失败：' + result.error);
        jiraApi.clearCredentials();
        return false;
      }
    } catch (error) {
      console.error('登录失败:', error);
      
      // 检查是否是CORS错误
      if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK' || !error.response) {
        setShowCorsError(true);
        message.error('网络连接问题，请尝试切换代理服务器');
      } else {
        message.error('登录失败：' + error.message);
      }
      
      jiraApi.clearCredentials();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // CORS错误处理函数
  const handleCorsRetry = async () => {
    setCorsRetryCount(prev => prev + 1);
    setShowCorsError(false);
    
    // 如果有认证信息，尝试重新连接
    if (jiraApi.isConfigured()) {
      try {
        const result = await jiraApi.testConnection();
        if (result.success) {
          setIsAuthenticated(true);
          await loadData();
          message.success('连接成功！');
        } else {
          setShowCorsError(true);
        }
      } catch (error) {
        setShowCorsError(true);
      }
    } else {
      // 如果没有认证信息，CORS错误对话框关闭后会自动显示登录框
      // 因为 LoginModal 的 visible 条件是 !isAuthenticated && !loading && !showCorsError
    }
  };

  // 切换CORS代理
  const handleSwitchProxy = async (proxyIndex) => {
    try {
      const newConfig = jiraApi.switchCorsProxy(proxyIndex);
      message.info(`已切换到: ${newConfig.proxyName}`);
      return newConfig;
    } catch (error) {
      message.error('切换代理失败');
      throw error;
    }
  };

  // 登出处理
  const handleLogout = () => {
    jiraApi.clearCredentials();
    setIsAuthenticated(false);
    setAvailableProjects([]);
    setProcessedIssues([]);
    setFilteredIssues([]);
    setTotalIssueCount(0);
    setStatistics({ total: 0, resolved: 0, inProgress: 0, pending: 0 });
    message.success('已成功登出');
  };

  // 加载数据 - 按需获取
  const loadData = async (projectKey = null, additionalJql = '') => {
    setLoading(true);
    try {
      console.log('🚀 开始按需数据加载...');
      
      if (projectKey) {
        // 加载特定项目的详细数据 - 限制数量避免循环
        console.log(`📋 加载项目 ${projectKey} 的详细数据...`);
        const jql = `project = "${projectKey}"${additionalJql ? ` AND ${additionalJql}` : ''}`;
        
        // 先获取总数
        const totalResult = await jiraApi.getIssues(jql, 0, 1, 'key');
        const total = totalResult.total || 0;
        console.log(`📊 项目 ${projectKey} 总共有 ${total} 条工单`);
        
        // 如果工单数量合理，获取详细数据；否则只获取样本
        let result;
        if (total <= 1000) {
          console.log('📋 工单数量合理，获取所有数据...');
          result = await jiraApi.getAllIssues(jql);
        } else {
          console.log('📋 工单数量较多，只获取最近1000条...');
          result = await jiraApi.getIssues(jql, 0, 1000, null);
        }
        
        if (result && result.issues) {
          const processed = DataProcessor.processIssues(result.issues);
          setProcessedIssues(processed);
          setTotalIssueCount(total); // 设置API返回的总数
          message.success(`成功加载项目 ${projectKey} 的 ${result.issues.length} 条工单（总计 ${total} 条）`);
        }
      } else {
        // 初始加载：获取项目列表和少量样本数据用于Sprint/开发者列表
        console.log('📊 初始化 - 获取项目列表和样本数据...');
        
        const projects = await jiraApi.getProjects();
        console.log(`✅ 获取到 ${projects.length} 个项目`);
        
        // 获取少量样本数据用于填充Sprint和开发者下拉框
        console.log('📋 获取样本数据用于下拉框...');
        try {
          // 直接获取最新的200条工单，不使用时间筛选
          const sampleResult = await jiraApi.getIssues('', 0, 200, null); // 获取200条样本
          
          if (sampleResult && sampleResult.issues && sampleResult.issues.length > 0) {
            const processed = DataProcessor.processIssues(sampleResult.issues);
            setProcessedIssues(processed);
            setTotalIssueCount(sampleResult.total || 0); // 设置样本数据的总数
            console.log(`✅ 获取到 ${sampleResult.issues.length} 条样本数据用于下拉框（总计 ${sampleResult.total || 0} 条）`);
            message.success(`初始化完成，获取到 ${projects.length} 个项目和 ${sampleResult.issues.length} 条最新工单数据。`);
          } else {
            setProcessedIssues([]);
            setTotalIssueCount(0);
            message.success(`初始化完成，获取到 ${projects.length} 个项目。请选择项目查看数据。`);
          }
        } catch (sampleError) {
          console.warn('⚠️ 样本数据获取失败:', sampleError.message);
          setProcessedIssues([]);
          setTotalIssueCount(0);
          message.success(`初始化完成，获取到 ${projects.length} 个项目。请选择项目查看数据。`);
        }
        
        setAvailableProjects(projects);
      }
      
    } catch (error) {
      message.error('加载数据失败：' + error.message);
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    if (isAuthenticated) {
      loadData();
    }
  };

  // 过滤器变化处理
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // 如果选择了特定项目，重新加载该项目的数据
    if (newFilters.project && newFilters.project !== 'all' && newFilters.project !== filters.project) {
      console.log(`🔄 切换到项目: ${newFilters.project}`);
      loadData(newFilters.project);
    }
  };

  // 重置过滤器
  const handleResetFilters = () => {
    setFilters({
      project: 'all',
      sprint: 'all',
      developer: 'all',
      status: [], // 重置为空数组
      issueType: [], // 重置为空数组
      dateRange: null
    });
  };

  return (
    <div className="App">
      <Layout style={{ minHeight: '100vh' }}>
        <Header 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          loading={loading}
          statistics={statistics}
        />
        
        <Content style={{ padding: '24px' }}>
          {isAuthenticated ? (
            <div>
          <FilterPanel
            issues={processedIssues}
            availableProjects={availableProjects}
            totalIssueCount={totalIssueCount}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            loading={loading}
          />
              
              <Dashboard 
                issues={filteredIssues}
                loading={loading}
                filters={filters}
              />
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '60vh' 
            }}>
              <Spin spinning={loading} size="large">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <h2>欢迎使用 Jira Dashboard</h2>
                  <p>请先登录以查看数据</p>
                </div>
              </Spin>
            </div>
          )}
        </Content>
      </Layout>

      {/* 登录模态框 */}
      <LoginModal
        visible={!isAuthenticated && !loading && !showCorsError}
        onLogin={handleLogin}
        loading={loading}
      />

      {/* 快速CORS解决指导 */}
      <QuickCorsGuide
        visible={showCorsError && showQuickGuide}
        onClose={() => setShowCorsError(false)}
        onRetry={handleCorsRetry}
        onShowAdvanced={() => setShowQuickGuide(false)}
      />

      {/* 详细CORS错误处理模态框 */}
      <CorsErrorHandler
        visible={showCorsError && !showQuickGuide}
        onClose={() => setShowCorsError(false)}
        onRetry={handleCorsRetry}
        onSwitchProxy={handleSwitchProxy}
        availableProxies={jiraApi.getAvailableProxies()}
        currentProxyIndex={jiraApi.currentProxyIndex || 0}
        retryCount={corsRetryCount}
      />
    </div>
  );
}

export default App;
