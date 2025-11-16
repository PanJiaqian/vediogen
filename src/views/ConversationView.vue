<template>
  <div class="conversation-page">
    <div class="header">
      <h2>对话</h2>
      <p class="sub">正在生成剧本，请稍候…</p>
    </div>

    <div class="chat-area">
      <div class="bubble user">
        <div class="bubble-title">你</div>
        <div class="bubble-text">{{ stageDirections }}</div>
      </div>

      <div class="bubble system">
        <div class="bubble-title">系统</div>
        <div class="bubble-text">
          <span v-if="loading" class="spinner"></span>
          <span v-if="loading"> 正在思考并生成剧本…</span>
          <span v-else> 剧本生成完成，即将跳转详情页</span>
        </div>
      </div>
    </div>

    <div class="thinking-steps">
      <h3 class="section-title">思考节点</h3>
      <div class="step-list">
        <div class="step-item" v-for="(step, idx) in steps" :key="idx"
          :class="{ completed: step.status === 'completed' }">
          <div class="step-icon">
            <span v-if="step.status === 'loading'" class="spinner small"></span>
            <span v-else-if="step.status === 'completed'">✓</span>
            <span v-else>•</span>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { scriptGen } from '@/api'
import { useUserStore } from '@/stores/user'
export default {
  name: 'ConversationView',
  data() {
    return {
      stageDirections: this.$route.query.q || '',
      category: this.$route.query.category || '0',
      materialId: this.$route.query.materialId || '',
      loading: true,
      steps: [
        { title: '剧本摘要', description: '概述剧本核心内容', status: 'loading' },
        { title: '艺术指导建议', description: '设定整体视觉与风格方向', status: 'loading' },
        { title: '音乐风格', description: '明确音乐基调与节奏', status: 'loading' },
        { title: '角色信息', description: '梳理主要角色信息', status: 'loading' },
        { title: '场景集合', description: '汇总关键场景要素', status: 'loading' },
        { title: '分镜故事板', description: '组织分镜与镜头安排', status: 'loading' }
      ]
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  mounted() {
    this.startGeneration()
  },
  methods: {
    markAllCompleted() {
      this.steps = this.steps.map(s => ({ ...s, status: 'completed' }))
    },
    startGeneration() {
      const stageDirections = this.stageDirections.trim()
      const category = this.category
      const materialId = this.materialId

      if (!stageDirections) {
        this.loading = false
        return
      }

      const token = (this.userStore && this.userStore.token) || ''
      if (!token) {
        console.warn('未找到token，无法调用生成接口')
        this.loading = false
        return
      }
      scriptGen({ stageDirections, materialId, category, token })
        .then(result => {
          // 标记完成
          this.loading = false
          this.markAllCompleted()
          const videoId = this.extractVideoIdFromSSE(result)
          const projectId = videoId ? String(videoId) : Date.now().toString()
          try {
            localStorage.setItem(`project:script:${projectId}`, result)
            localStorage.setItem(`project:prompt:${projectId}`, stageDirections)
            localStorage.setItem(`project:category:${projectId}`, category)
            if (videoId) localStorage.setItem(`project:videoId:${projectId}`, String(videoId))
            if (materialId) localStorage.setItem(`project:materialId:${projectId}`, materialId)
          } catch (e) {
            console.warn('本地存储失败:', e)
          }

          setTimeout(() => {
            const route = { name: 'ProjectDetail', params: { id: projectId } }
            try {
              const resolved = this.$router.resolve(route)
              window.history.replaceState({ replaced: true }, '', resolved?.href || `/project/${projectId}`)
            } catch (e) { /* noop */ }
            this.$router.replace(route)
          }, 600)
        })
        .catch(error => {
          console.error('生成接口调用失败:', error)
          this.loading = false
        })
    }
    ,
    extractVideoIdFromSSE(text) {
      if (!text) return null
      const chunks = String(text).split(/\n\n+/)
      for (const chunk of chunks) {
        const m = chunk.match(/data:(.*)/s)
        if (m && m[1]) {
          const jsonText = m[1].trim()
          try {
            const obj = JSON.parse(jsonText)
            if (obj && (obj.videoId || obj.videoID)) {
              return obj.videoId || obj.videoID
            }
          } catch (e) {
            // 忽略解析错误，继续尝试下一个片段
          }
        }
      }
      return null
    }
  }
}
</script>

<style scoped>
.conversation-page {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
}

.header {
  margin-bottom: 12px;
}

.header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header .sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.chat-area {
  margin-bottom: 16px;
}

.bubble {
  max-width: 720px;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.bubble .bubble-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

.bubble .bubble-text {
  color: #4b5563;
  line-height: 1.6;
}

.bubble.user {
  background: #e5f2ff;
  border: 1px solid #cce5ff;
}

.bubble.system {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

.spinner.small {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.thinking-steps {
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.step-list {
  padding: 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
  background: #f8f9fa;
}

.step-item.completed {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.step-description {
  color: #666;
}
</style>