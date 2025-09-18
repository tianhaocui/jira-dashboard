import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const ModuleDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无模块数据" />;
  }

  // 限制显示的模块数量
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
          <p style={{ margin: '4px 0', color: '#1890ff' }}>
            工单数量: {data.value} 个
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#faad14' }}>
            占比: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 自定义X轴标签
  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxLength = 12;
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

  // 动态颜色生成
  const getBarColor = (index) => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fa541c', '#2f54eb', '#fa8c16'
    ];
    return colors[index % colors.length];
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
            dataKey="name" 
            tick={<CustomXAxisTick />}
            interval={0}
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar 
            dataKey="value" 
            fill="#1890ff"
          >
            {displayData.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {data.length > 10 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 8, 
          fontSize: 12, 
          color: '#999' 
        }}>
          显示前 10 个模块，共 {data.length} 个
        </div>
      )}
    </div>
  );
};

export default ModuleDistributionChart;
