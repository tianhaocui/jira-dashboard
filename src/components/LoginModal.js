import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { UserOutlined, KeyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const LoginModal = ({ visible, onLogin, loading }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setError('');
    try {
      const success = await onLogin(values);
      if (success) {
        form.resetFields();
      }
    } catch (err) {
      setError(err.message || '登录失败，请检查您的凭据');
    }
  };

  const handleValuesChange = () => {
    if (error) {
      setError('');
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            连接到 Jira
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            请输入您的 Jira 服务器信息
          </Paragraph>
        </div>
      }
      open={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      className="login-modal"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        className="login-form"
        size="large"
      >
        {error && (
          <Alert
            message="登录失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <div style={{ 
          background: '#f6f8fa', 
          padding: 12, 
          borderRadius: 6, 
          marginBottom: 16,
          fontSize: 14,
          color: '#666'
        }}>
          <strong>Jira 服务器：</strong> https://jira.logisticsteam.com
        </div>

        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入您的Jira用户名"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' }
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="请输入您的Jira密码"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            {loading ? '连接中...' : '连接'}
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div className="login-help">
        <Title level={5}>登录说明</Title>
        <Paragraph style={{ fontSize: 12, margin: 0 }}>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            <li>请使用您的Jira用户名和密码登录</li>
            <li>服务器地址已固定为：https://jira.logisticsteam.com</li>
            <li>支持Jira 6.x版本的基本认证方式</li>
            <li>登录信息将安全保存在本地浏览器中</li>
          </ul>
        </Paragraph>
        
        <Alert
          message="安全提示"
          description="您的登录信息将保存在浏览器本地存储中，不会发送到第三方服务器。建议使用专门的服务账号以确保安全。"
          type="info"
          showIcon
          style={{ marginTop: 12, fontSize: 12 }}
        />
      </div>
    </Modal>
  );
};

export default LoginModal;
