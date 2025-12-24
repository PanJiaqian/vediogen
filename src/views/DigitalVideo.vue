<template>
  <div v-if="isSceneLipSyncMode" class="lip-sync-full-page" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;background:var(--bg-primary);">
    <LipSyncView 
      @close="goBack" 
      @task-created="onLipSyncTaskCreated"
      :imageUrl="lipSyncImageUrl"
      :sceneTitle="$route.query.sceneTitle || ''"
      :sceneDescription="$route.query.sceneDescription || ''"
      :detection="lipSyncDetection"
      :videoId="lipSyncVideoId"
      :shotId="lipSyncShotId" />
  </div>

  <div v-else class="video-edit-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <img src="/logo.png" alt="VideoGen" class="logo-icon" @click="$router.push('/')" />
        <div class="project-title-container">
          <span v-if="!isEditingTitle" class="project-title-text" @click="startEditTitle" title="点击修改标题">
            {{ projectTitle }}
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14"
              style="margin-left:4px;opacity:0.6;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
          <input v-else ref="titleInput" v-model="editingTitle" class="project-title-input" @blur="saveTitle"
            @keyup.enter="saveTitle" />
        </div>
      </div>
      <div class="navbar-right">
        <button v-if="!isVip" class="navbar-btn premium-btn" @click="showMembershipModal = true">开通会员</button>
        <button class="navbar-btn convert-btn" @click="convertToVideo" :disabled="true">一键转视频</button>
        <!-- <button class="navbar-btn export-btn" @click="exportVideo" :disabled="true">导出视频</button> -->
      </div>
    </div>

    <ToneSelector v-if="showToneSelector" :visible="true" @close="showToneSelector = false" @select="handleToneSelect"
      :token="userStore.token" modelName="qwen3-TTS-Flash" />
    
    <MembershipModal :visible="showMembershipModal" @close="showMembershipModal = false" />

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
            <span class="scene-number">分镜{{ (scenes && scenes[activeSceneIndex] &&
              Number(scenes[activeSceneIndex].order_index) > 0) ? Number(scenes[activeSceneIndex].order_index) : ''
              }}</span>
            <span class="scene-type" v-if="activeTab === 'image' && !isBlankScene(scenes[activeSceneIndex])">镜头策划</span>
            <span class="scene-type" v-if="activeTab === 'voice'">配音编辑</span>
          </div>
        </div>

        <template
          v-if="isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) || (isConverting && isActiveImageMissing && !sceneDetail.video_url)">
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
            <!-- 可滚动内容区域（空白分镜时隐藏，仅保留“分镜2”标题） -->
            <div class="scene-scrollable-content" v-if="!isBlankScene(scenes[activeSceneIndex])">
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
                  <span class="prompt-title">{{ (scenes[activeSceneIndex] && scenes[activeSceneIndex].scene_script &&
                    scenes[activeSceneIndex].scene_script.shot_title) }}</span>
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
                  <div v-if="!isEditingPrompt">
                    <template v-if="scenes[activeSceneIndex]?.scene_script">
                      <div style="display:flex;flex-direction:column;gap:4px;">
                        <div v-if="scenes[activeSceneIndex].scene_script.visual_description">
                          <span style="opacity:0.7;"></span>{{ scenes[activeSceneIndex].scene_script.visual_description}}
                        </div>
                      </div>
                    </template>
                    <!-- <p v-else>{{ scenes[activeSceneIndex]?.description || '暂无描述' }}</p> -->
                  </div>
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
                <div
                  v-if="(isActiveSceneCropping || isPreviewPending || (!sceneDetail.video_url && isActiveImageMissing)) && !isBlankScene(scenes[activeSceneIndex])"
                  class="skeleton-image"></div>
                <div v-else-if="isBlankScene(scenes[activeSceneIndex])" class="blank-scene-display"
                  @click="triggerUpload(activeSceneIndex)">
                  <svg class="upload-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                    <path d="M12 12v6"></path>
                    <path d="M9 15l3-3 3 3"></path>
                  </svg>
                  <div class="upload-text">从本地上传图片吧</div>
                </div>
              <video v-else-if="isVideo(sceneDetail.video_url)" ref="sceneVideo"
                  :src="cleanUrl(sceneDetail.video_url)" :poster="cleanUrl(sceneDetail.reference_image_url || '')"
                  preload="metadata" class="scene-image" playsinline controls></video>
                <img v-else-if="sceneDetail.reference_image_url && !previewImgErrored"
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
                <button v-if="!sceneDetail.video_url" class="bottom-btn regenerate-btn"
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
                  <!-- <span class="input-hint">消耗</span>
                  <span class="input-count">1</span> -->
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
                <div class="voice-input-box">
                  <textarea v-model="voiceScript" class="voice-script-input" placeholder="输入想要人物讲述的台词"></textarea>
                </div>
                <div class="voice-script-controls">
                <div class="voice-play-controls">
                  <button class="voice-icon-btn" @click="startVoiceAudition">
                    <div v-if="isVoiceLoading" class="spinner" style="width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <button class="voice-icon-btn" @click="stopVoiceAudition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" />
                      <rect x="14" y="5" width="4" height="14" />
                    </svg>
                  </button>
                  <input ref="voiceFileInput" type="file" accept="audio/*" style="display:none" @change="onVoiceFileSelected" />
                  <button class="voice-icon-btn" @click="triggerVoiceFileUpload" title="上传音频">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                </div>
                <!-- <span class="voice-duration">约 0s 音频 0/240</span> -->
              </div>
              <div v-if="voiceAudioUrl" class="voice-audio-player-wrap">
                <audio :src="voiceAudioUrl" controls class="voice-audio-player"></audio>
              </div>
              </div>

              <!-- 声音音色区域 -->
              <div class="voice-settings-section">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">声音音色</span>
                </div>

                <div class="voice-card" @click="showToneSelector = true">
                  <button class="voice-card-play" @click.stop="startVoiceAudition">
                    <div v-if="isVoiceLoading" class="spinner" style="width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div class="voice-card-tags">
                    <span class="voice-tag">{{ voiceName }}</span>
                    <span class="voice-tag">{{ voiceGender }}</span>
                    <span class="voice-tag">{{ voiceAge }}</span>
                    <!-- <span class="voice-tag">{{ voiceStyle }}</span> -->
                  </div>
                <div class="voice-card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>

              <!-- 语种选择区域（点击弹窗） -->
              <div class="voice-setting-item" style="margin-top: 16px;">
                <div class="voice-setting-header" style="gap:8px; align-items:center;">
                  <span class="voice-setting-title">语种选择</span>
                  <div v-if="!voiceName" class="no-voice-tip">请先选择音色</div>
                  <select v-else v-model="voiceLanguage" class="filter-select" style="min-width: 140px;">
                    <option v-for="lang in supportedLanguages" :key="lang" :value="lang">{{ toZhLanguage(lang) }}</option>
                  </select>
                </div>
              </div>

              <div class="voice-emotion-wrapper">
                <div class="emotion-btn">
                  <span class="emotion-icon">😊</span>
                  <span class="emotion-text">情绪: 默认</span>
                  <svg class="emotion-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>

              <!-- 声音音量区域（已注释） -->
              <!--
              <div class="voice-setting-item" style="margin-top: 20px;">
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
              -->

              <!-- 声音语速区域（已注释） -->
              <!--
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
              -->
              </div>
            </div>


            <!-- 固定的应用修改按钮 -->
            <div class="voice-apply-section">
              <button class="voice-apply-btn" @click="applyVoiceover">应用配音</button>
            </div>
          </div>
        </template>
      </div>

      <!-- 右侧区域 -->
      <div class="right-panel">
        <!-- 画布编辑和对口型 -->
        <div v-if="isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex)" class="skeleton-block"
          style="margin-bottom: 8px;">
          <div class="skeleton-line" style="width: 200px; height: 32px;"></div>
        </div>
        <div v-else class="edit-controls">
          <button v-if="sceneDetail.video_url" class="control-btn active" @click="toggleCanvasEditMode">
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
              <div
              v-if="(isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) || isPreviewPending || (!sceneDetail.video_url && isActiveImageMissing)) && !isBlankScene(scenes[activeSceneIndex])"
              class="skeleton-image"></div>
              <template v-else>
              <div v-if="isBlankScene(scenes[activeSceneIndex])" class="blank-scene-display" @click="triggerUpload(activeSceneIndex)">
                <svg class="upload-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                  <path d="M12 12v6"></path>
                  <path d="M9 15l3-3 3 3"></path>
                </svg>
                <div class="upload-text">从本地上传图片吧</div>
              </div>
              <video v-if="isVideo(sceneDetail.video_url)" ref="previewVideo" :src="cleanUrl(sceneDetail.video_url)"
                :poster="cleanUrl(sceneDetail.reference_image_url || '')" preload="metadata" playsinline loop
                class="video-image"></video>
              <img v-else-if="sceneDetail.reference_image_url && !isPreviewPending"
                :src="cleanUrl(sceneDetail.reference_image_url)"
                :alt="scenes[activeSceneIndex] ? scenes[activeSceneIndex].title : '预览'" class="video-image"
                decoding="async" fetchpriority="high" @error="onPreviewImgError" />
              <div
                v-if="!sceneDetail.video_url && previewImgErrored"
                class="video-overlay">
                <div class="error-banner">生成失败</div>
              </div>
              </template>
              <audio ref="previewAudio" style="display:none" preload="auto"></audio>
            </div>
          <div class="preview-aside">
            <template
              v-if="(isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) || isPreviewPending || (!sceneDetail.video_url && isActiveImageMissing)) && !isBlankScene(scenes[activeSceneIndex])">
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
              <div v-if="sceneDetail.reference_image_url && !previewImgErrored && !isPreviewPending"
                class="thumb-card">
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
            <template v-if="isVideoConverting">
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
                      <span class="track-title">分镜{{ (Number(scene.order_index) > 0 ? Number(scene.order_index) : '')
                        }}</span>
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
                      <template v-if="isSceneUpdating(scene, index) || isCropPendingScene(scene, index)">
                        <div v-for="m in 10" :key="'up-skel-' + index + '-' + m" class="scene-clip">
                          <div class="skeleton-image" style="height:28px;"></div>
                        </div>
                      </template>
                      <template v-else-if="isVideoPendingScene(scene, index)">
                        <div v-for="m in 10" :key="'gen-skel-' + index + '-' + m" class="scene-clip">
                          <div class="skeleton-image" style="height:28px;"></div>
                        </div>
                      </template>
                      <template v-else-if="index === activeSceneIndex && (isPreviewPending || isActiveImageMissing) && !isBlankScene(scene)">
                        <div v-for="m in 10" :key="'prev-skel-' + index + '-' + m" class="scene-clip">
                          <div class="skeleton-image" style="height:28px;"></div>
                        </div>
                      </template>
                      <template v-else-if="isBlankScene(scene)">
                        <div class="blank-scene-placeholder" @click.stop="triggerUpload(index)" style="height:28px; width:100%" title="添加图片">
                          <div class="blank-upload-ui">
                            <svg class="upload-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                              <path d="M12 12v6"></path>
                              <path d="M9 15l3-3 3 3"></path>
                            </svg>
                            <span class="blank-upload-label">添加图片</span>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="(clip, cidx) in getSceneClips(scene)" :key="cidx" class="scene-clip"
                          :class="{ active: index === activeSceneIndex }" :style="getClipStyle(scene, clip)">
                          <video v-if="isVideo(clip.url || scene.video_url || scene.thumbnail)"
                            :src="cleanUrl(clip.url || scene.video_url || scene.thumbnail)"
                            :poster="cleanUrl(scene.thumbnail || '')" class="clip-thumbnail" muted loop playsinline
                            :preload="index < 4 ? 'metadata' : 'none'" disablepictureinpicture></video>
                          <img
                            v-else-if="(clip.url || scene.thumbnail) && !isClipImgErrored(index, cidx)"
                            :src="cleanUrl(clip.url || scene.thumbnail)"
                            :alt="'分镜' + (Number(scene.order_index) > 0 ? Number(scene.order_index) : '')"
                            class="clip-thumbnail" loading="lazy" decoding="async" fetchpriority="low"
                            @error="onClipImgError(index, cidx)" />
                          <div v-else class="skeleton-image" style="height:28px;"></div>
                        </div>
                        <div v-if="getSceneClips(scene).length === 0" class="scene-clip" style="width:100%">
                          <div class="skeleton-image" style="height:28px;"></div>
                        </div>
                      </template>
                    </div>
                    <div class="add-scene-plus-btn" @click.stop="addBlankScene(index)" title="添加空白分镜">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>

                    <div class="track-audio">
                      <button v-if="scene.audio_url" class="audio-btn" @click.stop="openVoiceTab(index)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                            stroke-width="2" />
                        </svg>
                        配音
                      </button>
                      <button v-else class="audio-btn add-audio" @click.stop="openVoiceTab(index)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" />
                          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" />
                        </svg>
                        添加配音
                      </button>
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
      
    <input ref="digitalHumanImageInput" type="file" accept="image/*" style="display:none" @change="handleDigitalHumanImageSelected" />

    <div v-if="showImageCropModal" class="crop-modal-overlay" @click.self="cancelImageCrop">
      <div class="crop-modal">
        <div class="crop-modal-header">裁剪图片</div>
        <div class="crop-modal-body" @mousemove="onMouseMove" @mouseup="onMouseUp">
          <div class="crop-preview" ref="cropPreview">
            <img :src="selectedImageUrl" class="crop-image" ref="cropImage" @load="onCropImageLoad" />
            <div v-if="displayRect" class="crop-select" :style="cropSelectBoxStyle" @mousedown.prevent="onSelectMouseDown">
              <div class="crop-handle handle-nw" @mousedown.stop.prevent="onHandleMouseDown('nw', $event)"></div>
              <div class="crop-handle handle-ne" @mousedown.stop.prevent="onHandleMouseDown('ne', $event)"></div>
              <div class="crop-handle handle-sw" @mousedown.stop.prevent="onHandleMouseDown('sw', $event)"></div>
              <div class="crop-handle handle-se" @mousedown.stop.prevent="onHandleMouseDown('se', $event)"></div>
            </div>
          </div>
        </div>
        <div class="crop-modal-footer">
          <div class="ratio-buttons">
            <button :class="['ratio-btn', {active: cropRatio==='9:16'}]" @click="cropRatio='9:16'">9:16</button>
            <button :class="['ratio-btn', {active: cropRatio==='16:9'}]" @click="cropRatio='16:9'">16:9</button>
            <button :class="['ratio-btn', {active: cropRatio==='3:4'}]" @click="cropRatio='3:4'">3:4</button>
            <button :class="['ratio-btn', {active: cropRatio==='4:3'}]" @click="cropRatio='4:3'">4:3</button>
          </div>
          <div class="crop-actions">
            <button class="crop-cancel" @click="cancelImageCrop">取消</button>
            <button class="crop-apply" @click="applyImageCrop">应用</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 对口型页面覆盖层 -->
    <div v-if="showLipSyncView" class="lip-sync-overlay">
      <LipSyncView @close="toggleLipSyncView" @task-created="onLipSyncTaskCreated"
        :imageUrl="lipSyncImageUrl || cleanUrl(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail || '')"
        :sceneTitle="scenes[activeSceneIndex]?.title || ''"
        :sceneDescription="(scenes[activeSceneIndex]?.description || ((scenes[activeSceneIndex]?.scene_script?.shot_title || '') + (scenes[activeSceneIndex]?.scene_script?.visual_description ? '：' + scenes[activeSceneIndex]?.scene_script?.visual_description : ''))) || ''"
        :detection="lipSyncDetection"
        :videoId="lipSyncVideoId"
        :shotId="lipSyncShotId"
        :workId="lipSyncWorkId" />
    </div>
  </div>

  <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>

  <div v-if="successModalVisible" class="success-modal-overlay" @click="closeSuccessModal">
    <div class="success-modal" @click.stop>
      <div class="success-title">{{ successTitle || '任务创建成功' }}</div>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
        <button v-if="successPreviewUrl" class="success-close-btn" @click="downloadExportVideo">下载</button>
        <!-- <button class="success-close-btn" @click="closeSuccessModal">确定</button> -->
      </div>
    </div>
  </div>

  
</template>

<script>
import ToneSelector from '@/components/ToneSelector.vue'
import MembershipModal from '@/components/MembershipModal.vue'
import LipSyncView from '@/views/LipSyncView.vue'
import CanvasEditView from '@/views/CanvasEditView.vue'
import CropStoryboardModal from '@/components/CropStoryboardModal.vue'
// import Hls from 'hls.js'
import { getScriptDetailByVideo, regenerateImage, queryRegenerateImage, copyStoryboardVideo, reorderStoryboardScenes, clipStoryboardVideo, updateVideoTitle, aliTtsSubmit, aliTtsQuery, uploadStoryboardVoiceoverAudio, digitalhumanQuery, getDigitalHumanWorksByConversation, getDigitalHumanWorkSingle, objectDetectionByScene, uploadDigitalHumanWorkImage, objectDetectionByWork, digitalhumanGenByWork } from '@/api'
import { useUserStore } from '@/stores/user'
import { cleanUrl as cleanUrlUtil, getLocalMediaUrl as getLocalMediaUrlUtil } from '@/utils/media'

export default {
  name: 'DigitalVideo',
  components: {
    ToneSelector,
    MembershipModal,
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
      showMembershipModal: false,
      updatingKeySet: new Set(),
      cropPendingKeySet: new Set(),
      // 配音相关数据
      voiceScript: '',
      voiceGender: '女性',
      voiceAge: '中年',
      voiceStyle: '普通话',
      voiceName: '', // 默认为 cherry
      voiceLanguage: 'Chinese', // 默认为 Chinese
      supportedLanguages: [],
      showLanguageSelector: false,
      showToneSelector: false,
      voiceEmotion: '默认',
      voiceVolume: 100,
      voiceSpeed: 100,
      isVoiceAuditionPlaying: false,
      isVoiceLoading: false,
      voiceAuditionTaskId: '',
      voiceAudioUrl: '',
      voicePollTimer: null,
      voiceAudioEl: null,
      applyToAllScenes: false,
      applyVolumeToAllScenes: false,
      applySpeedToAllScenes: false,
      isPlaying: false,
      // audioDuration: '约 5s 音频 20/240',
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
      successTitle: '',
      successPreviewUrl: '',
      successFilename: '',
      isConverting: false,
      isVideoConverting: false,
      sceneDetail: { reference_image_url: '', video_url: '' },
      isEditingTitle: false,
      editingTitle: '',
      toastVisible: false,
      toastText: '',
      previewImgErrored: false,
      clipImgErrorMap: {},
      isVideoGenerating: false,
      pendingVideoSet: new Set()
      , videoQueue: [],
      videoProcessing: false,
      durationMap: new Map(),
      imagesDetailMap: new Map(),
      pollImagesActive: false,
      pollImagesTimer: null,
      pollImagesAbortResolve: null
      , lipSyncImageUrl: ''
      , lipSyncDetection: null
      , lipSyncVideoId: ''
      , lipSyncShotId: ''
      , lipSyncWorkId: '',
      digitalVideoQueryInterval: null,
      storyboardQueryInterval: null,
      digitalHumanConversationInterval: null,
      // Image Crop State
      showImageCropModal: false,
      cropRatio: 'free',
      selectedImageFile: null,
      selectedImageUrl: null,
      cropSelX: 0,
      cropSelY: 0,
      cropSelW: 0,
      cropSelH: 0,
      isDraggingSel: false,
      isResizingSel: false,
      resizeDir: '',
      dragStartX: 0,
      dragStartY: 0,
      dragStartSelX: 0,
      dragStartSelY: 0,
      dragStartW: 0,
      dragStartH: 0,
      displayRect: null
    }
  },

  beforeUnmount() {
    if (this.storyboardQueryInterval) {
      clearInterval(this.storyboardQueryInterval)
      this.storyboardQueryInterval = null
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
    try { if (this._hlsPreview && this._hlsPreview.destroy) this._hlsPreview.destroy() } catch (e) { void 0 }
    try { if (this._hlsScene && this._hlsScene.destroy) this._hlsScene.destroy() } catch (e) { void 0 }
    this.pollImagesActive = false
    if (this.pollImagesAbortResolve) {
      try { this.pollImagesAbortResolve() } catch (e) { void 0 }
      this.pollImagesAbortResolve = null
    }
    if (this.pollImagesTimer) {
      try { clearTimeout(this.pollImagesTimer) } catch (e) { void 0 }
      this.pollImagesTimer = null
    }
    if (this.digitalVideoQueryInterval) {
      try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 }
      this.digitalVideoQueryInterval = null
    }
    if (this.digitalHumanConversationInterval) {
      try { clearInterval(this.digitalHumanConversationInterval) } catch (e) { void 0 }
      this.digitalHumanConversationInterval = null
    }
  },
  mounted() {
    if (this.isSceneLipSyncMode) {
      const q = this.$route.query
      this.lipSyncImageUrl = q.imageUrl || ''
      this.lipSyncVideoId = q.videoId || ''
      this.lipSyncShotId = q.shotId || ''
      // Trigger detection immediately
      const token = (this.userStore && this.userStore.token) || ''
      if (this.lipSyncVideoId && this.lipSyncShotId && token) {
        objectDetectionByScene({ videoId: this.lipSyncVideoId, shotId: this.lipSyncShotId, token })
          .then(detResp => {
             const obj = typeof detResp === 'string' ? (() => { try { return JSON.parse(detResp) } catch { return null } })() : detResp
             this.lipSyncDetection = obj || null
          })
          .catch(() => { this.lipSyncDetection = null })
      }
      return
    }
    const taskId = this.$route.params.taskId
    if (taskId) {
      this.isVideoGenerating = true
      this.sceneDetail = { reference_image_url: '', video_url: '', audio_url: '' }
      const token = (this.userStore && this.userStore.token) || ''
      const poll = async () => {
        try {
          const resp = await digitalhumanQuery({ taskId, token })
          const obj = typeof resp === 'string' ? (() => { try { return JSON.parse(resp) } catch { return null } })() : resp
          const data = obj && obj.data
          const status = (obj && obj.status) || (data && data.task_status)
          const vid = data && data.generated_video_url
          const img = data && data.image_url
          const aud = data && data.audio_url
          const s = String(status || '').toLowerCase()
          if (s === 'failed') {
            if (this.digitalVideoQueryInterval) { try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 } this.digitalVideoQueryInterval = null }
            this.isVideoGenerating = false
            this.toastText = '生成失败'
            this.toastVisible = true
            this.previewImgErrored = true
            setTimeout(() => { this.toastVisible = false }, 2000)
          } else if ((s === 'succeeded' || s === 'completed') && (vid || img)) {
            const videoUrl = this.cleanUrl(String(vid || ''))
            const imageUrl = this.cleanUrl(String(img || ''))
            const audioUrl = this.cleanUrl(String(aud || ''))
            this.sceneDetail = { reference_image_url: imageUrl, video_url: videoUrl, audio_url: audioUrl }
            let clipUrl = videoUrl || imageUrl
            let durMs = 5000
            if (videoUrl) {
              try { durMs = await this.measureVideoDurationMs(videoUrl) } catch (e) { durMs = 5000 }
            }
            if (!Array.isArray(this.scenes) || this.scenes.length === 0) {
              this.scenes = [{ id: 1, title: '分镜1', description: '数字人视频', thumbnail: imageUrl || clipUrl, clips: [{ url: clipUrl, durationMs: durMs }], video_url: videoUrl, hasVideo: !!videoUrl, order_index: 1, audio_url: audioUrl }]
              this.activeSceneIndex = 0
            } else {
              const idx = this.activeSceneIndex
              const sc = this.scenes[idx] || {}
              sc.thumbnail = imageUrl || sc.thumbnail || clipUrl
              sc.video_url = videoUrl
              sc.hasVideo = !!videoUrl
              sc.audio_url = audioUrl
              sc.clips = [{ url: clipUrl, durationMs: durMs }]
            }
            try {
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              if (clipUrl) this.durationMap.set(clipUrl, durMs)
              if (videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs)
            } catch (e) { void 0 }
            this.updateTimeMarkers()
            this.ensurePreviewFromScenes()
            this.isVideoGenerating = false
            if (this.digitalVideoQueryInterval) { try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 } this.digitalVideoQueryInterval = null }
            this.$nextTick(() => { this.tryAttachHls() })
          }
        } catch (e) { void 0 }
      }
      poll()
      this.digitalVideoQueryInterval = setInterval(poll, 30000)
    }
    const conversationId = this.$route.query && this.$route.query.conversationId
    if (!taskId && conversationId) {
      this.loadDigitalHumanByConversation(String(conversationId))
      return
    }
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
              else if (/logo\.png$/i.test(thumb)) sc.thumbnail = ''
              else if (/placeholder/i.test(thumb)) sc.thumbnail = ''
              else sc.thumbnail = thumb
              if (Array.isArray(sc.clips) && sc.clips.length) {
                const u = this.cleanUrl(sc.clips[0].url || '')
                if (/^blob:/i.test(u)) sc.clips[0].url = this.cleanUrl(sc.thumbnail || '')
                else sc.clips[0].url = u
              }
            }
          } catch (e) { void 0 }
          this.activeSceneIndex = 0
          this.updateTimeMarkers()
          this.sortScenesByServerOrder()
          this.ensurePreviewFromScenes()
        }
      }
      // 解析原始分镜，生成包含clips的场景数据
      const rawStr = localStorage.getItem(`project:storyboard_raw:${projectId}`)
      if (rawStr) {
        const raw = JSON.parse(rawStr)
        const scenesFromRaw = this.parseStoryboardRawToScenes(raw)
        if ((!Array.isArray(this.scenes) || this.scenes.length === 0) && Array.isArray(scenesFromRaw) && scenesFromRaw.length) {
          this.scenes = scenesFromRaw
          this.activeSceneIndex = 0
          this.updateTimeMarkers()
          this.sortScenesByServerOrder()
          this.ensurePreviewFromScenes()
        }
      }
      const title = localStorage.getItem(`project:prompt:${projectId}`)
      if (title) this.projectTitle = title
      const shouldGen = localStorage.getItem(`video-edit:generateStoryboard:${projectId}`) === '1'
      const shouldView = localStorage.getItem(`video-edit:viewStoryboard:${projectId}`) === '1'
      this._entryIsGenerate = !!shouldGen
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
    // 禁止进入页面自动调用分镜详情接口：不再加载服务器顺序索引

    this.$nextTick(() => { this.initTimelineSync() })
    if (initialLoading) {
      setTimeout(() => {
        this.isConverting = false
        try { localStorage.removeItem(`video-edit:loading:${projectId}`) } catch (e) { void 0 }
      }, 800)
    }
    // 禁止进入页面自动调用分镜详情接口：不再进行当前分镜/预取调用
    if (!this._entryIsGenerate) { this.pollImagesActive = false }
    this.precacheSceneThumbnails()
    this.$nextTick(() => { this.tryAttachHls() })
    this.$nextTick(() => { this.initLeftPanelScript() })
    this.$nextTick(() => { this.prefetchFirstSceneAudioIfMissing() })
  },
  computed: {
    isSceneLipSyncMode() {
      return this.$route.query.mode === 'scene_lipsync'
    },
    userStore() {
      return useUserStore()
    },
    isVip() {
      return this.userStore && this.userStore.userInfo && this.userStore.userInfo.vipStatus === 'ACTIVE'
    },
    aspectStyle() {
      const r = String(this.cropRatio || '').trim()
      if (!r || r === 'free') return {}
      const parts = r.split(':')
      const rw = parseFloat(parts[0]) || 1
      const rh = parseFloat(parts[1]) || 1
      return { aspectRatio: `${rw} / ${rh}` }
    },
    cropSelectBoxStyle() {
      if (!this.displayRect) return {}
      const x = Math.round(this.cropSelX)
      const y = Math.round(this.cropSelY)
      const w = Math.round(this.cropSelW)
      const h = Math.round(this.cropSelH)
      return { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }
    },
    currentPreviewUrl() {
      const v = this.cleanUrl(this.sceneDetail.video_url || '')
      return this.isVideo(v) ? v : this.cleanUrl(this.sceneDetail.reference_image_url || '')
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
        return !!url
      })
    },
    allVideosReady() {
      const arr = Array.isArray(this.scenes) ? this.scenes : []
      if (arr.length === 0) return false
      return arr.every(sc => {
        const u = this.cleanUrl(sc && sc.video_url || '')
        return !!u
      })
    },
    pendingSkeletonCount() {
      const need = 1
      const len = Array.isArray(this.scenes) ? this.scenes.length : 0
      return Math.max(0, need - len)
    },
    isPreviewPending() {
      const idx = this.activeSceneIndex
      const scene = Array.isArray(this.scenes) ? this.scenes[idx] : null
      const set = this.pendingVideoSet instanceof Set ? this.pendingVideoSet : null
      if (!scene) return false
      const k = this.getSceneKey(scene, idx)
      const existingVid = this.cleanUrl((scene && scene.video_url) || '')
      const processedVideo = !!(scene && scene.hasVideo) || !!existingVid
      const hasImg = !!this.cleanUrl(this.sceneDetail.reference_image_url || '')
      if (processedVideo || hasImg) {
        if (processedVideo && set) { try { set.delete(k) } catch (e) { void 0 } }
        return false
      }
      if (!set) return false
      return set.has(k)
    },
    isActiveSceneCropping() {
      const idx = this.activeSceneIndex
      const scene = Array.isArray(this.scenes) ? this.scenes[idx] : null
      const set = this.cropPendingKeySet instanceof Set ? this.cropPendingKeySet : null
      if (!scene || !set) return false
      const k = this.getSceneKey(scene, idx)
      return set.has(k)
    },
    isActiveImageMissing() {
      const idx = this.activeSceneIndex
      const scene = Array.isArray(this.scenes) ? this.scenes[idx] : null
      const apiImg = this.cleanUrl(this.sceneDetail.reference_image_url || '')
      const thumb = this.cleanUrl((scene && scene.thumbnail) || '')
      const hasApi = !!apiImg
      const hasThumb = !!thumb
      return !hasApi && !hasThumb
    }
  },
  watch: {
    '$route.params.taskId'(taskId) {
      try { if (this.digitalVideoQueryInterval) { clearInterval(this.digitalVideoQueryInterval); this.digitalVideoQueryInterval = null } } catch (e) { void 0 }
      if (!taskId) return
      this.isVideoGenerating = true
      this.sceneDetail = { reference_image_url: '', video_url: '', audio_url: '' }
      const token = (this.userStore && this.userStore.token) || ''
      const poll = async () => {
        try {
          const resp = await digitalhumanQuery({ taskId, token })
          const obj = typeof resp === 'string' ? (() => { try { return JSON.parse(resp) } catch { return null } })() : resp
          const data = obj && obj.data
          const status = (obj && obj.status) || (data && data.task_status)
          const vid = data && data.generated_video_url
          const img = data && data.image_url
          const aud = data && data.audio_url
          const s = String(status || '').toLowerCase()
          if (s === 'failed') {
            if (this.digitalVideoQueryInterval) { try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 } this.digitalVideoQueryInterval = null }
            this.isVideoGenerating = false
            this.toastText = '生成失败'
            this.toastVisible = true
            this.previewImgErrored = true
            setTimeout(() => { this.toastVisible = false }, 2000)
          } else if ((s === 'succeeded' || s === 'completed') && (vid || img)) {
            const videoUrl = this.cleanUrl(String(vid || ''))
            const imageUrl = this.cleanUrl(String(img || ''))
            const audioUrl = this.cleanUrl(String(aud || ''))
            this.sceneDetail = { reference_image_url: imageUrl, video_url: videoUrl, audio_url: audioUrl }
            let clipUrl = videoUrl || imageUrl
            let durMs = 5000
            if (videoUrl) {
              try { durMs = await this.measureVideoDurationMs(videoUrl) } catch (e) { durMs = 5000 }
            }
            if (!Array.isArray(this.scenes) || this.scenes.length === 0) {
              this.scenes = [{ id: 1, title: '分镜1', description: '数字人视频', thumbnail: imageUrl || clipUrl, clips: [{ url: clipUrl, durationMs: durMs }], video_url: clipUrl, hasVideo: !!videoUrl, order_index: 1, audio_url: audioUrl }]
              this.activeSceneIndex = 0
            } else {
              const idx = this.activeSceneIndex
              const sc = this.scenes[idx] || {}
              sc.thumbnail = imageUrl || sc.thumbnail || clipUrl
              sc.video_url = clipUrl
              sc.hasVideo = !!videoUrl
              sc.audio_url = audioUrl
              sc.clips = [{ url: clipUrl, durationMs: durMs }]
            }
            try {
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              if (clipUrl) this.durationMap.set(clipUrl, durMs)
              if (videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs)
            } catch (e) { void 0 }
            this.updateTimeMarkers()
            this.ensurePreviewFromScenes()
            this.isVideoGenerating = false
            if (this.digitalVideoQueryInterval) { try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 } this.digitalVideoQueryInterval = null }
            this.$nextTick(() => { this.tryAttachHls() })
          }
        } catch (e) { void 0 }
      }
      poll()
      this.digitalVideoQueryInterval = setInterval(poll, 30000)
    },
    activeSceneIndex() {
      this.previewImgErrored = false
      try {
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
        const ref = this.cleanUrl((sc && sc.thumbnail) || '')
        const firstUrl = this.cleanUrl((first && first.url) || '')
        const sceneVid = this.cleanUrl((sc && sc.video_url) || '')
        const vid = this.isVideo(sceneVid) ? sceneVid : (this.isVideo(firstUrl) ? firstUrl : '')
        const audio = this.cleanUrl((sc && sc.audio_url) || '')
        this.sceneDetail = { reference_image_url: ref, video_url: vid, audio_url: audio }
        this.syncPreviewPlayback()
      } catch (e) { void 0 }
      this.$nextTick(() => { this.tryAttachHls() })
    },
    'sceneDetail.reference_image_url'(val) {
      this.previewImgErrored = false
    },
    'sceneDetail.video_url'(val) {
      if (this.isPlaying) {
        const el = this.$refs.previewVideo
        if (el) {
          try { el.pause() } catch (e) { void 0 }
        }
      } else {
        this.pausePreview()
      }
      this.$nextTick(() => { this.tryAttachHls() })
      this.$nextTick(() => { this.updateActiveSceneDurationFromVideo() })
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
    async loadDigitalHumanByConversation(conversationId) {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        const text = await getDigitalHumanWorksByConversation({ conversationId, token })
        let resp = null
        try { resp = JSON.parse(text) } catch (e) { resp = null }
        const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
        if (!list.length) return
        const scenes = []
        let anyPending = false
        for (let i = 0; i < list.length; i++) {
          const it = list[i] || {}
          const rawVid = (it && it.generated_video_url)
          const isExplicitNull = rawVid === null
          const isNoVideo = String(rawVid || '').toLowerCase() === 'novideo'
          const vClean = this.cleanUrl(String(rawVid || ''))
          const img = this.cleanUrl(String(it.image_url || ''))
          const aud = this.cleanUrl(String(it.audio_url || ''))
          const wid = String((it.work_id || it.workid || it.id || it.workId || '')).trim()
          let videoUrl = ''
          let hasVideo = false
          let clipUrl = ''
          if (isExplicitNull) {
            videoUrl = null
            hasVideo = false
            clipUrl = img
            anyPending = true
          } else if (isNoVideo) {
            videoUrl = ''
            hasVideo = false
            clipUrl = img
          } else if (vClean) {
            videoUrl = vClean
            hasVideo = true
            clipUrl = vClean
          } else {
            videoUrl = ''
            hasVideo = false
            clipUrl = img
          }
          let durMs = 5000
          if (hasVideo && videoUrl) { try { durMs = await this.measureVideoDurationMs(videoUrl) } catch (e) { durMs = 5000 } }
          const scene = { id: i + 1, title: '分镜' + (i + 1), description: '数字人视频', thumbnail: img || clipUrl, clips: [{ url: clipUrl, durationMs: durMs }], video_url: videoUrl, hasVideo, order_index: i + 1, audio_url: aud, work_id: wid }
          scenes.push(scene)
          try {
            if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
            if (clipUrl) this.durationMap.set(clipUrl, durMs)
            if (hasVideo && videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs)
          } catch (e) { /* no-op */ }
        }
        this.scenes = scenes
        this.activeSceneIndex = 0
        const first = scenes[0] || {}
        this.sceneDetail = { reference_image_url: this.cleanUrl(String(first.thumbnail || '')), video_url: first.video_url === null ? '' : this.cleanUrl(String(first.video_url || '')), audio_url: this.cleanUrl(String(first.audio_url || '')) }
        this.updateTimeMarkers()
        this.ensurePreviewFromScenes()
        const wid0 = String(first.work_id || first.workid || first.id || '').trim()
        if (wid0) { try { await this.loadDigitalHumanSingle(String(conversationId), wid0) } catch (e) { void 0 } }
        if (anyPending) {
          if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
          for (let i = 0; i < scenes.length; i++) {
            const sc = scenes[i]
            if (sc && sc.video_url === null) this.pendingVideoSet.add(this.getSceneKey(sc, i))
          }
          this.isVideoGenerating = true
          this.startPollingDigitalHumanConversation(String(conversationId))
        }
      } catch (e) { void 0 }
    },
    startPollingDigitalHumanWorks(conversationId) {
      try {
        if (this._digitalHumanWorksPollInterval) { clearInterval(this._digitalHumanWorksPollInterval); this._digitalHumanWorksPollInterval = null }
      } catch (e) { /* no-op */ }
      let remaining = 60
      const tick = async () => {
        try {
          if (!Array.isArray(this.scenes) || this.scenes.length === 0) return
          const token = (this.userStore && this.userStore.token) || ''
          for (let i = 0; i < this.scenes.length; i++) {
            const sc = this.scenes[i]
            if (!sc || sc.video_url !== null) continue
            const wid = String((sc.work_id || sc.workid || sc.id || '')).trim()
            if (!wid) continue
            const text = await getDigitalHumanWorkSingle({ conversationId, workId: wid, token })
            let resp = null
            try { resp = JSON.parse(text) } catch (e) { resp = null }
            const d = resp && resp.code === 0 && resp.data ? resp.data : null
            if (!d) continue
            const rawVid = d.generated_video_url
            const isNoVideo = String(rawVid || '').toLowerCase() === 'novideo'
            const v = this.cleanUrl(String(rawVid || ''))
            const img = this.cleanUrl(String(d.image_url || ''))
            const aud = this.cleanUrl(String(d.audio_url || ''))
            let hasVideo = false
            let videoUrl = ''
            let clipUrl = ''
            if (rawVid === null) {
              // still pending
            } else if (isNoVideo) {
              videoUrl = ''
              hasVideo = false
              clipUrl = img
            } else if (v) {
              videoUrl = v
              hasVideo = true
              clipUrl = v
            } else {
              videoUrl = ''
              hasVideo = false
              clipUrl = img
            }
            if (rawVid !== null) {
              sc.thumbnail = img || sc.thumbnail || clipUrl
              sc.video_url = videoUrl
              sc.hasVideo = !!hasVideo
              sc.audio_url = aud
              sc.clips = [{ url: clipUrl || img, durationMs: hasVideo && videoUrl ? await this.measureVideoDurationMs(videoUrl).catch(() => 5000) : 5000 }]
              const k = this.getSceneKey(sc, i)
              if (this.pendingVideoSet instanceof Set) { this.pendingVideoSet.delete(k); this.pendingVideoSet = new Set(this.pendingVideoSet) }
              if (this.activeSceneIndex === i) {
                this.sceneDetail = { reference_image_url: img || clipUrl || '', video_url: videoUrl, audio_url: aud }
                this.updateTimeMarkers()
                this.ensurePreviewFromScenes && this.ensurePreviewFromScenes()
              }
            }
          }
          const pendingEmpty = this.pendingVideoSet instanceof Set ? this.pendingVideoSet.size === 0 : true
          if (pendingEmpty) {
            this.isVideoGenerating = false
            if (this._digitalHumanWorksPollInterval) { clearInterval(this._digitalHumanWorksPollInterval); this._digitalHumanWorksPollInterval = null }
          }
        } catch (e) { /* no-op */ }
        remaining -= 1
        if (remaining <= 0) {
          try { if (this._digitalHumanWorksPollInterval) { clearInterval(this._digitalHumanWorksPollInterval); this._digitalHumanWorksPollInterval = null } } catch (e) { /* no-op */ }
        }
      }
      tick()
    },
    startPollingDigitalHumanConversation(conversationId) {
      try {
        if (this.digitalHumanConversationInterval) { clearInterval(this.digitalHumanConversationInterval); this.digitalHumanConversationInterval = null }
      } catch (e) { /* no-op */ }
      const poll = async () => {
        try {
          const token = (this.userStore && this.userStore.token) || ''
          const text = await getDigitalHumanWorksByConversation({ conversationId, token })
          let resp = null
          try { resp = JSON.parse(text) } catch (e) { resp = null }
          const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
          if (!list.length || !Array.isArray(this.scenes) || this.scenes.length === 0) return
          const indexByWid = new Map()
          for (let i = 0; i < this.scenes.length; i++) {
            const sc = this.scenes[i] || {}
            const wid = String((sc.work_id || sc.workid || sc.id || sc.workId || '')).trim()
            if (wid) indexByWid.set(wid, i)
          }
          let anyPending = false
          for (let j = 0; j < list.length; j++) {
            const it = list[j] || {}
            const wid = String((it.work_id || it.workid || it.id || it.workId || '')).trim()
            const idx = indexByWid.has(wid) ? indexByWid.get(wid) : j
            const sc = this.scenes[idx] || null
            if (!sc) continue
            const rawVid = it && it.generated_video_url
            const isExplicitNull = rawVid === null
            const isNoVideo = String(rawVid || '').toLowerCase() === 'novideo'
            const vClean = this.cleanUrl(String(rawVid || ''))
            const img = this.cleanUrl(String(it.image_url || ''))
            const aud = this.cleanUrl(String(it.audio_url || ''))
            let videoUrl = ''
            let hasVideo = false
            let clipUrl = ''
            if (isExplicitNull) {
              videoUrl = null
              hasVideo = false
              clipUrl = img
              anyPending = true
            } else if (isNoVideo) {
              videoUrl = ''
              hasVideo = false
              clipUrl = img
            } else if (vClean) {
              videoUrl = vClean
              hasVideo = true
              clipUrl = vClean
            } else {
              videoUrl = ''
              hasVideo = false
              clipUrl = img
            }
            let durMs = 5000
            if (hasVideo && videoUrl) { try { durMs = await this.measureVideoDurationMs(videoUrl) } catch (e) { durMs = 5000 } }
            sc.thumbnail = img || sc.thumbnail || clipUrl
            sc.video_url = videoUrl
            sc.hasVideo = !!hasVideo
            sc.audio_url = aud
            sc.clips = [{ url: clipUrl || img, durationMs: durMs }]
            try {
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              if (clipUrl) this.durationMap.set(clipUrl, durMs)
              if (hasVideo && videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs)
            } catch (e) { /* no-op */ }
            const k = this.getSceneKey(sc, idx)
            if (isExplicitNull) {
              if (this.pendingVideoSet instanceof Set) { this.pendingVideoSet.add(k); this.pendingVideoSet = new Set(this.pendingVideoSet) }
            } else {
              if (this.pendingVideoSet instanceof Set) { this.pendingVideoSet.delete(k); this.pendingVideoSet = new Set(this.pendingVideoSet) }
            }
            if (this.activeSceneIndex === idx) {
              const v = videoUrl === null ? '' : videoUrl
              const ref = img || clipUrl || ''
              this.sceneDetail = { reference_image_url: ref, video_url: v, audio_url: aud }
              this.updateTimeMarkers()
              this.ensurePreviewFromScenes && this.ensurePreviewFromScenes()
            }
          }
          this.isVideoGenerating = !!anyPending
        } catch (e) { /* no-op */ }
      }
      poll()
      this.digitalHumanConversationInterval = setInterval(poll, 30000)
    },
    async loadDigitalHumanSingle(conversationId, workId) {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        const text = await getDigitalHumanWorkSingle({ conversationId, workId, token })
        let resp = null
        try { resp = JSON.parse(text) } catch (e) { resp = null }
        const d = resp && resp.code === 0 && resp.data ? resp.data : null
        if (!d) return
        const rawVid = d.generated_video_url
        const isNoVideo = String(rawVid || '').toLowerCase() === 'novideo'
        const v = isNoVideo ? '' : this.cleanUrl(String(rawVid || ''))
        const img = this.cleanUrl(String(d.image_url || ''))
        const aud = this.cleanUrl(String(d.audio_url || ''))
        const clip = v ? v : img
        let durMs = 5000
        if (v) { try { durMs = await this.measureVideoDurationMs(v) } catch (e) { durMs = 5000 } }
        this.sceneDetail = { reference_image_url: img || clip, video_url: rawVid === null ? null : v, audio_url: aud }
        if (!Array.isArray(this.scenes) || this.scenes.length === 0) {
          this.scenes = [{ id: 1, title: '分镜1', description: '数字人视频', thumbnail: img || clip, clips: [{ url: clip, durationMs: durMs }], video_url: rawVid === null ? null : v, hasVideo: !!v, order_index: 1, audio_url: aud }]
        } else {
          const idx = this.activeSceneIndex
          const sc = this.scenes[idx] || {}
          sc.thumbnail = img || sc.thumbnail || clip
          sc.video_url = rawVid === null ? null : v
          sc.hasVideo = !!v
          sc.audio_url = aud
          sc.clips = [{ url: clip, durationMs: durMs }]
        }
        try { if (!(this.durationMap instanceof Map)) this.durationMap = new Map(); if (clip) this.durationMap.set(clip, durMs); if (v && clip !== v) this.durationMap.set(v, durMs) } catch (e) { void 0 }
        this.updateTimeMarkers()
        this.ensurePreviewFromScenes()
        this.$nextTick(() => { this.tryAttachHls() })
      } catch (e) { void 0 }
    },
    maybeLoadDigitalHumanForScene(idx) {
      try {
        const sc = Array.isArray(this.scenes) ? this.scenes[idx] : null
        const wid = String((sc && (sc.work_id || sc.workid || sc.id)) || '').trim()
        const conversationId = this.$route && this.$route.query && this.$route.query.conversationId
        if (!wid || !conversationId) return
        if (!(this.loadedWorkIdSet instanceof Set)) this.loadedWorkIdSet = new Set()
        if (this.loadedWorkIdSet.has(wid)) return
        this.loadedWorkIdSet.add(wid)
        this.loadDigitalHumanSingle(String(conversationId), wid)
      } catch (e) { void 0 }
    },
    startEditTitle() {
      this.editingTitle = this.projectTitle
      this.isEditingTitle = true
      this.$nextTick(() => {
        if (this.$refs.titleInput) this.$refs.titleInput.focus()
      })
    },
    async saveTitle() {
      if (!this.isEditingTitle) return
      const newTitle = this.editingTitle.trim()
      if (newTitle && newTitle !== this.projectTitle) {
        try {
          const token = (this.userStore && this.userStore.token) || ''
          const videoId = this.$route.params.id
          const res = await updateVideoTitle({ videoId, newTitle, token })
          let obj = null
          try { obj = JSON.parse(res) } catch (e) { obj = null }
          if (obj && (obj.code === 0 || obj.success)) {
            this.projectTitle = newTitle
            try { localStorage.setItem(`project:prompt:${videoId}`, newTitle) } catch (e) { void 0 }
            this.toastText = '标题修改成功'
            this.toastVisible = true
            setTimeout(() => { this.toastVisible = false }, 2000)
          } else {
            this.toastText = '修改失败: ' + (obj ? (obj.message || obj.msg) : '未知错误')
            this.toastVisible = true
            setTimeout(() => { this.toastVisible = false }, 2000)
          }
        } catch (e) {
          console.warn(e)
          this.toastText = '修改失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      }
      this.isEditingTitle = false
    },
    async ensureHlsLib() {
      return null
    },
    isM3u8(u) {
      return false
    },
    async attachHls(videoEl, src) {
      return null
    },
    async tryAttachHls() {
      return
    },
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
      // 禁止自动预取分镜详情：移除 IntersectionObserver 中的预取逻辑
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

    // 代理到通用工具，统一图片 URL 处理和失败判断
    cleanUrl(u) {
      let s = cleanUrlUtil(u)
      s = String(s || '').trim()
      s = s.replace(/[\s`'"]+/g, '')
      return s
    },
    isVideo(u) {
      const s = this.cleanUrl(u)
      if (!s) return false
      if (/^data:video\//i.test(s)) return true
      if (/^blob:/i.test(s)) {
        try { return this.durationMap instanceof Map && this.durationMap.has(s) } catch (e) { return true }
      }
      return /\.(mp4|webm|mov|mkv|avi|mpg|mpeg|ts|m4v)(\?|#|$)/i.test(s)
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
      const hasVideo = !!(scene && (scene.hasVideo || this.cleanUrl((scene && scene.video_url) || '')))
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
    isCropPendingScene(scene, index) {
      const set = this.cropPendingKeySet instanceof Set ? this.cropPendingKeySet : null
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
        const audioEl = this.$refs.previewAudio
        if (audioEl && audioEl.src && this.isPlaying) {
          try {
            if (el && !isNaN(el.currentTime)) {
              audioEl.currentTime = el.currentTime
            }
            const p = audioEl.play()
            if (p && p.catch) p.catch(() => {
              // 如果音频播放失败，尝试取消视频静音以确保有声音
              try { if (el) el.muted = false } catch (e) { void 0 }
            })
            const onAudioCanPlay = () => {
              try {
                audioEl.removeEventListener('canplay', onAudioCanPlay)
                const p2 = audioEl.play()
                if (p2 && p2.catch) p2.catch(() => {
                  try { if (el) el.muted = false } catch (e) { void 0 }
                })
              } catch (err) { /* no-op */ }
            }
            try { audioEl.addEventListener('canplay', onAudioCanPlay, { once: true }) } catch (err) { /* no-op */ }
          } catch (e) { void 0 }
        }

        // 即使没有视频元素（如纯图片分镜），也要保证音频播放，不提前返回
        // if (!el) return
        if (!this.isPlaying) return

        if (el) {
          const hasExternalAudio = !!(audioEl && audioEl.src)
          try { el.muted = hasExternalAudio ? true : false } catch (e) { void 0 }
          try { el.playsInline = true } catch (e) { void 0 }
          const src = this.cleanUrl(this.sceneDetail && this.sceneDetail.video_url || '')
          const isHls = this.isM3u8(src)
          const safePlay = () => {
            try {
              if (!this.isPlaying) return
              const p = el.play()
              if (p && p.catch) {
                p.catch(err => { if (!(err && err.name === 'AbortError')) console.warn('预览播放失败:', err) })
              }
            } catch (e) {
              console.warn('预览播放失败:', e)
            }
          }
          if (isHls) {
            if (this._hlsPreview && this._hlsPreviewUrl === src) {
              if (el.readyState >= 2) { requestAnimationFrame(safePlay) } else { const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }; try { el.addEventListener('canplay', onCanPlay, { once: true }) } catch (e) { void 0 } }
              return
            }
            try { this.attachHls(el, src).then(() => { if (el.readyState >= 2) { requestAnimationFrame(safePlay) } else { const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }; el.addEventListener('canplay', onCanPlay, { once: true }) } }) } catch (e) { void 0 }
            return
          }
          if (el.readyState >= 2 && (el.currentSrc || el.src)) {
            safePlay()
          } else {
            const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }
            try { el.addEventListener('canplay', onCanPlay, { once: true }) } catch (e) { void 0 }
            try { el.load() } catch (e) { void 0 }
          }
        }
      } catch (e) {
        console.warn('预览播放失败:', e)
      }
    },
    syncPreviewPlayback() {
      this.$nextTick(() => {
        const audioEl = this.$refs.previewAudio
        if (audioEl) {
          const scene = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
          const audioSrc = this.cleanUrl((this.sceneDetail && this.sceneDetail.audio_url) || (scene && scene.audio_url) || '')
          const audioExplicitNull = ((this.sceneDetail && this.sceneDetail.audio_url === null) || (scene && scene.audio_url === null))
          if (audioEl.src !== audioSrc && (audioSrc || audioEl.src)) {
            audioEl.src = audioSrc
            if (audioSrc) try { audioEl.load() } catch (e) { void 0 }
          }
          if (this.isPlaying && audioEl.src) {
            try {
              if (audioEl.paused) {
                const p = audioEl.play()
                if (p && p.catch) p.catch(() => {})
                try { audioEl.addEventListener('canplay', () => { try { const p2 = audioEl.play(); if (p2 && p2.catch) p2.catch(() => {}) } catch (err) { /* no-op */ } }, { once: true }) } catch (err) { /* no-op */ }
              }
            } catch (e) { void 0 }
          }
        }

        const el = this.$refs.previewVideo
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const firstClip = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
        if (!el) {
          const imgCandidate = this.cleanUrl((sc && sc.thumbnail) || (firstClip && firstClip.url) || '')
          if (imgCandidate && imgCandidate !== this.sceneDetail.reference_image_url) {
            this.sceneDetail = Object.assign({}, this.sceneDetail, { reference_image_url: imgCandidate, video_url: '' })
          }
          return
        }
        let src = this.cleanUrl(this.sceneDetail && this.sceneDetail.video_url || '')
        const candidate = this.cleanUrl((sc && sc.video_url) || (firstClip && firstClip.url) || '')
        const hasVideoCandidate = this.isVideo(candidate)
        if (!src && hasVideoCandidate) {
          this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: candidate })
          src = candidate
        }
        // 当前分镜没有视频时，确保清空 video_url 并使用图片
        if (src && !hasVideoCandidate) {
          const imgCandidate = this.cleanUrl((sc && sc.thumbnail) || (firstClip && firstClip.url) || '')
          this.sceneDetail = Object.assign({}, this.sceneDetail, { reference_image_url: imgCandidate, video_url: '' })
          src = ''
          try { el.pause(); el.currentTime = 0 } catch (e) { /* no-op */ }
          try { if (this._hlsPreview && this._hlsPreview.destroy) this._hlsPreview.destroy() } catch (e) { /* no-op */ }
          this._hlsPreview = null
          this._hlsPreviewUrl = ''
        }
        if (this._lastPreviewUrl === src) {
          return
        }
        this._lastPreviewUrl = src
        if (this.sceneDetail && this.sceneDetail.video_url) {
          try { el.pause(); el.currentTime = 0 } catch (e) { console.warn('预览暂停失败:', e) }
          // 不自动播放，等待用户点击播放按钮触发
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
      const audioEl = this.$refs.previewAudio
      if (audioEl) {
        try { audioEl.pause() } catch (e) { void 0 }
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
              const audio_url = this.cleanUrl(shot.audio_url || '')
              scenes.push({ id: id++, title, description, thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number, order_index: Number.isFinite(oi) ? oi : undefined, audio_url })
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
              const audio_url = this.cleanUrl(shot.audio_url || '')
              scenes.push({ id: id++, title, description, thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number: shot.scene_number, order_index: Number.isFinite(oi) ? oi : undefined, audio_url })
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
        const oi = Number(item.order_index || item.orderIndex)
        let idx = -1
        if (sceneKey) {
          idx = this.scenes.findIndex(sc => String(sc.scene_number || '').trim() === sceneKey)
          if (idx < 0 && shotOrder.length) idx = shotOrder.indexOf(sceneKey)
        }
        if (idx < 0 && Number.isFinite(oi) && oi > 0) {
          idx = this.scenes.findIndex(sc => Number(sc.order_index) === oi)
          if (idx < 0 && this._orderIndexMap instanceof Map) {
            const keyByOi = [...this._orderIndexMap.entries()].find(([k, v]) => Number(v) === oi)
            if (keyByOi) idx = this.scenes.findIndex(sc => String(sc.scene_number || '').trim() === String(keyByOi[0] || '').trim())
          }
        }
        if (idx < 0) continue
        if (idx >= 0 && idx < this.scenes.length) {
          const scene = this.scenes[idx]
          if (item.scene_script) {
            if (this.$set) this.$set(scene, 'scene_script', item.scene_script)
            else scene.scene_script = item.scene_script
            const script = item.scene_script
            const parts = []
            if (script.shot_title) parts.push(script.shot_title)
            if (script.visual_description) parts.push(script.visual_description)
            if (script.dialogue_or_narration) parts.push(`旁白：${script.dialogue_or_narration}`)
            scene.description = parts.join('\n')
          }
          const k = this.getSceneKey(this.scenes[idx] || {}, idx)
          if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
          this.updatingKeySet.add(k)
          const url = this.cleanUrl(item.video_url)
          const audioUrl = this.cleanUrl(item.audio_url || '')
          if (audioUrl) {
            if (this.$set) this.$set(scene, 'audio_url', audioUrl); else scene.audio_url = audioUrl
            if (idx === this.activeSceneIndex) {
               this.sceneDetail = Object.assign({}, this.sceneDetail, { audio_url: audioUrl })
               this.syncPreviewPlayback()
            }
          }
          const duration = Number(item.duration) ? Number(item.duration) * 1000 : undefined

          const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
          const existingVid = this.cleanUrl((scene && scene.video_url) || (first && first.url) || '')
          const alreadyProcessed = !!(scene && scene.hasVideo) && (!!existingVid && this.isVideo(existingVid))
          if (alreadyProcessed && existingVid === url) {
            if (Number.isFinite(oi) && oi > 0) {
              scene.order_index = oi
              if (!(this._orderIndexMap instanceof Map)) this._orderIndexMap = new Map()
              if (sceneKey) this._orderIndexMap.set(sceneKey, oi)
            }
            if (duration && Array.isArray(scene.clips) && scene.clips[0]) {
              scene.clips[0].durationMs = duration
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              this.durationMap.set(url, duration)
            }
            if (this.pendingVideoSet instanceof Set) this.pendingVideoSet.delete(k)
            try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
            anySucceeded = true
          } else {
            if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
            this.pendingVideoSet.add(k)
            this.queueVideoForScene(idx, url, Number.isFinite(oi) ? oi : undefined, sceneKey, k, duration)
            anySucceeded = true
          }
        }
      }
      this.refreshSidebarFromLocal()
      if (anySucceeded) {
        this.isConverting = false
        this.isVideoConverting = false
        const complete = Array.isArray(this.scenes) && this.scenes.length > 0 && this.scenes.every(sc => Number(sc.order_index) > 0)
        if (complete) {
          this.sortScenesByServerOrder()
          this.updateTimeMarkers()
        }
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
      const key = String(scene && scene.scene_number || '').trim()
      const oi = Number(scene && scene.order_index)
      let prefer = null
      if (key && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(key) || null
      if (!prefer && Number.isFinite(oi) && oi > 0 && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(`oi:${oi}`) || null
      const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const preferVideo = prefer ? this.cleanUrl(prefer.video_url || '') : ''
      const sceneVideo = this.cleanUrl((scene && scene.video_url) || '')
      const preferImage = prefer ? this.cleanUrl(prefer.reference_image_url || '') : ''
      if (preferVideo || sceneVideo) {
        baseUrl = preferVideo || sceneVideo
        const cached = (this.durationMap instanceof Map && baseUrl) ? Number(this.durationMap.get(baseUrl)) || 0 : 0
        duration = Number(first && first.durationMs) || cached || 5000
      } else {
        const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const activeImage = this.cleanUrl(this.sceneDetail.reference_image_url || '')
        const canUseActiveImage = active && scene === active && !!activeImage
        if (canUseActiveImage) {
          baseUrl = activeImage
          duration = Number(first && first.durationMs) || 5000
        } else {
          baseUrl = preferImage || this.cleanUrl((scene && scene.thumbnail) || '')
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
      let vidApi = this.cleanUrl(this.sceneDetail.video_url || '')
      if (!vidApi) {
        const arr = Array.isArray(this.scenes) ? this.scenes : []
        for (let i = 0; i < arr.length; i++) {
          const sc = arr[i] || {}
          const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
          const vurl = this.cleanUrl((first && first.url) || sc.video_url || '')
          if (vurl && this.isVideo(vurl)) { vidApi = vurl; break }
        }
      }
      if (imgApi || vidApi) {
        this.sceneDetail = { reference_image_url: imgApi, video_url: vidApi }
        return
      }
      const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const thumb = this.cleanUrl((active && active.thumbnail) || '')
      this.sceneDetail = { reference_image_url: thumb, video_url: '' }
    },
    async ensurePreviewFromScenes() {
      try {
        const apiImg = this.cleanUrl(this.sceneDetail.reference_image_url || '')
        const apiVid = this.cleanUrl(this.sceneDetail.video_url || '')
        if (apiImg || apiVid) {
          try {
            const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
            const audio = this.cleanUrl((sc && sc.audio_url) || '')
            if (audio && !this.sceneDetail.audio_url) {
              this.sceneDetail = Object.assign({}, this.sceneDetail, { audio_url: audio })
            }
          } catch (e) { /* no-op */ }
          this.syncPreviewPlayback()
          return
        }
        const arr = Array.isArray(this.scenes) ? this.scenes : []
        for (let i = 0; i < arr.length; i++) {
          const sc = arr[i] || {}
          const ref = this.cleanUrl(sc.thumbnail || '')
          const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
          const vid = this.cleanUrl((first && first.url) || sc.video_url || '')
          const audio = this.cleanUrl((sc && sc.audio_url) || '')
          if (ref || vid) {
            const refLocal = ref ? await this.getLocalUrl(ref) : ''
            const vidLocal = vid ? await this.getLocalUrl(vid) : ''
            const finalVideo = this.isVideo(vidLocal || vid) ? (vidLocal || vid) : ''
            this.sceneDetail = { reference_image_url: refLocal || ref, video_url: finalVideo, audio_url: audio }
            this.syncPreviewPlayback()
            break
          }
        }
      } catch (e) { void 0 }
    },
    prefetchFirstSceneAudioIfMissing() {
      try {
        const arr = Array.isArray(this.scenes) ? this.scenes : []
        if (!arr.length) return
        const first = arr[0] || {}
        const hasAudio = !!this.cleanUrl(first.audio_url || '')
        const isNullAudio = first && first.audio_url === null
        if (!hasAudio && !isNullAudio) {
          this.activeSceneIndex = 0
          this.fetchCurrentSceneDetail()
        }
      } catch (e) { void 0 }
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
      const scene = this.scenes[this.activeSceneIndex] || {}
      const k = this.getSceneKey(scene, this.activeSceneIndex)
      if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
      this.updatingKeySet.add(k)
      try {
        const refImg = this.cleanUrl(scene.thumbnail || '')
        const vurl = this.cleanUrl(scene.video_url || '')
        const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
        const vlocal = vurl ? await this.getLocalUrl(vurl) : ''
        const audio = this.cleanUrl(scene.audio_url || '')
        const finalVideo = this.isVideo(vlocal || vurl) ? (vlocal || vurl) : ''
        this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: finalVideo, audio_url: audio }
        this.syncPreviewPlayback()
      } catch (e) { void 0 } finally {
        try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
      }
    },
    async fetchAllSceneDetails() {
      try {
        const map = new Map()
        const idxMap = new Map()
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const key = String(sc.scene_number || '').trim()
          const oi = Number(sc.order_index)
          const refImg = this.cleanUrl(sc.thumbnail || '')
          const vurl = this.cleanUrl(sc.video_url || '')
          if (key) map.set(key, { video_url: vurl, reference_image_url: refImg })
          if (Number.isFinite(oi) && oi > 0) map.set(`oi:${oi}`, { video_url: vurl, reference_image_url: refImg })
          if (key && Number.isFinite(oi) && oi > 0) idxMap.set(key, oi)
        }
        this.imagesDetailMap = map
        if (idxMap.size > 0) {
          this._orderIndexMap = idxMap
          this.sortScenesByServerOrder()
          this.updateTimeMarkers()
        }
        const active = this.scenes[this.activeSceneIndex] || {}
        const refImg = this.cleanUrl(active.thumbnail || '')
        const vurl = this.cleanUrl(active.video_url || '')
        const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
        const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
        const finalVideo = this.isVideo(vLocal || vurl) ? (vLocal || vurl) : ''
        this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: finalVideo, audio_url: this.cleanUrl(active.audio_url || '') }
      } catch (e) { void 0 }
    },
    async pollStoryboardImagesDetail() {
      this.isConverting = false
      this.pollImagesActive = false
    },
    async updateLeftPreviewFromImagesDetail() {
      try {
        const map = new Map()
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const key = String(sc.scene_number || '').trim()
          const oi = Number(sc.order_index)
          const refImg = this.cleanUrl(sc.thumbnail || '')
          const vurl = this.cleanUrl(sc.video_url || '')
          if (key) map.set(key, { video_url: vurl, reference_image_url: refImg })
          if (Number.isFinite(oi) && oi > 0) map.set(`oi:${oi}`, { video_url: vurl, reference_image_url: refImg })
        }
        this.imagesDetailMap = map
        const activeIdx = this.activeSceneIndex
        const active = this.scenes[activeIdx] || {}
        const refImg = this.cleanUrl(active.thumbnail || '')
        const vurl = this.cleanUrl(active.video_url || '')
        const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
        const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
        const finalVideo = this.isVideo(vLocal || vurl) ? (vLocal || vurl) : ''
        this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: finalVideo, audio_url: this.cleanUrl(active.audio_url || '') }
      } catch (e) { void 0 }
    },
    async initLeftPanelScript() {
      try {
        const idx = this.activeSceneIndex
        const sc = this.scenes[idx] || {}
        const content = sc.scene_script && sc.scene_script.content ? sc.scene_script.content : null
        const title = content && content.shot_title ? String(content.shot_title).trim() : ''
        const visual = content && content.visual_description ? String(content.visual_description).trim() : ''
        if (title || visual) {
          const scriptObj = Object.assign({}, sc.scene_script || {})
          if (title) scriptObj.shot_title = title
          if (visual) scriptObj.visual_description = visual
          if (this.$set) this.$set(sc, 'scene_script', scriptObj); else sc.scene_script = scriptObj
        }
      } catch (e) { void 0 }
    },
    async prefetchInitialScenesDetails() {
      try {
        const count = Math.min(4, Array.isArray(this.scenes) ? this.scenes.length : 0)
        for (let i = 0; i < count; i++) {
          const sc = this.scenes[i] || {}
          const k = this.getSceneKey(sc, i)
          if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
          this.updatingKeySet.add(k)
          const refImg = this.cleanUrl(sc.thumbnail || '')
          const vurl = this.cleanUrl(sc.video_url || '')
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
          let dur = Number(sc.clips && sc.clips[0] && sc.clips[0].durationMs) || 0
          if (!dur) {
            dur = vurl ? await this.measureVideoDurationMs(vurl) : 5000
          }
          if (!Array.isArray(sc.clips) || !sc.clips.length) sc.clips = [{ url: vLocal || vurl || refLocal || refImg, durationMs: dur }]
          if (vurl) {
            if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
            this.durationMap.set(vurl, dur)
            if (vLocal) this.durationMap.set(vLocal, dur)
          }
          this.clearClipErrorsForIndex(i)
          if (i === this.activeSceneIndex) {
            const finalVideo = this.isVideo(vLocal || vurl) ? (vLocal || vurl) : ''
            this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: finalVideo }
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
        const sc = this.scenes[i] || {}
        const k = this.getSceneKey(sc, i)
        if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
        this.updatingKeySet.add(k)
        const refImg = this.cleanUrl(sc.thumbnail || '')
        const vurl = this.cleanUrl(sc.video_url || '')
        const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
        const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
        let dur = Number(sc.clips && sc.clips[0] && sc.clips[0].durationMs) || 0
        if (!dur) dur = vurl ? await this.measureVideoDurationMs(vurl) : 5000
        if (!Array.isArray(sc.clips) || !sc.clips.length) sc.clips = [{ url: vLocal || vurl || refLocal || refImg, durationMs: dur }]
        if (vurl) {
          if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
          this.durationMap.set(vurl, dur)
          if (vLocal) this.durationMap.set(vLocal, dur)
        }
        this.clearClipErrorsForIndex(i)
        if (i === this.activeSceneIndex) {
          this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: vLocal || vurl || this.sceneDetail.video_url }
        }
        try { this.updatingKeySet && this.updatingKeySet.delete && this.updatingKeySet.delete(k) } catch (err) { void 0 }
      } catch (e) { void 0 }
    },
    async loadServerOrderIndex() {
      try {
        const map = new Map()
        const arr = Array.isArray(this.scenes) ? this.scenes : []
        for (let i = 0; i < arr.length; i++) {
          const sc = arr[i] || {}
          const key = String(sc.scene_number || '').trim()
          const idx = Number(sc.order_index || i + 1)
          if (key) map.set(key, idx)
        }
        this._orderIndexMap = map
        this.sortScenesByServerOrder()
        this.updateTimeMarkers()
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
      return Math.max(3, actual)
    },
    getActualSceneSeconds(scene) {
      const c = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const key = String(scene && scene.scene_number || '').trim()
      const oi = Number(scene && scene.order_index)
      let prefer = null
      if (key && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(key) || null
      if (!prefer && Number.isFinite(oi) && oi > 0 && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(`oi:${oi}`) || null
      const preferVideo = prefer ? this.cleanUrl(prefer.video_url || '') : ''
      const urlScene = this.cleanUrl((scene && scene.video_url) || '')
      const url = preferVideo || urlScene
      const cached = (this.durationMap instanceof Map && url) ? Number(this.durationMap.get(url)) || 0 : 0
      const durMs = Number(c && c.durationMs) || cached
      if (url && Number(durMs)) {
        return Math.max(0, Number(durMs) / 1000)
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
        if (this.durationMap instanceof Map) {
          const cached = Number(this.durationMap.get(url)) || 0
          if (cached > 0) return cached
        }
        const s = this.cleanUrl(url)
        if (this.isM3u8(s)) {
          try {
            const res = await fetch(s)
            const text = await res.text()
            let sum = 0
            const re = /#EXTINF:([0-9.]+)/g
            let m
            while ((m = re.exec(text)) !== null) {
              const v = parseFloat(m[1] || '0')
              if (!isNaN(v)) sum += v
            }
            if (sum > 0) return Math.max(500, Math.round(sum * 1000))
          } catch (e) { void 0 }
        }
        const el = document.createElement('video')
        el.preload = 'metadata'
        try { el.muted = true } catch (e) { void 0 }
        el.src = s
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
    async updateActiveSceneDurationFromVideo() {
      try {
        const idx = this.activeSceneIndex
        const scene = this.scenes[idx] || {}
        const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
        const url = this.cleanUrl((first && first.url) || (scene && scene.video_url) || '')
        if (!url) return
        const dur = await this.measureVideoDurationMs(url)
        if (Number(dur)) {
          const prevMs = Number(first && first.durationMs) || 0
          const finalMs = (dur === 5000 && prevMs > 0) ? prevMs : dur
          if (!Array.isArray(scene.clips) || !scene.clips.length) {
            scene.clips = [{ url, durationMs: finalMs }]
          } else {
            scene.clips[0].durationMs = finalMs
          }
          if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
          this.durationMap.set(url, finalMs)
          this.updateTimeMarkers()
          try {
            const projectId = this.$route.params.id
            localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes))
          } catch (e) { /* no-op */ }
        }
      } catch (e) { void 0 }
    },
    queueVideoForScene(index, url, orderIndex, sceneKey, pendingKey, duration) {
      const task = { index, url: this.cleanUrl(url), orderIndex, sceneKey, pendingKey, duration }
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
        let dur = task.duration
        if (!dur) {
          dur = this.isVideo(url) ? await this.measureVideoDurationMs(url) : 5000
        }
        if (idx >= 0 && idx < this.scenes.length) {
          const scene = this.scenes[idx]
          scene.clips = [{ url: vLocal || url, durationMs: dur }]
          scene.hasVideo = true
          scene.video_url = vLocal || url
          if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
          this.durationMap.set(url, dur)
          if (vLocal) this.durationMap.set(vLocal, dur)

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
    async startVoiceAudition() {
      try {
        if (this.isVoiceAuditionPlaying) { this.stopVoiceAudition(); return }
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { void 0 } return }
        this.toastText = '收到，正在准备'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 1500)
        this.isVoiceLoading = true
        const text = String(this.voiceScript || '').trim() || String((this.scenes[this.activeSceneIndex] && this.scenes[this.activeSceneIndex].scene_script && this.scenes[this.activeSceneIndex].scene_script.dialogue_or_narration) || (this.scenes[this.activeSceneIndex] && this.scenes[this.activeSceneIndex].scene_script && this.scenes[this.activeSceneIndex].scene_script.visual_description) || '').trim() || '今天很适合吃点好吃的，喝点小酒，快来找我玩吧！'
        const languageType = this.voiceLanguage || 'Chinese'
        const voice = this.voiceName || 'cherry'

        const cacheKey = `ali-tts-cache:${voice}:${languageType}:${text}`
        try {
          const cachedUrl = localStorage.getItem(cacheKey)
          if (cachedUrl) {
            this.isVoiceLoading = false
            this.voiceAudioUrl = this.cleanUrl(cachedUrl)
            const el = new Audio(this.voiceAudioUrl)
            el.addEventListener('ended', () => { this.isVoiceAuditionPlaying = false })
            this.voiceAudioEl = el
            try { await el.play(); this.isVoiceAuditionPlaying = true } catch (e) { this.isVoiceAuditionPlaying = false }
            return
          }
        } catch (e) { /* no-op */ }

        const submit = await aliTtsSubmit({ text, languageType, voice, token })
        const taskId = (submit && submit.task_id) || (submit && submit.data && submit.data.task_id) || (typeof submit === 'string' ? (() => { try { const o = JSON.parse(submit); return o && (o.task_id || (o.data && o.data.task_id)) } catch { return '' } })() : '')
        if (!taskId) { this.isVoiceLoading = false; this.toastText = '语音任务创建失败'; this.toastVisible = true; setTimeout(() => { this.toastVisible = false }, 2000); return }
        this.voiceAuditionTaskId = taskId
        if (this.voicePollTimer) { try { clearInterval(this.voicePollTimer) } catch (e) { void 0 } this.voicePollTimer = null }
        this.voicePollTimer = setInterval(async () => {
          try {
            const q = await aliTtsQuery({ taskId, token })
            const obj = typeof q === 'string' ? (() => { try { return JSON.parse(q) } catch { return null } })() : q
            const status = obj && obj.status
            const url = obj && obj.result_url
            if (status === 'SUCCEEDED' && url) {
              try { clearInterval(this.voicePollTimer) } catch (e) { void 0 }
              this.voicePollTimer = null
              this.isVoiceLoading = false
              try { localStorage.setItem(cacheKey, this.cleanUrl(url)) } catch (e) { /* no-op */ }
              this.voiceAudioUrl = this.cleanUrl(url)
              const el = new Audio(this.voiceAudioUrl)
              el.addEventListener('ended', () => { this.isVoiceAuditionPlaying = false })
              this.voiceAudioEl = el
              try { await el.play(); this.isVoiceAuditionPlaying = true } catch (e) { this.isVoiceAuditionPlaying = false }
            }
          } catch (e) { /* no-op */ }
        }, 3000)
      } catch (e) {
        this.isVoiceLoading = false
        this.toastText = '试听失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    handleToneSelect(selected) {
      this.voiceName = selected.voiceName
      this.voiceLanguage = selected.language
      this.supportedLanguages = Array.isArray(selected.supportedLanguages) ? selected.supportedLanguages : ((selected.language && [selected.language]) || [])
      this.voiceGender = this.toZhGender(selected.gender) || this.voiceGender
      this.voiceAge = selected.age || this.voiceAge
      this.voiceStyle = selected.style || this.voiceStyle
    },
    toZhGender(g) {
      const s = String(g || '').trim().toLowerCase()
      const map = {
        'male': '男性', 'man': '男性', 'boy': '男性',
        'female': '女性', 'woman': '女性', 'girl': '女性',
        'neutral': '中性', 'unknown': '未知'
      }
      return map[s] || g
    },
    toZhLanguage(lang) {
      const s = String(lang || '').trim().toLowerCase()
      const map = {
        'chinese': '中文', 'zh': '中文', 'zh-cn': '中文(简体)', 'zh-tw': '中文(繁体)', 'cn': '中文', 'yue': '粤语', 'cantonese': '粤语',
        'english': '英语', 'en': '英语',
        'japanese': '日语', 'ja': '日语',
        'korean': '韩语', 'ko': '韩语',
        'french': '法语', 'fr': '法语',
        'german': '德语', 'de': '德语',
        'spanish': '西班牙语', 'es': '西班牙语',
        'italian': '意大利语', 'it': '意大利语',
        'russian': '俄语', 'ru': '俄语',
        'portuguese': '葡萄牙语', 'pt': '葡萄牙语',
        'hindi': '印地语', 'hi': '印地语',
        'arabic': '阿拉伯语', 'ar': '阿拉伯语'
      }
      return map[s] || lang
    },
    stopVoiceAudition() {
      try {
        if (this.voiceAudioEl) { try { this.voiceAudioEl.pause() } catch (e) { void 0 } this.voiceAudioEl = null }
        if (this.voicePollTimer) { try { clearInterval(this.voicePollTimer) } catch (e) { void 0 } this.voicePollTimer = null }
      } catch (e) { void 0 }
      this.isVoiceAuditionPlaying = false
    },
    triggerVoiceFileUpload() {
      if (this.$refs.voiceFileInput) this.$refs.voiceFileInput.click()
    },
    onVoiceFileSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      try {
        const url = URL.createObjectURL(file)
        this.voiceAudioUrl = this.cleanUrl(url)
        const el = new Audio(this.voiceAudioUrl)
        el.addEventListener('ended', () => { this.isVoiceAuditionPlaying = false })
        this.voiceAudioEl = el
        this.isVoiceAuditionPlaying = false
        const idx = this.activeSceneIndex
        const sc = Array.isArray(this.scenes) ? this.scenes[idx] : null
        if (sc) { if (this.$set) this.$set(sc, 'audio_url', this.voiceAudioUrl); else sc.audio_url = this.voiceAudioUrl }
        this.sceneDetail = Object.assign({}, this.sceneDetail, { audio_url: this.voiceAudioUrl })
        this.syncPreviewPlayback()
      } catch (err) { /* no-op */ }
      e.target.value = ''
    },
    async applyVoiceover() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { void 0 } return }
        const sc = this.scenes[this.activeSceneIndex] || {}
        const shotId = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const audioUrl = this.cleanUrl(this.voiceAudioUrl || '')
        if (!audioUrl) { this.toastText = '请先试听生成语音'; this.toastVisible = true; setTimeout(() => { this.toastVisible = false }, 2000); return }
        const text = await uploadStoryboardVoiceoverAudio({ videoId, shotId, audioUrl, token })
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const ok = !!(obj && obj.code === 0 && obj.data && obj.data.success === true)
        if (ok) {
          this.toastText = '应用成功'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 1500)
        } else {
          this.toastText = '应用失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      } catch (e) {
        this.toastText = '应用失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    closeSuccessModal() {
      this.successModalVisible = false
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
      this.fetchCurrentSceneDetail()
      try {
        const convId = this.$route.query && this.$route.query.conversationId
        if (convId) {
          const sc = this.scenes[index] || {}
          const wid = String((sc.work_id || sc.workid || sc.id || '')).trim()
          if (wid) { this.loadDigitalHumanSingle(String(convId), wid) }
        }
      } catch (e) { void 0 }
      if (this.isPlaying) {
        this.$nextTick(() => {
          this.syncPreviewPlayback()
          this.startPlayback()
        })
      }
    },
    async onLipSyncTaskCreated(taskId, audioUrl) {
      if (this.isSceneLipSyncMode && taskId) {
        const wid = String(this.lipSyncWorkId || '').trim()
        this.$router.push({ name: 'DigitalVideo', params: {}, query: Object.assign({}, this.$route.query, { taskId, workId: wid }) })
      }

      try { if (this.digitalVideoQueryInterval) { clearInterval(this.digitalVideoQueryInterval); this.digitalVideoQueryInterval = null } } catch (e) { void 0 }
      if (!taskId) return
      this.showLipSyncView = false
      this.isVideoGenerating = true
      let idx = this.activeSceneIndex
      try {
        const wid = String(this.lipSyncWorkId || '').trim()
        if (wid && Array.isArray(this.scenes) && this.scenes.length) {
          for (let i = 0; i < this.scenes.length; i++) {
            const sc = this.scenes[i] || {}
            const swid = String((sc.work_id || sc.workid || sc.id || sc.workId || '')).trim()
            if (swid === wid) { idx = i; break }
          }
          this.activeSceneIndex = idx
        }
      } catch (e) { void 0 }
      const sc = this.scenes[idx] || {}
      const key = this.getSceneKey(sc, idx)

      // 立即更新音频（如果有）以便预览
      if (audioUrl) {
        const aUrl = this.cleanUrl(audioUrl)
        if (sc) {
           if (this.$set) this.$set(sc, 'audio_url', aUrl); else sc.audio_url = aUrl
        }
        this.sceneDetail = Object.assign({}, this.sceneDetail, { audio_url: aUrl })
        this.$nextTick(() => { this.syncPreviewPlayback() })
      }

      if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
      this.pendingVideoSet.add(key)
      this.pendingVideoSet = new Set(this.pendingVideoSet)
      const token = (this.userStore && this.userStore.token) || ''
      let remaining = 20
      const poll = async () => {
        try {
          const resp = await digitalhumanQuery({ taskId, token })
          const obj = typeof resp === 'string' ? (() => { try { return JSON.parse(resp) } catch { return null } })() : resp
          const data = obj && obj.data
          const status = (obj && obj.status) || (data && data.task_status)
          const vid = data && data.generated_video_url
          const img = data && data.image_url
          const aud = data && data.audio_url
          const s = String(status || '').toLowerCase()

          const finish = (isSuccess) => {
            if (this.digitalVideoQueryInterval) { try { clearInterval(this.digitalVideoQueryInterval) } catch (e) { void 0 } this.digitalVideoQueryInterval = null }
            if (this.pendingVideoSet instanceof Set) {
              this.pendingVideoSet.delete(key)
              this.pendingVideoSet = new Set(this.pendingVideoSet)
            }
            if (this.pendingVideoSet.size === 0) this.isVideoGenerating = false
          }

          if (s === 'failed') {
            // 失败：移除骨架并恢复失败前的渲染类型
            finish(false)
            // 检查当前是否有有效的视频URL，如果没有，则强制重置为图片模式，避免 hasVideo 状态不一致
            const currentVideoUrl = this.cleanUrl(sc && sc.video_url || '')
            if (!currentVideoUrl) {
              const img = this.cleanUrl((sc && sc.thumbnail) || ((sc && sc.clips && sc.clips[0] && sc.clips[0].url) || ''))
              // 确保 sc 对象也被更新，避免状态不一致
              if (sc) {
                if (this.$set) {
                  this.$set(sc, 'video_url', '')
                  this.$set(sc, 'hasVideo', false)
                } else {
                  sc.video_url = ''
                  sc.hasVideo = false
                }
                // 保留 audio_url (可能用户刚上传的)
            }
            this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: '', reference_image_url: img })
            this.$nextTick(() => { this.syncPreviewPlayback() })
          }
          this.toastText = '生成失败'
          this.toastVisible = true
          this.previewImgErrored = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else if ((s === 'succeeded' || s === 'completed') && (vid || img)) {
            const videoUrl = this.cleanUrl(String(vid || ''))
            const imageUrl = this.cleanUrl(String(img || ''))
            const audioUrl = this.cleanUrl(String(aud || ''))
            const clipUrl = videoUrl || imageUrl
            let durMs = 5000
            if (videoUrl) { try { durMs = await this.measureVideoDurationMs(videoUrl) } catch (e) { durMs = 5000 } }
            const targetSc = this.scenes[idx] || {}
            targetSc.thumbnail = imageUrl || targetSc.thumbnail || clipUrl
            targetSc.video_url = videoUrl
            targetSc.hasVideo = !!videoUrl
            targetSc.audio_url = audioUrl
            targetSc.clips = [{ url: clipUrl, durationMs: durMs }]
            try { if (!(this.durationMap instanceof Map)) this.durationMap = new Map(); if (clipUrl) this.durationMap.set(clipUrl, durMs); if (videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs) } catch (e) { void 0 }
            if (this.activeSceneIndex === idx) {
              this.sceneDetail = { reference_image_url: imageUrl || '', video_url: videoUrl, audio_url: audioUrl }
              this.updateTimeMarkers()
              this.ensurePreviewFromScenes && this.ensurePreviewFromScenes()
              this.$nextTick(() => { this.tryAttachHls && this.tryAttachHls() })
            }
            finish(true)
          } else {
            remaining -= 1
            if (remaining <= 0) {
              finish(false)
              this.toastText = '生成超时，请稍后重试'
              this.toastVisible = true
              setTimeout(() => { this.toastVisible = false }, 2000)
            }
          }
        } catch (e) { /* no-op */ }
      }
      poll()
      this.digitalVideoQueryInterval = setInterval(poll, 30000)
    },
    // 新增：空白分镜与图片上传相关方法
    isBlankScene(scene) {
      return !!(scene && scene.isBlank)
    },
    addBlankScene(index) {
      const newScene = {
        id: Date.now(), // temporary ID
        isBlank: true,
        title: '空白分镜',
        description: '',
        durationMs: 5000,
        thumbnail: '',
        clips: [],
        video_url: '',
        audio_url: '',
        order_index: this.scenes.length + 1
      }
      this.scenes.splice(index + 1, 0, newScene)
      // Re-index orders if necessary
      this.scenes.forEach((sc, i) => { sc.order_index = i + 1 })
      this.activeSceneIndex = index + 1
      this.updateTimeMarkers()
    },
    triggerUpload(index) {
      this.activeSceneIndex = index
      if (this.$refs.digitalHumanImageInput) {
        this.$refs.digitalHumanImageInput.click()
      }
    },
    handleDigitalHumanImageSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.validateAndProcessImage(file)
      e.target.value = ''
    },
    validateAndProcessImage(file) {
      if (!file.type.startsWith('image/')) {
        this.toastText = '请选择图片文件'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
        return
      }
      const url = URL.createObjectURL(file)
      this.selectedImageFile = file
      this.selectedImageUrl = url
      this.cropRatio = 'free'
      this.showImageCropModal = true
    },
    // 裁剪逻辑
    onCropImageLoad(e) {
      this.computeDisplayRect()
      this.initSelection()
    },
    computeDisplayRect() {
      try {
        const imgEl = this.$refs.cropImage
        const previewEl = this.$refs.cropPreview
        if (!imgEl || !previewEl) return
        const contW = previewEl.clientWidth
        const contH = previewEl.clientHeight
        const nW = imgEl.naturalWidth || imgEl.width
        const nH = imgEl.naturalHeight || imgEl.height
        const imgRatio = nW / nH
        const contRatio = contW / contH
        let dispW, dispH
        if (contRatio > imgRatio) {
          dispH = contH
          dispW = Math.round(dispH * imgRatio)
        } else {
          dispW = contW
          dispH = Math.round(dispW / imgRatio)
        }
        const left = Math.round((contW - dispW) / 2)
        const top = Math.round((contH - dispH) / 2)
        this.displayRect = { left, top, width: dispW, height: dispH }
      } catch (e) { /* no-op */ }
    },
    initSelection() {
      const r = String(this.cropRatio || '').trim()
      if (!this.displayRect) return
      const W = this.displayRect.width
      const H = this.displayRect.height
      let w, h
      if (!r || r === 'free') {
        const size = Math.round(Math.min(W, H) * 0.8)
        w = size
        h = size
      } else {
        const parts = r.split(':')
        const rw = parseFloat(parts[0]) || 1
        const rh = parseFloat(parts[1]) || 1
        const ratio = rw / rh
        if (W / H > ratio) {
          h = H
          w = Math.round(h * ratio)
        } else {
          w = W
          h = Math.round(w / ratio)
        }
      }
      const x = Math.round(this.displayRect.left + (W - w) / 2)
      const y = Math.round(this.displayRect.top + (H - h) / 2)
      this.cropSelW = w
      this.cropSelH = h
      this.cropSelX = x
      this.cropSelY = y
    },
    onSelectMouseDown(e) {
      this.isDraggingSel = true
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.dragStartSelX = this.cropSelX
      this.dragStartSelY = this.cropSelY
    },
    onHandleMouseDown(dir, e) {
      this.isResizingSel = true
      this.resizeDir = String(dir || '')
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.dragStartSelX = this.cropSelX
      this.dragStartSelY = this.cropSelY
      this.dragStartW = this.cropSelW
      this.dragStartH = this.cropSelH
    },
    onMouseMove(e) {
      if (!this.displayRect) return
      if (this.isResizingSel) {
        this.resizeSelection(e)
        return
      }
      if (!this.isDraggingSel) return
      const dx = e.clientX - this.dragStartX
      const dy = e.clientY - this.dragStartY
      let nx = this.dragStartSelX + dx
      let ny = this.dragStartSelY + dy
      const minX = this.displayRect.left
      const minY = this.displayRect.top
      const maxX = this.displayRect.left + this.displayRect.width - this.cropSelW
      const maxY = this.displayRect.top + this.displayRect.height - this.cropSelH
      if (nx < minX) nx = minX
      if (ny < minY) ny = minY
      if (nx > maxX) nx = maxX
      if (ny > maxY) ny = maxY
      this.cropSelX = nx
      this.cropSelY = ny
    },
    onMouseUp() {
      this.isDraggingSel = false
      this.isResizingSel = false
    },
    resizeSelection(e) {
      const rStr = String(this.cropRatio || '').trim()
      if (!this.displayRect || !rStr || rStr === 'free') return
      const parts = rStr.split(':')
      const rw = parseFloat(parts[0]) || 1
      const rh = parseFloat(parts[1]) || 1
      const ratio = rw / rh
      const dx = e.clientX - this.dragStartX
      const dy = e.clientY - this.dragStartY
      const minX = this.displayRect.left
      const minY = this.displayRect.top
      const maxXEdge = this.displayRect.left + this.displayRect.width
      const maxYEdge = this.displayRect.top + this.displayRect.height

      let w = this.dragStartW
      let h = this.dragStartH
      let x = this.dragStartSelX
      let y = this.dragStartSelY

      const minW = 20
      const minH = Math.round(minW / ratio)

      if (this.resizeDir === 'se') {
        w = this.dragStartW + dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        // clamp by right and bottom edges
        const maxWByRight = maxXEdge - this.dragStartSelX
        const maxHByBottom = maxYEdge - this.dragStartSelY
        const maxWByBottom = Math.floor(maxHByBottom * ratio)
        const maxWAllowed = Math.min(maxWByRight, maxWByBottom)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = this.dragStartSelX
        y = this.dragStartSelY
      } else if (this.resizeDir === 'sw') {
        w = this.dragStartW - dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorX = this.dragStartSelX + this.dragStartW
        const maxWByLeft = anchorX - minX
        const maxHByBottom = maxYEdge - this.dragStartSelY
        const maxWByBottom = Math.floor(maxHByBottom * ratio)
        const maxWAllowed = Math.min(maxWByLeft, maxWByBottom)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = anchorX - w
        y = this.dragStartSelY
      } else if (this.resizeDir === 'ne') {
        w = this.dragStartW + dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorY = this.dragStartSelY + this.dragStartH
        const maxWByRight = maxXEdge - this.dragStartSelX
        const maxHByTop = anchorY - minY
        const maxWByTop = Math.floor(maxHByTop * ratio)
        const maxWAllowed = Math.min(maxWByRight, maxWByTop)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = this.dragStartSelX
        y = anchorY - h
      } else if (this.resizeDir === 'nw') {
        w = this.dragStartW - dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorX = this.dragStartSelX + this.dragStartW
        const anchorY = this.dragStartSelY + this.dragStartH
        const maxWByLeft = anchorX - minX
        const maxHByTop = anchorY - minY
        const maxWByTop = Math.floor(maxHByTop * ratio)
        const maxWAllowed = Math.min(maxWByLeft, maxWByTop)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = anchorX - w
        y = anchorY - h
      }

      // final clamp inside displayRect
      if (x < minX) x = minX
      if (y < minY) y = minY
      if (x + w > maxXEdge) x = maxXEdge - w
      if (y + h > maxYEdge) y = maxYEdge - h

      this.cropSelX = Math.round(x)
      this.cropSelY = Math.round(y)
      this.cropSelW = Math.round(w)
      this.cropSelH = Math.round(h)
    },
    cropToRatio(objectUrl, ratioName) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          try {
            const nW = img.naturalWidth || img.width
            const nH = img.naturalHeight || img.height
            let targetW = nW
            let targetH = nH
            if (ratioName && ratioName !== 'free') {
              const parts = ratioName.split(':')
              const rw = parseFloat(parts[0]) || 1
              const rh = parseFloat(parts[1]) || 1
              const ratio = rw / rh
              const imgRatio = nW / nH
              let cropW, cropH
              let startX, startY
              if (this.displayRect && this.cropSelW && this.cropSelH) {
                const scaleX = nW / this.displayRect.width
                const scaleY = nH / this.displayRect.height
                const selRelX = this.cropSelX - this.displayRect.left
                const selRelY = this.cropSelY - this.displayRect.top
                cropW = Math.round(this.cropSelW * scaleX)
                cropH = Math.round(this.cropSelH * scaleY)
                startX = Math.round(selRelX * scaleX)
                startY = Math.round(selRelY * scaleY)
              } else {
                if (imgRatio > ratio) {
                  cropH = nH
                  cropW = Math.round(cropH * ratio)
                } else {
                  cropW = nW
                  cropH = Math.round(cropW / ratio)
                }
                startX = Math.floor((nW - cropW) / 2)
                startY = Math.floor((nH - cropH) / 2)
              }
              if (startX < 0) startX = 0
              if (startY < 0) startY = 0
              if (startX + cropW > nW) cropW = nW - startX
              if (startY + cropH > nH) cropH = nH - startY
              targetW = cropW
              targetH = cropH
              const canvas = document.createElement('canvas')
              canvas.width = targetW
              canvas.height = targetH
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, targetW, targetH)
              canvas.toBlob(blob => {
                if (!blob) { reject(new Error('toBlob失败')); return }
                resolve(new File([blob], 'crop.png', { type: 'image/png' }))
              }, 'image/png', 0.92)
              return
            }
            let cropW = nW
            let cropH = nH
            let startX = 0
            let startY = 0
            if (this.displayRect && this.cropSelW && this.cropSelH) {
              const scaleX = nW / this.displayRect.width
              const scaleY = nH / this.displayRect.height
              const selRelX = (this.cropSelX - this.displayRect.left)
              const selRelY = (this.cropSelY - this.displayRect.top)
              cropW = Math.round(this.cropSelW * scaleX)
              cropH = Math.round(this.cropSelH * scaleY)
              startX = Math.round(selRelX * scaleX)
              startY = Math.round(selRelY * scaleY)
              if (startX < 0) startX = 0
              if (startY < 0) startY = 0
              if (startX + cropW > nW) cropW = nW - startX
              if (startY + cropH > nH) cropH = nH - startY
              targetW = cropW
              targetH = cropH
            }
            const canvas = document.createElement('canvas')
            canvas.width = targetW
            canvas.height = targetH
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, targetW, targetH)
            canvas.toBlob(blob => {
              if (!blob) { reject(new Error('toBlob失败')); return }
              resolve(new File([blob], 'original.png', { type: 'image/png' }))
            }, 'image/png', 0.92)
          } catch (err) { reject(err) }
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = objectUrl
      })
    },
    cancelImageCrop() {
      this.showImageCropModal = false
      this.selectedImageFile = null
      this.selectedImageUrl = null
      this.cropRatio = ''
    },
    async applyImageCrop() {
      try {
        this.toastText = '正在处理...'
        this.toastVisible = true
        const blob = await this.cropToRatio(this.selectedImageUrl, this.cropRatio)
        const file = new File([blob], 'cropped.png', { type: 'image/png' })
        const token = (this.userStore && this.userStore.token) || ''
        const conversationId = (this.$route.query && this.$route.query.conversationId) || '286'
        const res = await uploadDigitalHumanWorkImage({ conversationId, imageFile: file, token })
        if (res && res.code === 0 && res.data && res.data.success) {
           const imageUrl = this.cleanUrl(res.data.image_url)
           const workId = res.data.work_id
           const sc = this.scenes[this.activeSceneIndex]
           if (sc) {
             sc.isBlank = false
             sc.thumbnail = imageUrl
             sc.work_id = workId
             sc.clips = [{ url: imageUrl, durationMs: 5000 }]
             this.sceneDetail = Object.assign({}, this.sceneDetail, { reference_image_url: imageUrl, video_url: '' })
             this.ensurePreviewFromScenes()
           }
           this.showImageCropModal = false
           this.toastText = '上传成功'
           setTimeout(() => { this.toastVisible = false }, 1500)
        } else {
           throw new Error((res && res.message) || 'Upload failed')
        }
      } catch (e) {
        console.error(e)
        this.toastText = '上传失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    async triggerObjectDetection(workId) {
      if (!workId) return
      try {
        const token = (this.userStore && this.userStore.token) || ''
        const conversationId = (this.$route.query && this.$route.query.conversationId) || '286'
        const res = await objectDetectionByWork({ conversationId, workId, token })
        if (res && res.success) {
           const sc = this.scenes[this.activeSceneIndex]
           if (sc) {
             sc.mask_url = res.maskurl
           }
        }
      } catch (e) {
        console.error('Object detection error:', e)
      }
    },
    async generateVideo() {
      try {
        const sc = this.scenes[this.activeSceneIndex]
        if (!sc || !sc.work_id) {
          this.toastText = '请先上传数字人图片'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        if (!sc.audio_url) {
          this.toastText = '请先添加配音'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }

        this.toastText = '正在生成视频...'
        this.toastVisible = true

        const token = (this.userStore && this.userStore.token) || ''
        const conversationId = (this.$route.query && this.$route.query.conversationId) || '286'
        const workId = sc.work_id
        const audioUrl = sc.audio_url
        if (!sc.mask_url) {
           await this.triggerObjectDetection(workId)
        }
        const finalMaskUrl = sc.mask_url || sc.thumbnail
        const res = await digitalhumanGenByWork({ conversationId, workId, audioUrl, maskUrls: finalMaskUrl, maskUrlsAlt: 'source', token })
        if (res && res.success === false) {
           this.toastText = String(res.message || '生成失败')
           this.toastVisible = true
           setTimeout(() => { this.toastVisible = false }, 2000)
           return
        }
        if (res && res.success) {
           this.toastText = '视频生成任务已提交'
           setTimeout(() => { this.toastVisible = false }, 1500)
           if (res.task_id) {
             this.onLipSyncTaskCreated(res.task_id)
           }
        } else {
           throw new Error((res && res.message) || 'Generation failed')
        }
      } catch (e) {
        console.error(e)
        this.toastText = '生成失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    openVoiceTab(index) {
      this.activeSceneIndex = index
      this.activeTab = 'voice'
      const sc = this.scenes[index]
      if (sc && sc.work_id) {
        this.triggerObjectDetection(sc.work_id)
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

      // 计算起始场景索引和累积时间
      let acc0 = 0
      let idx0 = 0
      for (let i = 0; i < durations.length; i++) {
        const next = acc0 + durations[i]
        if (priorMs < next) { idx0 = i; break }
        acc0 = next
        idx0 = i
      }

      // 确保 activeSceneIndex 正确，以便 syncPreviewPlayback 使用正确的场景
      if (this.activeSceneIndex !== idx0) {
        this.activeSceneIndex = idx0
      }
      this.maybeLoadDigitalHumanForScene(idx0)

      // 立即设置并播放音频（同步操作，确保用户手势生效）
      try {
        const audioEl = this.$refs.previewAudio
        if (audioEl) {
          const sc0 = this.scenes[idx0] || {}
          const a0 = this.cleanUrl(sc0.audio_url || (this.sceneDetail && this.sceneDetail.audio_url) || '')
          if (a0) {
            if (audioEl.src !== a0) {
              audioEl.src = a0
              try { audioEl.load() } catch (e) { void 0 }
            }
            const t0 = Math.max(0, (priorMs - acc0) / 1000)
            try { audioEl.currentTime = t0 } catch (e) { void 0 }
            try { audioEl.muted = false; audioEl.volume = 1 } catch (e) { void 0 }
            
            const readyPlay = () => { 
              try { 
                const p = audioEl.play()
                if (p && p.catch) p.catch(() => {}) 
              } catch (e) { void 0 } 
            }

            if (audioEl.readyState >= 2) {
              readyPlay()
            } else {
              const onCanPlay = () => { 
                try { audioEl.removeEventListener('canplay', onCanPlay) } catch(e) { void 0 }
                readyPlay() 
              }
              try { audioEl.addEventListener('canplay', onCanPlay, { once: true }) } catch (e) { void 0 }
              // 备用：如果 canplay 不触发（已加载完毕?），尝试直接播放
              setTimeout(readyPlay, 200)
            }
          }
        }
      } catch (e) { console.warn('Audio start error:', e) }

      this.syncPreviewPlayback()
      
      const start = performance.now() - priorMs
      if (this._playbackInterval) clearInterval(this._playbackInterval)
      if (this._rafId) cancelAnimationFrame(this._rafId)
      
      const el = this.$refs.previewVideo
      if (el && this.isVideo(this.currentPreviewUrl)) {
        // 如果视频源正确，尝试播放；否则由 tick 循环处理
        // 注意：syncPreviewPlayback 可能会改变 currentPreviewUrl，所以这里只在 URL 匹配时尝试
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
          const scNext = this.scenes[idx] || {}
          const firstNext = (scNext && Array.isArray(scNext.clips) && scNext.clips[0]) || null
          const vCand = this.cleanUrl((scNext && scNext.video_url) || (firstNext && firstNext.url) || '')
          const iCand = this.cleanUrl((scNext && scNext.thumbnail) || (firstNext && firstNext.url) || '')
          if (!this.isVideo(vCand)) {
            this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: '', reference_image_url: iCand })
          } else {
            this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: vCand })
          }
          this.maybeLoadDigitalHumanForScene(idx)
        }
        
        // Audio sync
        const audioEl = this.$refs.previewAudio
        if (audioEl && audioEl.src) {
          const scene = this.scenes[idx] || {}
          const actualMs = Math.round(this.getActualSceneSeconds(scene) * 1000)
          const sceneElapsedMs = clamped - acc
          if (Number(actualMs) > 0 && sceneElapsedMs >= actualMs) {
             try { audioEl.pause() } catch (e) { void 0 }
          } else {
             const t = Math.max(0, sceneElapsedMs / 1000)
             if (Math.abs(audioEl.currentTime - t) > 0.3) {
                try { audioEl.currentTime = t } catch(e) { void 0 }
             }
             if (audioEl.paused && this.isPlaying) {
                try { 
                  const p = audioEl.play() 
                  if (p && p.catch) p.catch(() => {})
                } catch(e) { void 0 }
             }
          }
        }

        const vidEl = this.$refs.previewVideo
        if (vidEl && this.isVideo(this.currentPreviewUrl)) {
          try { vidEl.loop = false } catch (e) { void 0 }
          const scene = this.scenes[idx] || {}
          const actualMs = Math.round(this.getActualSceneSeconds(scene) * 1000)
          const sceneElapsedMs = clamped - acc
          if (Number(actualMs) > 0 && sceneElapsedMs >= actualMs) {
            try { vidEl.pause() } catch (e) { void 0 }
            const t = Math.max(0, actualMs / 1000)
            if (vidEl.readyState >= 2) {
              try { vidEl.currentTime = t } catch (e) { void 0 }
            } else {
              try { vidEl.addEventListener('loadeddata', () => { try { vidEl.currentTime = t } catch (e) { void 0 } }, { once: true }) } catch (e) { void 0 }
            }
          } else {
            if (vidEl.paused) this.playVideoSafely(vidEl)
          }
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
      
      // Reset audio when playback stops naturally
      const audioEl = this.$refs.previewAudio
      if (audioEl) {
        try { 
          audioEl.pause()
          audioEl.currentTime = 0
        } catch (e) { void 0 }
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
    async toggleLipSyncView() {
      try {
        // 立即展示对口型页面
        if (this.showLipSyncView) { this.showLipSyncView = false; return }
        this.showLipSyncView = true
        const sc = this.scenes[this.activeSceneIndex] || {}
        let url = this.cleanUrl(this.sceneDetail.reference_image_url || sc.thumbnail || '')
        if (!url) {
          const map = (this.imagesDetailMap instanceof Map) ? this.imagesDetailMap : null
          const key = String(sc.scene_number || '').trim()
          let info = null
          if (map && key) info = map.get(key) || null
          if (!info && map) {
            const oi = Number(sc.order_index)
            if (Number.isFinite(oi) && oi > 0) info = map.get(`oi:${oi}`) || null
          }
          url = this.cleanUrl((info && info.reference_image_url) || '')
        }
        this.lipSyncImageUrl = url

        // 异步触发检测，不阻塞跳转
        if (sc.work_id) {
          this.lipSyncWorkId = String(sc.work_id || '')
          this.lipSyncDetection = sc.mask_url ? { maskurl: sc.mask_url } : null
          Promise.resolve().then(() => this.triggerObjectDetection(sc.work_id)).catch(() => {})
        } else {
          const projectId = this.$route.params.id
          const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
          const token = (this.userStore && this.userStore.token) || ''
          const shotId = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
          this.lipSyncVideoId = String(videoId || '')
          this.lipSyncShotId = shotId
          this.lipSyncWorkId = ''
          if (videoId && shotId && token) {
            Promise.resolve().then(async () => {
              try {
                const detResp = await objectDetectionByScene({ videoId, shotId, token })
                const obj = typeof detResp === 'string' ? (() => { try { return JSON.parse(detResp) } catch { return null } })() : detResp
                this.lipSyncDetection = obj || null
              } catch (e) { this.lipSyncDetection = null }
            })
          }
        }
      } catch (e) { /* no-op */ }
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
        if (!(this.cropPendingKeySet instanceof Set)) this.cropPendingKeySet = new Set()
        this.cropPendingKeySet.add(upKey)
        const sceneNumber = String(scene.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const fps = 30
        const start_frame = Math.max(0, Math.round((Number(sel.startMs || 0) / 1000) * fps))
        const end_frame = Math.max(start_frame + 1, Math.round((Number(sel.endMs || 0) / 1000) * fps))
        const resp = await clipStoryboardVideo({ videoId, sceneNumber, start_frame, end_frame, token })
        let obj = null
        try { obj = typeof resp === 'string' ? JSON.parse(resp) : resp } catch (e) { obj = null }
        const data = obj && obj.data ? obj.data : null
        if (obj && obj.code === 0 && data && data.video_url) {
          const remote = this.cleanUrl(data.video_url || data.fallback_mp4 || '')
          const url = await this.getLocalUrl(remote)
          const durMs = Number(data.duration) ? Math.round(Number(data.duration) * 1000) : Math.max(1, Number(sel.endMs || 0) - Number(sel.startMs || 0)) || 5000
          if (Array.isArray(scene.clips) && scene.clips.length) {
            scene.clips[0] = { url: remote, durationMs: durMs }
          } else {
            scene.clips = [{ url: remote || this.cleanUrl(scene.thumbnail || ''), durationMs: durMs }]
          }
          scene.hasVideo = true
          scene.video_url = remote
          if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
          this.durationMap.set(remote, durMs)
          if (url) this.durationMap.set(url, durMs)
          const thumbLocal = scene.thumbnail ? await this.getLocalUrl(this.cleanUrl(scene.thumbnail || '')) : ''
          this.sceneDetail = { reference_image_url: thumbLocal, video_url: url }
          this.updateTimeMarkers()
          try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
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
        try { this.cropPendingKeySet && this.cropPendingKeySet.delete && this.cropPendingKeySet.delete(upKey) } catch (e) { void 0 }
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
  background: var(--bg-secondary);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-navbar {
  height: 60px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-secondary);
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

.project-title-container {
  display: flex;
  align-items: center;
}

.project-title-text {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
}

.project-title-text:hover {
  background: var(--bg-secondary);
}

.project-title-text:hover .edit-icon {
  opacity: 1 !important;
}

.back-btn {
  width: 85px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
}

.back-btn:hover {
  background: var(--bg-quaternary);
}

.project-title-input {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  border: none;
  background: transparent;
  outline: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.project-title-input:focus {
  background: var(--bg-secondary);
  border: 1px solid var(--primary-color);
}


.navbar-right {
  display: flex;
  gap: 12px;
}

.navbar-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.navbar-btn:hover {
  background: var(--bg-secondary);
}

/* 禁用状态样式 */
.navbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.premium-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-radius: 20px;
}

.convert-btn {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-active);
  border-radius: 20px;
}

.export-btn {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.export-btn:hover {
  background: var(--primary-hover);
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
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-secondary);
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
  background: var(--bg-quaternary);
}

.tab-item.active {
  background: var(--bg-tertiary);
  color: var(--primary-hover);
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
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-secondary);
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
  color: var(--text-primary);
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
  background: var(--bg-primary);
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
  background: var(--bg-tertiary);
  border-radius: 8px 8px 0 0;
  border: 1px solid var(--border-secondary);
}

.prompt-icon {
  color: #3b82f6;
}

.prompt-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
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
  color: var(--text-tertiary);
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
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.prompt-content p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
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
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.prompt-edit-input:focus {
  border-color: var(--primary-color);
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
  background: var(--primary-color);
  color: white;
}

.prompt-edit-btn.save-btn:hover {
  background: var(--primary-hover);
}

.prompt-edit-btn.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.prompt-edit-btn.cancel-btn:hover {
  background: var(--bg-quaternary);
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
  border: 1px solid var(--border-secondary);
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
  background-color: var(--bg-primary);
  color: var(--text-secondary);
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
  background: var(--bg-primary);
  padding: 20px;
  border-top: 1px solid var(--border-secondary);
}

.input-container {
  position: relative;
  margin-bottom: 8px;
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  background: var(--bg-primary);
  padding: 12px;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-secondary);
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
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
  background: var(--bg-tertiary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.input-action-btn:hover {
  background: var(--bg-quaternary);
}

.send-btn {
  background: var(--primary-color);
  color: white;
  border-radius: 25px;
}

.send-btn:hover {
  background: var(--primary-hover);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-tertiary);
}

.convert-video-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.convert-video-btn:hover {
  background: var(--bg-quaternary);
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
  color: var(--text-tertiary);
}

.input-count {
  color: var(--text-secondary);
  font-weight: 500;
}

.input-arrow {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-tertiary);
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
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-btn:hover {
  background: var(--bg-secondary);
}

.control-btn.active {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
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
  background: var(--bg-tertiary);
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
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
  color: var(--text-secondary);
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 8px;
}

.thumb-label svg {
  color: var(--text-tertiary);
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
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border-secondary);
}

.playback-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-secondary);
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.current-time,
.total-time {
  font-weight: 500;
}

.separator {
  color: var(--text-tertiary);
}

.expand-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.expand-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

/* 播放按钮（蓝色背景圆形） */
.play-btn-circle {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--primary-color);
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
  background: var(--primary-hover);
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
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 260px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.success-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.success-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
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
  color: var(--text-secondary);
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
  background-color: var(--border-primary);
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
  background-color: var(--bg-primary);
  transition: .4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: var(--primary-color);
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
  color: var(--text-quaternary);
}

.timeline-tracks {
  display: block;
  position: relative;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-primary) var(--bg-tertiary);
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
  height: 6px;
}

.timeline-tracks::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.timeline-tracks::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

.timeline-tracks::-webkit-scrollbar-thumb:hover {
  background: var(--text-quaternary);
}

.timeline-track {
  display: flex;
  flex-direction: column;
  /* 每个分镜固定占用5秒宽度 */
  flex: 0 0 calc(var(--px-per-second) * 5);
  width: calc(var(--px-per-second) * 5);
  min-width: calc(var(--px-per-second) * 5);
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s;
  /* overflow: hidden; */
  cursor: move;
  position: relative;
  z-index: 1;
}

.bgm-track {
  cursor: default;
}

.timeline-track:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.timeline-track.active {
  background: var(--bg-quaternary);
  border-color: var(--primary-color);
}

.track-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-secondary);
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
  justify-content: space-between;
  border-radius: 5px 5px 0 0;
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
  background: var(--bg-quaternary);
}

.copy-btn svg {
  color: var(--primary-color);
}

.delete-btn svg {
  color: var(--error-color);
}

.track-clips {
  display: flex;
  flex-wrap: nowrap;
  /* 单行显示，水平滚动 */
  gap: 0;
  padding: 8px 0;
  min-height: 60px;
  background: var(--bg-primary);
  overflow: hidden;
  border-radius: 0 0 6px 6px;
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
  background: var(--border-secondary);
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
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.clip-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 完整显示缩略图 */
  background: var(--bg-primary);
}

.track-audio {
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 6px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-secondary);
  min-height: 32px;
}

.audio-btn {
  padding: 4px 6px;
  font-size: 9px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius: 3px;
  cursor: pointer;
  color: var(--text-tertiary);
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
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.add-audio {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.add-audio:hover {
  background: var(--bg-tertiary);
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
  background: var(--bg-primary);
  height: 100%;
  position: relative;
  overflow: hidden;
  /* 防止内容溢出 */
}
.voice-audio-player-wrap { margin-top: 8px; }
.voice-audio-player { width: 100%; max-width: 480px; }

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
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.voice-script-section {
  margin-bottom: 20px;
}

.voice-input-box {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 12px;
}

.voice-script-input {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-secondary);
  resize: none;
  outline: none;
}

.voice-script-input::placeholder {
  color: var(--text-tertiary);
}

.voice-script-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.voice-play-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.voice-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.voice-icon-btn:hover {
  opacity: 1;
}

.voice-duration {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 声音设置区域 */
.voice-settings-section {
  margin-bottom: 24px;
}

.voice-setting-header {
  margin-bottom: 12px;
}

.voice-setting-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.voice-card {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.voice-card:hover {
  background: var(--bg-tertiary);
}

.voice-card-play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  /* Image shows it might be transparent or have a bg, usually transparent in such cards */
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  margin-right: 12px;
}

.voice-card-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.voice-tag {
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.05);
  /* Light gray for tags */
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

[data-theme="dark"] .voice-tag {
  background: rgba(255, 255, 255, 0.1);
}

.voice-card-arrow {
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
}

.voice-emotion-wrapper {
  margin-top: 12px;
}

.emotion-btn {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.emotion-btn:hover {
  background: var(--bg-tertiary);
}

.emotion-icon {
  margin-right: 8px;
  font-size: 16px;
}

.emotion-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
}

.emotion-arrow {
  color: var(--text-tertiary);
  opacity: 0.6;
}

/* Restored CSS for Volume and Speed */
.voice-setting-item {
  margin-bottom: 20px;
}

.voice-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.voice-setting-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
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
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
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
  background: var(--border-secondary);
  border-radius: 3px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.volume-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
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
  background: var(--border-secondary);
  border-radius: 3px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.speed-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.speed-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
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
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.voice-apply-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-apply-btn:hover {
  background: var(--primary-hover);
}

/* 对口型页面覆盖层样式 */
.lip-sync-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-tertiary);
  z-index: 3000;
  display: flex;
  flex-direction: column;
}

.skeleton-block {
  padding: 10px 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-quaternary) 37%, var(--bg-tertiary) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-paragraph {
  height: 80px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-quaternary) 37%, var(--bg-tertiary) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-quaternary) 37%, var(--bg-tertiary) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 8px;
}

.timeline-track .skeleton-image {
  height: 28px;
  background: linear-gradient(90deg, var(--border-primary) 20%, var(--text-quaternary) 40%, var(--border-primary) 60%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 6px;
}

.scene-clip .skeleton-image {
  width: 100%;
  height: 100%;
}

.skeleton-card {
  height: 60px;
  border-radius: 8px;
  margin-top: 8px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-quaternary) 37%, var(--bg-tertiary) 63%);
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

.filter-select {
  appearance: none;
  padding: 6px 32px 6px 16px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiLz48L3N2Zz4=");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

[data-theme="dark"] .filter-select {
  background-color: #1f1f1f;
  border-color: #333;
  color: #ccc;
}

.filter-select:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiLz48L3N2Zz4=");
}

.no-voice-tip {
  font-size: 14px;
  color: #999;
  margin-left: auto;
  padding: 6px 0;
}

@media (prefers-color-scheme: dark) {
  .filter-select {
    background-color: #1f1f1f;
    border-color: #333;
    color: #ccc;
  }
  .filter-select:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
  .no-voice-tip {
    color: #666;
  }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.add-scene-plus-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  width: 24px;
  height: 24px;
  background: #fff;
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.timeline-track:hover .add-scene-plus-btn {
  opacity: 1;
  right: 0;
}

.blank-scene-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.blank-scene-placeholder:hover {
  background: var(--bg-tertiary);
}

.blank-upload-ui {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 10px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--bg-primary);
}

.blank-upload-label {
  font-size: 12px;
  line-height: 1;
  color: var(--text-secondary);
}

.timeline-track:hover .blank-upload-ui {
  border-color: var(--primary-color);
}

.upload-icon-small {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.blank-scene-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  cursor: pointer;
  gap: 16px;
}

.blank-scene-display:hover {
  background: var(--bg-tertiary);
}

.upload-icon-large {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
}

.upload-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}
/* Crop Modal Styles */
.crop-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.crop-modal {
  width: 90%;
  max-width: 800px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.crop-modal-header {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-secondary);
}
.crop-modal-body {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  height: 60vh;
}
.crop-preview {
  width: 100%;
  height: 100%;
  border: 1px dashed var(--border-secondary);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.crop-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
}
.crop-select {
  position: absolute;
  border: 2px solid var(--primary-color);
  background: rgba(0, 0, 0, 0.15);
  cursor: move;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.2) inset;
}
.crop-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50%;
}
.handle-nw { left: -6px; top: -6px; cursor: nwse-resize; }
.handle-ne { right: -6px; top: -6px; cursor: nesw-resize; }
.handle-sw { left: -6px; bottom: -6px; cursor: nesw-resize; }
.handle-se { right: -6px; bottom: -6px; cursor: nwse-resize; }
.crop-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 16px;
}
.ratio-buttons { display: flex; gap: 8px; }
.ratio-btn {
  padding: 6px 10px;
  border: 1px solid var(--border-secondary);
  border-radius: 16px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.ratio-btn.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
.crop-actions { display: flex; gap: 10px; }
.crop-cancel { padding: 6px 12px; border: 1px solid var(--border-secondary); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
.crop-apply { padding: 6px 12px; border: none; border-radius: 8px; background: var(--primary-color); color: #fff; }
</style>
