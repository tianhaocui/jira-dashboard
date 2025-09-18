import React from 'react';
import { Card, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { DataProcessor } from '../utils/dataProcessor';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterPanel = ({ 
  issues, 
  availableProjects = [], // 从App传入的项目列表
  totalIssueCount = 0, // API返回的总工单数
  filters, 
  onFilterChange, 
  onReset, 
  loading 
}) => {
  // 获取唯一值列表
  const developers = DataProcessor.getUniqueDevelopers(issues);
  const sprints = DataProcessor.getUniqueSprints(issues);
  const projects = availableProjects.length > 0 ? availableProjects : DataProcessor.getUniqueProjects(issues);
  const statuses = [...new Set(issues.map(issue => issue.status))].sort();
  const issueTypes = [...new Set(issues.map(issue => issue.issueType))].sort();

  // 调试信息
  console.log('🔍 FilterPanel 数据统计:');
  console.log(`   - 总工单数: ${issues.length}`);
  console.log(`   - 项目数: ${projects.length} (来源: ${availableProjects.length > 0 ? 'API项目列表' : '工单数据'})`);
  console.log(`   - Sprint数: ${sprints.length}`);
  console.log(`   - 开发者数: ${developers.length}`);
  console.log(`   - 状态数: ${statuses.length}`);
  console.log(`   - 工单类型数: ${issueTypes.length}`);
  
  // 如果没有工单数据，显示提示
  const hasData = issues.length > 0;

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleDateRangeChange = (dates) => {
    const dateRange = dates && dates.length === 2 ? 
      [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : 
      null;
    onFilterChange({ dateRange });
  };

  return (
    <Card 
      title="数据筛选" 
      className="filter-panel"
      extra={
        <Space>
          <Button 
            icon={<ClearOutlined />} 
            onClick={onReset}
            disabled={loading}
          >
            重置
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <label>项目</label>
            <Select
              value={filters.project}
              onChange={(value) => handleFilterChange('project', value)}
              style={{ width: '100%' }}
              disabled={loading}
              showSearch
              placeholder="搜索项目..."
              optionFilterProp="children"
              filterOption={(input, option) => {
                const text = String(option.children || '').toLowerCase();
                const searchText = input.toLowerCase();
                // 支持项目key和项目名称的模糊搜索
                return text.indexOf(searchText) >= 0;
              }}
            >
              <Option value="all">全部项目 ({projects.length})</Option>
              {projects.map(project => (
                <Option key={project.key} value={project.key}>
                  {project.key} - {project.name}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <label>Sprint</label>
            <Select
              value={filters.sprint}
              onChange={(value) => handleFilterChange('sprint', value)}
              style={{ width: '100%' }}
              disabled={loading || !hasData}
              showSearch
              placeholder={hasData ? "搜索Sprint..." : "请先选择项目"}
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (!hasData) return false;
                const text = String(option.children || '').toLowerCase();
                const searchText = input.toLowerCase();
                return text.indexOf(searchText) >= 0;
              }}
            >
              <Option value="all">全部 Sprint ({sprints.length})</Option>
              {sprints.map(sprint => (
                <Option key={sprint.id || sprint.name} value={sprint.name}>
                  {sprint.name} ({sprint.state})
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <label>开发者</label>
            <Select
              value={filters.developer}
              onChange={(value) => handleFilterChange('developer', value)}
              style={{ width: '100%' }}
              disabled={loading || !hasData}
              showSearch
              placeholder={hasData ? "搜索开发者..." : "请先选择项目"}
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (!hasData) return false;
                const text = String(option.children || '').toLowerCase();
                const searchText = input.toLowerCase();
                return text.indexOf(searchText) >= 0;
              }}
            >
              <Option value="all">全部开发者 ({developers.length})</Option>
              {developers.map(developer => (
                <Option key={developer} value={developer}>
                  {developer}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <label>状态</label>
            <Select
              mode="multiple"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              disabled={loading || !hasData}
              showSearch
              placeholder={hasData ? "选择状态..." : "请先选择项目"}
              optionFilterProp="children"
              maxTagCount="responsive"
              filterOption={(input, option) => {
                if (!hasData) return false;
                const text = String(option.children || '').toLowerCase();
                const searchText = input.toLowerCase();
                return text.indexOf(searchText) >= 0;
              }}
            >
              {statuses.map(status => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <label>工单类型</label>
            <Select
              mode="multiple"
              value={filters.issueType}
              onChange={(value) => handleFilterChange('issueType', value)}
              style={{ width: '100%' }}
              disabled={loading || !hasData}
              showSearch
              placeholder={hasData ? "选择工单类型..." : "请先选择项目"}
              optionFilterProp="children"
              maxTagCount="responsive"
              filterOption={(input, option) => {
                if (!hasData) return false;
                const text = String(option.children || '').toLowerCase();
                const searchText = input.toLowerCase();
                return text.indexOf(searchText) >= 0;
              }}
            >
              {issueTypes.map(type => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label>创建日期范围</label>
            <RangePicker
              value={filters.dateRange ? [
                dayjs(filters.dateRange[0]), 
                dayjs(filters.dateRange[1])
              ] : null}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              disabled={loading}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          </div>
        </Col>
      </Row>

      {/* 显示当前筛选统计 */}
      <div style={{ 
        marginTop: 16, 
        padding: '12px 16px', 
        background: hasData ? '#f6f8fa' : '#fff7e6', 
        borderRadius: 6,
        fontSize: 12,
        color: hasData ? '#666' : '#d46b08'
      }}>
        {hasData ? (
          <Space split="|">
            <span>项目总数: {totalIssueCount.toLocaleString()} 条</span>
            <span>已加载: {issues.length} 条</span>
            <span>当前筛选: {
              Object.entries(filters).filter(([key, value]) => {
                if (key === 'dateRange') return value && value.length === 2;
                if (key === 'status' || key === 'issueType') return Array.isArray(value) && value.length > 0;
                return value && value !== 'all';
              }).length
            } 个条件</span>
            {filters.project !== 'all' && <span>项目: {filters.project}</span>}
            {filters.sprint !== 'all' && <span>Sprint: {filters.sprint}</span>}
            {filters.developer !== 'all' && <span>开发者: {filters.developer}</span>}
            {filters.status && filters.status.length > 0 && <span>状态: {filters.status.length}项</span>}
            {filters.issueType && filters.issueType.length > 0 && <span>类型: {filters.issueType.length}项</span>}
            {filters.dateRange && <span>日期: {filters.dateRange[0]} ~ {filters.dateRange[1]}</span>}
          </Space>
        ) : (
          <span>💡 请在项目下拉框中选择一个项目来查看数据和图表</span>
        )}
      </div>
    </Card>
  );
};

export default FilterPanel;
