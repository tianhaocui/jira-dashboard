import React from 'react';
import { Modal, Table, Tag, Button, Space, Tooltip } from 'antd';
import { LinkOutlined, BugOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const IssueListModal = ({ 
  visible, 
  onClose, 
  issues, 
  title, 
  type 
}) => {
  // 根据类型获取不同的颜色和图标
  const getTypeConfig = (type) => {
    const configs = {
      total: { color: '#1890ff', icon: <BugOutlined />, title: '全部工单' },
      resolved: { color: '#52c41a', icon: <CheckCircleOutlined />, title: '已解决工单' },
      pending: { color: '#faad14', icon: <BookOutlined />, title: '待处理工单' },
      inProgress: { color: '#722ed1', icon: <BookOutlined />, title: '进行中工单' }
    };
    return configs[type] || configs.total;
  };

  const typeConfig = getTypeConfig(type);

  // 生成Jira详情页链接
  const getJiraUrl = (issueKey) => {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'https://jira.logisticsteam.com' 
      : 'https://jira.logisticsteam.com';
    return `${baseUrl}/browse/${issueKey}`;
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    const colorMap = {
      'Done': 'success',
      'Closed': 'success', 
      'Resolved': 'success',
      'In Progress': 'processing',
      'Development': 'processing',
      'Testing': 'warning',
      'To Do': 'default',
      'Open': 'default',
      'Blocked': 'error'
    };
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('resolve') || lowerStatus.includes('complete')) {
      return 'success';
    }
    if (lowerStatus.includes('progress') || lowerStatus.includes('development') || lowerStatus.includes('coding')) {
      return 'processing';
    }
    if (lowerStatus.includes('test') || lowerStatus.includes('review')) {
      return 'warning';
    }
    if (lowerStatus.includes('block') || lowerStatus.includes('error')) {
      return 'error';
    }
    return colorMap[status] || 'default';
  };

  // 获取优先级颜色
  const getPriorityColor = (priority) => {
    const colorMap = {
      'Highest': '#f5222d',
      'High': '#fa541c',
      'Medium': '#faad14',
      'Low': '#52c41a',
      'Lowest': '#1890ff'
    };
    return colorMap[priority] || '#666';
  };

  const columns = [
    {
      title: '工单',
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (key, record) => (
        <Tooltip title="点击查看Jira详情">
          <Button 
            type="link" 
            size="small"
            icon={<LinkOutlined />}
            onClick={() => window.open(getJiraUrl(key), '_blank')}
            style={{ padding: 0, fontWeight: 'bold' }}
          >
            {key}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '标题',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => (
        <Tooltip title={summary}>
          <Button 
            type="link" 
            size="small"
            onClick={() => window.open(getJiraUrl(record.key), '_blank')}
            style={{ 
              padding: 0, 
              textAlign: 'left',
              height: 'auto',
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
          >
            {summary}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'issueType',
      key: 'issueType',
      width: 80,
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag style={{ color: getPriorityColor(priority), borderColor: getPriorityColor(priority) }}>
          {priority}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'developer',
      key: 'developer',
      width: 100,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created',
      width: 100,
      render: (created) => (
        <span>{dayjs(created).format('MM-DD')}</span>
      ),
    },
    {
      title: '故事点',
      dataIndex: 'storyPoints',
      key: 'storyPoints',
      width: 80,
      render: (points) => points || '-',
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <span style={{ color: typeConfig.color }}>
            {typeConfig.icon}
          </span>
          <span>{title || typeConfig.title}</span>
          <Tag color={typeConfig.color}>{issues.length} 条</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ maxWidth: 1200 }}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      <Table
        columns={columns}
        dataSource={issues}
        rowKey="key"
        size="small"
        scroll={{ x: 800, y: 400 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `显示 ${range[0]}-${range[1]} 条，共 ${total} 条工单`,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 20
        }}
      />
    </Modal>
  );
};

export default IssueListModal;
