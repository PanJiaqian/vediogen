<template>
  <div class="my-projects">
    <!-- 标签页导航 -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ 'tab-button--active': activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 项目网格 -->
    <div class="projects-grid">
      <div 
        v-for="project in currentTabProjects" 
        :key="project.id"
        class="project-card"
        @click="openProject(project)"
      >
        <div class="project-thumbnail">
          <img :src="project.thumbnail" :alt="project.name" />
        </div>
        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-date">{{ project.createdAt }}</p>
        </div>
      </div>
    </div>

    <!-- 暂无更多内容提示 -->
    <div class="empty-message">
      暂无更多内容
    </div>
  </div>
</template>

<script>
import { generateGradientPlaceholder } from '@/utils/placeholder'

export default {
  name: 'MyProjectsView',
  data() {
    return {
      activeTab: 'story',
      tabs: [
        { id: 'story', name: '故事' },
        { id: 'avatar', name: '数字人' }
      ],
      storyProjects: [
        {
          id: 1,
          name: '一生朝朝暮暮记',
          createdAt: '2023/11/20 02:05',
          thumbnail: generateGradientPlaceholder(300, 200, '4A90E2', '667eea', '朝暮'),
          type: 'story'
        },
        {
          id: 2,
          name: 'Hello Kitty的回忆',
          createdAt: '2023/10/20 17:14',
          thumbnail: generateGradientPlaceholder(300, 200, 'FF69B4', 'FFB6C1', 'Kitty'),
          type: 'story'
        },
        {
          id: 3,
          name: 'Hello Kitty的回忆',
          createdAt: '2023/10/20 17:09',
          thumbnail: generateGradientPlaceholder(300, 200, 'FF1493', 'FF69B4', 'Kitty'),
          type: 'story'
        }
      ],
      avatarProjects: []
    }
  },
  computed: {
    currentTabProjects() {
      return this.activeTab === 'story' ? this.storyProjects : this.avatarProjects
    }
  },
  methods: {
    setActiveTab(tabId) {
      this.activeTab = tabId
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
  margin: 0;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  margin-bottom: 30px;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #666666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #495057;
}

.tab-button--active {
  color: #007bff;
  border-bottom-color: #007bff;
}

/* 项目网格 */
.projects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
}

.project-card {
  width: 200px;
  height: 290px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.project-thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-icon {
  width: 48px;
  height: 48px;
  color: #6c757d;
}

.project-info {
  padding: 16px;
  height: 100px;
}

.project-name {
  font-size: 16px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.4;
}

.project-meta {
  font-size: 14px;
  color: #6c757d;
}

.empty-message {
  width: 100%;
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-projects {
    padding: 15px;
  }
  
  .tab-navigation {
    margin-bottom: 20px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .tab-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .my-projects {
    padding: 10px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-card {
    margin-bottom: 15px;
  }
}
</style>