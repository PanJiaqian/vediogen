<template>
  <div class="conversation-page">
    <div class="background-decoration">
      <div class="floating-icon" v-for="i in 6" :key="i" :style="getFloatingIconStyle(i)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
    </div>
    <div class="main-content">
      <div class="thinking-steps">
        <div class="header-section">
          <div class="loading-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="main-title">小梦正在为您构思剧本</h1>
        </div>
        <div class="step-list">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 
              'active': currentStep === index, 
              'completed': currentStep > index,
              'pending': currentStep < index
            }"
          >
            <div class="step-icon">
              <div class="step-number" v-if="currentStep < index">{{ index + 1 }}</div>
              <div class="step-loading" v-else-if="currentStep === index">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                  <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"/>
                  </path>
                </svg>
              </div>
              <div class="step-check" v-else>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-status">
                <span v-if="currentStep < index" class="status-pending">待开始执行</span>
                <span v-else-if="currentStep === index" class="status-progress">执行中 {{ progress }}%</span>
                <span v-else class="status-completed">执行完成</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ErrorModal :visible="errorModalVisible" :message="errorMessage" @close="errorModalVisible = false" />
</template>

<script>
import { scriptGen } from '@/api'
import { useUserStore } from '@/stores/user'
import ErrorModal from '@/components/ErrorModal.vue'
export default {
  name: 'ConversationView',
  components: { ErrorModal },
  data() {
    return {
      stageDirections: this.$route.query.q || '',
      category: this.$route.query.category || '0',
      materialId: this.$route.query.materialId || '',
      loading: true,
      currentStep: 0,
      progress: 0,
      steps: [
        { title: '剧本摘要', description: '概述剧本核心内容', status: 'loading' },
        { title: '艺术指导建议', description: '设定整体视觉与风格方向', status: 'loading' },
        { title: '音乐风格', description: '明确音乐基调与节奏', status: 'loading' },
        { title: '角色信息', description: '梳理主要角色信息', status: 'loading' },
        { title: '场景集合', description: '汇总关键场景要素', status: 'loading' },
        { title: '分镜故事板', description: '组织分镜与镜头安排', status: 'loading' }
      ],
      progressTimer: null,
      stepTimer: null,
      stepDurationsMs: [30000, 30000, 30000, 30000, 30000, 30000],
      progressIntervalMs: 1000,
      isContentComplete: false,
      errorModalVisible: false,
      errorMessage: '剧本生成失败，请稍后再试'
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  mounted() {
    this.startGeneration()
    this.initSteps()
    this.startStep()
  },
  methods: {
    getFloatingIconStyle(index) {
      const positions = [
        { top: '10%', left: '15%', animationDelay: '0s' },
        { top: '20%', right: '20%', animationDelay: '1s' },
        { top: '60%', left: '10%', animationDelay: '2s' },
        { top: '70%', right: '15%', animationDelay: '0.5s' },
        { top: '40%', left: '5%', animationDelay: '1.5s' },
        { top: '30%', right: '10%', animationDelay: '2.5s' }
      ]
      return positions[index - 1] || {}
    },
    markAllCompleted() {
      this.steps = this.steps.map(s => ({ ...s, status: 'completed' }))
    },
    initSteps() {
      this.currentStep = 0
      this.progress = 0
    },
  startStep() {
    const duration = this.stepDurationsMs[this.currentStep] || 30000
    const interval = this.progressIntervalMs || 1000
    if (this.progressTimer) clearInterval(this.progressTimer)
    if (this.stepTimer) clearTimeout(this.stepTimer)
    this.progressTimer = setInterval(() => {
      if (this.progress < 100) {
        const baseIncrement = 100 / (duration / interval)
        const jitter = baseIncrement * (Math.random() * 0.2 - 0.1)
        const inc = Math.max(0, baseIncrement + jitter)
        this.progress = Math.min(100, this.progress + inc)
        if (this.currentStep === this.steps.length - 1 && !this.isContentComplete) {
          if (this.progress > 97.7) this.progress = 97.7
        }
      }
    }, interval)
    this.stepTimer = setTimeout(() => {
      this.nextStep()
    }, duration)
  },
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
        this.progress = 0
        this.startStep()
      }
    },
    async startGeneration() {
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
      let attempts = 0
      while (attempts < 3) {
        try {
          const result = await scriptGen({ stageDirections, materialId, category, token })
          this.loading = false
          this.isContentComplete = true
          this.markAllCompleted()
          if (this.progressTimer) clearInterval(this.progressTimer)
          if (this.stepTimer) clearTimeout(this.stepTimer)
          const videoId = this.extractVideoIdFromSSE(result)
          const projectId = videoId ? String(videoId) : Date.now().toString()
          try {
            localStorage.setItem(`project:script:${projectId}`, result)
            localStorage.setItem(`project:prompt:${projectId}`, stageDirections)
            localStorage.setItem(`project:category:${projectId}`, category)
            if (videoId) localStorage.setItem(`project:videoId:${projectId}`, String(videoId))
            if (materialId) localStorage.setItem(`project:materialId:${projectId}`, materialId)
          } catch (e) { console.warn('保存项目本地数据失败:', e) }
          setTimeout(() => {
            const route = { name: 'ProjectDetail', params: { id: projectId } }
            try {
              const resolved = this.$router.resolve(route)
              window.history.replaceState({ replaced: true }, '', resolved?.href || `/project/${projectId}`)
            } catch (e) { console.warn('替换浏览历史失败:', e) }
            this.$router.replace(route)
          }, 600)
          return
        } catch (error) {
          attempts++
          if (attempts >= 3) {
            this.loading = false
            if (this.progressTimer) clearInterval(this.progressTimer)
            if (this.stepTimer) clearTimeout(this.stepTimer)
            this.errorModalVisible = true
            this.currentStep = this.steps.length - 1
            this.progress = 97.7
            return
          }
        }
      }
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 2000;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  color: rgba(59, 130, 246, 0.1);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.main-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  position: relative;
  z-index: 1;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.loading-icon {
  color: #3b82f6;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.step-list {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #eff6ff;
  border-color: #3b82f6;
}

.step-item.pending {
  background: #f9fafb;
  color: #6b7280;
}

.step-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.step-item.completed {
  background: #f0fdf4;
  color: #166534;
  border-color: transparent;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
  background: #3b82f6;
  color: white;
}
.step-item.completed .step-icon {
  background: #10b981;
}

.step-number {
  font-size: 16px;
  font-weight: 600;
}

.step-loading {
  color: white;
}

.step-check {
  color: white;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-status {
  font-size: 14px;
  opacity: 0.8;
}

.status-pending {
  color: #6b7280;
}

.status-progress {
  color: #3b82f6;
  font-weight: 500;
}

.status-completed {
  color: #10b981;
  font-weight: 500;
}

.step-description {
  color: #666;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 24px;
    margin: 20px;
  }
}
</style>