import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';

const SprintProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Empty description="暂无Sprint数据" />;
  }

  // 限制显示的Sprint数量
  const displayData = data.slice(0, 8);

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
          fontSize: 12,
          maxWidth: 250
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {label}
          </p>
          <p style={{ margin: '4px 0', color: '#13c2c2' }}>
            状态: {data.state}
          </p>
          <p style={{ margin: '4px 0', color: '#1890ff' }}>
            总工单: {data.totalIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#52c41a' }}>
            已解决: {data.resolvedIssues} 个
          </p>
          <p style={{ margin: '4px 0', color: '#722ed1' }}>
            总故事点: {data.totalStoryPoints}
          </p>
          <p style={{ margin: '4px 0', color: '#52c41a' }}>
            已完成故事点: {data.resolvedStoryPoints}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#faad14' }}>
            完成率: {data.completionRate}%
          </p>
          
          {data.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #444' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 11, color: '#ccc' }}>状态分布:</p>
              {Object.entries(data.statusBreakdown).map(([status, count]) => (
                <p key={status} style={{ margin: '2px 0', fontSize: 11 }}>
                  {status}: {count}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 自定义X轴标签
  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxLength = 15;
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
          transform="rotate(-30)"
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
            bottom: 80
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="sprint" 
            tick={<CustomXAxisTick />}
            interval={0}
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: 12 }}
          />
          
          <Bar 
            dataKey="totalIssues" 
            name="总工单" 
            fill="#1890ff" 
            opacity={0.7}
          />
          <Bar 
            dataKey="resolvedIssues" 
            name="已解决" 
            fill="#52c41a" 
          />
        </BarChart>
      </ResponsiveContainer>
      
      {data.length > 8 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 8, 
          fontSize: 12, 
          color: '#999' 
        }}>
          显示前 8 个 Sprint，共 {data.length} 个
        </div>
      )}
    </div>
  );
};

export default SprintProgressChart;
