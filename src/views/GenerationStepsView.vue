<template>
  <div class="generation-steps">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-icon" v-for="i in 6" :key="i" :style="getFloatingIconStyle(i)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 标题和描述 -->
      <div class="header-section">
        <div class="loading-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="main-title">请稍候，小梦正在为您生成分镜...</h1>
      </div>

      <!-- 步骤列表 -->
      <div class="steps-container">
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
</template>

<script>
import { storyboardPictureGenStream } from '@/api'
import { useUserStore } from '@/stores/user'
export default {
  name: 'GenerationStepsView',
  data() {
    return {
      currentStep: 0,
      progress: 0,
      steps: [
        { title: '灵感淬炼与主题锚定' },
        { title: '世界构建与骨架勾勒' },
        { title: '角色赋魂与关系织造' },
        { title: '情节编织与节奏设计' },
        { title: '对白打磨与细节镶嵌' }
      ],
      progressTimer: null,
      stepTimer: null,
      // 每步时长（毫秒）：默认每步约75秒，总计约6分钟，实际跳转仍以接口完成为准
      stepDurationsMs: [75000, 75000, 75000, 75000, 75000],
      // 进度刷新间隔（毫秒）
      progressIntervalMs: 1000
    }
  },
  mounted() {
    this.startGeneration()
    this.startSSE()
  },
  beforeUnmount() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
    if (this.stepTimer) {
      clearTimeout(this.stepTimer)
    }
  },
  methods: {
    cleanUrl(u) {
      const str = (u || '').toString()
      return str.replace(/`/g, '').trim()
    },
    startGeneration() {
      // 初始化第一步
      this.currentStep = 0
      this.progress = 0
      this.startStep()
    },
    startStep() {
      const duration = this.stepDurationsMs[this.currentStep] || 60000
      const interval = this.progressIntervalMs || 1000
      if (this.progressTimer) clearInterval(this.progressTimer)
      if (this.stepTimer) clearTimeout(this.stepTimer)
      // 进度条按时长平滑推进，带微小抖动
      this.progressTimer = setInterval(() => {
        if (this.progress < 100) {
          const baseIncrement = 100 / (duration / interval)
          const jitter = baseIncrement * (Math.random() * 0.2 - 0.1) // ±10%
          const inc = Math.max(0, baseIncrement + jitter)
          this.progress += inc
          if (this.progress > 100) this.progress = 100
        }
      }, interval)
      // 步骤时长结束后进入下一步
      this.stepTimer = setTimeout(() => {
        this.nextStep()
      }, duration)
    },
    async startSSE() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      let token = ''
      try {
        const store = useUserStore()
        token = store && store.token || ''
      } catch (e) { token = '' }
      if (!token) {
        try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { console.warn('打开登录弹窗失败:', e) }
        return
      }
      try {
        await storyboardPictureGenStream({
          videoId,
          token,
          onEvent: (obj) => {
            if (!obj || obj.type === 'connected') return
            if (obj.Storyboard_picture) {
              this.handleStoryboardPicture(obj.Storyboard_picture)
            }
          }
        })
      } catch (e) {
        console.error('分镜图片流式生成失败:', e)
      }
    },
    handleStoryboardPicture(sb) {
      const projectId = this.$route.params.id
      try {
        localStorage.setItem(`project:storyboard_raw:${projectId}`, JSON.stringify(sb))
      } catch (e) { console.warn('保存分镜原始数据失败:', e) }
      const scenes = this.normalizeStoryboardPicture(sb)
      try {
        localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(scenes))
      } catch (e) { console.warn('保存编辑页场景失败:', e) }
      if (this.progressTimer) clearInterval(this.progressTimer)
      if (this.stepTimer) clearTimeout(this.stepTimer)
      const dest = `/video-edit/${projectId}`
      try { window.history.replaceState({ replaced: true }, '', dest) } catch (e) { /* noop */ }
      this.$router.replace(dest)
    },
    normalizeStoryboardPicture(sb) {
      const container = Array.isArray(sb) ? sb[0] : sb
      const scenes = []
      if (!container || typeof container !== 'object') return scenes
      const sceneKeys = Object.keys(container).filter(k => /^scene_/i.test(k)).sort((a, b) => {
        const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
        const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
        return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
      })
      let id = 1
      for (const key of sceneKeys) {
        const s = container[key] || {}
        const title = s.scene_title || `分镜${id}`
        const shotKeys = Object.keys(s).filter(k => /^shot_/i.test(k)).sort((a, b) => {
          const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
          const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
          return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
        })
        const firstShot = shotKeys.length ? (s[shotKeys[0]] || {}) : {}
        const thumb = this.cleanUrl(firstShot.scene_picture || '')
        const descParts = []
        if (firstShot.shot_title) descParts.push(firstShot.shot_title)
        if (firstShot.visual_description) descParts.push(firstShot.visual_description)
        const description = descParts.length ? descParts.join('：') : '暂无描述'
        scenes.push({ id: id++, title, description, thumbnail: thumb || '/logo.png' })
      }
      return scenes
    },
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
        this.progress = 0
        // 开始下一步的进度推进
        this.startStep()
      } else {
        // 保留动画结束，但真正跳转由流式完成事件触发
        setTimeout(() => { console.debug('生成步骤动画结束，等待接口完成跳转') }, 1000)
      }
    },
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
    }
  }
}
</script>

<style scoped>
.generation-steps {
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

.steps-container {
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
  transition: all 0.3s ease;
}

.step-item.pending .step-icon {
  background: #e5e7eb;
  color: #6b7280;
}

.step-item.active .step-icon {
  background: #3b82f6;
  color: white;
}

.step-item.completed .step-icon {
  background: #10b981;
  color: white;
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

.step-content {
  flex: 1;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 24px;
    margin: 20px;
  }
  
  .main-title {
    font-size: 20px;
  }
  
  .step-item {
    padding: 12px;
    gap: 12px;
  }
  
  .step-icon {
    width: 36px;
    height: 36px;
  }
  
  .step-title {
    font-size: 15px;
  }
}
</style>