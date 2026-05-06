// 分镜生成步骤页：展示任务进度并在完成后跳转到视频编辑
<template>
  <div class="generation-steps">
    <Header />
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
      <div class="project-header">
        <p class="project-time" v-if="project.createdAt">创建于 {{ project.createdAt }}</p>
      </div>

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
              <span v-else-if="currentStep === index" class="status-progress">执行中 {{ progressDisplay }}%</span>
              <span v-else class="status-completed">执行完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ErrorModal :visible="errorModalVisible" :message="errorMessage" @close="errorModalVisible = false" />
  <div v-if="timeoutPromptVisible" class="center-prompt-overlay">
    <div class="center-prompt">
      <div class="prompt-text">由于任务生成时间过长，自动为您转到后台运行</div>
    </div>
  </div>
</template>

<script>
import { storyboardPictureGenStream, getScriptDetailByVideo, batchSubmitStoryboardVoiceover } from '@/api'
import { useUserStore } from '@/stores/user'
import ErrorModal from '@/components/ErrorModal.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'GenerationStepsView',
  components: { ErrorModal, Header },
  data() {
    return {
      project: {
        title: '',
        createdAt: ''
      },
      currentStep: 0,
      progress: 0,
      steps: [
        { title: '画面构想与光影预演' },
        { title: '镜头语言与情绪锚点' },
        { title: '场景调度与视觉叙事' },
        { title: '帧帧推演与动态留白' },
        { title: '色彩叙事与氛围凝练' }
      ],
      progressTimer: null,
      stepTimer: null,
      // 每步时长（毫秒）：默认每步约75秒，总计约6分钟，实际跳转仍以接口完成为准
      stepDurationsMs: [75000, 75000, 75000, 75000, 75000],
      // 进度刷新间隔（毫秒）
      progressIntervalMs: 1000,
      isContentComplete: false,
      errorModalVisible: false,
      errorMessage: '分镜生成失败，请稍后再试',
      generationTimeout: null,
      timeoutPromptVisible: false,
      timeoutRedirectTimer: null
      , redirectTimer: null
    }
  },
  computed: {
    progressDisplay() {
      const p = Number(this.progress) || 0
      return p.toFixed(2)
    }
  },
  mounted() {
    this.fetchProjectInfo()
    this.startGeneration()
    this.startSSE()
    this.startGenerationTimeout()
    const projectId = this.$route.params.id
    try { localStorage.setItem(`video-edit:loading:${projectId}`, '1') } catch (e) { void 0 }
    const dest = `/video-edit/${projectId}`
    if (this.redirectTimer) clearTimeout(this.redirectTimer)
    this.redirectTimer = setTimeout(() => {
      try { window.history.replaceState({ replaced: true }, '', dest) } catch (e) { console.warn('替换浏览历史失败:', e) }
      this.$router.replace(dest)
    }, 210000)
  },
  beforeUnmount() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
    if (this.stepTimer) {
      clearTimeout(this.stepTimer)
    }
    try { if (this._ssePicCtrl && this._ssePicCtrl.abort) this._ssePicCtrl.abort() } catch (e) { void e }
    if (this.generationTimeout) {
      clearTimeout(this.generationTimeout)
    }
    if (this.timeoutRedirectTimer) {
      clearTimeout(this.timeoutRedirectTimer)
    }
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer)
    }
  },
  methods: {
    async fetchProjectInfo() {
      try {
        const store = useUserStore()
        const token = store && store.token || ''
        if (!token) return
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId

        const cachedTitle = localStorage.getItem(`project:prompt:${projectId}`)
        if (cachedTitle) this.project.title = cachedTitle

        const text = await getScriptDetailByVideo({ videoId, token })
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const data = obj && obj.data ? obj.data : obj
        if (data) {
          if (data.title) {
            this.project.title = data.title
          } else if (data.Script_Summary) {
            const m = String(data.Script_Summary).match(/《([^》]+)》/)
            if (m && m[1]) this.project.title = m[1].trim()
          }
          // 尝试获取时间字段
          const timeStr = data.created_at || data.createTime || data.create_time
          if (timeStr) this.project.createdAt = timeStr
        }
      } catch (e) { console.warn('获取项目详情失败:', e) }
    },
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
          if (this.currentStep === this.steps.length - 1 && !this.isContentComplete) {
            if (this.progress > 97.7) this.progress = 97.7
          }
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
        return
      }
      let attempts = 0
      while (attempts < 3) {
        try {
          this._ssePicCtrl = new AbortController()
          await storyboardPictureGenStream({
            videoId,
            aspectRatio: localStorage.getItem(`project:aspectRatio:${projectId}`) || '16:9',
            token,
            signal: this._ssePicCtrl.signal,
            onEvent: (obj) => {
              if (!obj || obj.type === 'connected') return
              const hasFirstPic = obj.result && obj.result.shots && (obj.result.shots.scene_picture || obj.result.shots.scene_picture_url)

              if (obj.Storyboard_picture || hasFirstPic) {
                this.isContentComplete = true
                if (this.generationTimeout) clearTimeout(this.generationTimeout)
                if (this.timeoutRedirectTimer) clearTimeout(this.timeoutRedirectTimer)
                this.timeoutPromptVisible = false
                this.triggerStoryboardVoiceoverBatch(videoId, token)
                if (obj.Storyboard_picture) {
                  this.handleStoryboardPicture(obj.Storyboard_picture)
                }
                const projectId = this.$route.params.id
                this.$router.replace(`/video-edit/${projectId}`)
              }
            }
          })
          return
        } catch (e) {
          attempts++
          if (attempts >= 3) {
            this.errorModalVisible = true
            this.currentStep = this.steps.length - 1
            this.progress = 97.7
            if (this.generationTimeout) clearTimeout(this.generationTimeout)
            if (this.timeoutRedirectTimer) clearTimeout(this.timeoutRedirectTimer)
            return
          }
        }
      }
    },
    async triggerStoryboardVoiceoverBatch(videoId, token) {
      if (!videoId || !token) return
      const projectId = this.$route.params.id
      const guardKey = `video-edit:voiceoverBatchStarted:${projectId}`
      if (this._storyboardVoiceoverStarted) return
      try {
        if (localStorage.getItem(guardKey) === '1') return
      } catch (e) { /* no-op */ }
      try {
        const resp = await batchSubmitStoryboardVoiceover({ videoId, token })
        if (!resp) {
          console.warn('一键生成剧本分镜配音接口未返回结果')
          return
        }
        if (resp.success === false) {
          const msg = resp.message || resp.error_message || '未知错误'
          console.warn('一键生成剧本分镜配音启动失败:', msg, resp)
          return
        }
        this._storyboardVoiceoverStarted = true
        try { localStorage.setItem(guardKey, '1') } catch (e) { /* no-op */ }
        console.log('一键生成剧本分镜配音已启动:', resp)
      } catch (e) {
        console.warn('一键生成剧本分镜配音请求失败:', e)
      }
    },
    startGenerationTimeout() {
      if (this.generationTimeout) clearTimeout(this.generationTimeout)
      this.generationTimeout = setTimeout(() => {
        this.timeoutPromptVisible = true
        try { if (this._ssePicCtrl && this._ssePicCtrl.abort) this._ssePicCtrl.abort() } catch (e) { void e }
        if (this.timeoutRedirectTimer) clearTimeout(this.timeoutRedirectTimer)
        this.timeoutRedirectTimer = setTimeout(() => {
          this.$router.push('/')
        }, 8000)
      }, 300000)
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
      try { localStorage.setItem(`video-edit:viewStoryboard:${projectId}`, '1') } catch (e) { /* no-op */ }
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
        const rawThumb = firstShot.scene_picture || firstShot.scene_picture_url || firstShot.Scene_picture_url || s.Scene_picture_url || s.scene_picture_url || ''
        const thumb = this.cleanUrl(rawThumb)
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
.project-header {
  margin-bottom: 24px;
  text-align: center;
}
.project-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.project-title-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.project-time {
  font-size: 13px;
  color: var(--text-tertiary);
}

.generation-steps {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
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
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 90%;
  position: relative;
  z-index: 1;
  height: calc(100vh - var(--header-height) - 34px - 20px);
  min-height: 0 !important;
  margin-top: 64px;
  margin-bottom: 20px;
  /* margin-bottom: 64px; */
  /* margin-top: 48px; */
}

.header-section {
  text-align: center;
  margin-bottom: 24px;
}

.loading-icon {
  color: var(--primary-color);
  margin-bottom: 12px;
  animation: pulse 2s ease-in-out infinite;
}

.loading-icon svg {
  width: 40px;
  height: 40px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-item.pending {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
}

.step-item.active {
  background: var(--bg-quaternary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.step-item.completed {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-item.pending .step-icon {
  background: var(--bg-quaternary);
  color: var(--text-tertiary);
}

.step-item.active .step-icon {
  background: var(--primary-color);
  color: white;
}

.step-item.completed .step-icon {
  background: var(--primary-color);
  color: white;
}

.step-number {
  font-size: 14px;
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
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-status {
  font-size: 12px;
  opacity: 0.8;
}

.status-pending {
  color: var(--text-tertiary);
}

.status-progress {
  color: var(--primary-color);
  font-weight: 500;
}

.status-completed {
  color: var(--primary-color);
  font-weight: 500;
}

.center-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.center-prompt {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 280px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.prompt-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px;
    margin: 20px;
  }

  .main-title {
    font-size: 18px;
  }

  .step-item {
    padding: 10px;
    gap: 10px;
  }

  .step-icon {
    width: 32px;
    height: 32px;
  }

  .step-title {
    font-size: 13px;
  }
}


</style>
