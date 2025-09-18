import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Empty } from 'antd';

const StatusPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无状态数据" />;
  }

  // 状态颜色映射
  const getStatusColor = (status) => {
    const colorMap = {
      // 基础状态
      'To Do': '#f5222d',
      'In Progress': '#faad14', 
      'Done': '#52c41a',
      'Closed': '#52c41a',
      'Open': '#1890ff',
      'Resolved': '#52c41a',
      'Reopened': '#fa8c16',
      
      // 评审和测试状态
      'In Review': '#722ed1',
      'Code Review': '#722ed1',
      'Testing': '#13c2c2',
      'QA Testing': '#13c2c2',
      'UAT': '#13c2c2',
      
      // 准备状态
      'Ready for Test': '#1890ff',
      'Ready for Deploy': '#722ed1',
      'Ready for Release': '#722ed1',
      
      // 阻塞和问题状态
      'Blocked': '#f5222d',
      'On Hold': '#faad14',
      'Waiting': '#faad14',
      'Pending': '#faad14',
      
      // 开发状态
      'Development': '#faad14',
      'In Development': '#faad14',
      'Coding': '#faad14',
      
      // 部署状态
      'Deploying': '#722ed1',
      'Deployed': '#52c41a',
      
      // 验证状态
      'Verification': '#13c2c2',
      'Verified': '#52c41a',
      
      // 关闭状态
      'Cancelled': '#8c8c8c',
      'Rejected': '#f5222d',
      'Invalid': '#8c8c8c',
      'Duplicate': '#8c8c8c',
      
      // 新建状态
      'New': '#1890ff',
      'Created': '#1890ff',
      'Assigned': '#1890ff',
      
      // 其他常见状态
      'Backlog': '#d9d9d9',
      'Selected for Development': '#1890ff',
      'Won\'t Do': '#8c8c8c',
      'Won\'t Fix': '#8c8c8c'
    };
    
    // 如果找不到精确匹配，尝试模糊匹配
    const lowerStatus = status.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (key.toLowerCase() === lowerStatus) {
        return color;
      }
    }
    
    // 基于关键词的智能匹配
    if (lowerStatus.includes('progress') || lowerStatus.includes('doing') || lowerStatus.includes('active')) {
      return '#faad14'; // 橙色 - 进行中
    }
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('finish') || lowerStatus.includes('resolve')) {
      return '#52c41a'; // 绿色 - 完成
    }
    if (lowerStatus.includes('test') || lowerStatus.includes('qa') || lowerStatus.includes('verify')) {
      return '#13c2c2'; // 青色 - 测试
    }
    if (lowerStatus.includes('review') || lowerStatus.includes('approval')) {
      return '#722ed1'; // 紫色 - 评审
    }
    if (lowerStatus.includes('block') || lowerStatus.includes('stop') || lowerStatus.includes('error')) {
      return '#f5222d'; // 红色 - 阻塞
    }
    if (lowerStatus.includes('wait') || lowerStatus.includes('pending') || lowerStatus.includes('hold')) {
      return '#faad14'; // 橙色 - 等待
    }
    if (lowerStatus.includes('open') || lowerStatus.includes('new') || lowerStatus.includes('create')) {
      return '#1890ff'; // 蓝色 - 新建
    }
    if (lowerStatus.includes('close') || lowerStatus.includes('cancel') || lowerStatus.includes('reject')) {
      return '#8c8c8c'; // 灰色 - 关闭
    }
    
    // 默认颜色 - 浅灰色
    return '#d9d9d9';
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
          padding: '8px 12px',
          fontSize: 12
        }}>
          <p style={{ margin: 0 }}>
            <strong>{data.name}</strong>
          </p>
          <p style={{ margin: 0 }}>
            数量: {data.value} 个
          </p>
          <p style={{ margin: 0 }}>
            占比: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 自定义标签
  const renderLabel = (entry) => {
    if (entry.percentage > 5) { // 只显示占比大于5%的标签
      return `${entry.percentage}%`;
    }
    return '';
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getStatusColor(entry.name)} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: 12 }}>
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
