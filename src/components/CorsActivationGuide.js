import React from 'react';
import { Modal, Button, Steps, Alert, Typography, Space } from 'antd';
import { 
  LinkOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const CorsActivationGuide = ({ visible, onClose, onRetry }) => {
  const handleActivateCors = () => {
    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          <span>需要激活CORS代理</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={450}
      footer={[
        <Button key="close" onClick={onClose}>
          取消
        </Button>,
        <Button 
          key="activate" 
          type="primary" 
          icon={<LinkOutlined />}
          onClick={handleActivateCors}
        >
          激活代理
        </Button>,
        <Button 
          key="retry" 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => {
            onRetry();
            onClose();
          }}
        >
          重试连接
        </Button>
      ]}
    >
      <Alert
        message="检测到需要激活CORS代理服务"
        description="为了绕过浏览器的跨域限制，需要先激活代理服务。"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Title level={4}>🚀 激活步骤：</Title>

      <Steps direction="vertical" size="small" current={-1}>
        <Step
          title="点击激活代理"
          description={
            <Paragraph>
              点击下方"激活代理"按钮，会在新标签页打开激活页面
            </Paragraph>
          }
          icon={<LinkOutlined />}
        />
        <Step
          title="激活服务"
          description={
            <Paragraph>
              在新页面中点击 
              <Text strong style={{ color: '#52c41a' }}>
                "Request temporary access to the demo server"
              </Text> 按钮
            </Paragraph>
          }
        />
        <Step
          title="返回重试"
          description={
            <Paragraph>
              激活成功后，返回本页面点击"重试连接"即可
            </Paragraph>
          }
          icon={<ReloadOutlined />}
        />
      </Steps>

      <Alert
        message="💡 说明"
        description="激活是临时的，如果以后再次遇到问题，重复这个步骤即可。"
        type="success"
        showIcon
        style={{ marginTop: 20 }}
      />
    </Modal>
  );
};

export default CorsActivationGuide;
