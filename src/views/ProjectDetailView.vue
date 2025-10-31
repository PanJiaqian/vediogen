<template>
  <div class="project-detail">
    <!-- 左侧内容区域 -->
    <div class="left-content">
      <!-- 题目和时间 -->
      <div class="project-header">
        <h1 class="project-title">{{ project.title }}</h1>
        <p class="project-time">创建于 {{ project.createdAt }}</p>
      </div>

      <!-- 策划摘要 -->
      <div class="planning-summary">
        <h3 class="section-title">策划摘要</h3>
        <div class="summary-item">
          <span class="summary-bullet">•</span>
          <span class="summary-label">视频类型：</span>
          <span class="summary-content">{{ project.videoType }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-bullet">•</span>
          <span class="summary-label">内容概述：</span>
          <span class="summary-content">{{ project.contentSummary }}</span>
        </div>
      </div>

      <!-- 创作亮点 -->
      <div class="creative-highlights">
        <h3 class="section-title">创作亮点</h3>
        <div class="highlight-item" v-for="(highlight, index) in project.highlights" :key="index">
          <span class="highlight-icon">💡</span>
          <span class="highlight-label">亮点{{ index + 1 }}：</span>
          <span class="highlight-content">{{ highlight }}</span>
        </div>
      </div>

      <!-- 场景描述 -->
      <div class="scene-description">
        <h3 class="section-title">场景描述</h3>
        <div class="scene-item" v-for="(scene, index) in project.scenes" :key="index">
          <div class="scene-header">
            <span class="scene-label">场景{{ index + 1 }}</span>
          </div>
          <div class="scene-content">
            <div class="scene-detail">
              <span class="scene-detail-label">开场白：</span>
              <span class="scene-detail-text">{{ scene.opening }}</span>
            </div>
            <div class="scene-detail">
              <span class="scene-detail-label">生动有趣：</span>
              <span class="scene-detail-text">{{ scene.vivid }}</span>
            </div>
            <div class="scene-detail">
              <span class="scene-detail-label">动作场景：</span>
              <span class="scene-detail-text">{{ scene.action }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <!-- 可滚动内容区域 -->
      <div class="scrollable-content">
        <!-- 项目信息统计 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-label">预计时长：</div>
              <div class="stat-value">{{ project.duration }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📺</div>
            <div class="stat-content">
              <div class="stat-label">画面比例：</div>
              <div class="stat-value">{{ project.aspectRatio }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <div class="stat-label">字数：</div>
              <div class="stat-value">{{ project.wordCount }}</div>
            </div>
          </div>
        </div>

        <!-- 思考生成步骤 -->
        <div class="thinking-steps">
          <h3 class="section-title">思考生成步骤</h3>
          <div class="step-list">
            <div class="step-item completed">
              <div class="step-icon">✓</div>
              <div class="step-content">
                <div class="step-title">策划摘要</div>
                <div class="step-description">教育意义：教育自信</div>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">✓</div>
              <div class="step-content">
                <div class="step-title">内容策略</div>
                <div class="step-description">以生动有趣的动物形象，主动性主导大家常见的学习内容，通过十二生肖的故事，激发孩子们对传统文化的兴趣，让孩子在轻松愉快的氛围中学习传统文化。</div>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">💡</div>
              <div class="step-content">
                <div class="step-title">生成创作亮点</div>
                <div class="step-description">开篇即吸引眼球，通过可爱的动物形象引入</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">⏳</div>
              <div class="step-content">
                <div class="step-title">生成场景描述</div>
                <div class="step-description">生动有趣：动物竞赛大对决</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="action-btn save-script">保存剧本</button>
          <button class="action-btn add-scene">添加场景</button>
          <button class="action-btn generate-video" @click="generateVideo">生成视频</button>
        </div>
      </div>

      <!-- 固定在底部的输入框 -->
      <div class="input-section">
        <div class="input-container">
          <input 
            v-model="userInput" 
            placeholder="输入你的想法"
            class="user-input"
          />
          <button class="submit-btn" @click="submitInput">
            <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            ↑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectDetailView',
  data() {
    return {
      userInput: '',
      project: {
        title: '十二生肖起源记',
        createdAt: '2023/11/20 02:05',
        duration: '9:16',
        aspectRatio: '16:9',
        wordCount: '4.4',
        videoType: '教育科普类',
        contentSummary: '以幽默风趣的方式来讲述中国传统十二生肖的起源故事，讲述各种动物为争夺生肖排名的故事，作者通过现代化的叙述手法来十二生肖的起源故事中的传统文化。',
        highlights: [
          '开篇直接切入情境，通过开篇的问题引入',
          '主题突出：以幽默有趣的大对话'
        ],
        scenes: [
          {
            opening: '在很久很久以前，玉帝决定为十二种动物命名为生肖，举行了一场比赛。',
            vivid: '动物竞赛大对决',
            action: '工作画面展示，老鼠偷偷爬到牛背上，在最后一刻跳下来，成为第一名。'
          },
          {
            opening: '生动有趣：动物竞赛大对决',
            vivid: '动作场景：工作画面展示，各动物奋勇争先，老鼠坐在牛背上，最后跳下终点线。',
            action: '老鼠偷偷爬到牛背上，在最后一刻跳下来，成为第一名。'
          }
        ]
      }
    }
  },
  methods: {
    generateVideo() {
      const projectId = this.$route.params.id
      this.$router.push(`/video-edit/${projectId}`)
    },
    saveProject() {
      console.log('保存项目')
      // 实现保存项目逻辑
    },
    shareProject() {
      console.log('分享项目')
      // 实现分享项目逻辑
    },
    submitInput() {
      if (this.userInput.trim()) {
        console.log('用户输入:', this.userInput)
        // 处理用户输入
        this.userInput = ''
      }
    }
  },
  mounted() {
    // 根据路由参数获取项目详情
    const projectId = this.$route.params.id
    console.log('项目ID:', projectId)
    // 这里可以调用API获取具体的项目数据
  }
}
</script>

<style scoped>
.project-detail {
  position: fixed;
  top: 60px; /* 从header下方开始 */
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1500;
  display: flex;
  height: calc(100vh - 60px); /* 减去header高度 */
}

.left-content {
  flex: 1;
  padding: 20px 24px;
  overflow: hidden; /* 不允许滚动 */
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.right-content {
  width: 320px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scrollable-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  padding-bottom: 100px; /* 为固定输入框留出空间 */
}

/* 左侧样式 */
.project-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.project-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  line-height: 1.2;
}

.project-time {
  font-size: 13px;
  color: #6b7280;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
}

/* 策划摘要样式 */
.planning-summary {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.summary-bullet {
  color: #374151;
  margin-right: 8px;
  font-weight: 600;
}

.summary-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 80px;
  flex-shrink: 0;
}

.summary-content {
  color: #6b7280;
  flex: 1;
}

/* 创作亮点样式 */
.creative-highlights {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.highlight-icon {
  margin-right: 8px;
  font-size: 14px;
}

.highlight-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 60px;
  flex-shrink: 0;
}

.highlight-content {
  color: #6b7280;
  flex: 1;
}

/* 场景描述样式 */
.scene-description {
  flex: 1;
  overflow-y: auto;
}

.scene-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.scene-header {
  margin-bottom: 8px;
}

.scene-label {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  background-color: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.scene-content {
  margin-left: 0;
}

.scene-detail {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.scene-detail-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 70px;
  flex-shrink: 0;
}

.scene-detail-text {
  color: #6b7280;
  flex: 1;
}

/* 右侧样式 */
.stats-section {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.stat-icon {
  margin-right: 8px;
  font-size: 14px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-label {
  color: #666;
  margin-right: 4px;
}

.stat-value {
  color: #333;
  font-weight: 500;
}

.thinking-steps {
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
}

.step-list {
  background: transparent;
  border-radius: 8px;
  padding: 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 12px;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-item.completed:nth-child(1) {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-item.completed:nth-child(2) {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-item.completed:nth-child(3) {
  background: #cce7ff;
  border-left-color: #007bff;
}

.step-item:not(.completed) {
  background: #f8f9fa;
  border-left-color: #dee2e6;
}

.step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-right: 8px;
  flex-shrink: 0;
}

.step-item.completed .step-icon {
  background: #28a745;
  color: white;
}

.step-item:not(.completed) .step-icon {
  background: #6c757d;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.step-description {
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.save-script {
  background: #343a40;
  color: white;
}

.action-btn.save-script:hover {
  background: #23272b;
}

.action-btn.add-scene {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.action-btn.add-scene:hover {
  background: #e9ecef;
}

.action-btn.generate-video {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.action-btn.generate-video:hover {
  background: #e9ecef;
}

.input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 60px;
}

.input-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.user-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.user-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.submit-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.submit-icon {
  display: none;
}
</style>