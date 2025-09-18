import React from 'react';
import { Row, Col, Card, Empty, Spin } from 'antd';
import { DataProcessor } from '../utils/dataProcessor';

// 图表组件导入
import SummaryStats from './charts/SummaryStats';
import StatusPieChart from './charts/StatusPieChart';
import PriorityPieChart from './charts/PriorityPieChart';
import IssueTypePieChart from './charts/IssueTypePieChart';
import SprintProgressChart from './charts/SprintProgressChart';
import CreationTrendChart from './charts/CreationTrendChart';

const Dashboard = ({ issues, loading, filters }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>
          正在加载数据...
        </div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="empty-state">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div className="empty-title">暂无数据</div>
              <div className="empty-description">
                {Object.values(filters).some(v => v && v !== 'all') 
                  ? '当前筛选条件下没有找到工单数据，请尝试调整筛选条件'
                  : '请先连接到 Jira 并加载数据'
                }
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // 生成各种统计数据
  const summaryStats = DataProcessor.generateSummaryStats(issues);
  const statusDistribution = DataProcessor.generateStatusDistribution(issues);
  const priorityDistribution = DataProcessor.generatePriorityDistribution(issues);
  const issueTypeDistribution = DataProcessor.generateIssueTypeDistribution(issues);
  const sprintProgress = DataProcessor.generateSprintProgress(issues);
  const creationTrend = DataProcessor.generateCreationTrend(issues, 'week');

  return (
    <div className="dashboard fade-in">
      {/* 汇总统计卡片 */}
      <SummaryStats stats={summaryStats} allIssues={issues} />

      {/* 第一行：饼图 */}
      <Row gutter={[24, 24]} className="dashboard-row">
        <Col xs={24} lg={8} className="dashboard-col">
          <Card 
            title="工单状态分布" 
            className="dashboard-card"
            bodyStyle={{ padding: '20px' }}
          >
            <StatusPieChart data={statusDistribution} />
          </Card>
        </Col>
        
        <Col xs={24} lg={8} className="dashboard-col">
          <Card 
            title="优先级分布" 
            className="dashboard-card"
            bodyStyle={{ padding: '20px' }}
          >
            <PriorityPieChart data={priorityDistribution} />
          </Card>
        </Col>
        
        <Col xs={24} lg={8} className="dashboard-col">
          <Card 
            title="工单类型分布" 
            className="dashboard-card"
            bodyStyle={{ padding: '20px' }}
          >
            <IssueTypePieChart data={issueTypeDistribution} />
          </Card>
        </Col>
      </Row>

      {/* 第二行：分析图表 */}
      <Row gutter={[24, 24]} className="dashboard-row">
        <Col xs={24} lg={12} className="dashboard-col">
          <Card 
            title="Sprint 进度分析" 
            className="dashboard-card"
            bodyStyle={{ padding: '20px' }}
          >
            <SprintProgressChart data={sprintProgress} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12} className="dashboard-col">
          <Card 
            title="工单创建趋势（按周）" 
            className="dashboard-card"
            bodyStyle={{ padding: '20px' }}
          >
            <CreationTrendChart data={creationTrend} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
