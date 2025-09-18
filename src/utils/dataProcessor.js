import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import _ from 'lodash';

// 扩展dayjs插件
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

// 数据处理工具类
export class DataProcessor {
  
  // 处理工单数据，提取关键信息
  static processIssues(issues) {
    return issues.map(issue => {
      const fields = issue.fields;
      
      return {
        key: issue.key,
        summary: fields.summary,
        status: fields.status?.name || 'Unknown',
        statusCategory: fields.status?.statusCategory?.name || 'Unknown',
        assignee: fields.assignee?.displayName || 'Unassigned',
        assigneeKey: fields.assignee?.accountId || null,
        reporter: fields.reporter?.displayName || 'Unknown',
        priority: fields.priority?.name || 'Unknown',
        issueType: fields.issuetype?.name || 'Unknown',
        issueTypeIcon: fields.issuetype?.iconUrl || null,
        project: fields.project?.key || 'Unknown',
        projectName: fields.project?.name || 'Unknown',
        created: dayjs(fields.created).format('YYYY-MM-DD'),
        updated: dayjs(fields.updated).format('YYYY-MM-DD'),
        resolutionDate: fields.resolutiondate ? dayjs(fields.resolutiondate).format('YYYY-MM-DD') : null,
        
        // 自定义字段
        storyPoints: fields.customfield_10002 || 0,
        sprint: this.extractSprintInfo(fields.customfield_10005),
        developer: fields.customfield_11103?.displayName || fields.customfield_11000?.displayName || fields.assignee?.displayName || 'Unassigned',
        qa: fields.customfield_11102?.displayName || 'Unassigned',
        ba: fields.customfield_11104?.displayName || 'Unassigned',
        module: fields.customfield_10105?.value || fields.customfield_10802 || 'Unknown',
        product: fields.customfield_12000?.value || 'Unknown',
        demandType: fields.customfield_12300?.value || 'Unknown',
        requestUser: fields.customfield_10800?.displayName || 'Unknown',
        app: fields.customfield_10801 || 'Unknown',
        
        // 计算字段
        ageInDays: dayjs().diff(dayjs(fields.created), 'day'),
        isResolved: !!fields.resolutiondate,
        
        // 原始数据保留
        rawFields: fields
      };
    });
  }

  // 提取Sprint信息
  static extractSprintInfo(sprintField) {
    if (!sprintField || !Array.isArray(sprintField)) {
      return { name: 'No Sprint', id: null, state: 'unknown' };
    }

    // 取最后一个Sprint（当前Sprint）
    const currentSprint = sprintField[sprintField.length - 1];
    if (typeof currentSprint === 'string') {
      // 解析Sprint字符串格式
      const match = currentSprint.match(/name=([^,]+)/);
      const nameMatch = match ? match[1] : 'Unknown Sprint';
      const idMatch = currentSprint.match(/id=(\d+)/);
      const stateMatch = currentSprint.match(/state=(\w+)/);
      
      return {
        name: nameMatch,
        id: idMatch ? parseInt(idMatch[1]) : null,
        state: stateMatch ? stateMatch[1] : 'unknown'
      };
    }
    
    return {
      name: currentSprint.name || 'Unknown Sprint',
      id: currentSprint.id || null,
      state: currentSprint.state || 'unknown'
    };
  }

  // 生成状态分布数据（饼图）
  static generateStatusDistribution(issues) {
    const statusCount = _.countBy(issues, 'status');
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1)
    }));
  }

  // 生成优先级分布数据（饼图）
  static generatePriorityDistribution(issues) {
    const priorityCount = _.countBy(issues, 'priority');
    
    return Object.entries(priorityCount).map(([priority, count]) => ({
      name: priority,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1)
    }));
  }

  // 生成工单类型分布数据（饼图）
  static generateIssueTypeDistribution(issues) {
    const typeCount = _.countBy(issues, 'issueType');
    
    return Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1)
    }));
  }

  // 生成开发者工作量分布（柱状图）
  static generateDeveloperWorkload(issues) {
    const developerGroups = _.groupBy(issues, 'developer');
    
    return Object.entries(developerGroups).map(([developer, issueList]) => {
      const totalStoryPoints = _.sumBy(issueList, 'storyPoints');
      const resolvedCount = issueList.filter(issue => issue.isResolved).length;
      const inProgressCount = issueList.filter(issue => 
        issue.statusCategory === 'In Progress' || issue.status === 'In Progress'
      ).length;
      
      return {
        developer,
        totalIssues: issueList.length,
        resolvedIssues: resolvedCount,
        inProgressIssues: inProgressCount,
        pendingIssues: issueList.length - resolvedCount - inProgressCount,
        storyPoints: totalStoryPoints,
        avgAge: _.meanBy(issueList, 'ageInDays').toFixed(1)
      };
    }).sort((a, b) => b.totalIssues - a.totalIssues);
  }

  // 生成Sprint进度分析（柱状图）
  static generateSprintProgress(issues) {
    const sprintGroups = _.groupBy(issues, issue => issue.sprint.name);
    
    return Object.entries(sprintGroups).map(([sprintName, issueList]) => {
      const totalStoryPoints = _.sumBy(issueList, 'storyPoints');
      const resolvedStoryPoints = _.sumBy(
        issueList.filter(issue => issue.isResolved), 
        'storyPoints'
      );
      
      const statusBreakdown = _.countBy(issueList, 'status');
      
      return {
        sprint: sprintName,
        totalIssues: issueList.length,
        resolvedIssues: issueList.filter(issue => issue.isResolved).length,
        totalStoryPoints,
        resolvedStoryPoints,
        completionRate: totalStoryPoints > 0 ? 
          ((resolvedStoryPoints / totalStoryPoints) * 100).toFixed(1) : '0',
        statusBreakdown,
        state: issueList[0]?.sprint?.state || 'unknown'
      };
    }).sort((a, b) => {
      // 按Sprint状态和名称排序
      if (a.state !== b.state) {
        const stateOrder = { 'active': 0, 'future': 1, 'closed': 2 };
        return (stateOrder[a.state] || 3) - (stateOrder[b.state] || 3);
      }
      return a.sprint.localeCompare(b.sprint);
    });
  }

  // 生成模块分布数据
  static generateModuleDistribution(issues) {
    const moduleCount = _.countBy(issues, 'module');
    
    return Object.entries(moduleCount).map(([module, count]) => ({
      name: module,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);
  }

  // 生成产品分布数据
  static generateProductDistribution(issues) {
    const productCount = _.countBy(issues, 'product');
    
    return Object.entries(productCount).map(([product, count]) => ({
      name: product,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);
  }

  // 生成时间趋势数据（按创建日期）
  static generateCreationTrend(issues, period = 'week') {
    const grouped = _.groupBy(issues, issue => {
      const date = dayjs(issue.created);
      if (period === 'week') {
        return `${date.year()}-W${date.week().toString().padStart(2, '0')}`;
      } else if (period === 'month') {
        return date.format('YYYY-MM');
      } else {
        return date.format('YYYY-MM-DD');
      }
    });
    
    return Object.entries(grouped).map(([period, issueList]) => ({
      period,
      count: issueList.length,
      storyPoints: _.sumBy(issueList, 'storyPoints'),
      resolved: issueList.filter(issue => issue.isResolved).length
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  // 生成解决时间趋势数据
  static generateResolutionTrend(issues, period = 'week') {
    const resolvedIssues = issues.filter(issue => issue.resolutionDate);
    
    const grouped = _.groupBy(resolvedIssues, issue => {
      const date = dayjs(issue.resolutionDate);
      if (period === 'week') {
        return `${date.year()}-W${date.week().toString().padStart(2, '0')}`;
      } else if (period === 'month') {
        return date.format('YYYY-MM');
      } else {
        return date.format('YYYY-MM-DD');
      }
    });
    
    return Object.entries(grouped).map(([period, issueList]) => ({
      period,
      count: issueList.length,
      storyPoints: _.sumBy(issueList, 'storyPoints'),
      avgResolutionTime: _.meanBy(issueList, issue => 
        dayjs(issue.resolutionDate).diff(dayjs(issue.created), 'day')
      ).toFixed(1)
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  // 获取唯一的开发者列表
  static getUniqueDevelopers(issues) {
    const developers = issues.map(issue => issue.developer).filter(dev => dev && dev !== 'Unassigned');
    return [...new Set(developers)].sort();
  }

  // 获取唯一的Sprint列表
  static getUniqueSprints(issues) {
    console.log('🔍 提取Sprint信息，总工单数:', issues.length);
    
    const sprints = issues.map(issue => issue.sprint).filter(sprint => sprint && sprint.name !== 'No Sprint');
    const uniqueSprints = _.uniqBy(sprints, 'id');
    
    console.log('📋 提取到的唯一Sprint:', uniqueSprints.length, '个');
    console.log('📋 Sprint列表:', uniqueSprints.slice(0, 10)); // 显示前10个Sprint
    
    return uniqueSprints.sort((a, b) => {
      // 按状态和名称排序
      if (a.state !== b.state) {
        const stateOrder = { 'active': 0, 'future': 1, 'closed': 2 };
        return (stateOrder[a.state] || 3) - (stateOrder[b.state] || 3);
      }
      return a.name.localeCompare(b.name);
    });
  }

  // 获取唯一的项目列表
  static getUniqueProjects(issues) {
    console.log('🔍 提取项目信息，总工单数:', issues.length);
    
    const projects = issues.map(issue => ({ 
      key: issue.project, 
      name: issue.projectName 
    })).filter(project => project.key && project.key !== 'Unknown');
    
    const uniqueProjects = _.uniqBy(projects, 'key').sort((a, b) => a.key.localeCompare(b.key));
    
    console.log('📋 提取到的唯一项目:', uniqueProjects.length, '个');
    console.log('📋 项目列表:', uniqueProjects.slice(0, 10)); // 显示前10个项目
    
    return uniqueProjects;
  }

  // 过滤数据
  static filterIssues(issues, filters) {
    let filtered = [...issues];

    if (filters.sprint && filters.sprint !== 'all') {
      filtered = filtered.filter(issue => issue.sprint.name === filters.sprint);
    }

    if (filters.developer && filters.developer !== 'all') {
      filtered = filtered.filter(issue => issue.developer === filters.developer);
    }

    if (filters.project && filters.project !== 'all') {
      filtered = filtered.filter(issue => issue.project === filters.project);
    }

    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      filtered = filtered.filter(issue => filters.status.includes(issue.status));
    }

    if (filters.issueType && Array.isArray(filters.issueType) && filters.issueType.length > 0) {
      filtered = filtered.filter(issue => filters.issueType.includes(issue.issueType));
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(issue => {
        const createdDate = dayjs(issue.created);
        return createdDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
               createdDate.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    return filtered;
  }

  // 生成汇总统计
  static generateSummaryStats(issues) {
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(issue => issue.isResolved).length;
    const totalStoryPoints = _.sumBy(issues, 'storyPoints');
    const resolvedStoryPoints = _.sumBy(issues.filter(issue => issue.isResolved), 'storyPoints');
    const avgAge = totalIssues > 0 ? _.meanBy(issues, 'ageInDays').toFixed(1) : 0;
    
    return {
      totalIssues,
      resolvedIssues,
      pendingIssues: totalIssues - resolvedIssues,
      resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
      totalStoryPoints,
      resolvedStoryPoints,
      pendingStoryPoints: totalStoryPoints - resolvedStoryPoints,
      storyPointsCompletionRate: totalStoryPoints > 0 ? 
        ((resolvedStoryPoints / totalStoryPoints) * 100).toFixed(1) : 0,
      avgAge,
      uniqueDevelopers: this.getUniqueDevelopers(issues).length,
      uniqueSprints: this.getUniqueSprints(issues).length,
      uniqueProjects: this.getUniqueProjects(issues).length
    };
  }
}
