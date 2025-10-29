<template>
  <div class="my-projects">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">我的项目</h1>
        <p class="page-subtitle">管理和查看您的所有视频项目</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="importProject">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          导入项目
        </button>
        <button class="btn btn-primary" @click="createNewProject">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          新建项目
        </button>
      </div>
    </div>

    <!-- 筛选和搜索栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="filter-tabs">
          <button 
            v-for="filter in projectFilters" 
            :key="filter.id"
            class="filter-tab"
            :class="{ 'filter-tab--active': activeFilter === filter.id }"
            @click="setActiveFilter(filter.id)"
          >
            {{ filter.name }}
            <span class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>
      <div class="filter-right">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="搜索项目..." 
            v-model="searchQuery"
            class="search-input"
          />
        </div>
        <div class="view-toggle">
          <button 
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'grid' }"
            @click="setViewMode('grid')"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button 
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'list' }"
            @click="setViewMode('list')"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="projects-container">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="projects-grid">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id"
          class="project-card"
          @click="openProject(project)"
        >
          <div class="project-thumbnail">
            <img :src="project.thumbnail" :alt="project.name" />
            <div class="project-overlay">
              <div class="project-actions">
                <button class="action-btn" @click.stop="editProject(project)">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn" @click.stop="duplicateProject(project)">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn action-btn--danger" @click.stop="deleteProject(project)">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="project-status" :class="`project-status--${project.status}`">
              {{ getStatusText(project.status) }}
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-meta">
              <span class="project-date">{{ formatDate(project.updatedAt) }}</span>
              <span class="project-duration">{{ project.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="projects-list">
        <div class="list-header">
          <div class="list-col list-col--name">项目名称</div>
          <div class="list-col list-col--status">状态</div>
          <div class="list-col list-col--date">更新时间</div>
          <div class="list-col list-col--duration">时长</div>
          <div class="list-col list-col--actions">操作</div>
        </div>
        <div 
          v-for="project in filteredProjects" 
          :key="project.id"
          class="list-item"
          @click="openProject(project)"
        >
          <div class="list-col list-col--name">
            <div class="project-name-cell">
              <img :src="project.thumbnail" :alt="project.name" class="project-thumb" />
              <div class="project-details">
                <h4 class="project-title">{{ project.name }}</h4>
                <p class="project-desc">{{ project.description }}</p>
              </div>
            </div>
          </div>
          <div class="list-col list-col--status">
            <span class="status-badge" :class="`status-badge--${project.status}`">
              {{ getStatusText(project.status) }}
            </span>
          </div>
          <div class="list-col list-col--date">{{ formatDate(project.updatedAt) }}</div>
          <div class="list-col list-col--duration">{{ project.duration }}</div>
          <div class="list-col list-col--actions">
            <div class="action-buttons">
              <button class="action-btn-small" @click.stop="editProject(project)">编辑</button>
              <button class="action-btn-small" @click.stop="duplicateProject(project)">复制</button>
              <button class="action-btn-small action-btn-small--danger" @click.stop="deleteProject(project)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="empty-title">暂无项目</h3>
        <p class="empty-description">开始创建您的第一个视频项目吧</p>
        <button class="btn btn-primary" @click="createNewProject">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          新建项目
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { generateGradientPlaceholder } from '@/utils/placeholder'

export default {
  name: 'MyProjectsView',
  data() {
    return {
      searchQuery: '',
      activeFilter: 'all',
      viewMode: 'grid', // 'grid' 或 'list'
      projectFilters: [
        { id: 'all', name: '全部', count: 12 },
        { id: 'draft', name: '草稿', count: 5 },
        { id: 'processing', name: '处理中', count: 3 },
        { id: 'completed', name: '已完成', count: 4 }
      ],
      projects: [
        {
          id: 1,
          title: '产品介绍视频',
          description: '为新产品制作的宣传介绍视频',
          status: 'completed',
          createdAt: '2024-01-15',
          duration: '2分30秒',
          thumbnail: generateGradientPlaceholder(300, 200, '4A90E2', '667eea', '产品介绍'),
          tags: ['产品', '宣传', '商业']
        },
        {
          id: 2,
          title: '品牌故事',
          description: '讲述品牌发展历程的故事视频',
          status: 'in-progress',
          createdAt: '2024-01-20',
          duration: '5分钟',
          thumbnail: generateGradientPlaceholder(300, 200, '7ED321', '26de81', '品牌故事'),
          tags: ['品牌', '故事', '企业']
        },
        {
          id: 3,
          title: '教学演示',
          description: '产品使用方法的教学演示视频',
          status: 'draft',
          createdAt: '2024-01-25',
          duration: '8分钟',
          thumbnail: generateGradientPlaceholder(300, 200, 'F5A623', 'fdcb6e', '教学演示'),
          tags: ['教学', '演示', '指导']
        },
        {
          id: 4,
          title: '活动回顾',
          description: '公司年会活动的精彩回顾',
          status: 'completed',
          createdAt: '2024-02-01',
          duration: '4分钟',
          thumbnail: generateGradientPlaceholder(300, 200, 'D0021B', 'ff6b6b', '活动回顾'),
          tags: ['活动', '回顾', '企业']
        },
        {
          id: 5,
          title: '客户见证',
          description: '客户使用产品后的真实反馈',
          status: 'in-progress',
          createdAt: '2024-02-05',
          duration: '3分钟',
          thumbnail: generateGradientPlaceholder(300, 200, '9013FE', 'a55eea', '客户见证'),
          tags: ['客户', '见证', '反馈']
        },
        {
          id: 6,
          title: '技术分享',
          description: '团队技术经验分享视频',
          status: 'draft',
          createdAt: '2024-02-10',
          duration: '6分钟',
          thumbnail: generateGradientPlaceholder(300, 200, '50E3C2', '4ecdc4', '技术分享'),
          tags: ['技术', '分享', '团队']
        }
      ]
    }
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects

      // 按状态筛选
      if (this.activeFilter !== 'all') {
        filtered = filtered.filter(project => project.status === this.activeFilter)
      }

      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(project => 
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  },
  methods: {
    setActiveFilter(filterId) {
      this.activeFilter = filterId
    },
    setViewMode(mode) {
      this.viewMode = mode
    },
    createNewProject() {
      console.log('创建新项目')
      // 实现创建新项目逻辑
    },
    importProject() {
      console.log('导入项目')
      // 实现导入项目逻辑
    },
    openProject(project) {
      console.log('打开项目:', project)
      // 实现打开项目逻辑
    },
    editProject(project) {
      console.log('编辑项目:', project)
      // 实现编辑项目逻辑
    },
    duplicateProject(project) {
      console.log('复制项目:', project)
      // 实现复制项目逻辑
    },
    deleteProject(project) {
      console.log('删除项目:', project)
      // 实现删除项目逻辑
    },
    getStatusText(status) {
      const statusMap = {
        draft: '草稿',
        processing: '处理中',
        completed: '已完成'
      }
      return statusMap[status] || status
    },
    formatDate(date) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.my-projects {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.header-content p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-tab--active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-count {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: var(--font-size-xs);
}

.filter-tab--active .filter-count {
  background-color: rgba(255, 255, 255, 0.3);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px;
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  width: 200px;
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-btn:hover {
  background-color: var(--bg-tertiary);
}

.view-btn--active {
  background-color: var(--primary-color);
  color: white;
}

.view-btn svg {
  width: 16px;
  height: 16px;
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.project-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.project-thumbnail {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.project-card:hover .project-thumbnail img {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: white;
  transform: scale(1.1);
}

.action-btn--danger:hover {
  background-color: var(--danger-color);
  color: white;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  color: var(--text-primary);
}

.action-btn--danger:hover svg {
  color: white;
}

.project-status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: 4px var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: white;
}

.project-status--draft {
  background-color: var(--warning-color);
}

.project-status--processing {
  background-color: var(--info-color);
}

.project-status--completed {
  background-color: var(--success-color);
}

.project-info {
  padding: var(--spacing-lg);
}

.project-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-tight);
}

.project-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* 项目列表 */
.projects-list {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.list-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.list-item:hover {
  background-color: var(--bg-tertiary);
}

.list-item:last-child {
  border-bottom: none;
}

.list-col {
  flex: 1;
  min-width: 0;
}

.list-col--name {
  flex: 2;
}

.list-col--actions {
  flex: 0 0 auto;
  width: 150px;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.project-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.project-details {
  min-width: 0;
}

.project-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
  line-height: var(--line-height-tight);
}

.project-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.status-badge {
  display: inline-block;
  padding: 4px var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: white;
}

.status-badge--draft {
  background-color: var(--warning-color);
}

.status-badge--processing {
  background-color: var(--info-color);
}

.status-badge--completed {
  background-color: var(--success-color);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn-small {
  padding: 4px var(--spacing-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn-small:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn-small--danger:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-xl);
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-tabs {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--spacing-sm);
  }
  
  .filter-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    width: 150px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .list-header,
  .list-item {
    padding: var(--spacing-md);
  }
  
  .list-col--actions {
    width: 120px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .header-actions {
    width: 100%;
  }
  
  .search-input {
    width: 120px;
  }
  
  .project-name-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .project-thumb {
    width: 100%;
    height: 60px;
  }
}
</style>