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
      stepTimer: null
    }
  },
  mounted() {
    this.startGeneration()
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
    startGeneration() {
      // 开始进度动画
      this.progressTimer = setInterval(() => {
        if (this.progress < 100) {
          this.progress += Math.random() * 15 + 5 // 随机增加5-20%
          if (this.progress > 100) this.progress = 100
        }
      }, 200)

      // 步骤切换逻辑 - 总共15秒，每步3秒
      this.stepTimer = setTimeout(() => {
        this.nextStep()
      }, 3000) // 每3秒切换到下一步
    },
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
        this.progress = 0
        
        // 继续下一步
        this.stepTimer = setTimeout(() => {
          this.nextStep()
        }, 3000)
      } else {
        // 所有步骤完成，等待最后一步完成后跳转到视频编辑页面
        setTimeout(() => {
          const projectId = this.$route.params.id
          this.$router.push(`/video-edit/${projectId}`)
        }, 3000) // 最后一步也是3秒，总共15秒
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