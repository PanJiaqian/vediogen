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
          <p class="project-date">{{ formatDateTime(project.createdAt) }}</p>
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
import { getMyWorksList, getStoryboardImagesDetail, queryStoryboardVideoStatus } from '@/api/index.js'
import { useUserStore } from '@/stores/user.js'

export default {
  name: 'MyProjectsView',
  data() {
    return {
      activeTab: 'story',
      tabs: [
        { id: 'story', name: '故事' },
        { id: 'avatar', name: '数字人' }
      ],
      storyProjects: [],
      avatarProjects: []
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    currentTabProjects() {
      return this.activeTab === 'story' ? this.storyProjects : this.avatarProjects
    }
  },
  mounted() {
    this.fetchMyWorksList()
  },
  methods: {
    async fetchMyWorksList() {
      try {
        const token = this.userStore?.token || ''
        const result = await getMyWorksList(token)
        const resp = JSON.parse(result)

        if (resp && resp.code === 0 && Array.isArray(resp.data)) {
          const story = []
          const avatar = []

          for (const item of resp.data) {
            const name = item?.name || '未命名作品'
            const rawCover = String(item?.coverUrl || '').trim().replace(/^`+|`+$/g, '')
            const isUrl = /^https?:\/\//i.test(rawCover)
            const thumb = isUrl ? rawCover : generateGradientPlaceholder(300, 200, '667eea', '764ba2', '')

            const mapped = {
              id: item?.id,
              name,
              createdAt: item?.createdAt || '',
              thumbnail: thumb,
              type: item?.category === '数字人作品' ? 'avatar' : 'story'
            }

            if (item?.category === '数字人作品') {
              avatar.push(mapped)
            } else {
              // 默认归入“故事/视频作品”
              story.push(mapped)
            }
          }

          this.storyProjects = story
          this.avatarProjects = avatar
        } else {
          console.error('获取“我的空间”作品列表失败:', resp?.message)
        }
      } catch (e) {
        console.error('获取“我的空间”作品列表错误:', e)
      }
    },
    setActiveTab(tabId) {
      this.activeTab = tabId
    },
    createNewProject() {
      // 实现创建新项目逻辑
    },
    importProject() {
      // 实现导入项目逻辑
    },
    async openProject(project) {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          console.warn('未登录，无法查询分镜状态')
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { console.warn('打开登录弹窗失败:', e) }
          return
        }
        try { localStorage.setItem(`project:videoId:${project.id}`, String(project.id)) } catch (e) { console.warn('保存视频ID失败:', e) }
        let entryMode = 'canvas'
        let scenes = []
        try {
          const statusText = await queryStoryboardVideoStatus({ videoId: project.id, token })
          let statusJson = null
          try { statusJson = JSON.parse(statusText) } catch (e) { statusJson = null }
          const items = statusJson && Array.isArray(statusJson.items) ? statusJson.items : []
          const succeeded = items.filter(it => it && it.status === 'SUCCEEDED' && it.video_url)
          if (succeeded.length) {
            entryMode = 'crop'
            scenes = succeeded.map((it, idx) => {
              const url = String(it.video_url || '').trim()
              return { id: idx + 1, title: `分镜${idx + 1}`, description: '分镜视频', thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number: it.scene_number }
            })
          }
        } catch (e) { console.warn('查询分镜视频状态失败:', e) }
        if (entryMode === 'canvas') {
          try {
            const text = await getStoryboardImagesDetail({ videoId: project.id, token })
            let resp = null
            try { resp = JSON.parse(text) } catch (e) { console.warn('分镜图片详情解析失败:', e) }
            const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
            scenes = list.map((item, idx) => {
              const content = (item && item.scene_script && item.scene_script.content) || {}
              const title = content.shot_title || item.scene_number || `分镜${idx + 1}`
              const descParts = []
              if (content.visual_description) descParts.push(content.visual_description)
              if (content.camera_direction) descParts.push(`机位：${content.camera_direction}`)
              if (content.dialogue_or_narration) descParts.push(`旁白：${content.dialogue_or_narration}`)
              const rawUrl = String(item.reference_image_url || '').trim()
              const cleanedUrl = rawUrl.replace(/^`+|`+$/g, '').replace(/\s+/g, ' ').replace(/"/g, '').replace(/\\`/g, '').replace(/`/g, '')
              return { id: idx + 1, title, description: descParts.join(' | '), thumbnail: cleanedUrl, scene_number: item.scene_number }
            })
          } catch (e) { console.warn('查询分镜图片详情失败:', e) }
        }
        try {
          localStorage.setItem(`video-edit:entryMode:${project.id}`, entryMode)
          localStorage.setItem(`video-edit:scenes:${project.id}`, JSON.stringify(scenes))
          localStorage.setItem(`project:prompt:${project.id}`, String(project.name || ''))
        } catch (e) { console.warn('保存编辑页数据失败:', e) }
      } catch (e) {
        console.error('打开项目失败:', e)
      }
      this.$router.push(`/video-edit/${project.id}`)
    },
    editProject(project) {
      // 实现编辑项目逻辑
    },
    duplicateProject(project) {
      // 实现复制项目逻辑
    },
    deleteProject(project) {
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
    },
    formatDateTime(str) {
      const s = String(str || '').trim()
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        const pad = n => String(n).padStart(2, '0')
        const y = d.getFullYear()
        const m = pad(d.getMonth() + 1)
        const dd = pad(d.getDate())
        const hh = pad(d.getHours())
        const mm = pad(d.getMinutes())
        const ss = pad(d.getSeconds())
        return `${y}-${m}-${dd} ${hh}:${mm}:${ss}`
      }
      return s
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
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
.project-date {
  font-size: 12px;
  color: #6b7280;
}
