import React from 'react';
import { Button, Space, Statistic, Tooltip } from 'antd';
import { 
  LogoutOutlined, 
  ReloadOutlined, 
  DashboardOutlined,
  BugOutlined
} from '@ant-design/icons';

const Header = ({ 
  isAuthenticated, 
  onLogout, 
  onRefresh, 
  loading, 
  statistics = { total: 0, resolved: 0, inProgress: 0, pending: 0 }
}) => {
  return (
    <div className="header-left">
      <div className="header-logo">
        <DashboardOutlined style={{ marginRight: 8 }} />
        Jira Dashboard
      </div>
      
      {isAuthenticated && (
        <div className="header-stats">
          <Space size="large">
            <Statistic
              title="工单总数"
              value={statistics.total}
              prefix={<BugOutlined />}
              valueStyle={{ fontSize: 16, color: '#1890ff' }}
            />
            
            <Statistic
              title="已解决"
              value={statistics.resolved}
              valueStyle={{ fontSize: 16, color: '#52c41a' }}
            />
            
            <Statistic
              title="进行中"
              value={statistics.inProgress}
              valueStyle={{ fontSize: 16, color: '#faad14' }}
            />
            
            <Statistic
              title="待处理"
              value={statistics.pending}
              valueStyle={{ fontSize: 16, color: '#f5222d' }}
            />
          </Space>
        </div>
      )}
      
      <div className="header-right" style={{ marginLeft: 'auto' }}>
        {isAuthenticated && (
          <Space>
            <Tooltip title="刷新数据">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={onRefresh}
              >
                刷新
              </Button>
            </Tooltip>
            
            {loading && (
              <Tooltip title="停止加载并刷新页面">
                <Button
                  type="text"
                  danger
                  onClick={() => window.location.reload()}
                >
                  停止
                </Button>
              </Tooltip>
            )}
            
            <Tooltip title="退出登录">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={onLogout}
                danger
              >
                退出
              </Button>
            </Tooltip>
          </Space>
        )}
      </div>
    </div>
  );
};

export default Header;
