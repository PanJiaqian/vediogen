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
    <div v-if="isLoading" class="projects-grid">
      <div v-for="n in 8" :key="'skel-'+n" class="project-card">
        <div class="project-thumbnail">
          <div class="skeleton-image"></div>
        </div>
        <div class="project-info">
          <div class="skeleton-line" style="width: 80%; height: 16px;"></div>
          <div class="skeleton-line short" style="width: 60%; height: 12px;"></div>
        </div>
      </div>
    </div>
    <div v-else class="projects-grid">
      <div
        v-for="project in currentTabProjects"
        :key="project.id"
        class="project-card"
        @click="openProject(project)"
      >
        <button class="delete-fab" @click.stop="confirmDelete(project)">×</button>
        <div class="project-thumbnail">
          <img :src="project.thumbnail" :alt="project.name" />
        </div>
        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-date">{{ formatDateTime(project.createdAt) }}</p>
        </div>
      </div>
    </div>

    <div v-if="deleteConfirmVisible" class="delete-modal-overlay" @click="closeDeleteConfirm">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-title">是否要删除该作品</div>
        <div class="delete-modal-actions">
          <button class="delete-cancel" @click="closeDeleteConfirm">取消</button>
          <button class="delete-confirm" @click="doDelete">确认</button>
        </div>
      </div>
    </div>

    <!-- 暂无更多内容提示 -->
    <div class="empty-message" v-if="!isLoading && currentTabProjects.length === 0">
      暂无更多内容
    </div>
  </div>
</template>

<script>
import { generateGradientPlaceholder } from '@/utils/placeholder'
import { getMyWorksList, getStoryboardImagesDetail, queryStoryboardVideoStatus, getWorksVideoStatus, getScriptDetailByVideo, deleteConversation } from '@/api/index.js'
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
      avatarProjects: [],
      isLoading: true,
      deleteConfirmVisible: false,
      deleteTarget: null
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
        this.isLoading = true
        const token = this.userStore?.token || ''
        const result = await getMyWorksList(token)
        const resp = JSON.parse(result)

        if (resp && resp.code === 0 && Array.isArray(resp.data)) {
          const story = []
          const avatar = []

          for (const item of resp.data) {
            const name = item?.title || '未命名作品'
            const rawCover = String(item?.coverUrl || '').trim().replace(/^`+|`+$/g, '')
            const isUrl = /^https?:\/\//i.test(rawCover)
            const thumb = isUrl ? rawCover : generateGradientPlaceholder(300, 200, '667eea', '764ba2', '')
            const convType = String(item?.conversationType || '').trim().toLowerCase()

            const mapped = {
              id: (item?.recentVideoId ?? item?.conversationId),
              conversationId: item?.conversationId,
              name,
              createdAt: item?.createdAt || '',
              thumbnail: thumb,
              type: convType === 'digital_human' ? 'avatar' : 'story'
            }

            if (convType === 'digital_human') {
              avatar.push(mapped)
            } else {
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
      this.isLoading = false
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
        if (project && project.type === 'avatar') {
          const convId = project && project.conversationId
          this.$router.push({ name: 'DigitalVideo', query: convId ? { conversationId: convId } : {} })
          return
        }
        const videoId = String(project.id)
        try { localStorage.setItem(`project:videoId:${project.id}`, videoId) } catch (e) { console.warn('保存视频ID失败:', e) }

        // 1) 先调用作品创作进度状态接口
        let status = null
        try {
          const text = await getWorksVideoStatus({ videoId, token })
          try { status = JSON.parse(text) } catch (e) { status = null }
        } catch (e) {
          console.warn('查询作品创作进度状态失败:', e)
        }

        // 2) 根据状态决定后续行为
        const videoReady = !!(status && (status.video === true || status.data?.video === true))
        const pictureReady = !!(status && (status.picture === true || status.data?.picture === true))
        const scriptReady = !!(status && (status.script === true || status.data?.script === true))

        let entryMode = 'canvas'
        let scenes = []

        if (videoReady) {
          try {
            const statusText = await queryStoryboardVideoStatus({ videoId, token })
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
        } else if (pictureReady) {
          try {
            const text = await getStoryboardImagesDetail({ videoId, token })
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
        } else if (scriptReady) {
          try {
            const text = await getScriptDetailByVideo({ videoId, token })
            try { localStorage.setItem(`project:script_detail_json:${project.id}`, text) } catch (e) { console.warn('保存剧本详情失败:', e) }
            this.$router.push(`/project/${project.id}`)
            return
          } catch (e) {
            console.warn('查询剧本详情失败:', e)
          }
        } else {
          // 回退：与旧逻辑一致，尝试视频状态->图片详情->默认跳编辑页
          try {
            const statusText = await queryStoryboardVideoStatus({ videoId, token })
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
            } else {
              const text = await getStoryboardImagesDetail({ videoId, token })
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
            }
          } catch (e) { console.warn('回退查询失败:', e) }
        }

        try {
          localStorage.setItem(`video-edit:entryMode:${project.id}`, entryMode)
          localStorage.setItem(`video-edit:scenes:${project.id}`, JSON.stringify(scenes))
          localStorage.setItem(`project:prompt:${project.id}`, String(project.name || ''))
          localStorage.setItem(`video-edit:loading:${project.id}`, '1')
        } catch (e) { console.warn('保存编辑页数据失败:', e) }
        if (project.type === 'avatar') {
          const convId = project && project.conversationId
          this.$router.push({ name: 'DigitalVideo', query: convId ? { conversationId: convId } : {} })
        } else {
          this.$router.push(`/video-edit/${project.id}`)
        }
      } catch (e) {
        console.error('打开项目失败:', e)
      }
    },
    editProject(project) {
      // 实现编辑项目逻辑
    },
    duplicateProject(project) {
      // 实现复制项目逻辑
    },
    confirmDelete(project) {
      this.deleteTarget = project
      this.deleteConfirmVisible = true
    },
    closeDeleteConfirm() {
      this.deleteConfirmVisible = false
      this.deleteTarget = null
    },
    async doDelete() {
      try {
        const token = this.userStore?.token || ''
        const conversationId = String(this.deleteTarget?.conversationId || '')
        if (!token || !conversationId) { this.closeDeleteConfirm(); return }
        const text = await deleteConversation({ conversationId, token })
        let resp
        try { resp = JSON.parse(text) } catch { resp = null }
        const ok = !!(resp && resp.code === 0 && (resp.data && resp.data.success === true))
        if (ok) {
          const id = this.deleteTarget.id
          if (this.deleteTarget.type === 'story') {
            this.storyProjects = this.storyProjects.filter(p => p.id !== id)
          } else {
            this.avatarProjects = this.avatarProjects.filter(p => p.id !== id)
          }
        }
      } catch (e) { console.warn('删除作品失败:', e) }
      this.closeDeleteConfirm()
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
  background-color: var(--bg-secondary);
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
  color: var(--text-tertiary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: var(--text-secondary);
}

.tab-button--active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
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
  background-color: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.project-thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: var(--bg-secondary);
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
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  font-size: 14px;
  color: var(--text-tertiary);
}

.empty-message {
  width: 100%;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  font-size: 16px;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 6px;
  height: 14px;
  margin: 6px 0;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
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
<style scoped>
.delete-fab {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 10;
}

.delete-fab:hover {
  background: var(--bg-tertiary);
}

.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.delete-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 280px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.delete-modal-title {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius: 6px;
  color: var(--text-secondary);
}

.delete-confirm {
  padding: 8px 16px;
  border: none;
  background: var(--error-color);
  border-radius: 6px;
  color: #ffffff;
}
</style>
.project-date {
  font-size: 12px;
  color: var(--text-tertiary);
}
