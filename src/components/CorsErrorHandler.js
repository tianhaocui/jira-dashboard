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
  currentProxyIndex = 0,
  retryCount = 0
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
        description={`从GitHub Pages访问Jira服务器时遇到跨域限制，这是浏览器的安全机制。${retryCount > 0 ? ` (已重试 ${retryCount} 次)` : ''}`}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Alert
        message="🚀 快速解决方案"
        description="这是标准的CORS跨域问题。最快的解决方法是激活CORS代理服务，只需要2步操作。"
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Title level={4}>🛠️ 解决方案</Title>

      {/* 方案1: 激活CORS Anywhere (最推荐) */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          <LinkOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          方案1: 激活CORS Anywhere代理 (推荐，2步搞定)
        </Title>
        <Paragraph type="secondary">
          CORS Anywhere是最稳定的代理服务，但需要先激活
        </Paragraph>
        <div style={{ background: '#f6f8fa', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
          <Text strong>激活步骤：</Text>
          <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>点击下方"访问激活页面"按钮</li>
            <li>在新页面中点击"Request temporary access to the demo server"</li>
            <li>返回本页面，切换到"CORS Anywhere"代理</li>
            <li>点击"重试连接"</li>
          </ol>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank')}
          >
            访问激活页面
          </Button>
          <Button
            ghost
            onClick={() => handleSwitchProxy(0)}
            disabled={currentProxyIndex === 0}
          >
            切换到CORS Anywhere
          </Button>
        </Space>
      </div>

      <Divider />

      {/* 方案2: 切换代理 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          <ReloadOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          方案2: 尝试其他CORS代理服务
        </Title>
        <Paragraph type="secondary">
          如果CORS Anywhere无法使用，可以尝试其他代理服务器
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
