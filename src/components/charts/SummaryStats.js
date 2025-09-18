import React, { useState } from 'react';
import { Row, Col, Progress } from 'antd';
import { 
  BugOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import IssueListModal from '../IssueListModal';

const SummaryStats = ({ stats, allIssues = [] }) => {
  const {
    totalIssues,
    resolvedIssues,
    pendingIssues,
    resolutionRate,
    totalStoryPoints,
    resolvedStoryPoints,
    storyPointsCompletionRate
  } = stats;

  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    issues: [],
    title: '',
    type: ''
  });

  // 处理统计卡片点击
  const handleStatClick = (type) => {
    let filteredIssues = [];
    let title = '';
    
    switch (type) {
      case 'total':
        filteredIssues = allIssues;
        title = '全部工单';
        break;
      case 'resolved':
        filteredIssues = allIssues.filter(issue => issue.isResolved);
        title = '已解决工单';
        break;
      case 'pending':
        filteredIssues = allIssues.filter(issue => !issue.isResolved);
        title = '待处理工单';
        break;
      default:
        return;
    }
    
    setModalData({
      issues: filteredIssues,
      title,
      type
    });
    setModalVisible(true);
  };

  const statCards = [
    {
      title: '工单总数',
      value: totalIssues,
      icon: <BugOutlined />,
      color: '#1890ff',
      type: 'primary',
      clickable: true,
      onClick: () => handleStatClick('total')
    },
    {
      title: '已解决',
      value: resolvedIssues,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      type: 'success',
      suffix: `(${resolutionRate}%)`,
      clickable: true,
      onClick: () => handleStatClick('resolved')
    },
    {
      title: '待处理',
      value: pendingIssues,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      type: 'warning',
      clickable: true,
      onClick: () => handleStatClick('pending')
    },
    {
      title: '故事点总数',
      value: totalStoryPoints,
      icon: <TrophyOutlined />,
      color: '#722ed1',
      type: 'primary',
      clickable: false
    },
    {
      title: '已完成故事点',
      value: resolvedStoryPoints,
      icon: <TrophyOutlined />,
      color: '#52c41a',
      type: 'success',
      suffix: `(${storyPointsCompletionRate}%)`,
      clickable: false
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {statCards.map((stat, index) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={4} key={index}>
            <div 
              className={`stat-card ${stat.type} ${stat.clickable ? 'clickable' : ''}`}
              onClick={stat.clickable ? stat.onClick : undefined}
              style={{
                cursor: stat.clickable ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (stat.clickable) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (stat.clickable) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: stat.color, fontSize: 18, marginRight: 8 }}>
                  {stat.icon}
                </span>
                <span className="stat-label">
                  {stat.title}
                  {stat.clickable && (
                    <span style={{ color: '#999', fontSize: 12, marginLeft: 4 }}>
                      (点击查看)
                    </span>
                  )}
                </span>
              </div>
              
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
                {stat.suffix && (
                  <span style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 进度条显示 */}
      <Row gutter={[20, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <div style={{ 
            padding: '20px 24px', 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              marginBottom: 12, 
              color: '#262626', 
              fontSize: 16,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ color: '#52c41a', marginRight: 8 }}>
                <CheckCircleOutlined />
              </span>
              工单解决率
            </div>
            <Progress 
              percent={parseFloat(resolutionRate)} 
              status={parseFloat(resolutionRate) > 80 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#52c41a',
              }}
              strokeWidth={8}
              format={(percent) => `${percent}%`}
            />
            <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
              {resolvedIssues} / {totalIssues} 个工单已解决
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={12}>
          <div style={{ 
            padding: '20px 24px', 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              marginBottom: 12, 
              color: '#262626', 
              fontSize: 16,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ color: '#722ed1', marginRight: 8 }}>
                <TrophyOutlined />
              </span>
              故事点完成率
            </div>
            <Progress 
              percent={parseFloat(storyPointsCompletionRate)} 
              status={parseFloat(storyPointsCompletionRate) > 80 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#722ed1',
                '100%': '#eb2f96',
              }}
              strokeWidth={8}
              format={(percent) => `${percent}%`}
            />
            <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
              {resolvedStoryPoints} / {totalStoryPoints} 故事点已完成
            </div>
          </div>
        </Col>
      </Row>

      {/* 工单列表模态框 */}
      <IssueListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        issues={modalData.issues}
        title={modalData.title}
        type={modalData.type}
      />
    </div>
  );
};

export default SummaryStats;
