<template>
  <div class="video-edit-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <input 
          v-model="projectTitle" 
          class="project-title-input" 
          @blur="saveTitle"
          @keyup.enter="saveTitle"
        />
      </div>
      <div class="navbar-right">
        <button class="navbar-btn premium-btn">开通会员</button>
        <button class="navbar-btn convert-btn">一键转视频</button>
        <button class="navbar-btn export-btn">导出视频</button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 最左侧切换选项 -->
      <div class="sidebar-tabs">
        <div class="tab-item active" @click="activeTab = 'image'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="tab-label">画面</span>
        </div>
        <div class="tab-item" @click="activeTab = 'voice'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="tab-label">配音</span>
        </div>
      </div>

      <!-- 左侧区域 -->
      <div class="left-panel">
        <!-- 顶部标题区域 -->
        <div class="panel-header">
          <div class="scene-title-header">
            <span class="scene-number">分镜3</span>
            <span class="scene-type">镜头策划</span>
          </div>
        </div>

        <!-- 分镜内容 -->
        <div class="scene-content">

          <!-- 图片提示词区域 -->
          <div class="prompt-section">
            <div class="prompt-header">
              <div class="prompt-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <span class="prompt-title">图片提示词</span>
              <div class="prompt-actions">
                <button class="action-btn edit-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="action-btn copy-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="action-btn more-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 图片描述内容 -->
            <div class="prompt-content">
              <p>画风：卡通，以粉色、白色和浅蓝色为主色调，主体：中景，侧面朝着，Hello Kitty（白色卡通猫，圆脸，黄色蝴蝶结）</p>
            </div>
          </div>

          <!-- 图片展示 -->
          <div class="image-container">
            <img src="/logo.png" alt="分镜图片" class="scene-image" />
          </div>

          <!-- 底部操作按钮 -->
          <div class="bottom-actions">
            <button class="bottom-btn download-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              下载
            </button>
            <button class="bottom-btn apply-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
              应用
            </button>
            <button class="bottom-btn regenerate-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2"/>
              </svg>
              重新生成
            </button>
          </div>

          <!-- 输入框区域 -->
          <div class="input-section">
            <div class="input-container">
              <textarea 
                v-model="sceneInput"
                class="scene-input"
                placeholder="输入你想要对当前画面修改的内容"
              ></textarea>
              <div class="input-actions">
                <button class="input-action-btn voice-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="input-action-btn send-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="input-footer">
              <span class="input-hint">消耗</span>
              <span class="input-count">1</span>
              <button class="input-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-panel">
        <!-- 画布编辑和对口型 -->
        <div class="edit-controls">
          <button class="control-btn active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            画布编辑
          </button>
          <button class="control-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" stroke-width="2"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" stroke-width="2"/>
            </svg>
            对口型
          </button>
        </div>

        <!-- 视频画面 -->
        <div class="video-preview">
          <div class="video-container">
            <img src="/logo.png" alt="Hello Kitty" class="video-image" />
            <div class="video-overlay">
              <button class="play-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 播放控制和时间轴 -->
        <div class="playback-section">
          <!-- 播放控制 -->
          <div class="playback-controls">
            <div class="time-display">
              <span class="current-time">00:03</span>
              <span class="separator">/</span>
              <span class="total-time">00:22</span>
            </div>
            <button class="expand-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2"/>
                <polyline points="9,21 3,21 3,15" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="3" x2="14" y2="10" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="21" x2="10" y2="14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <!-- 时间轴区域 -->
          <div class="timeline-section">
            <!-- 字幕开关 -->
            <div class="timeline-header">
              <span class="timeline-label">字幕</span>
              <label class="switch">
                <input type="checkbox" v-model="subtitleEnabled" checked>
                <span class="slider"></span>
              </label>
            </div>

            <!-- 时间刻度 -->
            <div class="time-scale">
              <div class="time-marker" v-for="time in timeMarkers" :key="time">
                <span class="time-text">{{ time }}</span>
              </div>
            </div>

            <!-- 分镜轨道 - 水平布局 -->
            <div class="timeline-tracks">
              <!-- 分镜1 -->
              <div class="timeline-track">
                <div class="track-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span class="track-title">分镜1</span>
                </div>
                <div class="track-clips">
                  <div v-for="n in 4" :key="n" class="scene-clip">
                    <img src="/logo.png" alt="分镜1" class="clip-thumbnail" />
                  </div>
                </div>
                <div class="track-audio">
                  <button class="audio-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    配音
                  </button>
                  <button class="audio-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    背景音乐
                  </button>
                </div>
              </div>

              <!-- 分镜2 -->
              <div class="timeline-track">
                <div class="track-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span class="track-title">分镜2</span>
                </div>
                <div class="track-clips">
                  <div v-for="n in 4" :key="n" class="scene-clip">
                    <img src="/logo.png" alt="分镜2" class="clip-thumbnail" />
                  </div>
                </div>
                <div class="track-audio">
                  <button class="audio-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    配音
                  </button>
                  <button class="audio-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    背景音乐
                  </button>
                </div>
              </div>

              <!-- 分镜3 - 当前活跃 -->
              <div class="timeline-track active">
                <div class="track-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span class="track-title">分镜3</span>
                </div>
                <div class="track-clips">
                  <div v-for="n in 16" :key="n" class="scene-clip active">
                    <img src="/logo.png" alt="分镜3" class="clip-thumbnail" />
                  </div>
                </div>
                <div class="track-audio">
                  <button class="audio-btn add-audio">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
                      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    添加配音
                  </button>
                </div>
              </div>
            </div>

            <!-- 播放进度指示器 -->
            <div class="playback-indicator" :style="{ left: playbackPosition + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoEditView',
  data() {
    return {
      projectTitle: 'Hello Kitty动画记',
      activeTab: 'image',
      sceneInput: '',
      subtitleEnabled: true,
      activeSceneIndex: 2,
      playbackPosition: 15, // 播放进度百分比
      timeMarkers: ['00:00', '00:05', '00:10', '00:15', '00:20'],
      scenes: [
        {
          id: 1,
          title: '分镜1',
          description: '画面1：卡通、小猫、白色和粉色、可爱的表情为主色调，主体：全身，正面一个，坐着一个小猫咪的房子',
          thumbnail: '/logo.png'
        },
        {
          id: 2,
          title: '分镜2',
          description: '画面2：小猫在房间里玩耍',
          thumbnail: '/logo.png'
        },
        {
          id: 3,
          title: '分镜3',
          description: '画面3：小猫和朋友们一起',
          thumbnail: '/logo.png'
        }
      ]
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    saveTitle() {
      console.log('保存标题:', this.projectTitle)
    },
    selectScene(index) {
      this.activeSceneIndex = index
    }
  }
}
</script>

<style scoped>
.video-edit-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-navbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
}

.back-btn:hover {
  background: #e5e7eb;
}

.project-title-input {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  border: none;
  background: transparent;
  outline: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.project-title-input:focus {
  background: #f9fafb;
  border: 1px solid #3b82f6;
}

.navbar-right {
  display: flex;
  gap: 12px;
}

.navbar-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.navbar-btn:hover {
  background: #f9fafb;
}

.premium-btn {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.convert-btn {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.export-btn {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.export-btn:hover {
  background: #2563eb;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 最左侧切换选项 */
.sidebar-tabs {
  width: 80px;
  background: #f8f9fa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.tab-item:hover {
  background: #e5e7eb;
}

.tab-item.active {
  background: #dbeafe;
  color: #2563eb;
}

.tab-icon {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* 左侧面板 */
.left-panel {
  width: 320px;
  background: #f8f9fa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

/* 顶部标题区域 */
.panel-header {
  /* background: #00bcd4; */
  padding: 16px 20px;
  color: #000000;
}

.scene-title-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scene-number {
  font-size: 16px;
  font-weight: 600;
}

.scene-type {
  font-size: 16px;
  font-weight: 400;
}

.scene-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: white;
}


/* 图片提示词区域 */
.prompt-section {
  margin-bottom: 20px;
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #e8f4fd;
  border-radius: 8px 8px 0 0;
  border: 1px solid #b3d9f2;
}

.prompt-icon {
  color: #3b82f6;
}

.prompt-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.prompt-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.prompt-content {
  padding: 12px;
  background: white;
  border: 1px solid #b3d9f2;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.prompt-content p {
  margin: 0;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

.image-container {
  margin-bottom: 20px;
}

.scene-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* 底部操作按钮 */
.bottom-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.bottom-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.download-btn:hover {
  color: #059669;
  border-color: #059669;
}

.apply-btn:hover {
  color: #3b82f6;
  border-color: #3b82f6;
}

.regenerate-btn:hover {
  color: #dc2626;
  border-color: #dc2626;
}

/* 输入框区域 */
.input-section {
  margin-top: auto;
}

.input-container {
  position: relative;
  margin-bottom: 8px;
}

.scene-input {
  width: 100%;
  height: 60px;
  padding: 12px 50px 12px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  outline: none;
  background: white;
}

.scene-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 4px;
}

.input-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.input-action-btn:hover {
  background: #e5e7eb;
}

.send-btn {
  background: #3b82f6;
  color: white;
}

.send-btn:hover {
  background: #2563eb;
}

.input-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.input-hint {
  color: #6b7280;
}

.input-count {
  color: #374151;
  font-weight: 500;
}

.input-arrow {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.edit-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-btn:hover {
  background: #f9fafb;
}

.control-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.video-preview {
  height: 250px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.video-container {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.3s;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.8);
}

.play-button svg {
  margin-left: 2px;
}

/* 播放控制区域 */
.playback-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.playback-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #374151;
}

.current-time, .total-time {
  font-weight: 500;
}

.separator {
  color: #6b7280;
}

.expand-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* 时间轴区域 */
.timeline-section {
  position: relative;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeline-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.time-scale {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 8px;
}

.time-marker {
  font-size: 12px;
  color: #9ca3af;
}

.timeline-tracks {
  display: flex;
  gap: 12px;
  position: relative;
  overflow-x: auto;
  padding: 8px 0;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  overflow: hidden;
}

.timeline-track.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.track-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.track-title {
  font-weight: 600;
}

.track-clips {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px;
  min-height: 60px;
  background: white;
}

.scene-clip {
  width: 28px;
  height: 28px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.scene-clip:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
}

.scene-clip.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.clip-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-audio {
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 6px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  min-height: 32px;
}

.audio-btn {
  padding: 4px 6px;
  font-size: 9px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: center;
  white-space: nowrap;
  flex: 1;
  min-height: 20px;
}

.audio-btn svg {
  width: 10px;
  height: 10px;
}

.audio-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.add-audio {
  color: #3b82f6;
  border-color: #3b82f6;
}

.add-audio:hover {
  background: #eff6ff;
}

.playback-indicator {
  position: absolute;
  top: 40px;
  bottom: 0;
  width: 2px;
  background: #ef4444;
  z-index: 10;
  pointer-events: none;
  left: 15%;
}

.playback-indicator::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -3px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}
</style>