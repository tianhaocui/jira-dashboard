import React, { useState } from 'react';
import { Modal, Alert, Button, List, Space, Typography, Divider } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ReloadOutlined, 
  LinkOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const CorsErrorHandler = ({ 
  visible, 
  onClose, 
  onRetry, 
  onSwitchProxy,
  availableProxies = [],
  currentProxyIndex = 0 
}) => {
  const [loading, setLoading] = useState(false);

  const handleSwitchProxy = async (proxyIndex) => {
    setLoading(true);
    try {
      await onSwitchProxy(proxyIndex);
      // 等待一下再重试
      setTimeout(() => {
        onRetry();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('切换代理失败:', error);
      setLoading(false);
    }
  };

  const solutions = [
    {
      title: '方案1: 切换CORS代理',
      description: '尝试使用不同的代理服务器',
      action: 'switch-proxy',
      icon: <ReloadOutlined />,
      color: '#1890ff'
    },
    {
      title: '方案2: 激活CORS Anywhere',
      description: '访问代理服务激活页面',
      action: 'activate-cors',
      icon: <LinkOutlined />,
      color: '#52c41a'
    },
    {
      title: '方案3: 使用浏览器扩展',
      description: '安装CORS浏览器扩展',
      action: 'browser-extension',
      icon: <WarningOutlined />,
      color: '#faad14'
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>网络连接问题</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button 
          key="retry" 
          type="primary" 
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => onRetry()}
        >
          重试连接
        </Button>
      ]}
    >
      <Alert
        message="CORS跨域访问被阻止"
        description="从GitHub Pages访问Jira服务器时遇到跨域限制，这是浏览器的安全机制。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Title level={4}>🛠️ 解决方案</Title>

      {/* 方案1: 切换代理 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          <ReloadOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          方案1: 切换CORS代理服务
        </Title>
        <Paragraph type="secondary">
          尝试使用不同的代理服务器来绕过CORS限制
        </Paragraph>
        
        <List
          size="small"
          dataSource={availableProxies}
          renderItem={(proxy, index) => (
            <List.Item
              actions={[
                <Button
                  key="switch"
                  type={index === currentProxyIndex ? "primary" : "default"}
                  size="small"
                  loading={loading}
                  disabled={index === currentProxyIndex}
                  onClick={() => handleSwitchProxy(index)}
                  icon={index === currentProxyIndex ? <CheckCircleOutlined /> : <ReloadOutlined />}
                >
                  {index === currentProxyIndex ? '当前使用' : '切换到此代理'}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={proxy.name}
                description={proxy.description}
              />
            </List.Item>
          )}
        />
      </div>

      <Divider />

      {/* 方案2: 激活CORS Anywhere */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          <LinkOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          方案2: 激活CORS Anywhere代理
        </Title>
        <Paragraph type="secondary">
          如果使用CORS Anywhere代理，需要先激活服务
        </Paragraph>
        <Space>
          <Button
            type="primary"
            ghost
            icon={<LinkOutlined />}
            onClick={() => window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank')}
          >
            访问激活页面
          </Button>
          <Text type="secondary">点击"Request temporary access"按钮</Text>
        </Space>
      </div>

      <Divider />

      {/* 方案3: 浏览器扩展 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>
          <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
          方案3: 安装浏览器CORS扩展
        </Title>
        <Paragraph type="secondary">
          安装浏览器扩展来临时禁用CORS检查（仅用于开发测试）
        </Paragraph>
        <Space direction="vertical">
          <Button
            ghost
            onClick={() => window.open('https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino', '_blank')}
          >
            Chrome: CORS Unblock
          </Button>
          <Button
            ghost
            onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/', '_blank')}
          >
            Firefox: CORS Everywhere
          </Button>
        </Space>
      </div>

      <Alert
        message="安全提醒"
        description="使用CORS代理或浏览器扩展时，请注意数据安全。建议仅在可信环境中使用。"
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default CorsErrorHandler;
