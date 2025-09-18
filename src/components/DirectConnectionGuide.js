import React from 'react';
import { Alert, Typography, Space, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const DirectConnectionGuide = ({ onRetry, onShowCorsOptions }) => {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Alert
        message="🎯 使用与本地开发相同的连接方式"
        description="我们检测到您在本地开发时使用直接连接是成功的，现在尝试在生产环境中使用相同的方式。"
        type="success"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Title level={4}>
        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        直接连接方案
      </Title>
      
      <Paragraph>
        本地开发时，您的 <Text code>package.json</Text> 中配置了：
      </Paragraph>
      
      <div style={{ 
        background: '#f6f8fa', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '16px',
        fontFamily: 'monospace'
      }}>
        "proxy": "https://jira.logisticsteam.com"
      </div>
      
      <Paragraph>
        这个配置让React开发服务器直接代理请求到Jira服务器，避免了CORS问题。
        现在我们尝试在生产环境中使用相同的直接连接方式。
      </Paragraph>

      <Alert
        message="如果直接连接失败"
        description="某些企业网络或浏览器可能仍然阻止直接连接，这时我们提供了多种备用代理方案。"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Space>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={onRetry}
        >
          尝试直接连接
        </Button>
        <Button 
          ghost
          icon={<ExclamationCircleOutlined />}
          onClick={onShowCorsOptions}
        >
          查看其他选项
        </Button>
      </Space>
    </div>
  );
};

export default DirectConnectionGuide;
