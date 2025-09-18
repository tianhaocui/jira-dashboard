import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Empty } from 'antd';

const PriorityPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无优先级数据" />;
  }

  // 优先级颜色映射
  const getPriorityColor = (priority) => {
    const colorMap = {
      'Highest': '#f5222d',
      'High': '#fa541c',
      'Medium': '#faad14',
      'Low': '#52c41a',
      'Lowest': '#13c2c2',
      'Critical': '#f5222d',
      'Major': '#fa541c',
      'Minor': '#52c41a',
      'Trivial': '#d9d9d9'
    };
    return colorMap[priority] || '#1890ff';
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
                fill={getPriorityColor(entry.name)} 
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

export default PriorityPieChart;
