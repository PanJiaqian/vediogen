<template>
  <div class="video-edit-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <img src="/logo.png" alt="VideoGen" class="logo-icon" @click="$router.push('/')" />
        <span class="project-title-text">{{ projectTitle }}</span>
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          返回策划
        </button>
      </div>
      <div class="navbar-right">
        <button class="navbar-btn premium-btn">开通会员</button>
        <button class="navbar-btn convert-btn" @click="convertToVideo"
          :disabled="!allImagesReady || isVideo(currentPreviewUrl) || previewImgErrored">一键转视频</button>
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span class="tab-label">画面</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'voice' }" @click="activeTab = 'voice'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                stroke-width="2" />
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
            <span class="scene-number">分镜{{ (scenes && scenes[activeSceneIndex] && Number(scenes[activeSceneIndex].order_index) > 0) ? Number(scenes[activeSceneIndex].order_index) : '' }}</span>
            <span class="scene-type" v-if="activeTab === 'image'">镜头策划</span>
            <span class="scene-type" v-if="activeTab === 'voice'">配音编辑</span>
          </div>
        </div>

        <template v-if="isConverting">
          <div class="skeleton-block">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-image" style="height:200px;"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
        </template>
        <template v-else>
          <!-- 分镜内容 - 画面模式 -->
          <div class="scene-content" v-if="activeTab === 'image'">
            <!-- 可滚动内容区域 -->
            <div class="scene-scrollable-content">
              <!-- 图片提示词区域 -->
              <div class="prompt-section">
                <div class="prompt-header">
                  <div class="prompt-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <span class="prompt-title">图片提示词</span>
                  <div class="prompt-actions">
                    <button class="action-btn edit-btn" @click="editPrompt" title="编辑提示词">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"
                          stroke-width="2" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"
                          stroke-width="2" />
                      </svg>
                    </button>
                    <button class="action-btn copy-btn" @click="copyPrompt" title="复制提示词">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor"
                          stroke-width="2" />
                      </svg>
                    </button>
                    <button class="action-btn more-btn" @click="togglePromptExpansion"
                      :title="isPromptExpanded ? '收缩提示词' : '展开提示词'">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        :style="{ transform: isPromptExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
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
                    <textarea v-model="editingPromptText" class="prompt-edit-input" placeholder="请输入图片提示词..."
                      @keyup.enter.ctrl="savePromptEdit"></textarea>
                    <div class="prompt-edit-actions">
                      <button class="prompt-edit-btn save-btn" @click="savePromptEdit">保存</button>
                      <button class="prompt-edit-btn cancel-btn" @click="cancelPromptEdit">取消</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 图片展示 -->
              <div class="image-container">
                <div v-if="isPreviewPending" class="skeleton-image"></div>
                <video v-else-if="isVideo(sceneDetail.video_url)" :src="cleanUrl(sceneDetail.video_url)"
                  :poster="cleanUrl(sceneDetail.reference_image_url || '')" preload="metadata" class="scene-image"
                  playsinline muted loop controls></video>
                <img v-else-if="shouldRenderImage(sceneDetail.reference_image_url) && !previewImgErrored"
                  :src="cleanUrl(sceneDetail.reference_image_url)" alt="分镜图片" class="scene-image" decoding="async"
                  fetchpriority="high" />
              </div>

              <!-- 底部操作按钮 -->
              <div class="bottom-actions">
                <button class="bottom-btn download-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" />
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" />
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  下载
                </button>
                <button class="bottom-btn apply-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" />
                  </svg>
                  应用
                </button>
                <button v-if="!isVideo(currentPreviewUrl)" class="bottom-btn regenerate-btn"
                  @click="handleRegenerateActiveScene">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" />
                  </svg>
                  重新生成
                </button>
              </div>
            </div>

            <!-- 固定的输入框区域 -->
            <div class="input-section">
              <div class="input-container">
                <textarea v-model="sceneInput" class="scene-input" placeholder="输入你想要对当前画面修改的内容"></textarea>
                <div class="input-actions">
                  <button class="input-action-btn send-btn">
                    ↑
                  </button>
                </div>
              </div>
              <div class="input-footer">
                <!-- <button class="convert-video-btn" @click="convertToVideo"
                  :disabled="entryMode === 'crop' || isVideo(currentPreviewUrl) || previewImgErrored">
                  <span>转视频</span>
                </button> -->
                <div class="input-footer-right">
                  <span class="input-hint">消耗</span>
                  <span class="input-count">1</span>
                  <button class="input-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2" />
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
                  <textarea v-model="voiceScript" class="voice-script-input"
                    placeholder="很久很久以前，玉皇大帝要举十二位守护神。"></textarea>
                  <div class="voice-script-controls">
                    <button class="voice-control-btn play-btn" @click="togglePlay">
                      <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polygon points="5,3 19,12 5,21" fill="currentColor" />
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                        <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                      </svg>
                      {{ isPlaying ? '停止' : '试听' }}
                    </button>
                    <button class="voice-control-btn stop-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
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
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor"
                            stroke-width="2" />
                          <path d="M12 14c-3.87 0-7 3.13-7 7h14c0-3.87-3.13-7-7-7z" stroke="currentColor"
                            stroke-width="2" />
                        </svg>
                        专业主播
                      </button>
                      <button class="voice-refresh-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" />
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
                          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
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
                      <input type="range" v-model="voiceVolume" min="0" max="200" class="volume-slider" />
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
                      <input type="range" v-model="voiceSpeed" min="50" max="200" class="speed-slider" />
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
        </template>
      </div>

      <!-- 右侧区域 -->
      <div class="right-panel">
        <!-- 画布编辑和对口型 -->
        <div class="edit-controls">
          <button v-if="isVideo(currentPreviewUrl)" class="control-btn active" @click="toggleCanvasEditMode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
            </svg>
            裁剪分镜
          </button>
          <button class="control-btn" @click="toggleLipSyncView">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" />
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" stroke-width="2" />
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" stroke-width="2" />
            </svg>
            对口型
          </button>
        </div>

        <!-- 视频画面 -->
          <div class="video-preview">
          <div class="video-container" ref="videoContainer">
            <div v-if="isConverting || isPreviewPending" class="skeleton-image"></div>
            <template v-else>
              <video v-if="isVideo(sceneDetail.video_url)" ref="previewVideo" :src="cleanUrl(sceneDetail.video_url)"
                :poster="cleanUrl(sceneDetail.reference_image_url || '')" preload="metadata" playsinline muted loop
                class="video-image"></video>
              <img v-else-if="shouldRenderImage(sceneDetail.reference_image_url) && !isPreviewPending" :src="cleanUrl(sceneDetail.reference_image_url)"
                :alt="scenes[activeSceneIndex] ? scenes[activeSceneIndex].title : '预览'" class="video-image"
                decoding="async" fetchpriority="high" @error="onPreviewImgError" />
              <div v-if="!isVideo(sceneDetail.video_url) && previewImgErrored" class="video-overlay">
                <div class="error-banner">小梦刚刚打了个盹，快来试试重新生成吧~</div>
              </div>
            </template>
          </div>
          <div class="preview-aside">
            <template v-if="isConverting || isPreviewPending">
              <div class="thumb-card">
                <div class="skeleton-image"></div>
              </div>
              <div class="thumb-card">
                <div class="skeleton-image"></div>
              </div>
            </template>
            <template v-else>
              <div v-if="isVideo(sceneDetail.video_url) && !isPreviewPending" class="thumb-card">
                <div class="thumb-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                      stroke-width="2" />
                  </svg>
                  <span>视频</span>
                </div>
                <video :src="cleanUrl(sceneDetail.video_url)" :poster="cleanUrl(sceneDetail.reference_image_url || '')"
                  class="thumb-image" muted loop playsinline preload="none" disablepictureinpicture></video>
              </div>
              <div v-if="shouldRenderImage(sceneDetail.reference_image_url) && !previewImgErrored && !isPreviewPending" class="thumb-card">
                <div class="thumb-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <span>图片</span>
                </div>
                <img :src="cleanUrl(sceneDetail.reference_image_url)" alt="图片" class="thumb-image" loading="lazy"
                  decoding="async" fetchpriority="low" />
              </div>
            </template>
          </div>
        </div>

        <!-- 播放控制和时间轴 -->
        <div class="playback-section">
          <!-- 播放控制 -->
          <div class="playback-controls">
            <!-- 播放按钮放在时长左侧 -->
            <button class="play-btn-circle" @click="togglePlay" title="播放/暂停">
              <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
            </button>
            <div class="time-display">
              <span class="current-time">{{ currentTimeText }}</span>
              <span class="separator">/</span>
              <span class="total-time">{{ totalTimeText }}</span>
            </div>
            <button class="expand-btn" @click="toggleFullscreen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" />
                <polyline points="9,21 3,21 3,15" stroke="currentColor" stroke-width="2" />
                <line x1="21" y1="3" x2="14" y2="10" stroke="currentColor" stroke-width="2" />
                <line x1="3" y1="21" x2="10" y2="14" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
          </div>

          <!-- 时间轴区域 -->
          <div class="timeline-section" ref="timelineSection">
            <template v-if="isConverting">
              <div class="timeline-header">
                <span class="timeline-label">
                  <div class="skeleton-line" style="width:80px;height:12px;"></div>
                </span>
                <label class="switch">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="time-scale">
                <div class="time-scale-inner" ref="timeScaleInner">
                  <div class="skeleton-line" style="height:12px;"></div>
                </div>
              </div>
              <div class="timeline-tracks" ref="timelineTracks">
                <div v-for="n in 3" :key="'skel-track-' + n" class="timeline-track">
                  <div class="track-header">
                    <div class="skeleton-line" style="width:120px;height:12px;"></div>
                  </div>
                  <div class="track-clips">
                    <div v-for="m in 10" :key="'skel-clip-' + n + '-' + m" class="scene-clip">
                      <div class="skeleton-image" style="height:28px;"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="playback-indicator" :style="{ left: playbackLeftPx + 'px' }"></div>
            </template>
            <template v-else>

              <!-- 时间刻度 -->
              <div class="time-scale">
                <div class="time-scale-inner" ref="timeScaleInner">
                  <div class="time-marker" v-for="time in timeMarkers" :key="time">
                    <span class="time-text">{{ time }}</span>
                  </div>
                </div>
              </div>
              <!-- 分镜轨道 - 水平布局 -->
              <div class="timeline-tracks" ref="timelineTracks">
                <div class="tracks-row scenes-row">
                  <div v-for="(scene, index) in scenes" :key="scene.id" class="timeline-track" :data-index="index"
                    :class="{ active: index === activeSceneIndex }" draggable="true" :style="getTrackStyle(scene)"
                    @dragstart="handleDragStart(index, $event)" @dragover="handleDragOver($event)"
                    @drop="handleDrop(index, $event)" @dragend="handleDragEnd">
                  <div class="track-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span class="track-title">分镜{{ (Number(scene.order_index) > 0 ? Number(scene.order_index) : '') }}</span>
                    <!-- 操作按钮 -->
                    <div class="track-actions">
                      <button class="action-btn copy-btn" @click="copyScene(index)" title="复制分镜">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor"
                            stroke-width="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor"
                            stroke-width="2" />
                        </svg>
                      </button>
                      <!-- <button class="action-btn delete-btn" @click="deleteScene(index)" title="删除分镜"
                        v-if="scenes.length > 1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" />
                          <path d="M19,6v14a2,2 0,0,1-2,2H7a2,2 0,0,1-2-2V6m3,0V4a2,2 0,0,1,2-2h4a2,2 0,0,1,2,2v2"
                            stroke="currentColor" stroke-width="2" />
                        </svg>
                      </button> -->
                    </div>
                  </div>
                  <div class="track-clips" @click="selectScene(index)">
                    <template v-if="isSceneUpdating(scene, index)">
                      <div v-for="m in 10" :key="'up-skel-' + index + '-' + m" class="scene-clip">
                        <div class="skeleton-image" style="height:28px;"></div>
                      </div>
                    </template>
                    <template v-else-if="isVideoPendingScene(scene, index)">
                      <div v-for="m in 10" :key="'gen-skel-' + index + '-' + m" class="scene-clip">
                        <div class="skeleton-image" style="height:28px;"></div>
                      </div>
                    </template>
                    <template v-else-if="index === activeSceneIndex && isPreviewPending">
                      <div v-for="m in 10" :key="'prev-skel-' + index + '-' + m" class="scene-clip">
                        <div class="skeleton-image" style="height:28px;"></div>
                      </div>
                    </template>
                    <template v-else>
                      <div v-for="(clip, cidx) in getSceneClips(scene)" :key="cidx" class="scene-clip"
                        :class="{ active: index === activeSceneIndex }" :style="getClipStyle(scene, clip)">
                        <video v-if="scene.hasVideo || isVideo(clip.url || scene.video_url || scene.thumbnail)" :src="cleanUrl(clip.url || scene.video_url || scene.thumbnail)"
                          :poster="cleanUrl(scene.thumbnail || '')" class="clip-thumbnail" muted loop playsinline
                          :preload="index < 4 ? 'metadata' : 'none'" disablepictureinpicture></video>
                        <img v-else-if="shouldRenderImage(clip.url || scene.thumbnail) && !isClipImgErrored(index, cidx)"
                          :src="cleanUrl(clip.url || scene.thumbnail)"
                          :alt="'分镜' + (Number(scene.order_index) > 0 ? Number(scene.order_index) : '')" class="clip-thumbnail" loading="lazy" decoding="async"
                          fetchpriority="low" @error="onClipImgError(index, cidx)" />
                        <div v-else class="clip-placeholder"></div>
                      </div>
                      <div v-if="getSceneClips(scene).length === 0" class="scene-clip clip-empty"></div>
                    </template>
                  </div>
                  <div class="track-audio">
                    <button v-if="index === activeSceneIndex" class="audio-btn add-audio">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" />
                        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" />
                      </svg>
                      添加配音
                    </button>
                    <template v-else>
                      <button class="audio-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                            stroke-width="2" />
                        </svg>
                        配音
                      </button>
                    </template>
                  </div>
                  </div>
                  <div v-for="n in pendingSkeletonCount" :key="'pending-skel-' + n" class="timeline-track">
                    <div class="track-header">
                      <div class="skeleton-line" style="width:120px;height:12px;"></div>
                    </div>
                    <div class="track-clips">
                      <div v-for="m in 10" :key="'pending-skel-clip-' + n + '-' + m" class="scene-clip">
                        <div class="skeleton-image" style="height:28px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tracks-row bgm-row">
                  <button class="audio-btn bgm-button" :style="getBgmTrackStyle()">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                        stroke-width="2" />
                    </svg>
                    背景音乐
                  </button>
                </div>
              </div>
              <!-- 播放进度指示器 -->
              <div class="playback-indicator" :style="{ left: playbackLeftPx + 'px' }" @mousedown="onPointerDown"></div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isCanvasEditMode" class="canvas-edit-overlay">
      <CanvasEditView @close="toggleCanvasEditMode" />
    </div>

    <CropStoryboardModal :visible="showCropModal"
      :videoUrl="cleanUrl(sceneDetail.video_url || scenes[activeSceneIndex]?.clips?.[0]?.url || '')"
      :imageUrl="cleanUrl(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail || '')"
      :durationMs="(scenes[activeSceneIndex] && scenes[activeSceneIndex].clips && scenes[activeSceneIndex].clips[0] && Number(scenes[activeSceneIndex].clips[0].durationMs)) || 5000"
      @close="closeCropModal" @apply="applyCropSelection" />

    <!-- 对口型页面覆盖层 -->
    <div v-if="showLipSyncView" class="lip-sync-overlay">
      <LipSyncView @close="toggleLipSyncView" />
    </div>
  </div>

  <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>

  <div v-if="successModalVisible" class="success-modal-overlay" @click="closeSuccessModal">
    <div class="success-modal" @click.stop>
      <div class="success-title">任务创建成功</div>
      <button class="success-close-btn" @click="closeSuccessModal">确定</button>
    </div>
  </div>
</template>

<script>
import LipSyncView from '@/views/LipSyncView.vue'
import CanvasEditView from '@/views/CanvasEditView.vue'
import CropStoryboardModal from '@/components/CropStoryboardModal.vue'
import { getScriptDetailByVideo, generateStoryboardVideo, queryStoryboardVideoStatus, regenerateImage, queryRegenerateImage, getStoryboardSceneDetail, storyboardPictureGenStream, copyStoryboardVideo, reorderStoryboardScenes, getStoryboardImagesDetail, clipStoryboardVideo } from '@/api'
import { useUserStore } from '@/stores/user'
import { cleanUrl as cleanUrlUtil, isGenerateFailed as isGenerateFailedUtil, shouldRenderImage as shouldRenderImageUtil, getLocalMediaUrl as getLocalMediaUrlUtil } from '@/utils/media'

export default {
  name: 'VideoEditView',
  components: {
    LipSyncView,
    CanvasEditView,
    CropStoryboardModal
  },
  data() {
    return {
      projectTitle: '',
      activeTab: 'image',
      sceneInput: '',
      subtitleEnabled: true,
      activeSceneIndex: 0,
      playbackPosition: 0, // 播放进度百分比
      playbackLeftPx: 0,
      isDraggingPointer: false,
      timeMarkers: [],
      scenes: [],
      draggedIndex: null,
      entryMode: 'canvas',
      showCropModal: false,
      updatingKeySet: new Set(),
      // 配音相关数据
      voiceScript: '',
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
      originalPromptContent: '',
      // 画布编辑模式
      isCanvasEditMode: false,
      // 对口型页面显示状态
      showLipSyncView: false,
      successModalVisible: false,
      isConverting: false,
      sceneDetail: { reference_image_url: '', video_url: '' },
      toastVisible: false,
      toastText: '',
      previewImgErrored: false,
      clipImgErrorMap: {},
      isVideoGenerating: false,
      pendingVideoSet: new Set()
      , videoQueue: [],
      videoProcessing: false
    }
  },
  beforeUnmount() {
    if (this._storyboardQueryInterval) {
      clearInterval(this._storyboardQueryInterval)
      this._storyboardQueryInterval = null
    }
    if (this._io) {
      try { this._io.disconnect() } catch (e) { void 0 }
      this._io = null
    }
    if (this._timelineTracksEl && this._timelineScrollHandler) {
      try { this._timelineTracksEl.removeEventListener('scroll', this._timelineScrollHandler) } catch (e) { void 0 }
      this._timelineTracksEl = null
      this._timelineScrollHandler = null
    }
    try { if (this._ssePicCtrl && this._ssePicCtrl.abort) this._ssePicCtrl.abort() } catch (e) { void 0 }
  },
  mounted() {
    const projectId = this.$route.params.id
    let initialLoading = false
    try { initialLoading = localStorage.getItem(`video-edit:loading:${projectId}`) === '1' } catch (e) { initialLoading = false }
    if (initialLoading) this.isConverting = true
    try {
      const mode = localStorage.getItem(`video-edit:entryMode:${projectId}`)
      if (mode === 'crop' || mode === 'canvas') this.entryMode = mode
    } catch (e) { console.warn('读取入口模式失败:', e) }
    try {
      const scenesStr = localStorage.getItem(`video-edit:scenes:${projectId}`)
      if (scenesStr) {
        const parsed = JSON.parse(scenesStr)
        if (Array.isArray(parsed) && parsed.length) {
          this.scenes = parsed
          try {
            for (let i = 0; i < this.scenes.length; i++) {
              const sc = this.scenes[i] || {}
              const thumb = this.cleanUrl(sc.thumbnail || '')
              if (/^blob:/i.test(thumb)) sc.thumbnail = ''
              if (Array.isArray(sc.clips) && sc.clips.length) {
                const u = this.cleanUrl(sc.clips[0].url || '')
                if (/^blob:/i.test(u)) sc.clips[0].url = this.cleanUrl(sc.thumbnail || '')
              }
            }
          } catch (e) { void 0 }
          this.activeSceneIndex = 0
          this.updateTimeMarkers()
          this.sortScenesByServerOrder()
        }
      }
      // 解析原始分镜，生成包含clips的场景数据
      const rawStr = localStorage.getItem(`project:storyboard_raw:${projectId}`)
      if (rawStr) {
        const raw = JSON.parse(rawStr)
        const scenesFromRaw = this.parseStoryboardRawToScenes(raw)
        if (Array.isArray(scenesFromRaw) && scenesFromRaw.length) {
          this.scenes = scenesFromRaw
          this.activeSceneIndex = 0
          this.updateTimeMarkers()
          this.sortScenesByServerOrder()
        }
      }
      const title = localStorage.getItem(`project:prompt:${projectId}`)
      if (title) this.projectTitle = title
      const shouldGen = localStorage.getItem(`video-edit:generateStoryboard:${projectId}`) === '1'
      const shouldView = localStorage.getItem(`video-edit:viewStoryboard:${projectId}`) === '1'
      this._entryIsGenerate = !!shouldGen
      if (shouldGen) {
        this.isConverting = true
        this.toastText = '分镜图片开始生成，首图预计两分钟后显示，全流程生成预计8~10分钟，请耐心等待'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 6000)
        this.startStoryboardSSE()
        try { localStorage.removeItem(`video-edit:generateStoryboard:${projectId}`) } catch (e) { void 0 }
      }
      if (shouldView) {
        this.isConverting = true
      }
    } catch (e) {
      console.warn('读取分镜场景或标题失败:', e)
    }
    // 预计算 shot 顺序（用于接口返回的 scene_number 映射到轨道分镜）
    try {
      const projectId = this.$route.params.id
      this._shotOrder = this.getShotOrderFromRaw(projectId)
    } catch (e) {
      this._shotOrder = []
    }
    this.loadServerOrderIndex()

    this.$nextTick(() => { this.initTimelineSync() })
    if (initialLoading) {
      setTimeout(() => {
        this.isConverting = false
        try { localStorage.removeItem(`video-edit:loading:${projectId}`) } catch (e) { void 0 }
      }, 800)
    }
    this.fetchCurrentSceneDetail()
    this.prefetchInitialScenesDetails()
    if (!this._entryIsGenerate) this.pollStoryboardImagesDetail()
    this.precacheSceneThumbnails()
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    currentPreviewUrl() {
      const fromApi = this.cleanUrl(this.sceneDetail.video_url || this.sceneDetail.reference_image_url || '')
      return fromApi
    },
    // 动态时间显示：当前播放时间和总时长
    currentTimeText() {
      const totalSeconds = this.getTotalSeconds()
      const currentSeconds = Math.floor((Number(this.playbackPosition) || 0) / 100 * totalSeconds)
      return this.formatTime(currentSeconds)
    },
    totalTimeText() {
      const totalSeconds = Math.floor(this.getTotalSeconds())
      return this.formatTime(totalSeconds)
    },
    // 只有当全部分镜的图片都有有效URL且能渲染时才可转视频
    allImagesReady() {
      if (!Array.isArray(this.scenes) || this.scenes.length === 0) return false
      return this.scenes.every(sc => {
        const url = this.cleanUrl(sc?.thumbnail || '')
        return this.shouldRenderImage(url)
      })
    },
    pendingSkeletonCount() {
      const need = 4
      const len = Array.isArray(this.scenes) ? this.scenes.length : 0
      return Math.max(0, need - len)
    },
    isPreviewPending() {
      const idx = this.activeSceneIndex
      const scene = Array.isArray(this.scenes) ? this.scenes[idx] : null
      const set = this.pendingVideoSet instanceof Set ? this.pendingVideoSet : null
      if (!scene) return false
      const k = this.getSceneKey(scene, idx)
      const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const existingVid = this.cleanUrl((scene && scene.video_url) || (first && first.url) || '')
      const processedVideo = !!(scene && scene.hasVideo) || (!!existingVid && this.isVideo(existingVid))
      const hasImg = this.shouldRenderImage(this.cleanUrl(scene.thumbnail || ''))
        || this.shouldRenderImage(this.cleanUrl(this.sceneDetail.reference_image_url || ''))
      if (processedVideo || hasImg) {
        if (processedVideo && set) { try { set.delete(k) } catch (e) { void 0 } }
        return false
      }
      if (!set) return false
      return set.has(k)
    }
  },
  watch: {
    activeSceneIndex() {
      this.previewImgErrored = false
      this.fetchCurrentSceneDetail()
    },
    'sceneDetail.reference_image_url'(val) {
      this.previewImgErrored = false
    },
    isConverting(val) {
      if (!val) this.$nextTick(() => { this.initTimelineSync() })
    },
    scenes: {
      deep: true,
      handler() {
        this.refreshSidebarFromLocal()
        this.$nextTick(() => {
          const tracks = this.$refs.timelineTracks
          if (tracks && this._io) {
            tracks.querySelectorAll('.timeline-track').forEach(el => this._io.observe(el))
          } else {
            this.initTimelineSync()
          }
        })
      }
    }
  },
  methods: {
    initTimelineSync() {
      const tracks = this.$refs.timelineTracks
      const scaleInner = this.$refs.timeScaleInner
      if (!tracks || !scaleInner) return
      if (this._timelineTracksEl && this._timelineScrollHandler) {
        try { this._timelineTracksEl.removeEventListener('scroll', this._timelineScrollHandler) } catch (e) { void 0 }
      }
      const sync = () => {
        scaleInner.style.transform = `translateX(${-tracks.scrollLeft}px)`
        const pxPerSecond = this.getPxPerSecond()
        const totalSeconds = this.getTotalSeconds()
        const elapsedSec = (this.playbackPosition / 100) * totalSeconds
        const absolutePx = elapsedSec * pxPerSecond
        this.playbackLeftPx = tracks.offsetLeft + absolutePx - tracks.scrollLeft
      }
      this._timelineTracksEl = tracks
      this._timelineScrollHandler = sync
      tracks.addEventListener('scroll', sync)
      sync()
      this._prefetchedSceneIndices = new Set()
      try {
        if (this._io) { try { this._io.disconnect() } catch (e) { void 0 } }
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry && entry.isIntersecting) {
              const el = entry.target
              const idx = Number(el.getAttribute('data-index'))
              if (Number.isFinite(idx) && idx >= 4 && !(this._prefetchedSceneIndices && this._prefetchedSceneIndices.has(idx))) {
                this._prefetchedSceneIndices && this._prefetchedSceneIndices.add(idx)
                this.prefetchSceneDetailByIndex(idx)
                io.unobserve(el)
              }
            }
          })
        }, { root: this.$refs.timelineTracks, threshold: 0.25 })
        this._io = io
        tracks.querySelectorAll('.timeline-track').forEach(el => io.observe(el))
      } catch (err) { void 0 }
    },
    parseIncrementalResultToScenes(result) {
      const scenes = []
      try {
        if (!result || typeof result !== 'object') return scenes
        if (result.shots && typeof result.shots === 'object') {
          let id = (Array.isArray(this.scenes) ? this.scenes.length : 0) + 1
          const v = result.shots || {}
          const rawThumb = v.scene_picture || v.scene_picture_url || v.Scene_picture_url || ''
          const thumb = this.cleanUrl(rawThumb)
          if (thumb) {
            const descParts = []
            if (v.shot_title) descParts.push(v.shot_title)
            if (v.visual_description) descParts.push(v.visual_description)
            const description = descParts.length ? descParts.join('：') : '暂无描述'
            const sceneNumber = String(v.shot_id || v.shot_number || '').trim()
            const oi = Number(v.order_index || v.orderIndex || result.order_index || result.orderIndex)
            const title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : String(result.scene_title || sceneNumber || '分镜')
            scenes.push({ id: id++, title, description, thumbnail: thumb, scene_number: sceneNumber, order_index: Number.isFinite(oi) ? oi : undefined })
          }
          return scenes
        }
        const shotKeys = Object.keys(result).filter(k => /^shot_/i.test(k))
        if (shotKeys.length) {
          let id = (Array.isArray(this.scenes) ? this.scenes.length : 0) + 1
          for (const k of shotKeys.sort((a, b) => {
            const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
            const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
            return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
          })) {
            const v = result[k] || {}
            const rawThumb = v.scene_picture || v.scene_picture_url || v.Scene_picture_url || result.Scene_picture_url || result.scene_picture_url || ''
            const thumb = this.cleanUrl(rawThumb)
            if (!thumb) continue
            const descParts = []
            if (v.shot_title) descParts.push(v.shot_title)
            if (v.visual_description) descParts.push(v.visual_description)
            const description = descParts.length ? descParts.join('：') : '暂无描述'
            const oi = Number(v.order_index || v.orderIndex || result.order_index || result.orderIndex)
            const title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : String(result.scene_title || `分镜${id}`)
            scenes.push({ id: id++, title, description, thumbnail: thumb, scene_number: k, order_index: Number.isFinite(oi) ? oi : undefined })
          }
          return scenes
        }
        const rawThumb = result.scene_picture || result.scene_picture_url || result.Scene_picture_url || ''
        const thumb = this.cleanUrl(rawThumb)
        if (!thumb) return scenes
        const descParts = []
        if (result.shot_title) descParts.push(result.shot_title)
        if (result.visual_description) descParts.push(result.visual_description)
        const description = descParts.length ? descParts.join('：') : '暂无描述'
        const sceneNumber = String(result.scene_number || result.shot_id || result.scene_id || '').trim()
        const oi = Number(result.order_index || result.orderIndex)
        const title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : String(result.scene_title || sceneNumber || '分镜')
        scenes.push({ id: (Array.isArray(this.scenes) ? this.scenes.length : 0) + 1, title, description, thumbnail: thumb, scene_number: sceneNumber, order_index: Number.isFinite(oi) ? oi : undefined })
      } catch (e) { void 0 }
      return scenes
    },
    async startStoryboardSSE() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { void 0 }
          this.isConverting = false
          return
        }
        this._ssePicCtrl = new AbortController()
        await storyboardPictureGenStream({
          videoId,
          aspectRatio: localStorage.getItem(`project:aspectRatio:${projectId}`) || '16:9',
          token,
          signal: this._ssePicCtrl.signal,
          onEvent: (obj) => {
            if (!obj || obj.type === 'connected') return
            const finished = (obj && obj.status && String(obj.status).toLowerCase() === 'workflow_finished')
              || (obj && obj.data && obj.data.status && String(obj.data.status).toLowerCase() === 'workflow_finished')
              || (obj && obj.message && obj.message.status && String(obj.message.status).toLowerCase() === 'workflow_finished')
            if (finished) {
              this.isConverting = false
              try { this._ssePicCtrl && this._ssePicCtrl.abort() } catch (e) { void 0 }
              return
            }
            if (obj.Storyboard_picture) {
              let prevRaw = null
              try { prevRaw = JSON.parse(localStorage.getItem(`project:storyboard_raw:${projectId}`) || 'null') } catch (e) { prevRaw = null }
              const incoming = obj.Storyboard_picture
              let mergedRaw = incoming
              if (prevRaw && typeof prevRaw === 'object' && !Array.isArray(prevRaw) && typeof incoming === 'object' && !Array.isArray(incoming)) {
                mergedRaw = Object.assign({}, prevRaw, incoming)
              } else if (Array.isArray(prevRaw) && Array.isArray(incoming)) {
                const seen = new Set()
                const arr = []
                for (const item of prevRaw) {
                  const key = String(item.scene_id || item.scene_title || '')
                  if (!seen.has(key)) { arr.push(item); seen.add(key) }
                }
                for (const item of incoming) {
                  const key = String(item.scene_id || item.scene_title || '')
                  if (!seen.has(key)) { arr.push(item); seen.add(key) }
                }
                mergedRaw = arr
              }
              try { localStorage.setItem(`project:storyboard_raw:${projectId}`, JSON.stringify(mergedRaw)) } catch (e) { void 0 }
              const incScenes = this.parseStoryboardRawToScenes(incoming)
              let added = 0
              if (Array.isArray(incScenes) && incScenes.length) {
                for (const sc of incScenes) {
                  const key = String(sc.scene_number || '').trim()
                  let exists = false
                  for (let i = 0; i < this.scenes.length; i++) {
                    const t = this.scenes[i]
                    if (key && String(t.scene_number || '').trim() === key) { exists = true; break }
                    if (!key && t.thumbnail && sc.thumbnail && t.thumbnail === sc.thumbnail) { exists = true; break }
                  }
                  if (!exists) { this.scenes.push(sc); added++ }
                }
              }
              if (added > 0) {
                if (this.activeSceneIndex < 0 || this.activeSceneIndex >= this.scenes.length) this.activeSceneIndex = 0
                this._shotOrder = this.getShotOrderFromRaw(projectId)
                this.sortScenesByServerOrder()
                this.updateTimeMarkers()
                try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
                if (this.isConverting) this.isConverting = false
                this.prefetchInitialScenesDetails()
              }
            } else if (obj.result) {
              const incScenes = this.parseIncrementalResultToScenes(obj.result)
              let added = 0
              if (Array.isArray(incScenes) && incScenes.length) {
                for (const sc of incScenes) {
                  const key = String(sc.scene_number || '').trim()
                  let exists = false
                  for (let i = 0; i < this.scenes.length; i++) {
                    const t = this.scenes[i]
                    if (key && String(t.scene_number || '').trim() === key) { exists = true; break }
                    if (!key && t.thumbnail && sc.thumbnail && t.thumbnail === sc.thumbnail) { exists = true; break }
                  }
                  if (!exists) { this.scenes.push(sc); added++ }
                }
              }
              if (added > 0) {
                if (this.activeSceneIndex < 0 || this.activeSceneIndex >= this.scenes.length) this.activeSceneIndex = 0
                this.sortScenesByServerOrder()
                this.updateTimeMarkers()
                try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
                if (this.isConverting) this.isConverting = false
              }
            }
          }
        })
      } catch (e) {
        this.isConverting = false
      }
    },
    // 代理到通用工具，统一图片 URL 处理和失败判断
    cleanUrl(u) {
      return cleanUrlUtil(u)
    },
    isVideo(u) {
      const s = this.cleanUrl(u)
      if (!s) return false
      if (this.entryMode === 'crop') return true
      if (/\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(s)) return false
      if (/^data:image\//i.test(s)) return false
      if (/^data:video\//i.test(s)) return true
      if (/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(s)) return true
      const vcur = this.cleanUrl((this.sceneDetail && this.sceneDetail.video_url) || '')
      if (vcur && s === vcur) return true
      const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const activeVid = this.cleanUrl((active && active.video_url) || '')
      if (active && active.hasVideo && activeVid && s === activeVid) return true
      if (active && active.hasVideo && Array.isArray(active.clips)) {
        const found = active.clips.some(c => this.cleanUrl((c && c.url) || '') === s)
        if (found) return true
      }
      if (/^blob:/i.test(s)) {
        try {
          const isFromVideoScene = Array.isArray(this.scenes) && this.scenes.some(sc => {
            const vUrl = this.cleanUrl((sc && sc.video_url) || '')
            const clips = Array.isArray(sc && sc.clips) ? sc.clips : []
            const clipMatch = clips.some(c => this.cleanUrl((c && c.url) || '') === s)
            return !!(sc && sc.hasVideo && (vUrl === s || clipMatch))
          })
          if (isFromVideoScene) return true
        } catch (e) { void 0 }
      }
      const lower = s.toLowerCase()
      if (lower.includes('type=image') || lower.includes('mediatype=image')) return false
      if (lower.includes('type=video') || lower.includes('mediatype=video')) return true
      return false
    },
    isGenerateFailed(u) {
      return isGenerateFailedUtil(u)
    },
    shouldRenderImage(u) {
      return shouldRenderImageUtil(u)
    },
    getSceneKey(scene, index) {
      const sn = String((scene && scene.scene_number) || '').trim()
      if (sn) return 'sn:' + sn
      const id = String((scene && scene.id) || index)
      return 'id:' + id
    },
    isSceneUpdating(scene, index) {
      const set = this.updatingKeySet instanceof Set ? this.updatingKeySet : null
      if (!set) return false
      const hasVideo = !!(scene && (scene.hasVideo || this.isVideo(this.cleanUrl((scene && Array.isArray(scene.clips) && scene.clips[0] && scene.clips[0].url) || scene.video_url || ''))))
      if (hasVideo) return false
      const k = this.getSceneKey(scene, index)
      return set.has(k)
    },
    isVideoPendingScene(scene, index) {
      if (!this.isVideoGenerating) return false
      const set = this.pendingVideoSet instanceof Set ? this.pendingVideoSet : null
      if (!set) return false
      const k = this.getSceneKey(scene, index)
      return set.has(k)
    },
    async getLocalUrl(u) {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      return await getLocalMediaUrlUtil(videoId, u)
    },
    async toggleFullscreen() {
      try {
        const d = document
        const el = this.$refs.previewVideo || this.$refs.videoContainer
        if (!el) return
        const activeFs = d.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement
        if (activeFs) {
          if (d.exitFullscreen) await d.exitFullscreen()
          else if (d.webkitExitFullscreen) d.webkitExitFullscreen()
          else if (d.msExitFullscreen) d.msExitFullscreen()
        } else {
          if (el.requestFullscreen) await el.requestFullscreen()
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
          else if (el.msRequestFullscreen) el.msRequestFullscreen()
        }
      } catch (e) {
        console.warn('全屏切换失败:', e)
      }
    },
    playVideoSafely(el) {
      try {
        const p = el.play()
        if (p && p.catch) {
          p.catch(err => {
            if (!(err && err.name === 'AbortError')) {
              console.warn('预览播放失败:', err)
            }
          })
        }
      } catch (e) {
        console.warn('预览播放失败:', e)
      }
    },
    syncPreviewPlayback() {
      this.$nextTick(() => {
        const el = this.$refs.previewVideo
        if (!el) return
        if (this.isVideo(this.currentPreviewUrl)) {
          try { el.pause(); el.currentTime = 0 } catch (e) { console.warn('预览暂停失败:', e) }
          const tryPlay = () => this.playVideoSafely(el)
          if (el.readyState >= 2) {
            requestAnimationFrame(tryPlay)
          } else {
            el.addEventListener('loadeddata', () => requestAnimationFrame(tryPlay), { once: true })
          }
        } else {
          try { el.pause(); el.currentTime = 0 } catch (e) { console.warn('预览暂停失败:', e) }
        }
      })
    },
    pausePreview() {
      const el = this.$refs.previewVideo
      if (el) {
        try { el.pause() } catch (e) { console.warn('预览暂停失败:', e) }
      }
    },
    // 估算时长（当接口未提供时使用）
    estimateDurationMs(text) {
      const len = String(text || '').trim().length
      const base = 2000
      const perChar = 50
      const dur = base + len * perChar
      return Math.max(1500, Math.min(10000, dur))
    },
    // 读取每秒对应的像素宽度（与CSS变量保持一致）
    getPxPerSecond() {
      const section = this.$refs.timelineSection
      if (!section) return 48
      const val = getComputedStyle(section).getPropertyValue('--px-per-second') || '48px'
      const num = parseFloat(val)
      return Number.isFinite(num) ? num : 48
    },
    // 将秒格式化为 mm:ss
    formatTime(seconds) {
      const s = Math.max(0, Math.floor(Number(seconds) || 0))
      const mm = String(Math.floor(s / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      return `${mm}:${ss}`
    },
    // 解析原始分镜，生成包含clips的场景结构
    parseStoryboardRawToScenes(raw) {
      const scenes = []
      try {
        if (Array.isArray(raw)) {
          // 形如 [{ scene_id, scene_title, shots: [...] }, ...]
          let id = 1
          raw.forEach((rec) => {
            const shots = Array.isArray(rec.shots) ? rec.shots : []
            shots.forEach(shot => {
              const url = this.cleanUrl(shot.scene_picture || '')
              if (!url) return
              const descParts = []
              if (shot.shot_title) descParts.push(shot.shot_title)
              if (shot.visual_description) descParts.push(shot.visual_description)
              const description = descParts.length ? descParts.join('：') : '暂无描述'
              // 每张图片一个分镜，统一5秒
              const scene_number = shot.scene_number || shot.shot_number || undefined
              const oi = Number(shot.order_index || shot.orderIndex)
              const title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : `分镜${id}`
              scenes.push({ id: id++, title, description, thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number, order_index: Number.isFinite(oi) ? oi : undefined })
            })
          })
        } else if (raw && typeof raw === 'object') {
          // 形如 { scene_1: { shot_1_1: {...}, shot_1_2: {...}, scene_title: ... }, ... }
          const sceneKeys = Object.keys(raw).filter(k => /^scene_/i.test(k)).sort((a, b) => {
            const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
            const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
            return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
          })
          let id = 1
          for (const key of sceneKeys) {
            const s = raw[key] || {}
            let shots = []
            if (Array.isArray(s.shots)) {
              shots = s.shots
            } else {
              const shotKeys = Object.keys(s).filter(k => /^shot_/i.test(k)).sort((a, b) => {
                const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
                const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
                return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
              })
              shots = shotKeys.map(k => {
                const val = s[k] || {}
                return Object.assign({}, val, { scene_number: k })
              }).filter(x => x)
            }
            shots.forEach(shot => {
              const url = this.cleanUrl(shot.scene_picture || '')
              if (!url) return
              const descParts = []
              if (shot.shot_title) descParts.push(shot.shot_title)
              if (shot.visual_description) descParts.push(shot.visual_description)
              const description = descParts.length ? descParts.join('：') : '暂无描述'
              const oi = Number(shot.order_index || shot.orderIndex)
              const title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : `分镜${id}`
              scenes.push({ id: id++, title, description, thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number: shot.scene_number, order_index: Number.isFinite(oi) ? oi : undefined })
            })
          }
        }
      } catch (e) {
        console.warn('解析原始分镜失败:', e)
      }
      return scenes
    },
    // 从原始分镜推导 shot 顺序，用于接口返回的 scene_number 映射
    getShotOrderFromRaw(projectId) {
      const rawStr = localStorage.getItem(`project:storyboard_raw:${projectId}`)
      if (!rawStr) return []
      try {
        const raw = JSON.parse(rawStr)
        const order = []
        if (Array.isArray(raw)) {
          raw.forEach(rec => {
            const shots = Array.isArray(rec.shots) ? rec.shots : []
            shots.forEach(shot => {
              if (shot.scene_number) order.push(String(shot.scene_number))
              else if (shot.shot_number) order.push(String(shot.shot_number))
            })
          })
        } else if (raw && typeof raw === 'object') {
          const sceneKeys = Object.keys(raw).filter(k => /^scene_/i.test(k)).sort((a, b) => {
            const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
            const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
            return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
          })
          for (const key of sceneKeys) {
            const s = raw[key] || {}
            const shotKeys = Object.keys(s).filter(k => /^shot_/i.test(k)).sort((a, b) => {
              const na = parseInt(String(a).replace(/[^0-9]/g, ''), 10)
              const nb = parseInt(String(b).replace(/[^0-9]/g, ''), 10)
              return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb)
            })
            order.push(...shotKeys)
          }
        }
        return order
      } catch (e) {
        return []
      }
    },
    // 将查询结果中的 video_url 替换到轨道 clips 中
    async updateScenesWithQueryItems(items) {
      if (!Array.isArray(items) || !items.length) return
      const shotOrder = Array.isArray(this._shotOrder) ? this._shotOrder : []
      let anySucceeded = false
      for (let it = 0; it < items.length; it++) {
        const item = items[it]
        if (!item || item.status !== 'SUCCEEDED' || !item.video_url) continue
        const sceneKey = String(item.scene_number || '').trim()
        let idx = -1
        if (sceneKey && shotOrder.length) idx = shotOrder.indexOf(sceneKey)
        if (idx < 0) idx = this.scenes.findIndex(sc => !Array.isArray(sc.clips) || !sc.clips.length || !/\.mp4($|\?)/i.test(String(sc.clips[0].url || '')))
        if (idx >= 0 && idx < this.scenes.length) {
          const k = this.getSceneKey(this.scenes[idx] || {}, idx)
          if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
          this.updatingKeySet.add(k)
          const url = this.cleanUrl(item.video_url)
          const oi = Number(item.order_index || item.orderIndex)
          const scene = this.scenes[idx]
          const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
          const existingVid = this.cleanUrl((scene && scene.video_url) || (first && first.url) || '')
          const alreadyProcessed = !!(scene && scene.hasVideo) && (!!existingVid && this.isVideo(existingVid))
          if (alreadyProcessed && existingVid === url) {
            if (Number.isFinite(oi) && oi > 0) {
              scene.order_index = oi
              if (!(this._orderIndexMap instanceof Map)) this._orderIndexMap = new Map()
              if (sceneKey) this._orderIndexMap.set(sceneKey, oi)
            }
            if (this.pendingVideoSet instanceof Set) this.pendingVideoSet.delete(k)
            try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
            anySucceeded = true
          } else {
            if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
            this.pendingVideoSet.add(k)
            this.queueVideoForScene(idx, url, Number.isFinite(oi) ? oi : undefined, sceneKey, k)
            anySucceeded = true
          }
        }
      }
      this.refreshSidebarFromLocal()
      if (anySucceeded) {
        this.isConverting = false
        this.sortScenesByServerOrder()
        this.updateTimeMarkers()
      }
      const pendingEmpty = this.pendingVideoSet instanceof Set ? this.pendingVideoSet.size === 0 : true
      if (pendingEmpty) {
        this.isVideoGenerating = false
      }
    },
    // 返回场景的clips，若无则回退到单一缩略图
    getSceneClips(scene) {
      let baseUrl = ''
      let duration = 0
      const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const clipUrl = this.cleanUrl((first && first.url) || (scene && scene.video_url) || '')
      const hasVideoClip = !!clipUrl && (scene && scene.hasVideo || this.isVideo(clipUrl))
      if (hasVideoClip) {
        baseUrl = clipUrl
        duration = Number(first && first.durationMs) || 5000
      } else {
        const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const activeImage = this.cleanUrl(this.sceneDetail.reference_image_url || '')
        const canUseActiveImage = active && scene === active && this.shouldRenderImage(activeImage)
        if (canUseActiveImage) {
          baseUrl = activeImage
          duration = Number(first && first.durationMs) || 5000
        } else {
          baseUrl = this.cleanUrl((scene && scene.thumbnail) || '')
          duration = 5000
        }
      }
      if (!baseUrl) return []
      const perSecondFrames = 2
      const totalSeconds = Math.max(1, Math.round(duration / 1000))
      const frames = Math.max(1, totalSeconds * perSecondFrames)
      const seg = Math.max(250, Math.round(duration / frames))
      const result = []
      for (let i = 0; i < frames; i++) result.push({ url: baseUrl, durationMs: seg })
      return result
    },
    // 基于时长计算片段在轨的宽度百分比
    getClipStyle(scene, clip) {
      const clips = this.getSceneClips(scene)
      const total = clips.reduce((sum, c) => sum + (Number(c.durationMs) || 5000), 0) || 1
      const widthPct = Math.max(2, Math.round(((Number(clip.durationMs) || 5000) / total) * 100))
      return { width: widthPct + '%', minWidth: '28px' }
    },
    onPreviewImgError() {
      this.previewImgErrored = true
    },
    getClipKey(index, cidx) {
      return String(index) + ':' + String(cidx)
    },
    isClipImgErrored(index, cidx) {
      const k = this.getClipKey(index, cidx)
      return !!this.clipImgErrorMap[k]
    },
    onClipImgError(index, cidx) {
      const k = this.getClipKey(index, cidx)
      this.$set ? this.$set(this.clipImgErrorMap, k, true) : (this.clipImgErrorMap[k] = true)
    },
    sortScenesByOrder() {
      const order = Array.isArray(this._shotOrder) ? this._shotOrder : []
      if (!Array.isArray(this.scenes) || this.scenes.length === 0 || order.length === 0) return
      const sorted = this.scenes.slice().sort((a, b) => {
        const ak = String(a.scene_number || '').trim()
        const bk = String(b.scene_number || '').trim()
        const ai = order.indexOf(ak)
        const bi = order.indexOf(bk)
        if (ai === -1 && bi === -1) {
          const an = parseInt(ak.replace(/[^0-9]/g, ''), 10)
          const bn = parseInt(bk.replace(/[^0-9]/g, ''), 10)
          const av = Number.isFinite(an) ? an : Number.MAX_SAFE_INTEGER
          const bv = Number.isFinite(bn) ? bn : Number.MAX_SAFE_INTEGER
          return av - bv
        }
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
      for (let i = 0; i < sorted.length; i++) {
        const sc = sorted[i]
        const oi = Number(sc.order_index)
        sc.title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : `分镜${i + 1}`
      }
      this.scenes = sorted
      this.clipImgErrorMap = {}
    },
    sortScenesByServerOrder() {
      const byServer = this._orderIndexMap && typeof this._orderIndexMap.size === 'number' && this._orderIndexMap.size > 0
      if (byServer) {
        const arr = Array.isArray(this.scenes) ? this.scenes.slice() : []
        arr.sort((a, b) => {
          const ak = String(a.scene_number || '').trim()
          const bk = String(b.scene_number || '').trim()
          const ai = Number(this._orderIndexMap.get(ak)) || Number(a.order_index) || Number.MAX_SAFE_INTEGER
          const bi = Number(this._orderIndexMap.get(bk)) || Number(b.order_index) || Number.MAX_SAFE_INTEGER
          return ai - bi
        })
        for (let i = 0; i < arr.length; i++) {
          const sc = arr[i]
          const ak = String(sc.scene_number || '').trim()
          const oi = Number(this._orderIndexMap.get(ak)) || Number(sc.order_index)
          sc.title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : `分镜${i + 1}`
        }
        this.scenes = arr
        this.clipImgErrorMap = {}
        return
      }
      const arr = Array.isArray(this.scenes) ? this.scenes.slice() : []
      arr.sort((a, b) => {
        const ai = Number(a.order_index)
        const bi = Number(b.order_index)
        const av = Number.isFinite(ai) && ai > 0 ? ai : Number.MAX_SAFE_INTEGER
        const bv = Number.isFinite(bi) && bi > 0 ? bi : Number.MAX_SAFE_INTEGER
        return av - bv
      })
      for (let i = 0; i < arr.length; i++) {
        const sc = arr[i]
        const oi = Number(sc.order_index)
        sc.title = Number.isFinite(oi) && oi > 0 ? `分镜${oi}` : `分镜${i + 1}`
      }
      this.scenes = arr
      this.clipImgErrorMap = {}
    },
    refreshSidebarFromLocal() {
      const imgApi = this.cleanUrl(this.sceneDetail.reference_image_url || '')
      const vidApi = this.cleanUrl(this.sceneDetail.video_url || '')
      if (imgApi || vidApi) {
        this.sceneDetail = { reference_image_url: imgApi, video_url: vidApi }
        return
      }
      const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const thumb = this.cleanUrl((active && active.thumbnail) || '')
      this.sceneDetail = { reference_image_url: thumb, video_url: '' }
    },
    onPointerDown(e) {
      this.isDraggingPointer = true
      this.isPlaying = false
      this.pausePreview()
      try {
        document.addEventListener('mousemove', this.onDocumentPointerMove)
        document.addEventListener('mouseup', this.onDocumentPointerUp)
      } catch (err) { console.warn('绑定拖动事件失败:', err) }
      this.updatePointerByClientX(e.clientX)
    },
    onDocumentPointerMove(e) {
      if (!this.isDraggingPointer) return
      this.updatePointerByClientX(e.clientX)
    },
    onDocumentPointerUp() {
      this.isDraggingPointer = false
      try {
        document.removeEventListener('mousemove', this.onDocumentPointerMove)
        document.removeEventListener('mouseup', this.onDocumentPointerUp)
      } catch (err) { console.warn('移除拖动事件失败:', err) }
    },
    updatePointerByClientX(clientX) {
      const section = this.$refs.timelineSection
      const tracks = this.$refs.timelineTracks
      if (!section || !tracks) return
      const rect = section.getBoundingClientRect()
      const relX = clientX - rect.left
      const pxPerSecond = this.getPxPerSecond()
      let absolutePx = relX - tracks.offsetLeft + tracks.scrollLeft
      if (!Number.isFinite(absolutePx)) absolutePx = 0
      const totalSeconds = this.getTotalSeconds()
      let elapsedSec = Math.max(0, Math.min(totalSeconds, absolutePx / pxPerSecond))
      this.playbackPosition = totalSeconds > 0 ? (elapsedSec / totalSeconds) * 100 : 0
      this.playbackLeftPx = tracks.offsetLeft + (elapsedSec * pxPerSecond) - tracks.scrollLeft
      let idx = 0
      let acc = 0
      for (let i = 0; i < this.scenes.length; i++) {
        acc += this.getSceneSeconds(this.scenes[i])
        if (elapsedSec < acc) { idx = i; break }
        idx = i
      }
      if (idx !== this.activeSceneIndex) {
        this.activeSceneIndex = idx
      }
    },
    async fetchCurrentSceneDetail() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const scene = this.scenes[this.activeSceneIndex] || {}
      const k = this.getSceneKey(scene, this.activeSceneIndex)
      if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
      this.updatingKeySet.add(k)
      try {
        const sceneNumber = String(scene.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : '') || `shot_${this.activeSceneIndex + 1}`)
        const token = (this.userStore && this.userStore.token) || ''
        const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
        let json
        try { json = JSON.parse(text) } catch { json = null }
        const data = json && json.data ? json.data : null
        if (data) {
          const refImg = this.cleanUrl(data.reference_image_url || scene.thumbnail || '')
          const vurl = this.cleanUrl(data.video_url || '')
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vlocal = ''
          const incomingKey = String(data.scene_number || '').trim()
          const targetIndex = this.activeSceneIndex
          if (targetIndex >= 0 && targetIndex < this.scenes.length) {
            const target = this.scenes[targetIndex]
            if (refImg) target.thumbnail = refImg
            if (vurl) {
              const first = (target && Array.isArray(target.clips) && target.clips[0]) || null
              const existingVid = this.cleanUrl((target && target.video_url) || (first && first.url) || '')
              const alreadyProcessed = !!(target && target.hasVideo) && (!!existingVid && this.isVideo(existingVid))
              if (!(alreadyProcessed && existingVid === vurl)) {
                if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
                this.pendingVideoSet.add(k)
                this.queueVideoForScene(targetIndex, vurl, undefined, incomingKey, k)
              }
            } else if (!this.isVideoGenerating && (!Array.isArray(target.clips) || !target.clips.length)) {
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
            }
            this.clearClipErrorsForIndex(targetIndex)

            const oi = Number(data.order_index || data.orderIndex)
            if (Number.isFinite(oi) && oi > 0) {
              target.order_index = oi
              target.title = `分镜${oi}`
              const map = this._orderIndexMap instanceof Map ? this._orderIndexMap : new Map()
              if (incomingKey) map.set(incomingKey, oi)
              this._orderIndexMap = map
              this.sortScenesByServerOrder()
              this.updateTimeMarkers()
            }
            const content = data && data.prompt && data.prompt.content ? data.prompt.content : null
            if (content) {
              const parts = []
              if (content.shot_title) parts.push(content.shot_title)
              if (content.visual_description) parts.push(content.visual_description)
              const desc = parts.length ? parts.join('：') : ''
              if (desc) target.description = desc
              if (!target.scene_number) target.scene_number = incomingKey || content.shot_id || undefined
            }
          }
          this.sceneDetail = { reference_image_url: refLocal, video_url: this.sceneDetail.video_url }
        } else {
          this.refreshSidebarFromLocal()
        }
      } catch (e) {
        this.refreshSidebarFromLocal()
      } finally {
        try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
      }
    },
    async fetchAllSceneDetails() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const order = Array.isArray(this._shotOrder) ? this._shotOrder : []
        const arr = []
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const sceneNumber = String(sc.scene_number || (order[i] || '')).trim()
          if (!sceneNumber) continue
          try {
            const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
            let json
            try { json = JSON.parse(text) } catch { json = null }
            const data = json && json.data ? json.data : null
            if (data) arr.push(data)
          } catch (e) { void 0 }
        }
        if (!arr.length) return
        const idxMap = new Map()
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i]
          const key = String(item.scene_number || (item.scene_script && item.scene_script.content && item.scene_script.content.shot_id) || '').trim()
          let idx = this.scenes.findIndex(sc => String(sc.scene_number || '').trim() === key)
          if (idx < 0 && order.length) idx = order.indexOf(key)
          if (idx < 0) idx = i < this.scenes.length ? i : -1
          if (idx >= 0 && idx < this.scenes.length) {
            const sc = this.scenes[idx]
            const refImg = this.cleanUrl(item.reference_image_url || sc.thumbnail || '')
            const vurl = this.cleanUrl(item.video_url || '')
            const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
            const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
            if (refImg) sc.thumbnail = refImg
            if (vurl) {
              const dur = this.isVideo(vurl) ? await this.measureVideoDurationMs(vurl) : 5000
              sc.clips = [{ url: vurl, durationMs: dur }]
            } else if (!Array.isArray(sc.clips) || !sc.clips.length) sc.clips = [{ url: refImg, durationMs: 5000 }]
            const oi = Number(item.order_index || item.orderIndex)
            if (Number.isFinite(oi) && oi > 0) {
              sc.order_index = oi
              if (key) idxMap.set(key, oi)
            }
            const content = item && item.scene_script && item.scene_script.content ? item.scene_script.content : null
            if (content) {
              const parts = []
              if (content.shot_title) parts.push(content.shot_title)
              if (content.visual_description) parts.push(content.visual_description)
              const desc = parts.length ? parts.join('：') : ''
              if (desc) sc.description = desc
            }
            if (!sc.scene_number) sc.scene_number = key || undefined
          }
        }
        if (idxMap.size > 0) {
          this._orderIndexMap = idxMap
          this.sortScenesByServerOrder()
          this.updateTimeMarkers()
          try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
        }
        // 同步当前分镜到界面展示
        const active = this.scenes[this.activeSceneIndex] || {}
        const activeKey = String(active.scene_number || '').trim()
        const activeItem = arr.find(x => String(x.scene_number || '').trim() === activeKey) || null
        if (activeItem) {
          const refImg = this.cleanUrl(activeItem.reference_image_url || active.thumbnail || '')
          const vurl = this.cleanUrl(activeItem.video_url || '')
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
          this.sceneDetail = { reference_image_url: refLocal, video_url: vLocal }
        }
      } catch (e) { void 0 }
    },
    async pollStoryboardImagesDetail() {
      const projectId = this.$route.params.id
      const showSkel = localStorage.getItem(`video-edit:viewStoryboard:${projectId}`) === '1'
      try {
        if (showSkel) this.isConverting = true
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const text = await getStoryboardImagesDetail({ videoId, token })
            let resp = null
            try { resp = JSON.parse(text) } catch { resp = null }
            const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
            if (list.length) {
              const order = Array.isArray(this._shotOrder) ? this._shotOrder : []
              const idxMap = new Map()
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                const key = String(item.scene_number || (item.scene_script && item.scene_script.content && item.scene_script.content.shot_id) || '').trim()
                let idx = this.scenes.findIndex(sc => String(sc.scene_number || '').trim() === key)
                if (idx < 0 && order.length) idx = order.indexOf(key)
                if (idx < 0) idx = i < this.scenes.length ? i : -1
                if (idx >= 0 && idx < this.scenes.length) {
                  const k = this.getSceneKey(this.scenes[idx] || {}, idx)
                  if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
                  this.updatingKeySet.add(k)
                  const sc = this.scenes[idx]
                  const refImg = this.cleanUrl(item.reference_image_url || sc.thumbnail || '')
                  const vurl = this.cleanUrl(item.video_url || '')
                  const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
                  const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
                  if (refImg) sc.thumbnail = refImg
                  if (vurl) {
                    const dur = this.isVideo(vurl) ? await this.measureVideoDurationMs(vurl) : 5000
                    sc.clips = [{ url: vurl, durationMs: dur }]
                  } else if (!Array.isArray(sc.clips) || !sc.clips.length) sc.clips = [{ url: refImg, durationMs: 5000 }]
                  const oi = Number(item.order_index || item.orderIndex)
                  if (Number.isFinite(oi) && oi > 0) {
                    sc.order_index = oi
                    sc.title = `分镜${oi}`
                    if (key) idxMap.set(key, oi)
                  }
                  const content = item && item.scene_script && item.scene_script.content ? item.scene_script.content : null
                  if (content) {
                    const parts = []
                    if (content.shot_title) parts.push(content.shot_title)
                    if (content.visual_description) parts.push(content.visual_description)
                    const desc = parts.length ? parts.join('：') : ''
                    if (desc) sc.description = desc
                  }
                  if (!sc.scene_number) sc.scene_number = key || undefined
                  try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
                }
              }
              if (idxMap.size > 0) {
                this._orderIndexMap = idxMap
                this.sortScenesByServerOrder()
                this.updateTimeMarkers()
                try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
              }
              const active = this.scenes[this.activeSceneIndex] || {}
              const activeKey = String(active.scene_number || '').trim()
              const activeItem = list.find(x => String(x.scene_number || '').trim() === activeKey) || null
              if (activeItem) {
                const refImg = this.cleanUrl(activeItem.reference_image_url || active.thumbnail || '')
                const vurl = this.cleanUrl(activeItem.video_url || '')
                const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
                const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
                this.sceneDetail = { reference_image_url: refLocal, video_url: vLocal }
              }
              const needsMore = list.some(x => !this.cleanUrl(x.reference_image_url || ''))
              if (!needsMore) break
            }
          } catch (e) { void 0 }
          if (attempt < 2) await new Promise(r => setTimeout(r, 30000))
        }
      } catch (e) { void 0 } finally {
        this.isConverting = false
        if (showSkel) {
          try { localStorage.removeItem(`video-edit:viewStoryboard:${projectId}`) } catch (e) { void 0 }
        }
      }
    },
    async prefetchInitialScenesDetails() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const count = Math.min(4, Array.isArray(this.scenes) ? this.scenes.length : 0)
        for (let i = 0; i < count; i++) {
          const sc = this.scenes[i] || {}
          const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[i] : '') || `shot_${i + 1}`)
          const k = this.getSceneKey(sc, i)
          if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
          this.updatingKeySet.add(k)
          const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
          let json
          try { json = JSON.parse(text) } catch { json = null }
          const data = json && json.data ? json.data : null
          if (data) {
            const refImg = this.cleanUrl(data.reference_image_url || sc.thumbnail || '')
            const vurl = this.cleanUrl(data.video_url || '')
            const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
            const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
            const incomingKey = String(data.scene_number || '').trim()
            const targetIndex = i
            if (targetIndex >= 0 && targetIndex < this.scenes.length) {
              const target = this.scenes[targetIndex]
            if (refImg) target.thumbnail = refImg
            if (vurl) {
              const first = (target && Array.isArray(target.clips) && target.clips[0]) || null
              const existingVid = this.cleanUrl((target && target.video_url) || (first && first.url) || '')
              const alreadyProcessed = !!(target && target.hasVideo) && (!!existingVid && this.isVideo(existingVid))
              if (!(alreadyProcessed && existingVid === vurl)) {
                if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
                this.pendingVideoSet.add(k)
                this.queueVideoForScene(targetIndex, vurl, undefined, incomingKey, k)
              }
            } else if (!this.isVideoGenerating && (!Array.isArray(target.clips) || !target.clips.length)) {
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
            }
            this.clearClipErrorsForIndex(targetIndex)
              const content = data && data.prompt && data.prompt.content ? data.prompt.content : null
              if (content) {
                const parts = []
                if (content.shot_title) parts.push(content.shot_title)
                if (content.visual_description) parts.push(content.visual_description)
                const desc = parts.length ? parts.join('：') : ''
                if (desc) target.description = desc
                if (!target.scene_number) target.scene_number = incomingKey || content.shot_id || undefined
              }
              if (targetIndex === this.activeSceneIndex) {
                this.sceneDetail = { reference_image_url: refLocal, video_url: this.sceneDetail.video_url }
              }
            }
          }
          try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
        }
        if (!this.sceneDetail.reference_image_url && !this.sceneDetail.video_url) this.refreshSidebarFromLocal()
      } catch (e) { void 0 }
    },
    clearClipErrorsForIndex(i) {
      try {
        const keys = Object.keys(this.clipImgErrorMap || {})
        const prefix = String(i) + ':'
        for (const k of keys) { if (k.indexOf(prefix) === 0) { if (this.$delete) this.$delete(this.clipImgErrorMap, k); else delete this.clipImgErrorMap[k] } }
      } catch (e) { void 0 }
    },
    async precacheSceneThumbnails() {
      try {
        const arr = Array.isArray(this.scenes) ? this.scenes : []
        for (let i = 0; i < arr.length; i++) {
          const sc = arr[i] || {}
          const u = this.cleanUrl(sc.thumbnail || '')
          if (!u) continue
          try { await this.getLocalUrl(u) } catch (e) { void 0 }
        }
      } catch (e) { void 0 }
    },
    async prefetchSceneDetailByIndex(i) {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const sc = this.scenes[i] || {}
        const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[i] : '') || `shot_${i + 1}`)
        const k = this.getSceneKey(sc, i)
        if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
        this.updatingKeySet.add(k)
        const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
        let json
        try { json = JSON.parse(text) } catch { json = null }
        const data = json && json.data ? json.data : null
        if (data) {
          const refImg = this.cleanUrl(data.reference_image_url || sc.thumbnail || '')
          const vurl = this.cleanUrl(data.video_url || '')
          const incomingKey = String(data.scene_number || '').trim()
          const targetIndex = i
          if (targetIndex >= 0 && targetIndex < this.scenes.length) {
            const target = this.scenes[targetIndex]
            if (refImg) target.thumbnail = refImg
            if (vurl) {
              const dur = this.isVideo(vurl) ? await this.measureVideoDurationMs(vurl) : 5000
              const vLocal = await this.getLocalUrl(vurl)
              target.clips = [{ url: vLocal || vurl, durationMs: dur }]
            } else if (!this.isVideoGenerating && (!Array.isArray(target.clips) || !target.clips.length)) {
              const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
            }
            this.clearClipErrorsForIndex(targetIndex)
            const content = data && data.prompt && data.prompt.content ? data.prompt.content : null
            if (content) {
              const parts = []
              if (content.shot_title) parts.push(content.shot_title)
              if (content.visual_description) parts.push(content.visual_description)
              const desc = parts.length ? parts.join('：') : ''
              if (desc) target.description = desc
              if (!target.scene_number) target.scene_number = incomingKey || content.shot_id || undefined
            }
          }
          if (i === this.activeSceneIndex) {
            const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
            const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
            this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: vLocal || vurl || this.sceneDetail.video_url }
          }
        }
        try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
      } catch (e) { void 0 }
    },
    async loadServerOrderIndex() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const order = Array.isArray(this._shotOrder) ? this._shotOrder : []
        const arr = []
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const sceneNumber = String(sc.scene_number || (order[i] || '')).trim()
          if (!sceneNumber) continue
          try {
            const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
            let json
            try { json = JSON.parse(text) } catch { json = null }
            const data = json && json.data ? json.data : null
            if (data) arr.push(data)
          } catch (e) { void 0 }
        }
        if (!arr.length) return
        const map = new Map()
        for (let i = 0; i < arr.length; i++) {
          const it = arr[i]
          const key = String(it.scene_number || (it.scene_script && it.scene_script.content && it.scene_script.content.shot_id) || '').trim()
          const idx = Number(it.order_index || it.orderIndex || i + 1)
          if (key) map.set(key, idx)
        }
        this._orderIndexMap = map
        this.sortScenesByServerOrder()
        this.updateTimeMarkers()
        try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
      } catch (e) { void 0 }
    },
    // 根据分镜数量生成时间刻度（每1秒一个刻度）
    updateTimeMarkers() {
      const totalSeconds = this.getTotalSeconds()
      const markers = []
      for (let s = 0; s <= totalSeconds; s += 5) {
        const mm = String(Math.floor(s / 60)).padStart(2, '0')
        const ss = String(s % 60).padStart(2, '0')
        markers.push(`${mm}:${ss}`)
      }
      this.timeMarkers = markers
    },
    getSceneSeconds(scene) {
      const actual = this.getActualSceneSeconds(scene)
      return Math.max(2, actual)
    },
    getActualSceneSeconds(scene) {
      const c = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const url = this.cleanUrl((c && c.url) || (scene && scene.thumbnail) || '')
      if (url && this.isVideo(url) && c && Number(c.durationMs)) {
        return Math.max(0.5, Number(c.durationMs) / 1000)
      }
      return 5
    },
    getTotalSeconds() {
      let sum = 0
      const arr = Array.isArray(this.scenes) ? this.scenes : []
      for (let i = 0; i < arr.length; i++) {
        sum += this.getSceneSeconds(arr[i])
      }
      return Math.max(0, sum)
    },
    getTrackStyle(scene) {
      const secs = this.getSceneSeconds(scene)
      const w = secs > 0 ? `calc(var(--px-per-second) * ${secs})` : '56px'
      return { flex: `0 0 ${w}`, width: w, minWidth: w }
    },
    getBgmTrackStyle() {
      const secs = this.getTotalSeconds()
      const w = secs > 0 ? `calc(var(--px-per-second) * ${secs})` : '56px'
      return { flex: `0 0 ${w}`, width: w, minWidth: w }
    },
    async measureVideoDurationMs(url) {
      try {
        const el = document.createElement('video')
        el.preload = 'metadata'
        try { el.muted = true } catch (e) { void 0 }
        el.src = this.cleanUrl(url)
        return await new Promise((resolve) => {
          const done = () => {
            const d = Number(el.duration) || 0
            resolve(Math.max(500, Math.round(d * 1000)))
          }
          el.onloadedmetadata = done
          el.onerror = () => resolve(5000)
        })
      } catch (e) { return 5000 }
    },
    queueVideoForScene(index, url, orderIndex, sceneKey, pendingKey) {
      const task = { index, url: this.cleanUrl(url), orderIndex, sceneKey, pendingKey }
      if (!Array.isArray(this.videoQueue)) this.videoQueue = []
      this.videoQueue.push(task)
      this.processVideoQueue()
    },
    async processVideoQueue() {
      if (this.videoProcessing) return
      if (!Array.isArray(this.videoQueue) || this.videoQueue.length === 0) return
      this.videoProcessing = true
      const task = this.videoQueue.shift()
      try {
        const idx = task.index
        const url = task.url
        const vLocal = await this.getLocalUrl(url)
        const dur = this.isVideo(url) ? await this.measureVideoDurationMs(url) : 5000
        if (idx >= 0 && idx < this.scenes.length) {
          const scene = this.scenes[idx]
          scene.clips = [{ url: vLocal || url, durationMs: dur }]
          scene.hasVideo = true
          scene.video_url = vLocal || url
          if (Number.isFinite(task.orderIndex) && task.orderIndex > 0) {
            scene.order_index = task.orderIndex
            if (!(this._orderIndexMap instanceof Map)) this._orderIndexMap = new Map()
            if (task.sceneKey) this._orderIndexMap.set(task.sceneKey, task.orderIndex)
          }
          const k = task.pendingKey || this.getSceneKey(scene, idx)
          if (this.pendingVideoSet instanceof Set) this.pendingVideoSet.delete(k)
          try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
          if (idx === this.activeSceneIndex) {
            const thumb = this.cleanUrl(scene.thumbnail || '')
            this.sceneDetail = { reference_image_url: thumb, video_url: vLocal || url }
            if (this.isPlaying) {
              this.$nextTick(() => {
                const el = this.$refs.previewVideo
                if (el && this.isVideo(this.sceneDetail.video_url)) {
                  this.playVideoSafely(el)
                }
              })
            }
          }
        }
      } catch (e) { void 0 }
      finally {
        this.videoProcessing = false
        const pendingEmpty = this.pendingVideoSet instanceof Set ? this.pendingVideoSet.size === 0 : true
        if (pendingEmpty) this.isVideoGenerating = false
        setTimeout(() => this.processVideoQueue(), 0)
      }
    },
    async handleRegenerateActiveScene() {
      try {
        this.toastText = '正在生成中'
        this.toastVisible = true
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          console.warn('未登录，无法重新生成分镜图片')
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { void 0 }
          this.toastText = '生成失败'
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const type = 'shot_img'
        const currentScene = this.scenes[this.activeSceneIndex] || {}
        // 使用接口返回的 id，如 shot_1_1；若不存在则回退到按索引生成
        const nameRaw = String(currentScene.scene_number || '').trim()
        const name = nameRaw || `shot_${this.activeSceneIndex + 1}`
        const resp = await regenerateImage({ videoId, type, name, token })
        const respMsg = String((resp && (resp.message || resp.msg || resp.meg)) || '').trim()
        const respSensitive = (resp && resp.success === false) || /敏感/i.test(respMsg)
        if (respSensitive) {
          try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { void 0 }
          this.toastText = '生成失败'
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const generateUuid = resp.generate_uuid || (resp.raw && resp.raw.data && resp.raw.data.generateUuid)
        if (!generateUuid) {
          console.warn('未获取到 generateUuid，无法查询结果', resp)
          this.toastText = '生成失败'
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        if (this._regenerateActiveSceneInterval) {
          try { clearInterval(this._regenerateActiveSceneInterval) } catch (e) { void 0 }
          this._regenerateActiveSceneInterval = null
        }
        try {
          const q = await queryRegenerateImage({ videoId, type, name, generateUuid, token })
          const url = (q && q.urls && q.urls[0] && q.urls[0].imageUrl) || (q && q.raw && q.raw.data && q.raw.data.images && q.raw.data.images[0] && q.raw.data.images[0].imageUrl)
          const msgText = String((q && (q.message || q.msg || q.meg)) || '').trim()
          const isSensitive = (q && q.success === false) || /敏感/i.test(msgText)
          if (isSensitive) {
            try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { void 0 }
            this.toastText = '生成失败'
            setTimeout(() => { this.toastVisible = false }, 2000)
            return
          }
          if (msgText) {
            console.warn('重生成分镜图片接口返回错误:', msgText)
            this.toastText = '生成失败'
            setTimeout(() => { this.toastVisible = false }, 2000)
            return
          }
          if (url) {
            const cleaned = this.cleanUrl(url)
            const refLocal = await this.getLocalUrl(cleaned)
            if (this.activeSceneIndex >= 0 && this.activeSceneIndex < this.scenes.length) {
              const scene = this.scenes[this.activeSceneIndex]
              scene.thumbnail = cleaned
              scene.clips = [{ url: refLocal || cleaned, durationMs: 5000 }]
              this.sceneDetail = { reference_image_url: refLocal || cleaned, video_url: this.sceneDetail.video_url }
              this.clearClipErrorsForIndex(this.activeSceneIndex)
            }
            this.toastText = '生成成功'
            setTimeout(() => { this.toastVisible = false }, 2000)
          }
        } catch (e) {
          console.warn('查询重生成分镜图片失败:', e)
          this.toastText = '生成失败'
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      } catch (e) {
        console.warn('重新生成分镜图片失败:', e)
        this.toastText = '生成失败'
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    async goBack() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const token = (this.userStore && this.userStore.token) || ''
      if (token) {
        try {
          const text = await getScriptDetailByVideo({ videoId, token })
          try {
            localStorage.setItem(`project:script_detail_json:${projectId}`, text)
          } catch (e) {
            console.warn('保存剧本详情失败:', e)
          }
        } catch (e) {
          console.error('查询剧本详情失败:', e)
        }
      }
      this.$router.push(`/project/${projectId}`)
    },
    async convertToVideo() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const token = (this.userStore && this.userStore.token) || ''
      const modelName = 'wan2.2-i2v-flash'
      try {
        this.isConverting = true
        this.isVideoGenerating = true
        const set = new Set()
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const hasVid = Array.isArray(sc.clips) && sc.clips.length && this.isVideo(sc.clips[0].url || '')
          if (!hasVid) {
            const k = this.getSceneKey(sc, i)
            set.add(k)
          }
        }
        this.pendingVideoSet = set
        const text = await generateStoryboardVideo({ videoId, modelName, token })
        let result
        try { result = JSON.parse(text) } catch { result = { raw: text } }
        console.log('一键转视频接口返回:', result)
        this.toastText = '第一个视频会在1分钟左右显示，5~7分钟'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 4000)
        // 每30秒轮询一次分镜视频生成状态（localhost）
        if (this._storyboardQueryInterval) clearInterval(this._storyboardQueryInterval)
        this._storyboardQueryInterval = setInterval(async () => {
          try {
            const statusText = await queryStoryboardVideoStatus({ videoId, token })
            let statusJson = null
            try { statusJson = JSON.parse(statusText) } catch (e) { statusJson = null }
            if (statusJson && statusJson.success && Array.isArray(statusJson.items)) {
              const items = statusJson.items
              this.updateScenesWithQueryItems(items)
              const pendingEmpty = this.pendingVideoSet instanceof Set && this.pendingVideoSet.size === 0
              if (pendingEmpty) {
                if (this._storyboardQueryInterval) {
                  try { clearInterval(this._storyboardQueryInterval) } catch (e) { void 0 }
                  this._storyboardQueryInterval = null
                }
                this.isConverting = false
              }
            }
          } catch (e) {
            console.warn('查询分镜视频生成状态失败:', e)
          }
        }, 30000)
      } catch (err) {
        console.error('一键转视频失败:', err)
        this.isConverting = false
      }
    },
    closeSuccessModal() {
      this.successModalVisible = false
    },
    saveTitle() {
      console.log('保存标题:', this.projectTitle)
    },
    selectScene(index) {
      this.activeSceneIndex = index
      const arr = Array.isArray(this.scenes) ? this.scenes : []
      if (arr.length > 0) {
        const pxPerSecond = this.getPxPerSecond()
        const tracks = this.$refs.timelineTracks
        let totalMs = 0
        let startMs = 0
        for (let i = 0; i < arr.length; i++) {
          const ms = Math.round(this.getSceneSeconds(arr[i]) * 1000)
          if (i < index) startMs += ms
          totalMs += ms
        }
        const totalSeconds = Math.max(1, totalMs / 1000)
        const targetSec = Math.max(0, startMs / 1000)
        this.playbackPosition = (targetSec / totalSeconds) * 100
        if (tracks) {
          const absolutePx = targetSec * pxPerSecond
          this.playbackLeftPx = tracks.offsetLeft + absolutePx - tracks.scrollLeft
        }
      }
      if (this.isPlaying) {
        this.$nextTick(() => {
          this.syncPreviewPlayback()
          this.startPlayback()
        })
      }
    },
    togglePlay() {
      if (this.isPlaying) {
        this.pausePlayback()
      } else {
        this.startPlayback()
      }
    },
    // 播放相关方法：按每个分镜自身时长顺序播放
    startPlayback() {
      if (!Array.isArray(this.scenes) || this.scenes.length === 0) return
      this.isPlaying = true
      const durations = this.scenes.map(sc => Math.round(this.getSceneSeconds(sc) * 1000))
      const totalMs = durations.reduce((s, v) => s + v, 0)
      let priorMs = Math.max(0, Math.min(totalMs, (Number(this.playbackPosition) || 0) / 100 * totalMs))
      if (priorMs >= totalMs - 1) {
        priorMs = 0
        this.playbackPosition = 0
        this.activeSceneIndex = 0
      }
      const start = performance.now() - priorMs
      if (this._playbackInterval) clearInterval(this._playbackInterval)
      if (this._rafId) cancelAnimationFrame(this._rafId)
      const el = this.$refs.previewVideo
      if (el && this.isVideo(this.currentPreviewUrl)) {
        this.playVideoSafely(el)
      }
      const tick = (now) => {
        if (!this.isPlaying) return
        const elapsed = now - start
        const clamped = Math.min(elapsed, totalMs)
        this.playbackPosition = totalMs > 0 ? (clamped / totalMs) * 100 : 0
        let acc = 0
        let idx = 0
        for (let i = 0; i < durations.length; i++) {
          const next = acc + durations[i]
          if (clamped < next) { idx = i; break }
          acc = next
          idx = i
        }
        if (idx !== this.activeSceneIndex) {
          this.activeSceneIndex = idx
          this.syncPreviewPlayback()
        }
        const pxPerSecond = this.getPxPerSecond()
        const section = this.$refs.timelineSection
        const tracks = this.$refs.timelineTracks
        if (tracks && section) {
          const elapsedSec = clamped / 1000
          const absolutePx = elapsedSec * pxPerSecond
          this.playbackLeftPx = tracks.offsetLeft + absolutePx - tracks.scrollLeft
        }
        if (clamped >= totalMs) { this.stopPlayback(); return }
        this._rafId = requestAnimationFrame(tick)
      }
      this._rafId = requestAnimationFrame(tick)
    },
    pausePlayback() {
      this.isPlaying = false
      this.pausePreview()
      if (this._playbackInterval) {
        try { clearInterval(this._playbackInterval) } catch (e) { console.warn('清理播放定时器失败:', e) }
        this._playbackInterval = null
      }
      if (this._rafId) {
        try { cancelAnimationFrame(this._rafId) } catch (e) { console.warn('取消动画帧失败:', e) }
        this._rafId = null
      }
    },
    stopPlayback() {
      this.isPlaying = false
      this.pausePreview()
      if (this._playbackInterval) {
        clearInterval(this._playbackInterval)
        this._playbackInterval = null
      }
      if (this._rafId) {
        cancelAnimationFrame(this._rafId)
        this._rafId = null
      }
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
      this.showCropModal = true
    },
    // 对口型页面相关方法
    toggleLipSyncView() {
      this.showLipSyncView = !this.showLipSyncView
      console.log('切换对口型页面显示状态:', this.showLipSyncView)
    },
    closeCropModal() {
      this.showCropModal = false
    },
    async applyCropSelection(sel) {
      let upKey = null
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const scene = this.scenes[this.activeSceneIndex] || {}
        upKey = this.getSceneKey(scene, this.activeSceneIndex)
        if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
        this.updatingKeySet.add(upKey)
        const sceneNumber = String(scene.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const fps = 30
        const start_frame = Math.max(0, Math.round((Number(sel.startMs || 0) / 1000) * fps))
        const end_frame = Math.max(start_frame + 1, Math.round((Number(sel.endMs || 0) / 1000) * fps))
        const resp = await clipStoryboardVideo({ videoId, sceneNumber, start_frame, end_frame, token })
        let obj = null
        try { obj = typeof resp === 'string' ? JSON.parse(resp) : resp } catch (e) { obj = null }
        const data = obj && obj.data ? obj.data : null
        if (obj && obj.code === 0 && data && data.video_url) {
          const remote = this.cleanUrl(data.video_url || '')
          const url = await this.getLocalUrl(remote)
          const durMs = Number(data.duration) ? Math.round(Number(data.duration) * 1000) : Math.max(1, Number(sel.endMs || 0) - Number(sel.startMs || 0)) || 5000
          if (Array.isArray(scene.clips) && scene.clips.length) {
            scene.clips[0] = { url: remote, durationMs: durMs }
          } else {
            scene.clips = [{ url: remote || this.cleanUrl(scene.thumbnail || ''), durationMs: durMs }]
          }
          const thumbLocal = scene.thumbnail ? await this.getLocalUrl(this.cleanUrl(scene.thumbnail || '')) : ''
          this.sceneDetail = { reference_image_url: thumbLocal, video_url: url }
          this.updateTimeMarkers()
          this.toastText = '裁剪成功'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else {
          const msg = (obj && obj.message) ? String(obj.message) : '裁剪失败，请重试'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2500)
        }
      } catch (e) {
        this.toastText = '裁剪失败，请稍后重试'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2500)
      } finally {
        try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(upKey) } catch (e) { void 0 }
      }
    },
    // 拖拽相关方法
    handleDragStart(index, event) {
      this.draggedIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', event.target.outerHTML)
      console.log('开始拖拽分镜:', index)
    },
    handleDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    async handleDrop(targetIndex, event) {
      event.preventDefault()
      if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
        const draggedScene = this.scenes[this.draggedIndex]
        this.scenes.splice(this.draggedIndex, 1)
        this.scenes.splice(targetIndex, 0, draggedScene)

        // 更新活跃场景索引
        if (this.activeSceneIndex === this.draggedIndex) {
          this.activeSceneIndex = targetIndex
        } else if (this.activeSceneIndex === targetIndex) {
          this.activeSceneIndex = this.draggedIndex > targetIndex ? this.activeSceneIndex + 1 : this.activeSceneIndex - 1
        }

        console.log('拖拽完成，从', this.draggedIndex, '移动到', targetIndex)

        try {
          const projectId = this.$route.params.id
          const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
          const token = (this.userStore && this.userStore.token) || ''
          if (token) {
            const orders = this.scenes.map((sc, idx) => ({
              scene_number: String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[idx] : `shot_${idx + 1}`)),
              order_index: idx + 1
            }))
            await reorderStoryboardScenes({ videoId, orders, token })
          }
          const idxMap = new Map()
          for (let i = 0; i < this.scenes.length; i++) {
            const sc = this.scenes[i]
            sc.order_index = i + 1
            const k = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[i] : `shot_${i + 1}`))
            idxMap.set(k, i + 1)
          }
          this._orderIndexMap = idxMap
          this.sortScenesByServerOrder()
          try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
        } catch (e) { void 0 }
      }
    },
    handleDragEnd() {
      this.draggedIndex = null
      console.log('拖拽结束')
    },
    // 复制分镜
    async copyScene(index) {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { void 0 }
          return
        }
        const order_index = index + 1
        const text = await copyStoryboardVideo({ videoId, order_index, token })
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const arr = obj && obj.code === 0 && obj.data && Array.isArray(obj.data.scenes) ? obj.data.scenes : []
        if (!arr.length) return
        const prevScenes = Array.isArray(this.scenes) ? this.scenes.slice() : []
        const mapped = arr.map((it, idx) => {
          const url = this.cleanUrl(it.video_url || '')
          const title = `分镜${Number(it.order_index) || idx + 1}`
          const dur = Number(it.duration) || 5
          let thumb = ''
          const key = String(it.scene_number || '').trim()
          if (key) {
            const prev = prevScenes.find(sc => String(sc.scene_number || '').trim() === key)
            thumb = this.cleanUrl((prev && prev.thumbnail) || '')
          }
          if (!thumb) {
            const byIndex = prevScenes[(Number(it.order_index) || (idx + 1)) - 1]
            thumb = this.cleanUrl((byIndex && byIndex.thumbnail) || '')
          }
          return { id: Date.now() + idx, title, description: '分镜视频', thumbnail: thumb, clips: [{ url, durationMs: dur * 1000 }], scene_number: it.scene_number, order_index: Number(it.order_index) || idx + 1 }
        })
        this.scenes = mapped
        this.updateTimeMarkers()
        try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
      } catch (e) { void 0 }
    },
    // 删除分镜
    deleteScene(index) {
      if (this.scenes.length <= 1) {
        console.log('至少需要保留一个分镜')
        return
      }

      const deletedScene = this.scenes[index]
      this.scenes.splice(index, 1)

      // 调整活跃场景索引
      if (this.activeSceneIndex === index) {
        this.activeSceneIndex = Math.min(this.activeSceneIndex, this.scenes.length - 1)
      } else if (this.activeSceneIndex > index) {
        this.activeSceneIndex--
      }

      console.log('删除分镜:', deletedScene.title)
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
  width: 85px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
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

.project-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  padding: 4px 8px;
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

/* 禁用状态样式 */
.navbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  flex-shrink: 0;
  /* 防止被右侧内容挤压 */
  position: relative;
  /* 为绝对定位的输入框提供定位上下文 */
  height: 100%;
  /* 确保面板占满高度 */
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
  overflow: hidden;
  /* 防止内容溢出 */
}

.scene-scrollable-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 200px;
  /* 增加底部空间，确保底部按钮不被遮挡 */
  overflow-y: auto;
  height: 0;
  /* 强制flex子元素计算高度 */
  min-height: 0;
  /* 允许flex子元素缩小 */
  content-visibility: auto;
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

.convert-video-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
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
  min-width: 0;
  /* 允许内容在容器内收缩，避免挤压左侧 */
  overflow: hidden;
  /* 右侧自身不溢出，内部控件自行滚动 */
  padding: 12px 20px 20px;
}

.edit-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
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
  height: 300px;
  margin-bottom: 20px;
  flex-shrink: 0;
  display: flex;
  gap: 12px;
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
  flex: 1;
  content-visibility: auto;
}

.video-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-aside {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thumb-card {
  position: relative;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: calc(50% - 6px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-label {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.08);
  color: #374151;
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 8px;
}

.thumb-label svg {
  color: #6b7280;
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

.error-banner {
  background: rgba(17, 24, 39, 0.85);
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
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

.current-time,
.total-time {
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

/* 播放按钮（蓝色背景圆形） */
.play-btn-circle {
  width: 32px;
  height: 32px;
  border: none;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  transition: background 0.2s, transform 0.1s;
}

.play-btn-circle:hover {
  background: #2563eb;
}

.play-btn-circle:active {
  transform: scale(0.96);
}

.play-btn-circle svg {
  margin-left: 1px;
}

.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.success-modal {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 260px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.success-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.success-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  cursor: pointer;
}

.floating-toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 0.9);
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 3000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 时间轴区域 */
.timeline-section {
  position: relative;
  /* 每秒对应的像素宽度，用于控制时间轴比例 */
  --px-per-second: 48px;
  /* 分镜卡片之间的水平间距（置零） */
  --timeline-track-gap: 0px;
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

input:checked+.slider {
  background-color: #3b82f6;
}

input:checked+.slider:before {
  transform: translateX(20px);
}

.time-scale {
  position: relative;
  margin-bottom: 12px;
  padding: 0 8px;
  overflow: hidden;
  /* 内层容器随滚动平移 */
}

.time-scale-inner {
  display: flex;
  flex-wrap: nowrap;
  /* 单行 */
  white-space: nowrap;
  gap: calc(var(--px-per-second) * 4.35 + var(--timeline-track-gap));
  /* 刻度间隔与分镜宽度严格对齐 */
  will-change: transform;
  transform: translateX(0);
}

.time-marker {
  font-size: 12px;
  color: #9ca3af;
}

.timeline-tracks {
  display: block;
  position: relative;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  padding: 8px 0;
  content-visibility: auto;
}

.tracks-row {
  display: flex;
  gap: 0;
}

.bgm-row {
  margin-top: 8px;
}

.timeline-tracks::-webkit-scrollbar {
  height: 8px;
}

.timeline-tracks::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.timeline-tracks::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.timeline-tracks::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  /* 每个分镜固定占用5秒宽度 */
  flex: 0 0 calc(var(--px-per-second) * 5);
  width: calc(var(--px-per-second) * 5);
  min-width: calc(var(--px-per-second) * 5);
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  overflow: hidden;
  cursor: move;
}

.bgm-track {
  cursor: default;
}

.timeline-track:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  justify-content: space-between;
}

.track-title {
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 4px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.copy-btn svg {
  color: #3b82f6;
}

.delete-btn svg {
  color: #ef4444;
}

.track-clips {
  display: flex;
  flex-wrap: nowrap;
  /* 单行显示，水平滚动 */
  gap: 0;
  padding: 8px 0;
  min-height: 60px;
  background: white;
}

.bgm-track .track-clips {
  min-height: 40px;
}

.bgm-clip {
  height: 24px;
  width: 100%;
  background: repeating-linear-gradient(45deg, #e0f2fe, #e0f2fe 10px, #bfdbfe 10px, #bfdbfe 20px);
  border-radius: 4px;
  margin: 8px 12px;
}

.bgm-button {
  /* 复用 .audio-btn 外观，仅覆盖布局以占满宽度 */
  flex: 0 0 auto;
  width: 100%;
  justify-content: flex-start;
}

.scene-clip {
  width: auto;
  height: 28px;
  background: #e5e7eb;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 0;
  flex: 0 0 auto;
}

.scene-clip:hover {
  transform: none;
}

.scene-clip.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.clip-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 完整显示缩略图 */
  background: #fff;
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

/* 覆盖 audio-btn 的水平居中，确保“背景音乐”文本靠最左 */
.audio-btn.bgm-button {
  justify-content: flex-start;
  width: 100%;
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
  pointer-events: auto;
  left: 15%;
  transition: left 0.15s linear;
  will-change: left;
  cursor: col-resize;
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
  overflow: hidden;
  /* 防止内容溢出 */
}

.voice-scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 120px;
  /* 为固定输入框留出空间 */
  height: 0;
  /* 强制flex子元素计算高度 */
  min-height: 0;
  /* 允许flex子元素缩小 */
  content-visibility: auto;
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

.skeleton-block {
  padding: 10px 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-paragraph {
  height: 80px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 8px;
}

.skeleton-card {
  height: 60px;
  border-radius: 8px;
  margin-top: 8px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.logo-icon {
  width: 28px;
  height: 28px;
}
</style>
