<template>
  <!-- 原始的VideoEditView内容 -->
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
        <div class="tab-item" :class="{ active: activeTab === 'image' }" @click="activeTab = 'image'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="tab-label">画面</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'voice' }" @click="activeTab = 'voice'">
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
            <span class="scene-number">分镜1</span>
            <span class="scene-type" v-if="activeTab === 'image'">镜头策划</span>
            <span class="scene-type" v-if="activeTab === 'voice'">配音编辑</span>
          </div>
        </div>

        <!-- 分镜内容 - 画面模式 -->
        <div class="scene-content" v-if="activeTab === 'image'">
          <!-- 可滚动内容区域 -->
          <div class="scene-scrollable-content">
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
                  <button class="action-btn edit-btn" @click="editPrompt" title="编辑提示词">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn copy-btn" @click="copyPrompt" title="复制提示词">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn more-btn" @click="togglePromptExpansion" :title="isPromptExpanded ? '收缩提示词' : '展开提示词'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :style="{ transform: isPromptExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 图片描述内容 -->
              <div class="prompt-content" v-show="isPromptExpanded">
                <!-- 显示模式 -->
                <p v-if="!isEditingPrompt">{{ scenes[activeSceneIndex]?.description || '暂无描述' }}</p>
                <!-- 编辑模式 -->
                <div v-else class="prompt-edit-container">
                  <textarea
                    v-model="editingPromptText"
                    class="prompt-edit-input"
                    placeholder="请输入图片提示词..."
                    @keyup.enter.ctrl="savePromptEdit"
                  ></textarea>
                  <div class="prompt-edit-actions">
                    <button class="prompt-edit-btn save-btn" @click="savePromptEdit">保存</button>
                    <button class="prompt-edit-btn cancel-btn" @click="cancelPromptEdit">取消</button>
                  </div>
                </div>
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
          </div>

          <!-- 固定的输入框区域 -->
          <div class="input-section">
            <div class="input-container">
              <textarea
                v-model="sceneInput"
                class="scene-input"
                placeholder="输入你想要对当前画面修改的内容"
              ></textarea>
              <div class="input-actions">
                <button class="input-action-btn send-btn">
            ↑
                </button>
              </div>
            </div>
            <div class="input-footer">
              <button class="convert-video-btn">
                <span>转视频</span>
              </button>
              <div class="input-footer-right">
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

        <!-- 配音内容 - 配音模式 -->
        <div class="voice-content" v-if="activeTab === 'voice'">
          <!-- 可滚动内容区域 -->
          <div class="voice-scrollable-content">
            <!-- 画外音合词区域 -->
            <div class="voice-script-section">
              <div class="voice-script-header">
                <span class="voice-script-title">画外音合词</span>
              </div>
              <div class="voice-script-container">
                <textarea
                  v-model="voiceScript"
                  class="voice-script-input"
                  placeholder="很久很久以前，玉皇大帝要举十二位守护神。"
                ></textarea>
                <div class="voice-script-controls">
                  <button class="voice-control-btn play-btn" @click="togglePlay">
                    <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                      <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                    </svg>
                    {{ isPlaying ? '停止' : '试听' }}
                  </button>
                  <button class="voice-control-btn stop-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    停顿
                  </button>
                  <span class="voice-duration">约5s 音频 20/240</span>
                </div>
              </div>
            </div>

            <!-- 声音音色区域 -->
            <div class="voice-settings-section">
              <div class="voice-setting-item">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">声音音色</span>
                  <label class="voice-setting-checkbox">
                    <input type="checkbox" v-model="applyToAllScenes" />
                    <span class="checkbox-text">应用所有分镜</span>
                  </label>
                </div>
                <div class="voice-setting-content">
                  <div class="voice-type-selector">
                    <button class="voice-type-btn active">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 14c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      专业主播
                    </button>
                    <button class="voice-refresh-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                  <div class="voice-attributes">
                    <span class="voice-attr">女性</span>
                    <span class="voice-attr">中年</span>
                    <span class="voice-attr">普通话</span>
                  </div>
                  <div class="voice-emotion-selector">
                    <span class="emotion-label">情绪：</span>
                    <div class="emotion-dropdown">
                      <span class="selected-emotion">默认</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 声音音量区域 -->
              <div class="voice-setting-item">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">声音音量</span>
                  <label class="voice-setting-checkbox">
                    <input type="checkbox" v-model="applyVolumeToAllScenes" />
                    <span class="checkbox-text">应用所有分镜</span>
                  </label>
                </div>
                <div class="voice-setting-content">
                  <div class="volume-slider-container">
                    <input
                      type="range"
                      v-model="voiceVolume"
                      min="0"
                      max="200"
                      class="volume-slider"
                    />
                    <span class="volume-value">{{ voiceVolume }}</span>
                  </div>
                </div>
              </div>

              <!-- 声音语速区域 -->
              <div class="voice-setting-item">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">声音语速</span>
                  <label class="voice-setting-checkbox">
                    <input type="checkbox" v-model="applySpeedToAllScenes" />
                    <span class="checkbox-text">应用所有分镜</span>
                  </label>
                </div>
                <div class="voice-setting-content">
                  <div class="speed-slider-container">
                    <input
                      type="range"
                      v-model="voiceSpeed"
                      min="50"
                      max="200"
                      class="speed-slider"
                    />
                    <span class="speed-value">{{ (voiceSpeed / 100).toFixed(1) }}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 固定的应用修改按钮 -->
          <div class="voice-apply-section">
            <button class="voice-apply-btn">应用修改</button>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-panel">
        <!-- 画布编辑和对口型 -->
        <div class="edit-controls">
          <button class="control-btn active" @click="toggleCanvasEditMode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            画布编辑
          </button>
          <button class="control-btn" @click="toggleLipSyncView">
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

    <div v-if="isCanvasEditMode" class="canvas-edit-overlay">
      <CanvasEditView @close="toggleCanvasEditMode" />
    </div>

    <!-- 对口型页面覆盖层 -->
    <div v-if="showLipSyncView" class="lip-sync-overlay">
      <LipSyncView @close="toggleLipSyncView" />
    </div>
  </div>
</template>

<script>
import LipSyncView from '@/views/LipSyncView.vue'
import CanvasEditView from '@/views/CanvasEditView.vue'

export default {
  name: 'VideoEditView',
  components: {
    LipSyncView,
    CanvasEditView
  },
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
      ],
      // 配音相关数据
      voiceScript: '很久很久以前，玉皇大帝要选十二位守护神。',
      voiceGender: '女性',
      voiceAge: '中年',
      voiceStyle: '普通话',
      voiceEmotion: '默认',
      voiceVolume: 100,
      voiceSpeed: 100,
      applyToAllScenes: false,
      applyVolumeToAllScenes: false,
      applySpeedToAllScenes: false,
      isPlaying: false,
      audioDuration: '约 5s 音频 20/240',
      // 图片提示词相关数据
      isPromptExpanded: true,
      isEditingPrompt: false,
      editingPromptText: '',
      originalPromptContent: '画面1：卡通、小猫、白色和粉色、可爱的表情为主色调，主体：全身，正面一个，坐着一个小猫咪的房子',
      // 画布编辑模式
      isCanvasEditMode: false,
      // 对口型页面显示状态
      showLipSyncView: false
    }
  },
  methods: {
    goBack() {
      const projectId = this.$route.params.id
      this.$router.push(`/project/${projectId}`)
    },
    saveTitle() {
      console.log('保存标题:', this.projectTitle)
    },
    selectScene(index) {
      this.activeSceneIndex = index
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    // 图片提示词相关方法
    editPrompt() {
      const currentScene = this.scenes[this.activeSceneIndex]
      this.editingPromptText = currentScene ? currentScene.description : ''
      this.isEditingPrompt = true
      // 下一帧聚焦到输入框
      this.$nextTick(() => {
        const textarea = document.querySelector('.prompt-edit-input')
        if (textarea) {
          textarea.focus()
        }
      })
    },
    savePromptEdit() {
      if (this.activeSceneIndex >= 0 && this.activeSceneIndex < this.scenes.length) {
        this.scenes[this.activeSceneIndex].description = this.editingPromptText
        this.isEditingPrompt = false
        this.editingPromptText = ''
        console.log('提示词已保存:', this.editingPromptText)
      }
    },
    cancelPromptEdit() {
      this.isEditingPrompt = false
      this.editingPromptText = ''
      console.log('取消编辑提示词')
    },
    copyPrompt() {
      const currentScene = this.scenes[this.activeSceneIndex]
      if (currentScene && currentScene.description) {
        navigator.clipboard.writeText(currentScene.description).then(() => {
          console.log('提示词已复制到剪贴板')
          // 这里可以添加成功提示
        }).catch(err => {
          console.error('复制失败:', err)
        })
      }
    },
    togglePromptExpansion() {
      this.isPromptExpanded = !this.isPromptExpanded
      console.log('切换提示词展开状态:', this.isPromptExpanded)
    },
    // 画布编辑模式相关方法
    toggleCanvasEditMode() {
      this.isCanvasEditMode = !this.isCanvasEditMode
      console.log('切换画布编辑模式:', this.isCanvasEditMode)
    },
    // 对口型页面相关方法
    toggleLipSyncView() {
      this.showLipSyncView = !this.showLipSyncView
      console.log('切换对口型页面显示状态:', this.showLipSyncView)
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
  background: #f3f4f6;
  color: black;
  border-radius: 20px;
}

.convert-btn {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
  border-radius: 20px;
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
  position: relative; /* 为绝对定位的输入框提供定位上下文 */
  height: 100%; /* 确保面板占满高度 */
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
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  position: relative;
  overflow: hidden; /* 防止内容溢出 */
}

.scene-scrollable-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 200px; /* 增加底部空间，确保底部按钮不被遮挡 */
  overflow-y: auto;
  height: 0; /* 强制flex子元素计算高度 */
  min-height: 0; /* 允许flex子元素缩小 */
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

.action-btn svg {
  transition: transform 0.2s ease;
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

.prompt-edit-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-edit-input {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.prompt-edit-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.prompt-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.prompt-edit-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.prompt-edit-btn.save-btn {
  background: #3b82f6;
  color: white;
}

.prompt-edit-btn.save-btn:hover {
  background: #2563eb;
}

.prompt-edit-btn.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.prompt-edit-btn.cancel-btn:hover {
  background: #e5e7eb;
}

.image-container {
  margin-bottom: 20px;
}

.scene-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background-color: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom-btn:hover {
  color: #111827;
}

/* 输入框区域 */
.input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  position: relative;
  margin-bottom: 8px;
  border: 2px solid #3b82f6;
  border-radius: 16px;
  background: white;
  padding: 12px;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.scene-input {
  width: 100%;
  height: 60px;
  padding: 12px 50px 12px 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  outline: none;
  background: transparent;
}

.scene-input:focus {
  outline: none;
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
  border-radius: 25px;
}

.send-btn:hover {
  background: #2563eb;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.convert-video-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.convert-video-btn:hover {
  background: #e5e7eb;
}

.input-footer-right {
  display: flex;
  align-items: center;
  gap: 4px;
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

/* 配音界面样式 */
.voice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  height: 100%;
  position: relative;
  overflow: hidden; /* 防止内容溢出 */
}

.voice-scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 120px; /* 为固定输入框留出空间 */
  height: 0; /* 强制flex子元素计算高度 */
  min-height: 0; /* 允许flex子元素缩小 */
}

.input-section {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.voice-script-section {
  margin-bottom: 20px;
}

.voice-script-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.voice-script-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.voice-script-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.voice-script-input {
  width: 100%;
  height: 80px;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #374151;
  resize: none;
  outline: none;
}

.voice-script-input::placeholder {
  color: #9ca3af;
}

.voice-script-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(0, 188, 212, 0.3);
}

.voice-control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: black;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-control-btn:hover {
  /* color: white; */
  background-color: #dbeafe;
  border-radius: 25px;
}

.voice-duration {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
}

/* 声音设置区域 */
.voice-settings-section {
  margin-bottom: 24px;
}

.voice-setting-item {
  margin-bottom: 20px;
}

.voice-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.voice-setting-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.voice-setting-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.voice-setting-checkbox input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 0;
  cursor: pointer;
}

.checkbox-text {
  white-space: nowrap;
}

.voice-setting-content {
  background: #f9f9f7;
  border-radius: 12px;
  padding: 16px;
}

/* 声音类型选择器 */
.voice-type-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.voice-type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-type-btn.active {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #374151;
}

.voice-refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-refresh-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* 声音属性 */
.voice-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.voice-attr {
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  color: #374151;
}

/* 情绪选择器 */
.voice-emotion-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emotion-label {
  font-size: 14px;
  color: #374151;
}

.emotion-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  min-width: 80px;
}

.selected-emotion {
  font-size: 12px;
  color: #374151;
}

.emotion-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.emotion-select:focus {
  border-color: #00bcd4;
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
}

/* 音量滑块 */
.volume-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-slider {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.volume-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  min-width: 30px;
  text-align: right;
}

/* 语速滑块 */
.speed-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-slider {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.speed-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #00bcd4;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.speed-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
  text-align: right;
}

/* 应用修改按钮 */
.voice-apply-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.voice-apply-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-apply-btn:hover {
  background: #00acc1;
}

/* 对口型页面覆盖层样式 */
.lip-sync-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 3000;
  display: flex;
  flex-direction: column;
}
</style>
