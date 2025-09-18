import React from 'react';
import { Modal, Button, Steps, Alert, Typography, Space } from 'antd';
import { 
  LinkOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const QuickCorsGuide = ({ visible, onClose, onRetry, onShowAdvanced }) => {
  const handleActivateCors = () => {
    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>CORS跨域问题 - 2步解决</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={500}
      footer={[
        <Button key="close" onClick={onClose}>
          稍后处理
        </Button>,
        <Button key="advanced" onClick={onShowAdvanced}>
          更多选项
        </Button>,
        <Button 
          key="activate" 
          type="primary" 
          icon={<LinkOutlined />}
          onClick={handleActivateCors}
        >
          第1步：激活代理
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
          第2步：重试连接
        </Button>
      ]}
    >
      <Alert
        message="这是标准的CORS跨域访问问题"
        description="浏览器阻止了从GitHub Pages到Jira服务器的直接访问，这是正常的安全机制。"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Title level={4}>🚀 2步快速解决：</Title>

      <Steps direction="vertical" size="small" current={-1}>
        <Step
          title="激活CORS代理服务"
          description={
            <div>
              <Paragraph>
                点击下方"第1步：激活代理"按钮，在新页面中点击 
                <Text strong style={{ color: '#52c41a' }}>
                  "Request temporary access to the demo server"
                </Text>
              </Paragraph>
            </div>
          }
          icon={<LinkOutlined />}
        />
        <Step
          title="返回重试连接"
          description={
            <Paragraph>
              激活成功后，返回本页面点击"第2步：重试连接"即可正常使用
            </Paragraph>
          }
          icon={<ReloadOutlined />}
        />
      </Steps>

      <Alert
        message="💡 提示"
        description="激活是临时的，如果以后再次遇到问题，重复这2个步骤即可。"
        type="success"
        showIcon
        style={{ marginTop: 20 }}
      />
    </Modal>
  );
};

export default QuickCorsGuide;
