import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const CreationTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无趋势数据" />;
  }

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
          padding: '12px',
          fontSize: 12
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {label}
          </p>
          <p style={{ margin: '4px 0', color: '#1890ff' }}>
            创建工单: {data.count} 个
          </p>
          <p style={{ margin: '4px 0', color: '#722ed1' }}>
            故事点: {data.storyPoints}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#52c41a' }}>
            已解决: {data.resolved} 个
          </p>
        </div>
      );
    }
    return null;
  };

  // 格式化X轴标签
  const formatXAxisLabel = (tickItem) => {
    // 如果是周格式 (YYYY-WWW)
    if (tickItem.includes('-W')) {
      const [year, week] = tickItem.split('-W');
      return `${year}年第${week}周`;
    }
    // 如果是月格式 (YYYY-MM)
    if (tickItem.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = tickItem.split('-');
      return `${year}年${month}月`;
    }
    // 默认返回原值
    return tickItem;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: '#666' }}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: 12 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="count" 
            name="创建工单数" 
            stroke="#1890ff" 
            strokeWidth={2}
            dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="resolved" 
            name="解决工单数" 
            stroke="#52c41a" 
            strokeWidth={2}
            dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#52c41a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CreationTrendChart;
