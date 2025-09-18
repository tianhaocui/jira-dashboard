import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const DeveloperWorkloadChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无开发者数据" />;
  }

  // 限制显示的开发者数量，避免图表过于拥挤
  const displayData = data.slice(0, 10);

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
          <p style={{ margin: '4px 0', color: '#52c41a' }}>
            已解决: {data.resolvedIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#faad14' }}>
            进行中: {data.inProgressIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#f5222d' }}>
            待处理: {data.pendingIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#1890ff' }}>
            总工单: {data.totalIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#722ed1' }}>
            故事点: {data.storyPoints}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#13c2c2' }}>
            平均年龄: {data.avgAge} 天
          </p>
        </div>
      );
    }
    return null;
  };

  // 自定义X轴标签
  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxLength = 10;
    const text = payload.value;
    const displayText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#666" 
          fontSize="12"
          transform="rotate(-45)"
        >
          {displayText}
        </text>
      </g>
    );
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="developer" 
            tick={<CustomXAxisTick />}
            interval={0}
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: 12 }}
          />
          
          <Bar 
            dataKey="resolvedIssues" 
            name="已解决" 
            stackId="a" 
            fill="#52c41a" 
          />
          <Bar 
            dataKey="inProgressIssues" 
            name="进行中" 
            stackId="a" 
            fill="#faad14" 
          />
          <Bar 
            dataKey="pendingIssues" 
            name="待处理" 
            stackId="a" 
            fill="#f5222d" 
          />
        </BarChart>
      </ResponsiveContainer>
      
      {data.length > 10 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 8, 
          fontSize: 12, 
          color: '#999' 
        }}>
          显示前 10 位开发者，共 {data.length} 位
        </div>
      )}
    </div>
  );
};

export default DeveloperWorkloadChart;
