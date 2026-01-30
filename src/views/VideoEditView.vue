// 视频编辑页：编辑分镜图文、生成视频并配置配音与背景音乐
<template>
  <div class="video-edit-container">
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
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          返回策划
        </button>
      </div>
      <div class="navbar-right">
        <div class="points-display" :class="{ 'non-member-points': !isVip }" :title="!isVip ? '会员已过期，请重新订阅' : ''" v-if="userStore && userStore.isLoggedIn" @click="showPointsModal = true"><span class="points-icon">✨</span> {{ (userStore && userStore.userInfo && userStore.userInfo.pointsBalance) || 0 }}</div>
        <button class="navbar-btn theme-toggle-btn" @click="toggleTheme" :aria-label="isDark ? '切换为浅色' : '切换为深色'">
          <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="navbar-btn premium-btn" v-if="!isVip" @click="showMembershipModal = true">开通会员</button>
        <button class="navbar-btn convert-btn" @click="openConvertConfirmModal"
          :disabled="worksVideoReady || !allImagesReady">一键转视频</button>
        <button class="navbar-btn export-btn" @click="exportVideo" :disabled="!allVideosReady">导出视频</button>
      </div>
    </div>

    <ToneSelector v-if="showToneSelector" :visible="true" @close="showToneSelector = false" @select="handleToneSelect"
      :token="userStore.token" modelName="qwen3-TTS-Flash" />

    <MembershipModal :visible="showMembershipModal" @close="showMembershipModal = false" />
    <PointsModal :visible="showPointsModal" @close="showPointsModal = false" />

    <!-- 转视频积分确认弹窗 -->
    <div v-if="convertConfirmVisible" class="convert-modal-overlay" @click="closeConvertConfirmModal">
      <div class="convert-modal" @click.stop>
        <div class="convert-modal-header">转视频任务明细</div>
        <div class="convert-modal-body">
          <div class="convert-scenes-stack">
            <div class="stack-icon"></div>
            <div class="stack-count">X {{ convertScenesCount }}</div>
          </div>
          <div class="convert-detail">
            <!-- <div class="convert-row">
              <div class="convert-label">选用模型</div>
              <select class="convert-select" v-model="selectedConvertModelName" @change="reestimateConvertBilling">
                <option value="wan2.2-i2v-flash">智能选择（720P）</option>
              </select>
            </div> -->
            <div class="convert-row">
              <div class="convert-label">视频时长</div>
              <select class="convert-select" v-model="selectedDurationMode" disabled>
                <option value="voice-crop">根据配音长度选择（裁剪）</option>
              </select>
            </div>
            <div class="convert-row">
              <div class="convert-label">分镜数量</div>
              <div class="convert-value">{{ convertScenesCount }}</div>
            </div>
            <div class="convert-row">
              <div class="convert-label">积分消耗</div>
              <div class="convert-value">{{ convertEstimateTotal }}</div>
            </div>
            <div class="convert-tip" v-if="!canConfirmConvert">积分不足，请充值</div>
          </div>
        </div>
        <div class="convert-modal-footer">
          <button class="convert-cancel-btn" @click="closeConvertConfirmModal">取消</button>
          <button class="convert-confirm-btn" :disabled="!canConfirmConvert" @click="confirmConvert">确认</button>
        </div>
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
        <div class="tab-item" :class="{ active: activeTab === 'music' }" @click="activeTab = 'music'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 3v10.5a3.5 3.5 0 1 1-2-3.146V5h9v6.5a3.5 3.5 0 1 1-2-3.146V3H9z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <span class="tab-label">音乐</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'subtitle' }" @click="activeTab = 'subtitle'">
          <div class="tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M6 10h12M8 14h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="tab-label">字幕</span>
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
            <span class="scene-type" v-if="activeTab === 'image'">镜头策划</span>
            <span class="scene-type" v-if="activeTab === 'voice'">配音编辑</span>
            <span class="scene-type" v-if="activeTab === 'music'">音乐编辑</span>
            <span class="scene-type" v-if="activeTab === 'subtitle'">字幕编辑</span>
          </div>
        </div>

          <template v-if="shouldShowActiveSkeleton">
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
            <div class="scene-scrollable-content" ref="sceneScrollable">

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
                  <span v-if="!isEditingShotTitle" class="prompt-title" @click="editShotTitle">
                    {{ (scenes[activeSceneIndex] && scenes[activeSceneIndex].scene_script &&
                    scenes[activeSceneIndex].scene_script.shot_title) || '点击编辑标题' }}
                  </span>
                  <input v-else class="prompt-title-input" v-model="editingShotTitleText" @blur="saveShotTitle" @keyup.enter="saveShotTitle" />
                  <div class="prompt-actions">
                    <button class="action-btn edit-btn" @click="editPrompt">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" />
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
                <div class="prompt-content" :class="{ collapsed: !isPromptExpanded && !isEditingPrompt }">
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

              <!-- 运镜描述区域 -->
              <div class="prompt-section" style="margin-top: 12px;">
                <div class="prompt-header">
                  <div class="prompt-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <span class="prompt-title">运镜描述</span>
                  <div class="prompt-actions">
                    <button class="action-btn edit-btn" @click="editCameraDirection" title="编辑运镜">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="prompt-content">
                  <div v-if="!isEditingCameraDirection">
                    <div v-if="scenes[activeSceneIndex]?.scene_script?.camera_direction">
                      <span style="opacity:0.7;"></span>{{ scenes[activeSceneIndex].scene_script.camera_direction }}
                    </div>
                    <div v-else style="opacity:0.6;">暂无运镜描述</div>
                  </div>
                  <div v-else class="prompt-edit-container">
                    <textarea v-model="editingCameraDirectionText" class="prompt-edit-input" placeholder="请输入运镜描述..." @keyup.enter.ctrl="saveCameraDirection"></textarea>
                    <div class="prompt-edit-actions">
                      <button class="prompt-edit-btn save-btn" @click="saveCameraDirection">保存</button>
                      <button class="prompt-edit-btn cancel-btn" @click="cancelCameraDirectionEdit">取消</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部操作按钮（移动到图片提示词下方） -->
              <div class="bottom-actions">
                <!-- <button class="bottom-btn download-btn" @click="downloadImageDirect(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" />
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" />
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  下载
                </button> -->
                <!-- <button class="bottom-btn apply-btn" @click="applySelectedSceneVersion">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" />
                  </svg>
                  应用
                </button> -->
                <button v-if="!isVideo(currentPreviewUrl)" class="bottom-btn regenerate-btn"
                  @click="handleRegenerateActiveScene">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" />
                  </svg>
                  重新生成
                </button>
              </div>

              <!-- 图片展示 -->
              <!-- <div class="image-container">
                <div
                  v-if="(isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) && !shouldRenderImage(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail)) || (sceneDetail.video_url === null && !shouldRenderImage(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail)) || isActiveSceneCropping || isPreviewPending || ((!isVideo(sceneDetail.video_url)) && isActiveImageMissing)"
                  class="skeleton-image"></div>
                <video v-else-if="isVideo(sceneDetail.video_url) && sceneDetail.video_url && sceneDetail.video_url.trim() !== ''" ref="sceneVideo"
                  :src="preferMp4(sceneDetail.video_url)" :poster="cleanUrl(sceneDetail.reference_image_url || '')"
                  preload="metadata" class="scene-image" playsinline muted controls></video>
                <img v-else-if="shouldRenderImage(sceneDetail.reference_image_url) && !previewImgErrored"
                  :src="cleanUrl(sceneDetail.reference_image_url)" alt="分镜图片" class="scene-image" decoding="async"
                  fetchpriority="high" />
              </div> -->

              <!-- 历史记录 -->
              <div class="version-history-section" style="margin-top: 12px;">
                <div v-if="sceneHistoryLoading" class="skeleton-image" style="height:100px;"></div>
                <div v-else-if="sortedSceneHistory && sortedSceneHistory.length" class="version-list" style="display:flex;flex-direction:column;gap:12px;">
                  <div
                    v-for="v in sortedSceneHistory"
                    :key="v.id || v.createdAt || v.created_at"
                    class="chat-message-wrapper"
                    style="display:flex;flex-direction:column;gap:8px;"
                  >
                    <div v-if="String(v.userPrompt || '').trim()" class="chat-bubble chat-right" style="margin-left:auto; max-width:80%; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-primary); border-radius:14px; padding:10px 12px;">
                      <span>{{ v.userPrompt }}</span>
                    </div>
                    <div class="chat-bubble chat-left" style="padding:10px;border-radius:12px;">
                      <div style="font-size:12px;opacity:0.6;margin-bottom:8px;">{{ formatDisplayTime(v.createdAt || v.created_at) }}</div>
                      <template v-if="isVideo(v.content)">
                        <video :src="preferMp4(cleanUrl(v.content))"
                               style="width:100%;height:auto;border-radius:10px;object-fit:contain;"
                               muted playsinline preload="none" controls></video>
                      </template>
                      <template v-else>
                        <img :src="cleanUrl(v.content)" alt="版本图"
                             style="width:100%;height:auto;border-radius:10px;object-fit:contain;cursor:pointer;"
                             decoding="async" @click="openVersionPreview(v.content)" />
                      </template>
                      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
                        <button class="bottom-btn apply-btn" @click.stop="applySceneVersionItem(v)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" />
                          </svg>
                          应用
                        </button>
                        <button class="bottom-btn download-btn" @click.stop="downloadImage(v.content)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                          </svg>
                          预览
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else style="font-size:12px;opacity:0.7;padding:8px;">暂无版本记录</div>
              </div>
              <div class="chat-messages" style="margin-top: 12px;">
                <div v-for="msg in leftChatMessages" :key="msg.id" class="chat-message-wrapper" style="margin-bottom: 12px;">
                  <!-- User Message (Right) -->
                  <div v-if="msg.side === 'right'" class="chat-bubble chat-right" style="margin-left: auto; max-width: 80%;">
                    <span>{{ msg.text }}</span>
                  </div>

                  <!-- Assistant Prompt Box (Left) -->
                  <div v-else-if="msg.type === 'prompt_box'" class="prompt-box-chat" style="width: 100%;">
                     <!-- Prompt Section Replica -->
                     <div class="prompt-section" style="margin-bottom: 0;">
                        <div class="prompt-header">
                          <div class="prompt-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
                            </svg>
                          </div>
                          <span class="prompt-title">{{ (msg.data && msg.data.shot_title) || '分镜' }}</span>
                          <div class="prompt-actions">
                             <!-- Visual only buttons for identical look -->
                            <button class="action-btn edit-btn" title="编辑提示词">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" />
                              </svg>
                            </button>
                            <button class="action-btn copy-btn" title="复制提示词">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" />
                              </svg>
                            </button>
                            <button class="action-btn more-btn" title="收缩提示词">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div class="prompt-content">
                          <div style="display:flex;flex-direction:column;gap:4px;">
                            <div v-if="msg.data && msg.data.visual_description">
                              <span style="opacity:0.7;"></span>{{ msg.data.visual_description }}
                            </div>
                          </div>
                        </div>
                     </div>

                     <!-- Image Display inside Prompt Box -->
                     <div class="image-container" style="margin-top: 12px;">
                        <div v-if="msg.pending && !msg.imageUrl" class="skeleton-image" style="height:200px;"></div>
                        <img v-else-if="msg.imageUrl" :src="cleanUrl(msg.imageUrl)" alt="分镜更新图" class="scene-image" decoding="async" />
                        <div v-else-if="msg.text" style="padding: 12px; font-size: 13px; opacity: 0.8; background: var(--bg-tertiary); border-radius: 8px;">
                           {{ msg.text }}
                        </div>
                     </div>
                  </div>

                  <!-- Default Left Message -->
                  <div v-else class="chat-bubble chat-left">
                    <div v-if="msg.pending" style="display:flex; flex-direction:column; align-items:flex-start;">
                      <template v-if="!msg.imageUrl">
                        <div class="skeleton-image" style="width:100%;height:160px;border-radius:12px;"></div>
                      </template>
                      <template v-else>
                        <img :src="cleanUrl(msg.imageUrl)" alt="分镜更新图" style="width:100%;height:auto;border-radius:12px;" decoding="async" />
                      </template>
                      <span v-if="msg.text" style="display:block; margin-top:6px; opacity:0.8; font-size:12px;">{{ msg.text }}</span>
                    </div>
                    <span v-else>{{ msg.text }}</span>
                  </div>
                </div>
              </div>
            </div>

                <!-- 固定的输入框区域 -->
            <div class="input-section">
              <div class="input-container">
                <textarea v-model="sceneInput" class="scene-input" placeholder="输入你想要对当前画面修改的内容" maxlength="250"></textarea>
                <div class="char-counter">{{ (sceneInput || '').length }}/250</div>
                <div class="input-actions">
                  <button class="input-action-btn send-btn" @click="sendSceneInput">
                    ↑
                  </button>
                </div>
              </div>
              <div class="input-footer">
                <!-- <button class="convert-video-btn" @click="convertToVideo"
                  :disabled="entryMode === 'crop' || isVideo(currentPreviewUrl) || previewImgErrored">
                  <span>转视频</span>
                </button> -->
                <!-- <div class="input-footer-right">
                  <span class="input-hint">消耗</span>
                  <span class="input-count">1</span>
                  <button class="input-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </button>
                </div> -->
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
                  <textarea v-model="voiceScript" class="voice-script-input" placeholder="输入想要人物讲述的台词" maxlength="150"></textarea>
                  <div class="voice-char-counter">{{ (voiceScript || '').length }}/150</div>
                </div>
                <div class="voice-script-controls">
                  <div class="voice-play-controls">
                    <button class="voice-icon-btn" @click="startVoiceAudition" :disabled="isVoiceLoading">
                      <svg v-if="!isVoiceLoading" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 50 50" fill="none">
                        <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round">
                          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    </button>
                    <button class="voice-icon-btn" @click="stopVoiceAudition">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="5" width="4" height="14" />
                        <rect x="14" y="5" width="4" height="14" />
                      </svg>
                    </button>
                  </div>
                  <!-- <span class="voice-duration">约 0s 音频 0/240</span> -->
                </div>
              </div>

              <!-- 声音音色区域 -->
              <div class="voice-settings-section">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">声音音色</span>
                </div>

                <div class="voice-card" @click="showToneSelector = true">
                  <button class="voice-card-play" @click.stop="startVoiceAudition" :disabled="isVoiceLoading">
                    <svg v-if="!isVoiceLoading" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <svg v-else width="12" height="12" viewBox="0 0 50 50" fill="none">
                      <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
                      </circle>
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
              <div v-if="voiceSceneAudioUrl" class="uploaded-audio-card" style="margin-top:12px;">
                <button class="audio-icon-btn" @click.stop="toggleVoiceSceneAudio">
                  <svg v-if="!voiceScenePlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </button>
                <div class="audio-main">
                  <div class="audio-title">配音音频</div>
                  <input class="audio-slider" type="range" min="0" :max="Math.max(1, Math.floor(voiceSceneAudioDuration || 1))" :value="Math.floor(voiceSceneCurrentTime || 0)" @input="seekVoiceSceneAudio">
                </div>
                <div class="audio-actions">
                  <span class="audio-time">{{ formatSec(voiceSceneCurrentTime) }}/{{ formatSec(voiceSceneAudioDuration) }}</span>
                  <button class="delete-audio-btn" @click.stop="deleteVoiceover" title="删除配音">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4h8v2"></path>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                    </svg>
                  </button>
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

          <!-- 音乐内容 - 上传模式 -->
          <div class="music-content" v-if="activeTab === 'music'">
            <div class="music-scrollable-content">
              <div v-if="!musicAudioUrl" class="upload-area" @click="$refs.musicFileInput && $refs.musicFileInput.click()" @dragover.prevent @drop.prevent="handleMusicDrop">
                <div class="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p class="upload-text">点击 or 将文件拖拽到这里上传</p>
                  <p class="upload-hint">支持 MP3、WAV 格式，时长 0.3s - 60s</p>
                </div>
                <input type="file" accept=".mp3,.wav" style="display:none" ref="musicFileInput" @change="onMusicFileSelected">
              </div>
              <div v-if="musicAudioUrl" class="uploaded-audio-card">
                <button class="audio-icon-btn" @click.stop="toggleMusicPlay">
                  <svg v-if="!musicPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </button>
                <div class="audio-main">
                  <div class="audio-title">{{ musicAudioName }}</div>
                  <input class="audio-slider" type="range" min="0" :max="Math.max(1, Math.floor(musicAudioDuration || 1))" :value="Math.floor(musicCurrentTime || 0)" @input="seekMusicAudio">
                </div>
                <div class="audio-actions">
                  <span class="audio-time">{{ formatSec(musicCurrentTime) }}/{{ formatSec(musicAudioDuration) }}</span>
                  <button class="delete-audio-btn" @click.stop="deleteBackgroundMusicByApi" title="删除音乐">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4h8v2"></path>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="music-apply-section" v-if="musicAudioUrl">
              <button class="music-apply-btn" @click="uploadBackgroundMusic">上传背景音乐</button>
            </div>
          </div>

          <!-- 字幕内容 - 字幕模式 -->
          <div class="subtitle-content" v-if="activeTab === 'subtitle'">
            <div class="subtitle-scrollable-content">
              <div class="voice-setting-item">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">字幕文本</span>
                </div>
                <div class="voice-setting-content">
                  <textarea v-model="subtitleText" class="subtitle-textarea" rows="4" placeholder="请输入字幕文本"></textarea>
                </div>
              </div>
              <div class="voice-setting-item" style="margin-top: 16px;">
                <div class="voice-setting-header">
                  <span class="voice-setting-title">字幕样式</span>
                </div>
                <div class="voice-setting-content">
                  <div class="subtitle-style-row">
                    <label class="subtitle-style-label">字体</label>
                    <select v-model="subtitleStyleFamily" class="subtitle-style-input">
                      <option v-for="opt in fontFamilyOptions" :key="opt.value || 'default-fam'" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div class="subtitle-style-row">
                    <label class="subtitle-style-label">字重</label>
                    <select v-model="subtitleStyleFormat" class="subtitle-style-input">
                      <option v-for="opt in fontWeightOptions" :key="opt.value || 'default-wt'" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div class="subtitle-style-row">
                    <label class="subtitle-style-label">字号</label>
                    <input type="range" min="12" max="80" step="1" :value="parseInt(subtitleStyleSize) || 20" @input="subtitleStyleSize = ($event.target.value + 'px')" class="subtitle-style-input">
                    <!-- <span style="min-width:44px;text-align:right;">{{ parseInt(subtitleStyleSize) || 20 }}</span> -->
                  </div>
                  <div class="subtitle-style-row">
                    <label class="subtitle-style-label">颜色</label>
                    <input type="color" v-model="subtitleStyleColor" class="subtitle-style-input">
                  </div>
                </div>
              </div>
            </div>
            <div class="voice-apply-section">
              <button class="voice-apply-btn" @click="applySubtitleText">应用修改</button>
            </div>
          </div>
        </template>
      </div>

      <!-- 右侧区域 -->
      <div class="right-panel">
        <!-- 画布编辑和对口型 -->
        <div v-if="isSceneUpdating(scenes[activeSceneIndex], activeSceneIndex) || (isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) && !shouldRenderImage(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail)) || (sceneDetail.video_url === null && !shouldRenderImage(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail))" class="skeleton-block"
          style="margin-bottom: 8px;">
          <div class="skeleton-line" style="width: 200px; height: 32px;"></div>
        </div>
        <div v-else class="edit-controls">
          <button v-if="isVideo(getActiveSceneVideoUrl())" class="control-btn active" @click="toggleCanvasEditMode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" />
            </svg>
            裁剪分镜
          </button>
          <!-- <button class="control-btn" @click="toggleLipSyncView">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" />
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" stroke-width="2" />
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" stroke-width="2" />
            </svg>
            对口型
          </button> -->
        </div>

        <!-- 视频画面 -->
        <div class="video-preview">
            <div class="video-container" ref="videoContainer" @click="handleVideoContainerClick">
              <!-- 1、骨架屏 -->
              <div v-if="shouldShowActiveSkeleton"
                   class="skeleton-image"
                   style="height:100%"></div>
            <video v-else-if="shouldShowVideo"
              ref="previewVideo"
              :src="preferMp4(sceneDetail.video_url)"
              :poster="cleanUrl(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail || '')"
              preload="metadata" playsinline muted
              class="video-image" @loadedmetadata="updateSubtitleMaxWidth"></video>
            <img v-else-if="shouldShowImage"
              :src="cleanUrl(sceneDetail.reference_image_url)"
              :alt="scenes[activeSceneIndex] ? scenes[activeSceneIndex].title : '预览'" class="video-image" ref="previewImage"
              decoding="async" fetchpriority="high" @error="onPreviewImgError" @load="updateSubtitleMaxWidth" />
            <div v-else class="skeleton-image"></div>
            <div
              v-if="!isVideo(sceneDetail.video_url) && (previewImgErrored || isGenerateFailed(sceneDetail.reference_image_url))"
              class="video-overlay">
              <div class="error-banner">生成失败</div>
            </div>
            <audio ref="previewAudio" style="display:none" preload="auto"></audio>
            <input ref="replaceFileInput" type="file" accept="image/*" style="display:none" @change="onReplaceImageFileSelected" />
            <button
              v-if="!isVideo(sceneDetail.video_url) && shouldRenderImage(sceneDetail.reference_image_url || scenes[activeSceneIndex]?.thumbnail) && !(isVideoConverting || isSceneUpdating(scenes[activeSceneIndex], activeSceneIndex))"
              class="replace-btn"
              @click="triggerReplaceImageUpload">
              <span class="replace-icon">⟲</span>
              替换
            </button>
            <!-- 字幕叠加层 -->
            <div v-if="subtitleEnabled && !isVideoConverting && !isVideoPendingScene(scenes[activeSceneIndex], activeSceneIndex) && scenes[activeSceneIndex] && (isEditingSubtitle || subtitleText || (scenes[activeSceneIndex].scene_script && scenes[activeSceneIndex].scene_script.dialogue_or_narration))" class="subtitle-overlay" :class="{ 'fullscreen-mode': isFullscreen, 'portrait-mode': aspectRatio === '9:16' }" :style="subtitleOverlayStyle">
              <span v-if="!isEditingSubtitle">
                {{ subtitleText || scenes[activeSceneIndex].scene_script.dialogue_or_narration }}
              </span>
              <input v-else ref="subtitleInput" v-model="editingSubtitleText" class="subtitle-edit-input" @keyup.enter="saveSubtitleEdit" @blur="saveSubtitleEdit" />
              <button v-if="isEditingSubtitle" class="subtitle-save-btn" @click.stop="saveSubtitleEdit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div class="preview-aside">
            <template v-if="shouldShowActiveSkeleton || isSceneUpdating(scenes[activeSceneIndex], activeSceneIndex) || isPreviewPending">
              <div class="thumb-card">
                <div class="skeleton-image"></div>
              </div>
              <div class="thumb-card">
                <div class="skeleton-image"></div>
              </div>
            </template>
            <template v-else>
              <div v-if="hasVideoThumb() && !isPreviewPending" class="thumb-card" @click="switchPreviewTo('video')">
                <div class="thumb-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"
                      stroke-width="2" />
                  </svg>
                  <span>视频</span>
                </div>
                <video v-if="!isM3u8(getSceneVideoUrlForThumb())"
                  :src="preferMp4(getSceneVideoUrlForThumb())"
                  :poster="cleanUrl(sceneDetail.reference_image_url || '')"
                  class="thumb-image" muted playsinline preload="none" disablepictureinpicture></video>
                <img v-else
                  :src="cleanUrl(sceneDetail.reference_image_url || '')"
                  class="thumb-image" alt="缩略图" />
              </div>
              <div v-if="shouldRenderImage(sceneDetail.reference_image_url) && !previewImgErrored && !isPreviewPending"
                class="thumb-card" @click="switchPreviewTo('image')">
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

              <!-- 时间轴头部控制区 -->
              <div class="timeline-header-control" style="display: flex; justify-content: flex-end; padding: 0 16px 8px;">
                <div class="subtitle-switch" style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 12px; color: var(--text-secondary);">字幕</span>
                  <label class="switch">
                    <input type="checkbox" v-model="subtitleEnabled">
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>

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
                        <button class="action-btn delete-btn" @click="deleteSceneRemote(index)" title="删除分镜" v-if="scenes.length > 1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" />
                            <path d="M19,6v14a2,2 0,0,1-2,2H7a2,2 0,0,1-2-2V6m3,0V4a2,2 0,0,1,2-2h4a2,2 0,0,1,2,2v2"
                              stroke="currentColor" stroke-width="2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div class="track-clips" @click="selectScene(index)">
                      <template v-if="shouldShowSkeletonForScene(index)">
                        <div v-for="m in 10" :key="'skel-' + index + '-' + m" class="scene-clip">
                          <div class="skeleton-image" style="height:28px;"></div>
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="(clip, cidx) in getSceneClips(scene)" :key="cidx" class="scene-clip"
                          :class="{ active: index === activeSceneIndex }" :style="getClipStyle(scene, clip)">
                          <video v-if="scene.hasVideo || isVideo(clip.url || scene.video_url || scene.thumbnail)"
                            :src="preferMp4(clip.url || scene.video_url || scene.thumbnail)"
                            :poster="cleanUrl(scene.thumbnail || '')" class="clip-thumbnail" muted playsinline
                            :preload="index < 4 ? 'metadata' : 'none'" disablepictureinpicture></video>
                          <img
                            v-else-if="shouldRenderImage(clip.url || scene.thumbnail) && !isClipImgErrored(index, cidx)"
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
                    <div class="track-audio">
                      <template v-if="shouldShowSkeletonForScene(index)">
                        <div class="skeleton-image" style="height:28px; width: 60px;"></div>
                      </template>
                      <template v-else>
                        <button v-if="hasAudio(scene, index)" class="audio-btn">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M3 10h4l5-4v12l-5-4H3z" stroke="currentColor" stroke-width="2" />
                            <path d="M16 8c2 2 2 6 0 8" stroke="currentColor" stroke-width="2" />
                            <path d="M18 5c3 3 3 11 0 14" stroke="currentColor" stroke-width="2" />
                          </svg>
                        </button>
                        <button v-else class="audio-btn add-audio" @click.stop="activeSceneIndex = index; activeTab = 'voice'">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" />
                            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" />
                          </svg>
                          添加配音
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
                    <svg v-if="!musicAudioUrl" width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" />
                      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" stroke-width="2" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" />
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


  </div>

  <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>

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

  <div v-if="successModalVisible" class="success-modal-overlay" @click="closeSuccessModal">
    <div class="success-modal" @click.stop>
      <div class="success-title">{{ successTitle || '任务创建成功' }}</div>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
        <button v-if="successPreviewUrl" class="success-close-btn" @click="downloadExportVideo">下载</button>
        <!-- <button class="success-close-btn" @click="closeSuccessModal">确定</button> -->
      </div>
    </div>
  </div>

  <div v-if="exportProgressVisible" class="success-modal-overlay" @click.stop>
    <div class="success-modal" @click.stop>
      <div class="export-icon" style="display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
        <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="export-folder">
          <defs>
            <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6c6f75"/>
              <stop offset="100%" stop-color="#3d4044"/>
            </linearGradient>
          </defs>
          <g fill="none">
            <path d="M6 22h18l4 4h26c2.209 0 4 1.791 4 4v20c0 4.418-3.582 8-8 8H12c-4.418 0-8-3.582-8-8V26c0-2.209 1.791-4 4-4Z" fill="url(#folderGrad)" />
            <rect x="38" y="16" width="18" height="24" rx="2" fill="#f5f6f7" stroke="#d0d0d0" stroke-width="1"/>
            <text x="10" y="16" font-size="8" fill="#cfcfcf" font-family="system-ui, -apple-system, Segoe UI, Roboto">织梦</text>
            <circle cx="32" cy="34" r="2.3" fill="#ffffff" opacity="0.9"/>
            <circle cx="26" cy="34" r="2.3" fill="#ffffff" opacity="0.9"/>
            <circle cx="38" cy="34" r="2.3" fill="#ffffff" opacity="0.9"/>
            <circle cx="32" cy="28" r="2.3" fill="#ffffff" opacity="0.9"/>
            <circle cx="32" cy="40" r="2.3" fill="#ffffff" opacity="0.9"/>
          </g>
        </svg>
      </div>
      <div class="export-progress-text" style="text-align:center;font-size:24px;color:var(--text-primary);">
        {{ exportProgressDone ? '导出成功' : (exportProgressPct.toFixed(1) + '%') }}
      </div>
      <div class="export-desc" style="text-align:center;color:var(--text-secondary);margin-top:8px;">
        {{ exportProgressDone ? '如自动下载失败可点击手动下载' : '正在导出您的视频，请稍候' }}
      </div>
      <div v-if="exportProgressDone && exportManualUrl" style="text-align:center;margin-top:8px;">
        <a :href="exportManualUrl" target="_blank" rel="noopener" style="color:var(--primary-color)">手动下载链接</a>
      </div>
      <div style="display:flex;justify-content:center;margin-top:16px;">
        <button class="success-close-btn" @click="closeExportProgress">取消</button>
      </div>
    </div>
  </div>

  <div v-if="showReplaceCropModal" class="crop-modal-overlay" @click.self="cancelReplaceCrop">
    <div class="crop-modal" @click.stop>
      <div class="crop-modal-header">裁剪图片</div>
      <div class="crop-modal-body" @mousemove="onReplaceMouseMove" @mouseup="onReplaceMouseUp">
        <div class="crop-preview" ref="replaceCropPreview">
          <img :src="replaceSelectedImageUrl" class="crop-image" ref="replaceCropImage" @load="onReplaceCropImageLoad" />
          <div v-if="replaceDisplayRect" class="crop-select" :style="replaceCropSelectBoxStyle" @mousedown.prevent="onReplaceSelectMouseDown">
            <div class="crop-handle handle-nw" @mousedown.stop.prevent="onReplaceHandleMouseDown('nw', $event)"></div>
            <div class="crop-handle handle-ne" @mousedown.stop.prevent="onReplaceHandleMouseDown('ne', $event)"></div>
            <div class="crop-handle handle-sw" @mousedown.stop.prevent="onReplaceHandleMouseDown('sw', $event)"></div>
            <div class="crop-handle handle-se" @mousedown.stop.prevent="onReplaceHandleMouseDown('se', $event)"></div>
          </div>
        </div>
      </div>
      <div class="crop-modal-footer">
        <div class="ratio-buttons">
          <button :class="['ratio-btn', {active: replaceCropRatio==='9:16'}]" @click="replaceCropRatio='9:16'">9:16</button>
          <button :class="['ratio-btn', {active: replaceCropRatio==='16:9'}]" @click="replaceCropRatio='16:9'">16:9</button>
          <button :class="['ratio-btn', {active: replaceCropRatio==='3:4'}]" @click="replaceCropRatio='3:4'">3:4</button>
          <button :class="['ratio-btn', {active: replaceCropRatio==='4:3'}]" @click="replaceCropRatio='4:3'">4:3</button>
        </div>
        <div class="crop-actions">
          <button class="crop-cancel" @click="cancelReplaceCrop">取消</button>
          <button class="crop-apply" @click="applyReplaceCrop">应用</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 版本预览浮层（置于同一模板内） -->
  <div v-if="versionPreviewVisible" class="version-preview-overlay" @click="closeVersionPreview" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:4000;display:flex;align-items:center;justify-content:center;">
    <div class="version-preview-modal" @click.stop style="position:relative;max-width:90vw;max-height:90vh;padding:12px;background:var(--bg-primary);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);display:flex;flex-direction:column;gap:10px;align-items:center;">
      <button @click="closeVersionPreview" style="position:absolute;top:8px;right:8px;width:32px;height:32px;border:none;background:var(--bg-tertiary);border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);cursor:pointer;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <img :src="cleanUrl(versionPreviewUrl)" alt="预览" style="max-width:86vw;max-height:78vh;object-fit:contain;border-radius:10px;" />
    </div>
  </div>
</template>

<script>

import ToneSelector from '@/components/ToneSelector.vue'
import MembershipModal from '@/components/MembershipModal.vue'
import PointsModal from '@/components/PointsModal.vue'
import LipSyncView from '@/views/LipSyncView.vue'
import CanvasEditView from '@/views/CanvasEditView.vue'
import CropStoryboardModal from '@/components/CropStoryboardModal.vue'
import Hls from 'hls.js'
import { getScriptDetailByVideo, generateStoryboardVideo, queryStoryboardVideoStatus, regenerateImage, queryRegenerateImage, getStoryboardSceneDetail, copyStoryboardVideo, reorderStoryboardScenes, getStoryboardImagesDetail, clipStoryboardVideo, updateVideoTitle, exportWorksVideo, exportWorksVideoDownload, aliTtsSubmit, aliTtsQuery, uploadStoryboardVoiceoverAudio, digitalhumanQuery, objectDetectionByScene, getBillingEstimate, getUserBasicStatus, updateSceneStream, replaceStoryboardImage, getWorksVideoStatus, getSceneVersionHistory, applySceneVersion, updateSceneScript, updateVisualDescription, updateCameraDirection, updateShotTitle, deleteStoryboardScene, uploadBackgroundMusic as uploadBackgroundMusicApi, getWorksVideoDetail, getSubtitleState, updateSubtitleState, deleteBackgroundMusic as deleteBackgroundMusicApi, deleteAliTts } from '@/api'
import { useUserStore } from '@/stores/user'
import { cleanUrl as cleanUrlUtil, isGenerateFailed as isGenerateFailedUtil, shouldRenderImage as shouldRenderImageUtil, getLocalMediaUrl as getLocalMediaUrlUtil } from '@/utils/media'

export default {
  name: 'VideoEditView',
  components: {
    ToneSelector,
    MembershipModal,
    PointsModal,
    LipSyncView,
    CanvasEditView,
    CropStoryboardModal
  },
  data() {
    return {
      showPointsModal: false,
      projectTitle: '',
      activeTab: 'image',
      sceneInput: '',
      subtitleEnabled: true,
      lastPreviewMode: '',
      isEditingSubtitle: false,
      editingSubtitleText: '',
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
      voiceAge: '青年',
      voiceStyle: '普通话',
      voiceName: '芊悦',
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
      isPromptExpanded: false,
      isEditingPrompt: false,
      editingPromptText: '',
      originalPromptContent: '',
      isEditingShotTitle: false,
      editingShotTitleText: '',
      isEditingCameraDirection: false,
      editingCameraDirectionText: '',
      // 画布编辑模式
      isCanvasEditMode: false,
      // 对口型页面显示状态
      showLipSyncView: false,
      successModalVisible: false,
      successTitle: '',
      successPreviewUrl: '',
      successFilename: '',
      exportProgressVisible: false,
      exportProgressPct: 0,
      exportProgressDone: false,
      exportManualUrl: '',
      exportTimer: null,
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
      isFullscreen: false
      , leftChatMessages: []
      , subtitleEnabledPrev: true
      , pointsBalance: 0
      , worksVideoReady: false
      , convertConfirmVisible: false
      , convertEstimateTotal: 0
      , convertScenesCount: 0
      , canConfirmConvert: false
      , isDark: false
      , selectedConvertModelName: 'wan2.2-i2v-flash'
      , selectedDurationMode: 'voice-crop'
      , aspectRatio: '16:9'
      , showReplaceCropModal: false
      , replaceCropRatio: ''
      , replaceSelectedImageFile: null
      , replaceSelectedImageUrl: null
      , replaceDisplayRect: null
      , replaceCropSelX: 0
      , replaceCropSelY: 0
      , replaceCropSelW: 0
      , replaceCropSelH: 0
      , replaceIsDraggingSel: false
      , replaceIsResizingSel: false
      , replaceResizeDir: ''
      , replaceDragStartX: 0
      , replaceDragStartY: 0
      , replaceDragStartSelX: 0
      , replaceDragStartSelY: 0
      , replaceDragStartW: 0
      , replaceDragStartH: 0
      , sceneHistory: []
      , sceneHistoryLoading: false
      , selectedVersionId: null
      , versionPreviewVisible: false
      , versionPreviewUrl: ''
      , subtitleMaxWidthPx: 0
      , musicAudioEl: null
      , musicAudioFile: null
      , musicAudioUrl: ''
      , musicAudioName: ''
      , musicAudioDuration: 0
      , musicCurrentTime: 0
      , musicPlaying: false
      , subtitleText: ''
      , subtitleStyleFamily: ''
      , subtitleStyleFormat: ''
      , subtitleStyleSize: '20px'
      , subtitleStyleColor: '#ffffff'
      , subtitleStateLoading: false
      , subtitleStyleFromApi: false
      , subtitleStyleSaving: false
      , fontFamilyOptions: [
        { value: '', label: '默认' },
        // { value: 'PingFang SC', label: '苹方' },
        { value: 'Microsoft YaHei', label: '微软雅黑' },
        { value: 'Noto Sans SC', label: '思源黑体' },
        { value: 'SimHei', label: '黑体' },
        { value: 'SimSun', label: '宋体' },
        { value: 'KaiTi', label: '楷体' },
        { value: 'FangSong', label: '仿宋' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Georgia', label: 'Georgia' }
      ]
      , fontWeightOptions: [
        { value: '', label: '默认' },
        { value: 'bold', label: '粗' },
        { value: '500', label: '中' },
        { value: '300', label: '细' }
      ]
      , fontSizeOptions: ['16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '50px']
      , voiceSceneAudioEl: null
      , voiceSceneAudioUrl: ''
      , voiceSceneAudioDuration: 0
      , voiceSceneCurrentTime: 0
      , voiceScenePlaying: false
    }
  },
  beforeUnmount() {
    if (this.onFullscreenChange) {
      document.removeEventListener('fullscreenchange', this.onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
      document.removeEventListener('msfullscreenchange', this.onFullscreenChange)
      this.onFullscreenChange = null
    }
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
  },
  mounted() {
    this.onFullscreenChange = () => {
      this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
    }
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
    document.addEventListener('msfullscreenchange', this.onFullscreenChange)

    const projectId = this.$route.params.id
    let initialLoading = false
    try { initialLoading = localStorage.getItem(`video-edit:loading:${projectId}`) === '1' } catch (e) { initialLoading = false }
    if (initialLoading) this.isConverting = true
    try {
      const aspect = localStorage.getItem(`project:aspectRatio:${projectId}`)
      if (aspect) this.aspectRatio = aspect
    } catch (e) { void 0 }

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
          this.loadSubtitleState()
          this.$nextTick(() => { this.initLeftPanelScript() })
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
          this.loadSubtitleState()
          this.$nextTick(() => { this.initLeftPanelScript() })
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
    try {
      const saved = localStorage.getItem('darkMode')
      if (saved === 'true' || saved === '1') {
        document.documentElement.setAttribute('data-theme', 'dark')
        this.isDark = true
      } else if (saved === 'false' || saved === '0') {
        document.documentElement.removeAttribute('data-theme')
        this.isDark = false
      } else {
        this.isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      }
    } catch (e) { /* no-op */ }
    // Check if returning from Lip Sync generation (after scenes loaded)
    try {
      const q = this.$route.query
      if (q && q.taskId && q.sceneIndex !== undefined) {
        const tid = String(q.taskId)
        const idx = Number(q.sceneIndex)
        if (tid && Number.isFinite(idx)) {
          this.$nextTick(() => {
            if (this.scenes && this.scenes[idx]) {
              this.activeSceneIndex = idx
              this.onLipSyncTaskCreated(tid)
            }
          })
          this.$router.replace({ name: 'VideoEdit', params: { id: projectId }, query: {} })
        }
      }
    } catch (e) { console.warn('Check Lip Sync return failed:', e) }

    this.$nextTick(() => { this.initTimelineSync() })
    if (initialLoading) {
      setTimeout(() => {
        this.isConverting = false
        try { localStorage.removeItem(`video-edit:loading:${projectId}`) } catch (e) { void 0 }
      }, 800)
    }
    // 禁止进入页面自动调用分镜详情接口：不再进行当前分镜/预取调用
    if (!this._entryIsGenerate) { this.pollImagesActive = true; this.pollStoryboardImagesDetail() }
    this.precacheSceneThumbnails()
    if (this.voiceName && (!this.supportedLanguages || this.supportedLanguages.length === 0)) {
      this.supportedLanguages = [
        'Chinese', 'English', 'Japanese', 'Korean', 'French',
        'German', 'Spanish', 'Italian', 'Russian', 'Portuguese',
        'Hindi', 'Arabic'
      ]
    }
    // this.$nextTick(() => { this.tryAttachHls() })
    Promise.resolve().then(async() => {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (token) {
          const status = await getUserBasicStatus(token)
          const balance = (status && status.code === 0 && status.data && Number(status.data.pointsBalance)) || 0
          this.userStore.setUser({
            ...this.userStore.userInfo,
            pointsBalance: balance
          })
        }
      } catch (e) { /* no-op */ }
    })
    Promise.resolve().then(async() => {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const imgText = await getStoryboardImagesDetail({ videoId, token })
        let imgResp = null
        try { imgResp = JSON.parse(imgText) } catch { imgResp = null }
        const list = imgResp && imgResp.code === 0 && Array.isArray(imgResp.data) ? imgResp.data : []
        try {
          const modSet = new Set()
          for (const it of list) {
            const sn = String((it && it.scene_number) || '').trim()
            const vurl = String((it && it.video_url) || '').trim()
            if (sn && this.isModifyingStatus(vurl)) modSet.add(sn)
          }
          if (modSet.size) {
            const arr = Array.isArray(this.scenes) ? this.scenes : []
            for (let i = 0; i < arr.length; i++) {
              const sc = arr[i] || {}
              const sn = String((sc && sc.scene_number) || '').trim()
              if (sn && modSet.has(sn)) {
                sc.hasVideo = false
                sc.video_url = 'modifying'
                sc.clips = []
              }
            }
          }
        } catch (e) { void 0 }
        const text = await getStoryboardSceneDetail({ videoId, sceneNumber: list[0].scene_number, token })
        let json
        try { json = JSON.parse(text) } catch { json = null }
        const data = json && json.data ? json.data : null
        if (data) {
          const refImg = this.cleanUrl(data.reference_image_url || '')
          const vurl = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
          const audioUrl = ('audio_url' in data && data.audio_url === null) ? null : this.cleanUrl(data.audio_url || '')
          this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: vLocal || vurl, audio_url: audioUrl }
          this.syncPreviewPlayback()
        }
      } catch (e) { void 0 }
    })
    Promise.resolve().then(async() => {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const text = await getWorksVideoStatus({ videoId, token })
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const data = obj && obj.data ? obj.data : obj
        this.worksVideoReady = !!(data && data.video === true)
      } catch (e) { void 0 }
    })
    Promise.resolve().then(async() => {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const resp = await getWorksVideoDetail({ id: videoId, token })
        const data = resp && resp.code === 0 ? (resp.data || resp) : null
        const url = this.cleanUrl((data && (data.background_music_url || (data.work && data.work.backgroundMusicUrl))) || '')
        if (url) {
          this.musicAudioUrl = url
          this.musicAudioName = '背景音乐'
          const el = new Audio(url)
          try { el.crossOrigin = 'anonymous' } catch (e) { void 0 }
          el.addEventListener('loadedmetadata', () => { this.musicAudioDuration = Number(el.duration) || 0 })
          el.addEventListener('timeupdate', () => { this.musicCurrentTime = Number(el.currentTime) || 0 })
          el.addEventListener('ended', () => { this.musicPlaying = false })
          this.musicAudioEl = el
          this.musicPlaying = false
        }
      } catch (e) { void 0 }
    })
    Promise.resolve().then(async() => {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const imgText = await getStoryboardImagesDetail({ videoId, token })
        let imgResp = null
        try { imgResp = JSON.parse(imgText) } catch { imgResp = null }
        const list = imgResp && imgResp.code === 0 && Array.isArray(imgResp.data) ? imgResp.data : []
        try {
          const modSet = new Set()
          for (const it of list) {
            const sn = String((it && it.scene_number) || '').trim()
            const vurl = String((it && it.video_url) || '').trim()
            if (sn && this.isModifyingStatus(vurl)) modSet.add(sn)
          }
          if (modSet.size) {
            const arr = Array.isArray(this.scenes) ? this.scenes : []
            for (let i = 0; i < arr.length; i++) {
              const sc = arr[i] || {}
              const sn = String((sc && sc.scene_number) || '').trim()
              if (sn && modSet.has(sn)) {
                sc.hasVideo = false
                sc.video_url = 'modifying'
                sc.clips = []
              }
            }
          }
        } catch (e) { void 0 }
        try {
          const audioMap = new Map()
          for (const item of list) {
            const sn = String((item && item.scene_number) || '').trim()
            const au = this.cleanUrl((item && item.audio_url) || '')
            if (sn && au) audioMap.set(sn, au)
          }
          if (audioMap.size) {
            const arr = Array.isArray(this.scenes) ? this.scenes : []
            for (let i = 0; i < arr.length; i++) {
              const sc = arr[i]
              const sn = String((sc && sc.scene_number) || '').trim()
              const au = audioMap.get(sn)
              if (au) {
                if (this.$set) this.$set(sc, 'audio_url', au); else sc.audio_url = au
                if (i === this.activeSceneIndex) {
                  const sd = this.sceneDetail || {}
                  this.sceneDetail = Object.assign({}, sd, { audio_url: au })
                }
              }
            }
          }
        } catch (e) { void 0 }
        const sceneNumber = list[0].scene_number || ''
        const obj = await getSceneVersionHistory({ videoId, sceneNumber, token })
        const arr = obj && obj.code === 0 && Array.isArray(obj.data) ? obj.data : []
        this.sceneHistory = arr
          .map(x => ({ ...x, content: this.cleanUrl(x.content || ''), createdAt: x.createdAt || x.created_at }))
          .filter(x => !!x.content)
        if (this.sceneHistory.length) this.selectedVersionId = this.sceneHistory[0].id
      } catch (e) { void 0 }
    })
    this.$nextTick(() => {
      this.scrollLeftToBottom()
      setTimeout(() => { this.scrollLeftToBottom() }, 300)
      setTimeout(() => { this.scrollLeftToBottom() }, 1000)
    })
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    subtitleOverlayStyle() {
      const w = Math.max(0, Number(this.subtitleMaxWidthPx) || 0)
      const s = w ? { maxWidth: `${w  }px` } : {}
      const fam = String(this.subtitleStyleFamily || '').trim()
      const fmt = String(this.subtitleStyleFormat || '').trim()
      const size = String(this.subtitleStyleSize || '').trim()
      const color = String(this.subtitleStyleColor || '').trim()
      if (fam) s.fontFamily = fam
      if (fmt) s.fontWeight = fmt
      if (size) s.fontSize = size
      if (color) s.color = color
      return s
    },
    sortedSceneHistory() {
      const arr = Array.isArray(this.sceneHistory) ? [...this.sceneHistory] : []
      let mode = String(this.lastPreviewMode || '').toLowerCase()
      if (!mode) {
        const hasVid = this.hasVideoThumb()
        const hasImg = this.shouldRenderImage(this.sceneDetail.reference_image_url || this.scenes[this.activeSceneIndex]?.thumbnail)
        if (hasVid && hasImg) mode = 'video'
      }
      const filtered = arr.filter(x => {
        const t = String((x && (x.changeType || x.change_type)) || '').toUpperCase()
        if (t === 'SCRIPT') return false
        if (mode === 'image') return t === 'IMAGE'
        if (mode === 'video') return t === 'VIDEO'
        return true
      })
      const toTs = (x) => {
        const s = String((x && (x.createdAt || x.created_at)) || '').replace('T', ' ').trim()
        const d = new Date(s)
        return Number.isFinite(d.getTime()) ? d.getTime() : 0
      }
      return filtered.sort((a, b) => toTs(a) - toTs(b))
    },
    isVip() {
      return this.userStore && this.userStore.userInfo && this.userStore.userInfo.vipStatus === 'ACTIVE'
    },
    currentPreviewUrl() {
      const v = this.cleanUrl(this.sceneDetail.video_url || '')
      const img = this.cleanUrl(this.sceneDetail.reference_image_url || '')
      const vLower = v.toLowerCase()
      if (vLower === 'replaceimage') return img || ''
      if (v) return v
      if (img) return img
      const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const clip = this.cleanUrl((sc && Array.isArray(sc.clips) && sc.clips[0] && sc.clips[0].url) || '')
      const sv = this.cleanUrl((sc && sc.video_url) || '')
      const si = this.cleanUrl((sc && sc.thumbnail) || '')
      if (sv) return sv
      if (clip) return clip
      return si || ''
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
    allVideosReady() {
      const arr = Array.isArray(this.scenes) ? this.scenes : []
      if (arr.length === 0) return false
      return arr.every(sc => {
        const u = this.cleanUrl(sc && sc.video_url || '')
        return !!u && this.isVideo(u)
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
      const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const existingVid = this.cleanUrl((scene && scene.video_url) || (first && first.url) || '')
      const processedVideo = !!(scene && scene.hasVideo) || (!!existingVid && this.isVideo(existingVid))
      const hasImg = this.shouldRenderImage(this.cleanUrl(this.sceneDetail.reference_image_url || ''))
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
      const hasApi = this.shouldRenderImage(apiImg)
      const hasThumb = this.shouldRenderImage(thumb)
      return !hasApi && !hasThumb
    },
    replaceCropSelectBoxStyle() {
      const rect = this.replaceDisplayRect
      if (!rect) return {}
      const x = Math.round(this.replaceCropSelX || 0)
      const y = Math.round(this.replaceCropSelY || 0)
      const w = Math.max(0, Math.round(this.replaceCropSelW || 0))
      const h = Math.max(0, Math.round(this.replaceCropSelH || 0))
      return { left: `${x  }px`, top: `${y  }px`, width: `${w  }px`, height: `${h  }px`, position: 'absolute' }
    },
    // 判断指定分镜是否应该显示骨架屏
    shouldShowSkeletonForScene() {
      return (sceneIndex) => {
        const scene = this.scenes[sceneIndex]
        if (!scene) return false
        if (this.isSceneUpdating(scene, sceneIndex)) return true

        // 使用 isVideoPendingScene 方法判断视频是否正在生成
        // 该方法会检查 video_url === null，即使重新进入页面也能正确判断
        if (this.isVideoPendingScene(scene, sceneIndex)) {
          // 检查是否有视频
          const hasVid = this.isVideo(scene.video_url || '') ||
                        (Array.isArray(scene.clips) && scene.clips.length > 0 &&
                         this.isVideo(scene.clips[0].url || ''))
          // 没有视频就显示骨架屏
          if (!hasVid) return true
        }

        return false
      }
    },
    // 当前激活分镜是否显示骨架屏
    shouldShowActiveSkeleton() {
      return this.shouldShowSkeletonForScene(this.activeSceneIndex)
    },
    // 判断是否应该显示视频
    shouldShowVideo() {
      if (this.lastPreviewMode === 'image') return false
      const videoUrl = this.sceneDetail.video_url
      if (!videoUrl || videoUrl === null) return false
      const cleanedUrl = this.cleanUrl(videoUrl)
      return !!cleanedUrl && this.isVideo(cleanedUrl)
    },
    // 判断是否应该显示图片
    shouldShowImage() {
      if (this.lastPreviewMode === 'video') return false
      // 如果应该显示骨架屏，则不显示图片
      if (this.shouldShowActiveSkeleton) return false

      // 如果有视频，则不显示图片
      if (this.shouldShowVideo) return false

      // 显示图片（没点击一键转视频，或点击了但没有视频）
      const imageUrl = this.sceneDetail.reference_image_url ||
                       this.scenes[this.activeSceneIndex]?.thumbnail
      return this.shouldRenderImage(imageUrl)
    }
  },
  watch: {
    activeSceneIndex() {
      this.previewImgErrored = false
      this.voiceScript = ''
      try {
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
        const ref = this.cleanUrl((sc && sc.thumbnail) || '')
        const rawVid = (first && first.url) || (sc && sc.video_url)
        const vid = (rawVid === null || this.isModifyingStatus(rawVid)) ? null : this.cleanUrl(rawVid || '')
        const audio = this.cleanUrl((sc && sc.audio_url) || '')
        this.sceneDetail = { reference_image_url: ref, video_url: vid, audio_url: audio }
        try {
          const t = sc && sc.scene_script && sc.scene_script.dialogue_or_narration ? String(sc.scene_script.dialogue_or_narration) : ''
          this.subtitleText = t
        } catch (e) { void 0 }
        this.syncPreviewPlayback()
      } catch (e) { void 0 }
      // this.$nextTick(() => { this.tryAttachHls() })
      this.$nextTick(() => { this.fetchSceneHistoryForActiveScene() })
      this.$nextTick(() => {
        if (this.lastPreviewMode === 'image') this.switchPreviewTo('image')
        else if (this.lastPreviewMode === 'video') this.switchPreviewTo('video')
      })
    },
    'sceneDetail.reference_image_url'(val) {
      this.previewImgErrored = false
      this.$nextTick(() => { this.updateSubtitleMaxWidth() })
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
      try { this._previewLoadSrc = '' } catch (e) { void 0 }
      // this.$nextTick(() => { this.tryAttachHls() })
      this.$nextTick(() => { this.updateActiveSceneDurationFromVideo() })
      this.$nextTick(() => { this.updateSubtitleMaxWidth() })
    },
    'sceneDetail.audio_url'(val) {
      try {
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const explicitNull = ((this.sceneDetail && this.sceneDetail.audio_url === null) || (sc && sc.audio_url === null))
        const url = explicitNull ? '' : this.cleanUrl((val != null ? val : (sc && sc.audio_url)) || '')
        if (this.voiceSceneAudioEl) { try { this.voiceSceneAudioEl.pause() } catch (e) { void 0 } this.voiceSceneAudioEl = null }
        this.voiceSceneAudioUrl = ''
        this.voiceScenePlaying = false
        this.voiceSceneAudioDuration = 0
        this.voiceSceneCurrentTime = 0
        if (url && !explicitNull) {
          this.voiceSceneAudioUrl = url
          const el = new Audio(url)
          try { el.crossOrigin = 'anonymous' } catch (e) { void 0 }
          el.addEventListener('loadedmetadata', () => { this.voiceSceneAudioDuration = Number(el.duration) || 0 })
          el.addEventListener('timeupdate', () => { this.voiceSceneCurrentTime = Number(el.currentTime) || 0 })
          el.addEventListener('ended', () => { this.voiceScenePlaying = false })
          this.voiceSceneAudioEl = el
          this.voiceScenePlaying = false
        }
      } catch (e) { void 0 }
    },
    isConverting(val) {
      if (!val) this.$nextTick(() => { this.initTimelineSync() })
    },
    activeTab(val) {
      if (val === 'subtitle') {
        try {
          const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
          const t = sc && sc.scene_script && sc.scene_script.dialogue_or_narration ? String(sc.scene_script.dialogue_or_narration) : ''
          this.subtitleText = t
        } catch (e) { void 0 }
        this.loadSubtitleState()
      }
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
    },
    replaceCropRatio(val) {
      if (val && val !== 'free') {
        this.$nextTick(() => { this.initReplaceSelection() })
      }
    }
  },
  methods: {
    applySubtitleText() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        const text = String(this.subtitleText || '').trim()
        if (!videoId || !sceneNumber || !token) return
        const p1 = updateSubtitleState({
          token, workId: String(videoId), sceneNumber, workType: 'script_creation',
          fontFamily: this.subtitleStyleFamily || '', fontFormat: this.subtitleStyleFormat || '', fontSize: this.subtitleStyleSize || '20px', fontColor: this.subtitleStyleColor || '#ffffff'
        })
        const p2 = updateSceneScript({ videoid: String(videoId), scene_number: sceneNumber, text, token })
        Promise.all([p1, p2]).then(([resp1, resp2]) => {
          const ok1 = !!(resp1 && ((resp1.code === 0) || resp1.success === true))
          const ok2 = !!(resp2 && resp2.code === 0)
          if (ok2 && sc) {
            if (!sc.scene_script) sc.scene_script = {}
            sc.scene_script.dialogue_or_narration = text
          }
          const ok = ok1 && ok2
          this.toastText = ok ? '应用成功' : '更新失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }).catch(() => {
          this.toastText = '更新失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        })
      } catch (e) { void 0 }
    },
    async loadSubtitleState() {
      try {
        this.subtitleStateLoading = true
        this.subtitleStyleFromApi = false
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !token) { this.subtitleStateLoading = false; return }
        const resp = await getSubtitleState({ token, workId: String(videoId), workType: 'script_creation', sceneNumber })
        const data = resp && resp.code === 0 ? (resp.data || null) : null
        if (data && typeof data === 'object') {
          this.subtitleStyleFamily = String(data.fontFamily || this.subtitleStyleFamily || '')
          this.subtitleStyleFormat = String(data.fontFormat || this.subtitleStyleFormat || '')
          this.subtitleStyleSize = String(data.fontSize || this.subtitleStyleSize || '20px')
          this.subtitleStyleColor = String(data.fontColor || this.subtitleStyleColor || '#ffffff')
          this.subtitleStyleFromApi = true
        } else {
          // 返回为 null 时恢复为默认样式
          this.subtitleStyleFamily = ''
          this.subtitleStyleFormat = ''
          this.subtitleStyleSize = '20px'
          this.subtitleStyleColor = '#ffffff'
          this.subtitleStyleFromApi = false
        }
      } catch (e) { void 0 } finally { this.subtitleStateLoading = false }
    },
    async updateSubtitleStyle() {
      try {
        this.subtitleStyleSaving = true
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !token) { this.subtitleStyleSaving = false; return }
        const resp = await updateSubtitleState({
          token, workId: String(videoId), sceneNumber, workType: 'script_creation',
          fontFamily: this.subtitleStyleFamily || '', fontFormat: this.subtitleStyleFormat || '', fontSize: this.subtitleStyleSize || '20px', fontColor: this.subtitleStyleColor || '#ffffff'
        })
        const ok = !!(resp && ((resp.code === 0) || resp.success === true))
        this.toastText = ok ? '字幕样式已更新' : ((resp && (resp.message || resp.msg)) || '更新失败')
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
        if (ok) this.subtitleStyleFromApi = true
      } catch (e) {
        this.toastText = '更新失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      } finally {
        this.subtitleStyleSaving = false
      }
    },
    toggleVoiceSceneAudio() {
      const el = this.voiceSceneAudioEl
      if (!el) return
      if (this.voiceScenePlaying) {
        try { el.pause() } catch (e) { void 0 }
        this.voiceScenePlaying = false
      } else {
        try { el.currentTime = Math.max(0, this.voiceSceneCurrentTime || 0) } catch (e) { void 0 }
        const p = el.play()
        if (p && p.then) p.then(() => { this.voiceScenePlaying = true }).catch(() => { this.voiceScenePlaying = false })
        else this.voiceScenePlaying = true
      }
    },
    seekVoiceSceneAudio(e) {
      try {
        const v = Number(e && e.target && e.target.value) || 0
        this.voiceSceneCurrentTime = Math.max(0, Math.min(v, Number(this.voiceSceneAudioDuration) || v))
        const el = this.voiceSceneAudioEl
        if (el) { try { el.currentTime = this.voiceSceneCurrentTime } catch (err) { void 0 } }
      } catch (err) { void 0 }
    },
    async deleteBackgroundMusicByApi() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !token) return
        const resp = await deleteBackgroundMusicApi({ token, videoId })
        const ok = !!(resp && ((resp.code === 0) || resp.success === true))
        if (ok) { this.removeMusicAudio() }
        this.toastText = ok ? '背景音乐已删除' : ((resp && (resp.message || resp.msg)) || '删除失败')
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      } catch (e) {
        this.toastText = '删除失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    async deleteVoiceover() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !token) return
        const resp = await deleteAliTts({ token, videoId: String(videoId), shotId: sceneNumber })
        const ok = !!(resp && ((resp.code === 0) || resp.success === true))
        if (ok) {
          try { if (this.voiceSceneAudioEl) { try { this.voiceSceneAudioEl.pause() } catch (e) { void 0 } this.voiceSceneAudioEl = null } } catch (e) { void 0 }
          this.voiceSceneAudioUrl = ''
          this.voiceScenePlaying = false
          this.voiceSceneAudioDuration = 0
          this.voiceSceneCurrentTime = 0
          if (sc) sc.audio_url = ''
        }
        this.toastText = ok ? '配音已删除' : ((resp && (resp.message || resp.msg)) || '删除失败')
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      } catch (e) {
        this.toastText = '删除失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    isModifyingStatus(v) {
      const s = String(v || '').trim().toLowerCase()
      return s === 'modifying'
    },
    toggleTheme() {
      this.isDark = !this.isDark
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
        try { localStorage.setItem('darkMode', 'true') } catch (e) { /* no-op */ }
      } else {
        document.documentElement.removeAttribute('data-theme')
        try { localStorage.setItem('darkMode', 'false') } catch (e) { /* no-op */ }
      }
    },
    determineSceneType(sc) {
      if (this.lastPreviewMode === 'image') return 'image'
      const rawV = (this.sceneDetail && this.sceneDetail.video_url) || (sc && sc.video_url) || ''
      const vstr = String(rawV || '').trim().toLowerCase()
      const isReplace = vstr === 'replace image' || vstr === 'replaceimage' || vstr === 'replace_image'
      const vurl = this.cleanUrl(rawV || '')
      if (vurl && this.isVideo(vurl) && !isReplace) return 'video'
      const img = this.cleanUrl((this.sceneDetail && this.sceneDetail.reference_image_url) || (sc && sc.thumbnail) || '')
      if (img) return 'image'
      return 'image'
    },
    updateSubtitleMaxWidth() {
      try {
        const cont = this.$refs.videoContainer
        const ve = this.$refs.previewVideo
        const ie = this.$refs.previewImage
        const basis = (ve && ve.clientWidth) || (ie && ie.clientWidth) || (cont && cont.clientWidth) || 0
        const pad = 48
        const w = Math.max(0, Math.floor(basis - pad))
        this.subtitleMaxWidthPx = w
      } catch (e) { /* no-op */ }
    },
    scrollLeftToBottom() {
      const el = this.$refs.sceneScrollable
      if (!el) return
      try { el.scrollTop = el.scrollHeight } catch (e) { void 0 }
    },
    async fetchSceneHistoryForActiveScene() {
      try {
        this.sceneHistoryLoading = true
        this.sceneHistory = []
        this.selectedVersionId = null
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !token) { this.sceneHistoryLoading = false; return }
        const obj = await getSceneVersionHistory({ videoId, sceneNumber, token })
        const arr = obj && obj.code === 0 && Array.isArray(obj.data) ? obj.data : []
        this.sceneHistory = arr
          .map(x => ({ ...x, content: this.cleanUrl(x.content || ''), createdAt: x.createdAt || x.created_at }))
          .filter(x => !!x.content)
        if (this.sceneHistory.length) this.selectedVersionId = this.sceneHistory[0].id
      } catch (e) {
        this.sceneHistory = []
      } finally {
        this.sceneHistoryLoading = false
      }
    },
    getActiveSceneVideoUrl() {
      const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const clip = sc && Array.isArray(sc.clips) && sc.clips[0] ? this.cleanUrl(sc.clips[0].url || '') : ''
      const v1 = this.cleanUrl((this.sceneDetail && this.sceneDetail.video_url) || '')
      const v1Lower = v1.toLowerCase()
      // 如果是 replaceimage，返回空
      if (v1Lower === 'replaceimage') return ''
      // 如果 sceneDetail.video_url 是视频，优先返回
      if (v1 && this.isVideo(v1)) return this.preferMp4(v1)

      const v2 = this.cleanUrl((sc && sc.video_url) || '')
      const v2Lower = v2.toLowerCase()
      // 如果 scene.video_url 是 replaceimage，返回空
      if (v2Lower === 'replaceimage') return ''
      // 如果 scene.video_url 是视频，返回
      if (v2 && this.isVideo(v2)) return this.preferMp4(v2)

      // 如果 scene.hasVideo 为 true 且 clips 有视频 URL
      if (sc && sc.hasVideo) {
        const clipLower = clip.toLowerCase()
        if (clipLower !== 'replaceimage' && clip && this.isVideo(clip)) return this.preferMp4(clip)
      }

      // 没有视频，返回空
      return ''
    },
    getSceneVideoUrlForThumb() {
      const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
      const v2 = this.cleanUrl((sc && sc.video_url) || (first && first.url) || '')
      const v2Lower = v2.toLowerCase()
      if (!v2 || v2Lower === 'replaceimage') return ''
      return this.isVideo(v2) ? v2 : ''
    },
    hasVideoThumb() {
      const url = this.getSceneVideoUrlForThumb()
      return !!url && this.isVideo(url)
    },
    switchPreviewTo(mode) {
      const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      if (mode === 'video') {
        this.lastPreviewMode = 'video'
        const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
        const vurl = this.cleanUrl((sc && sc.video_url) || (first && first.url) || '')
        this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: vurl })
        this.$nextTick(() => { this.tryAttachHls && this.tryAttachHls() })
      } else {
        this.lastPreviewMode = 'image'
        const img = this.cleanUrl((this.sceneDetail && this.sceneDetail.reference_image_url) || (sc && sc.thumbnail) || '')
        this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: '', reference_image_url: img })
        this.previewImgErrored = false
        this.$nextTick(() => { this.updateSubtitleMaxWidth() })
      }
    },
    downloadImage(u) {
      try {
        const url = this.cleanUrl(u || '')
        if (!url) return
        const a = document.createElement('a')
        a.href = url
        a.download = ''
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (e) { /* no-op */ }
    },
    downloadImageDirect(u) {
      try {
        const url = this.cleanUrl(u || '')
        if (!url) return
        const a = document.createElement('a')
        a.href = url
        a.download = ''
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (e) { /* no-op */ }
    },
    openVersionPreview(u) {
      this.versionPreviewUrl = this.cleanUrl(u || '')
      this.versionPreviewVisible = !!this.versionPreviewUrl
    },
    closeVersionPreview() {
      this.versionPreviewVisible = false
      this.versionPreviewUrl = ''
    },
    handleVideoContainerClick() {

    },
    startEditSubtitle() {
      if (this.isEditingSubtitle) return
      const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const t = sc && sc.scene_script && sc.scene_script.dialogue_or_narration ? String(sc.scene_script.dialogue_or_narration) : ''
      this.editingSubtitleText = t
      this.isEditingSubtitle = true
      this.$nextTick(() => {
        try {
          const el = this.$refs && this.$refs.subtitleInput
          if (el && el.focus) {
            el.focus()
            const len = String(this.editingSubtitleText || '').length
            if (el.setSelectionRange) el.setSelectionRange(len, len)
          }
        } catch (e) { /* no-op */ }
      })
    },
    cancelSubtitleEdit() {
      this.isEditingSubtitle = false
      this.editingSubtitleText = ''
    },
    async saveSubtitleEdit() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        const text = String(this.editingSubtitleText || '').trim()
        if (!videoId || !sceneNumber || !token) return
        const resp = await updateSceneScript({ videoid: String(videoId), scene_number: sceneNumber, text, token })
        const ok = !!(resp && resp.code === 0)
        if (ok) {
          if (sc) {
            if (!sc.scene_script) sc.scene_script = {}
            sc.scene_script.dialogue_or_narration = text
          }
          this.isEditingSubtitle = false
          this.toastText = '字幕已更新'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else {
          const msg = (resp && (resp.message || resp.msg)) ? String(resp.message || resp.msg) : '更新失败'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      } catch (e) {
        this.toastText = '更新失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    onMusicFileSelected(e) {
      try {
        const f = e && e.target && e.target.files && e.target.files[0]
        if (!f) return
        if (!(f.type && f.type.startsWith('audio/'))) {
          this.toastText = '仅支持音频文件'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        if (this.musicAudioEl) { try { this.musicAudioEl.pause() } catch (err) { void 0 } this.musicAudioEl = null }
        this.musicAudioFile = f
        const url = URL.createObjectURL(f)
        this.musicAudioUrl = url
        this.musicAudioName = String(f.name || '音乐')
        const el = new Audio(url)
        try { el.crossOrigin = 'anonymous' } catch (e) { void 0 }
        el.addEventListener('loadedmetadata', () => { this.musicAudioDuration = Number(el.duration) || 0 })
        el.addEventListener('timeupdate', () => { this.musicCurrentTime = Number(el.currentTime) || 0 })
        el.addEventListener('ended', () => { this.musicPlaying = false })
        this.musicAudioEl = el
        this.musicPlaying = false
      } catch (err) { void 0 }
    },
    toggleMusicPlay() {
      const el = this.musicAudioEl
      if (!el) return
      if (this.musicPlaying) {
        try { el.pause() } catch (e) { void 0 }
        this.musicPlaying = false
      } else {
        try { el.currentTime = Math.max(0, this.musicCurrentTime || 0) } catch (e) { void 0 }
        const p = el.play()
        if (p && p.then) p.then(() => { this.musicPlaying = true }).catch(() => { this.musicPlaying = false })
        else this.musicPlaying = true
      }
    },
    seekMusicAudio(e) {
      try {
        const v = Number(e && e.target && e.target.value) || 0
        this.musicCurrentTime = Math.max(0, Math.min(v, Number(this.musicAudioDuration) || v))
        const el = this.musicAudioEl
        if (el) { try { el.currentTime = this.musicCurrentTime } catch (err) { void 0 } }
      } catch (err) { void 0 }
    },
    removeMusicAudio() {
      try { if (this.musicAudioEl) { try { this.musicAudioEl.pause() } catch (e) { void 0 } this.musicAudioEl = null } } catch (e) { void 0 }
      try { if (this.musicAudioUrl && /^blob:/.test(this.musicAudioUrl)) URL.revokeObjectURL(this.musicAudioUrl) } catch (e) { void 0 }
      this.musicAudioFile = null
      this.musicAudioUrl = ''
      this.musicAudioName = ''
      this.musicAudioDuration = 0
      this.musicCurrentTime = 0
      this.musicPlaying = false
      try { if (this.$refs && this.$refs.musicFileInput) this.$refs.musicFileInput.value = '' } catch (e) { void 0 }
    },
    formatSec(seconds) {
      const s = Math.max(0, Math.floor(Number(seconds) || 0))
      const mm = String(Math.floor(s / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      return `${mm}:${ss}`
    },
    handleMusicDrop(e) {
      try {
        const f = e && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
        if (!f) return
        if (!(f.type && f.type.startsWith('audio/'))) {
          this.toastText = '仅支持音频文件'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const evt = { target: { files: [f] } }
        this.onMusicFileSelected(evt)
      } catch (err) { void 0 }
    },
    async uploadBackgroundMusic() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !this.musicAudioFile || !token) {
          this.toastText = '缺少参数或未选择音乐'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const obj = await uploadBackgroundMusicApi({
          videoId: String(videoId),
          musicFile: this.musicAudioFile,
          filename: this.musicAudioName || 'music',
          token
        })
        const ok = !!(obj && obj.code === 0)
        this.toastText = ok ? '背景音乐上传成功' : ((obj && (obj.message || obj.msg)) || '背景音乐上传失败')
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      } catch (e) {
        this.toastText = '背景音乐上传失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    async applySceneVersionItem(v) {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const sceneNumber = String((sc && sc.scene_number) || '').trim()
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !v || !v.id || !token) return
        const obj = await applySceneVersion({ videoId: String(videoId), sceneNumber, versionId: String(v.id), token })
        const ok = !!(obj && obj.code === 0)
        if (ok) {
          const nextImg = this.cleanUrl(v.content || '')
          const local = nextImg ? await this.getLocalUrl(nextImg) : ''
          this.sceneDetail = { ...this.sceneDetail, reference_image_url: local || nextImg }
          const scn = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
          if (scn) scn.thumbnail = local || nextImg
          this.toastText = '应用成功'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
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
    async applySelectedSceneVersion() {
      const v = this.sceneHistory.find(x => x.id === this.selectedVersionId) || this.sceneHistory[0]
      if (!v) return
      await this.applySceneVersionItem(v)
    },
    triggerReplaceImageUpload() {
      const el = this.$refs.replaceFileInput
      if (el) el.click()
    },
    onReplaceImageFileSelected(e) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file) return
      if (!(file.type && file.type.startsWith('image/'))) {
        this.toastText = '仅支持图片文件'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
        return
      }
      const objectUrl = URL.createObjectURL(file)
      this.replaceSelectedImageFile = file
      this.replaceSelectedImageUrl = objectUrl
      this.showReplaceCropModal = true
    },
    onReplaceCropImageLoad() {
      this.computeReplaceDisplayRect()
      this.initReplaceSelection()
    },
    computeReplaceDisplayRect() {
      const imgEl = this.$refs.replaceCropImage
      const previewEl = this.$refs.replaceCropPreview
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
      this.replaceDisplayRect = { left, top, width: dispW, height: dispH }
    },
    initReplaceSelection() {
      const r = String(this.replaceCropRatio || '').trim()
      if (!this.replaceDisplayRect) return
      const W = this.replaceDisplayRect.width
      const H = this.replaceDisplayRect.height
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
      const x = Math.round(this.replaceDisplayRect.left + (W - w) / 2)
      const y = Math.round(this.replaceDisplayRect.top + (H - h) / 2)
      this.replaceCropSelW = w
      this.replaceCropSelH = h
      this.replaceCropSelX = x
      this.replaceCropSelY = y
    },
    onReplaceSelectMouseDown(e) {
      this.replaceIsDraggingSel = true
      this.replaceDragStartX = e.clientX
      this.replaceDragStartY = e.clientY
      this.replaceDragStartSelX = this.replaceCropSelX
      this.replaceDragStartSelY = this.replaceCropSelY
    },
    onReplaceHandleMouseDown(dir, e) {
      this.replaceIsResizingSel = true
      this.replaceResizeDir = String(dir || '')
      this.replaceDragStartX = e.clientX
      this.replaceDragStartY = e.clientY
      this.replaceDragStartSelX = this.replaceCropSelX
      this.replaceDragStartSelY = this.replaceCropSelY
      this.replaceDragStartW = this.replaceCropSelW
      this.replaceDragStartH = this.replaceCropSelH
    },
    onReplaceMouseMove(e) {
      if (!this.replaceDisplayRect) return
      if (this.replaceIsResizingSel) {
        this.resizeReplaceSelection(e)
        return
      }
      if (!this.replaceIsDraggingSel) return
      const dx = e.clientX - this.replaceDragStartX
      const dy = e.clientY - this.replaceDragStartY
      let nx = this.replaceDragStartSelX + dx
      let ny = this.replaceDragStartSelY + dy
      const minX = this.replaceDisplayRect.left
      const minY = this.replaceDisplayRect.top
      const maxX = this.replaceDisplayRect.left + this.replaceDisplayRect.width - this.replaceCropSelW
      const maxY = this.replaceDisplayRect.top + this.replaceDisplayRect.height - this.replaceCropSelH
      if (nx < minX) nx = minX
      if (ny < minY) ny = minY
      if (nx > maxX) nx = maxX
      if (ny > maxY) ny = maxY
      this.replaceCropSelX = nx
      this.replaceCropSelY = ny
    },
    onReplaceMouseUp() {
      this.replaceIsDraggingSel = false
      this.replaceIsResizingSel = false
    },
    resizeReplaceSelection(e) {
      const rStr = String(this.replaceCropRatio || '').trim()
      if (!this.replaceDisplayRect || !rStr || rStr === 'free') return
      const parts = rStr.split(':')
      const rw = parseFloat(parts[0]) || 1
      const rh = parseFloat(parts[1]) || 1
      const ratio = rw / rh
      const dx = e.clientX - this.replaceDragStartX
      const dy = e.clientY - this.replaceDragStartY
      const minX = this.replaceDisplayRect.left
      const minY = this.replaceDisplayRect.top
      const maxXEdge = this.replaceDisplayRect.left + this.replaceDisplayRect.width
      const maxYEdge = this.replaceDisplayRect.top + this.replaceDisplayRect.height
      let w = this.replaceDragStartW
      let h = this.replaceDragStartH
      let x = this.replaceDragStartSelX
      let y = this.replaceDragStartSelY
      const minW = 20
      const minH = Math.round(minW / ratio)
      if (this.replaceResizeDir === 'se') {
        w = this.replaceDragStartW + dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const maxWByRight = maxXEdge - this.replaceDragStartSelX
        const maxHByBottom = maxYEdge - this.replaceDragStartSelY
        const maxWByBottom = Math.floor(maxHByBottom * ratio)
        const maxWAllowed = Math.min(maxWByRight, maxWByBottom)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = this.replaceDragStartSelX
        y = this.replaceDragStartSelY
      } else if (this.replaceResizeDir === 'sw') {
        w = this.replaceDragStartW - dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorX = this.replaceDragStartSelX + this.replaceDragStartW
        const maxWByLeft = anchorX - minX
        const maxHByBottom = maxYEdge - this.replaceDragStartSelY
        const maxWByBottom = Math.floor(maxHByBottom * ratio)
        const maxWAllowed = Math.min(maxWByLeft, maxWByBottom)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = anchorX - w
        y = this.replaceDragStartSelY
      } else if (this.replaceResizeDir === 'ne') {
        w = this.replaceDragStartW + dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorY = this.replaceDragStartSelY + this.replaceDragStartH
        const maxWByRight = maxXEdge - this.replaceDragStartSelX
        const maxHByTop = anchorY - minY
        const maxWByTop = Math.floor(maxHByTop * ratio)
        const maxWAllowed = Math.min(maxWByRight, maxWByTop)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = this.replaceDragStartSelX
        y = anchorY - h
      } else if (this.replaceResizeDir === 'nw') {
        w = this.replaceDragStartW - dx
        if (w < minW) w = minW
        h = Math.round(w / ratio)
        const anchorX = this.replaceDragStartSelX + this.replaceDragStartW
        const anchorY = this.replaceDragStartSelY + this.replaceDragStartH
        const maxWByLeft = anchorX - minX
        const maxHByTop = anchorY - minY
        const maxWByTop = Math.floor(maxHByTop * ratio)
        const maxWAllowed = Math.min(maxWByLeft, maxWByTop)
        if (w > maxWAllowed) { w = maxWAllowed; h = Math.round(w / ratio) }
        x = anchorX - w
        y = anchorY - h
      }
      if (x < minX) x = minX
      if (y < minY) y = minY
      if (x + w > maxXEdge) x = maxXEdge - w
      if (y + h > maxYEdge) y = maxYEdge - h
      this.replaceCropSelX = Math.round(x)
      this.replaceCropSelY = Math.round(y)
      this.replaceCropSelW = Math.round(w)
      this.replaceCropSelH = Math.round(h)
    },
    cancelReplaceCrop() {
      this.showReplaceCropModal = false
      this.replaceSelectedImageFile = null
      this.replaceSelectedImageUrl = null
      this.replaceCropRatio = ''
    },
    async applyReplaceCrop() {
      try {
        const file = this.replaceSelectedImageFile
        const url = this.replaceSelectedImageUrl
        if (!file || !url) { this.cancelReplaceCrop(); return }
        const cropped = await this.cropReplaceToRatio(url, this.replaceCropRatio)
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const scene = this.scenes[this.activeSceneIndex] || {}
        const sceneNumber = String(scene.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const resp = await replaceStoryboardImage({ videoId, sceneNumber, file: cropped, token })
        let obj = null
        try { obj = typeof resp === 'string' ? JSON.parse(resp) : resp } catch (e) { obj = null }
        const ok = !!(obj && (obj.code === 0 || obj.success))
        if (ok) {
          const data = obj && obj.data ? obj.data : {}
          const remote = this.cleanUrl(data.reference_image_url || data.image_url || data.url || '')
          let next = remote
          if (!next) {
            next = URL.createObjectURL(cropped)
          }
          const sceneRef = this.scenes[this.activeSceneIndex]
          if (sceneRef) sceneRef.thumbnail = next
          this.sceneDetail = Object.assign({}, this.sceneDetail, { reference_image_url: next })
          try {
            const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
            let detail = null
            try { detail = JSON.parse(text) } catch { detail = null }
            const d = detail && detail.data ? detail.data : null
            if (d) {
              const refImg = this.cleanUrl(d.reference_image_url || next || '')
              const vurl = this.cleanUrl(d.fallback_mp4 || d.video_url || '')
              const audioUrl = this.cleanUrl(d.audio_url || '')
              const finalVid = vurl ? vurl : ''
              this.sceneDetail = Object.assign({}, this.sceneDetail, { reference_image_url: refImg, video_url: finalVid, audio_url: audioUrl })
            }
          } catch (e) { void 0 }
          this.toastText = '替换成功'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          this.$nextTick(() => { this.fetchSceneHistoryForActiveScene() })
        } else {
          const msg = (obj && (obj.message || obj.msg)) ? String(obj.message || obj.msg) : '替换失败，请重试'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2500)
        }
      } catch (e) {
        this.toastText = '替换失败，请稍后重试'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2500)
      } finally {
        this.showReplaceCropModal = false
      }
    },
    cropReplaceToRatio(objectUrl, ratioName) {
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
              if (this.replaceDisplayRect && this.replaceCropSelW && this.replaceCropSelH) {
                const scaleX = nW / this.replaceDisplayRect.width
                const scaleY = nH / this.replaceDisplayRect.height
                const selRelX = this.replaceCropSelX - this.replaceDisplayRect.left
                const selRelY = this.replaceCropSelY - this.replaceDisplayRect.top
                cropW = Math.round(this.replaceCropSelW * scaleX)
                cropH = Math.round(this.replaceCropSelH * scaleY)
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
                resolve(new File([blob], 'replace.png', { type: 'image/png' }))
              }, 'image/png', 0.92)
              return
            }
            let cropW = nW
            let cropH = nH
            let startX = 0
            let startY = 0
            if (this.replaceDisplayRect && this.replaceCropSelW && this.replaceCropSelH) {
              const scaleX = nW / this.replaceDisplayRect.width
              const scaleY = nH / this.replaceDisplayRect.height
              const selRelX = (this.replaceCropSelX - this.replaceDisplayRect.left)
              const selRelY = (this.replaceCropSelY - this.replaceDisplayRect.top)
              cropW = Math.round(this.replaceCropSelW * scaleX)
              cropH = Math.round(this.replaceCropSelH * scaleY)
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
              resolve(new File([blob], 'replace.png', { type: 'image/png' }))
            }, 'image/png', 0.92)
          } catch (err) { reject(err) }
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = objectUrl
      })
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
            this.toastText = `修改失败: ${  obj ? (obj.message || obj.msg) : '未知错误'}`
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
      /* HLS相关逻辑已停用 */
      return null
    },
    isM3u8(u) {
      const s = this.cleanUrl(u)
      return /\.m3u8(\?|#|$)/i.test(s)
    },
    preferMp4(u) {
      const s = this.cleanUrl(u)
      if (!s) return ''
      return this.isM3u8(s) ? s.replace(/\.m3u8/i, '.mp4') : s
    },
    async attachHls(videoEl, src) {
      /* HLS相关逻辑已停用 */
      return null
    },
    async tryAttachHls() {
      /* HLS相关逻辑已停用 */

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
      const lower = s.toLowerCase()
      if (!s) return false
      if (this.isGenerateFailed(s)) return false
      if (lower === 'replaceimage') return false
      if (/\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(s)) return false
      if (/^data:image\//i.test(s)) return false
      if (/^data:video\//i.test(s)) return true
      if (/\.(mp4|webm|mov)(\?|#|$)/i.test(s)) return true
      if (this.isM3u8(s)) return true
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
    hasAudio(scene, index) {
      try {
        if (!scene) return false
        const a1 = this.cleanUrl((scene && scene.audio_url) || '')
        if (a1) return true
        if (index === this.activeSceneIndex) {
          const a2 = this.cleanUrl((this.sceneDetail && this.sceneDetail.audio_url) || '')
          return !!a2
        }
        return false
      } catch (e) { return false }
    },
    getSceneKey(scene, index) {
      const sn = String((scene && scene.scene_number) || '').trim()
      if (sn) return `sn:${  sn}`
      const id = String((scene && scene.id) || index)
      return `id:${  id}`
    },
    isSceneUpdating(scene, index) {
      const set = this.updatingKeySet instanceof Set ? this.updatingKeySet : null
      if (!set) return false
      // const hasVideo = !!(scene && (scene.hasVideo || this.isVideo(this.cleanUrl((scene && Array.isArray(scene.clips) && scene.clips[0] && scene.clips[0].url) || scene.video_url || ''))))
      // if (hasVideo) return false
      const k = this.getSceneKey(scene, index)
      return set.has(k)
    },
    isVideoPendingScene(scene, index) {
      if (scene && (scene.video_url === null || this.isModifyingStatus(scene.video_url))) return true
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
            const p = audioEl.play()
            if (p && p.catch) p.catch(() => {})
          } catch (e) { void 0 }
        }

        if (!el) return
        if (!this.isPlaying) return
        try { el.muted = true } catch (e) { void 0 }
        try { el.playsInline = true } catch (e) { void 0 }
        const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const src = this.preferMp4((this.sceneDetail && this.sceneDetail.video_url) || (sc && Array.isArray(sc.clips) && sc.clips[0] && sc.clips[0].url) || (sc && sc.video_url) || '')
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
        // if (isHls) {
        //   if (this._hlsPreview && this._hlsPreviewUrl === src) {
        //     if (el.readyState >= 2) { requestAnimationFrame(safePlay) } else { const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }; try { el.addEventListener('canplay', onCanPlay, { once: true }) } catch (e) { void 0 } }
        //     return
        //   }
        //   try { this.attachHls(el, src).then(() => { if (el.readyState >= 2) { requestAnimationFrame(safePlay) } else { const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }; el.addEventListener('canplay', onCanPlay, { once: true }) } }) } catch (e) { void 0 }
        //   return
        // }
        if (el.readyState >= 2 && (el.currentSrc || el.src)) {
          safePlay()
        } else {
          const onCanPlay = () => { el.removeEventListener('canplay', onCanPlay); safePlay() }
          try { el.addEventListener('canplay', onCanPlay, { once: true }) } catch (e) { void 0 }
          if (this._previewLoadSrc !== src) {
            this._previewLoadSrc = src
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
          if (!audioSrc && this.isPlaying && !audioExplicitNull) {
            try { this.fetchCurrentSceneDetail() } catch (e) { void 0 }
          }
          if (this.isPlaying && audioEl.src) {
            try {
              if (audioEl.paused) {
                const p = audioEl.play()
                if (p && p.catch) p.catch(() => {})
              }
            } catch (e) { void 0 }
          }
        }

        if (this.sceneDetail && this.sceneDetail.video_url === null) {
          const el = this.$refs.previewVideo
          if (el) {
            try { el.pause(); el.currentTime = 0 } catch (e) { console.warn('预览暂停失败:', e) }
          }
          return
        }

        const el = this.$refs.previewVideo
        if (!el) return
        const rawVid = this.sceneDetail && this.sceneDetail.video_url
        let src = rawVid === null ? '' : this.cleanUrl(rawVid || '')
        if (!this.isVideo(src)) {
          const sc = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
          const firstClip = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
          const candidate = this.cleanUrl((sc && sc.video_url) || (firstClip && firstClip.url) || '')
          if (this.isVideo(candidate) && candidate !== src) {
            this.sceneDetail = Object.assign({}, this.sceneDetail, { video_url: candidate })
            src = candidate
          }
        }
        if (this._lastPreviewUrl === src) {
          return
        }
        this._lastPreviewUrl = src
        if (this.isVideo(this.currentPreviewUrl)) {
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
    formatDisplayTime(time) {
      const t = String(time || '').trim().replace('T', ' ')
      if (!t) return ''
      try {
        const d = new Date(t)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        const hh = String(d.getHours()).padStart(2, '0')
        const min = String(d.getMinutes()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`
      } catch (e) {
        return t
      }
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
      const preferUrl = prefer ? this.cleanUrl(prefer.video_url || prefer.reference_image_url || '') : ''
      const first = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const clipUrl = this.cleanUrl((first && first.url) || (scene && scene.video_url) || '')
      const primaryVideo = this.isVideo(clipUrl) ? clipUrl : (this.isVideo(preferUrl) ? preferUrl : '')
      const hasVideoClip = !!primaryVideo
      if (hasVideoClip) {
        baseUrl = primaryVideo
        const cached = (this.durationMap instanceof Map && primaryVideo) ? Number(this.durationMap.get(primaryVideo)) || 0 : 0
        duration = Number(first && first.durationMs) || cached || 5000
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
      return { width: `${widthPct  }%`, minWidth: '28px' }
    },
    onPreviewImgError() {
      this.previewImgErrored = true
    },
    getClipKey(index, cidx) {
      return `${String(index)  }:${  String(cidx)}`
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
      const rawVid = this.sceneDetail.video_url
      const isNullVid = rawVid === null
      let vidApi = isNullVid ? null : this.cleanUrl(rawVid || '')
      if (!vidApi) {
        const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
        const first = (active && Array.isArray(active.clips) && active.clips[0]) || null
        const vurl = this.cleanUrl((first && first.url) || (active && active.video_url) || '')
        if (!isNullVid && vurl && this.isVideo(vurl)) { vidApi = vurl }
      }
      if (imgApi || vidApi !== null) {
        this.sceneDetail = { reference_image_url: imgApi, video_url: isNullVid ? null : (vidApi || '') }
        return
      }
      const active = Array.isArray(this.scenes) ? this.scenes[this.activeSceneIndex] : null
      const thumb = this.cleanUrl((active && active.thumbnail) || '')
      this.sceneDetail = { reference_image_url: thumb, video_url: isNullVid ? null : '' }
    },
    async ensurePreviewFromScenes() {
      try {
        if (this.sceneDetail && this.sceneDetail.video_url === null) {
          this.syncPreviewPlayback()
          return
        }
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
            this.sceneDetail = { reference_image_url: refLocal || ref, video_url: vidLocal || vid, audio_url: audio }
            this.syncPreviewPlayback()
            break
          }
        }
      } catch (e) { void 0 }
      try {
        const active = this.scenes[this.activeSceneIndex] || {}
        const k = this.getSceneKey(active, this.activeSceneIndex)
        if (this.updatingKeySet && this.updatingKeySet.delete) this.updatingKeySet.delete(k)
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
      const elapsedSec = Math.max(0, Math.min(totalSeconds, absolutePx / pxPerSecond))
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
        const sceneNumber = String(scene.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const token = (this.userStore && this.userStore.token) || ''
        const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
        let json
        try { json = JSON.parse(text) } catch { json = null }
        const data = json && json.data ? json.data : null
        console.log(data)
        console.log(this.scenes)
        if (data) {
          const refImg = this.cleanUrl(data.reference_image_url || scene.thumbnail || '')
          // 优先使用 fallback_mp4，其次 video_url，保留 "replace image" 等特殊值
          const rawVideoUrl = data.fallback_mp4 || data.video_url || ''
          const vurl = this.cleanUrl(rawVideoUrl)
          console.log(vurl,1111)
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vlocal = vurl ? await this.getLocalUrl(vurl) : ''
          const incomingKey = String(data.scene_number || '').trim()
          const targetIndex = this.activeSceneIndex
          const duration = Number(data.duration) ? Number(data.duration) * 1000 : undefined

          if (targetIndex >= 0 && targetIndex < this.scenes.length) {
            const target = this.scenes[targetIndex]
            console.log(target,333333)
            if (refImg) target.thumbnail = refImg
            target.audio_url = ('audio_url' in data && data.audio_url === null) ? null : this.cleanUrl(data.audio_url || '')
            console.log(target.audio_url,555)
            // 检查是否是真正的视频 URL（排除 "replace image" 等特殊值）
            const isRealVideo = vurl && this.isVideo(vurl)
            if (isRealVideo) {
              const first = (target && Array.isArray(target.clips) && target.clips[0]) || null
              const existingVid = this.cleanUrl((target && target.video_url) || (first && first.url) || '')
              const alreadyProcessed = !!(target && target.hasVideo) && (!!existingVid && this.isVideo(existingVid))
              if (!(alreadyProcessed && existingVid === vurl)) {
                if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
                this.pendingVideoSet.add(k)
                this.queueVideoForScene(targetIndex, vurl, undefined, incomingKey, k, duration)
              } else {
                // 已存在视频，检查是否需要更新时长
                if (duration && first) {
                  first.durationMs = duration
                  if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
                  this.durationMap.set(vurl, duration)
                  if (vlocal) this.durationMap.set(vlocal, duration)
                }
              }
            } else if (!this.isVideoGenerating && (!Array.isArray(target.clips) || !target.clips.length)) {
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
            }
            // 当 video_url 是 "replace image" 时，标记场景为图片状态
            const isReplaceImage = vurl && vurl.toLowerCase() === 'replaceimage'
            const isModifying = this.isModifyingStatus(vurl)
            if (isReplaceImage) {
              target.video_url = 'replaceimage'
              target.hasVideo = false
              // 关键：把 clips 也更新为图片 URL，否则 getActiveSceneVideoUrl() 会返回旧的视频 URL
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
            } else if (isModifying) {
              target.video_url = 'modifying'
              target.hasVideo = false
              target.clips = []
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
            const content = (data && data.prompt && data.prompt.content) ? data.prompt.content : ((data && data.scene_script && data.scene_script.content) ? data.scene_script.content : null)
            if (content) {
              const scriptObj = Object.assign({}, target.scene_script || {})
              if (content.shot_title) scriptObj.shot_title = content.shot_title
              if (content.visual_description) scriptObj.visual_description = content.visual_description
              if (content.dialogue_or_narration) scriptObj.dialogue_or_narration = content.dialogue_or_narration
              if (content.camera_direction) scriptObj.camera_direction = content.camera_direction
              if (this.$set) this.$set(target, 'scene_script', scriptObj); else target.scene_script = scriptObj
              try { this.subtitleText = String(content.dialogue_or_narration || '') } catch (e) { /* no-op */ }
              if (content.visual_description) target.description = content.visual_description
              if (!target.scene_number) target.scene_number = incomingKey || content.shot_id || undefined
            }
          }
          const target = this.scenes[targetIndex] || {}
          const firstClip = (target && Array.isArray(target.clips) && target.clips[0]) || null
          const clipUrl = this.cleanUrl((firstClip && firstClip.url) || '')
          const targetVid = this.cleanUrl(target && target.video_url || '')
          console.log(vlocal)
          console.log(vurl)
          console.log(targetVid)
          console.log(clipUrl)

          // const nextVideo = vlocal || vurl || (this.isVideo(targetVid) ? targetVid : (this.isVideo(clipUrl) ? clipUrl : ''))
          const nextVideo = (this.isVideo(vurl) ? (vlocal || vurl) : null)
          const sdAudio = ('audio_url' in data && data.audio_url === null) ? null : this.cleanUrl(data.audio_url || '')
          // 确保 reference_image_url 有回退值
          this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: nextVideo, audio_url: sdAudio }
          console.log(this.sceneDetail,2222222)
          if (targetIndex === this.activeSceneIndex) this.syncPreviewPlayback()
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
            const vurl = this.cleanUrl(item.fallback_mp4 || item.video_url || '')
            if (item.audio_url) {
              if (this.$set) this.$set(sc, 'audio_url', this.cleanUrl(item.audio_url)); else sc.audio_url = this.cleanUrl(item.audio_url)
              if (idx === this.activeSceneIndex) {
                this.sceneDetail = { reference_image_url: sc.thumbnail, video_url: sc.video_url, audio_url: sc.audio_url }
                this.syncPreviewPlayback()
              }
            }
            const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
            const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
            if (refImg) sc.thumbnail = refImg
            if (vurl) {
              const apiDur = Number(item.duration) ? Number(item.duration) * 1000 : undefined
              let dur = 5000
              if (apiDur) {
                dur = apiDur
              } else {
                dur = this.isVideo(vurl) ? await this.measureVideoDurationMs(vurl) : 5000
              }
              sc.clips = [{ url: vurl, durationMs: dur }]
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              this.durationMap.set(vurl, dur)
              if (vLocal) this.durationMap.set(vLocal, dur)
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
          const vurl = this.cleanUrl(activeItem.fallback_mp4 || activeItem.video_url || '')
          const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
          const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
          this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: vLocal || null }
        }
      } catch (e) { void 0 }
    },
    async pollStoryboardImagesDetail() {
      if (!this.pollImagesActive) return
      const projectId = this.$route.params.id
      const showSkel = localStorage.getItem(`video-edit:viewStoryboard:${projectId}`) === '1'
      try {
        if (showSkel) this.isConverting = true
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        for (; ;) {
          if (!this.pollImagesActive) break
          try {
            const curVideoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
            const text = await getStoryboardImagesDetail({ videoId: curVideoId, token })
            let resp = null
            try { resp = JSON.parse(text) } catch { resp = null }
            const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
            if (list.length) {
              const map = new Map()
              const idxMap = new Map()
              let anyVideoQueued = false
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                const oi = Number(item.order_index || item.orderIndex)
                const idx = Number.isFinite(oi) && oi > 0 ? oi - 1 : i
                while (idx >= this.scenes.length) {
                  this.scenes.push({ id: Date.now() + this.scenes.length, title: `分镜${this.scenes.length + 1}`, description: '', thumbnail: '', clips: [], order_index: this.scenes.length + 1 })
                }
                const sc = this.scenes[idx]
                const refImg = this.cleanUrl(item.reference_image_url || '')
                const vurl = this.cleanUrl(item.video_url || '')
                const shotTitle = (item && item.scene_script && item.scene_script.shot_title) || item.shot_title || ''
                const visualDesc = (item && item.scene_script && item.scene_script.visual_description) || item.visual_description || ''
                const sceneKey = String(item.scene_number || '').trim()
                if (sceneKey) map.set(sceneKey, { video_url: this.isVideo(vurl) ? vurl : '', reference_image_url: refImg })
                if (Number.isFinite(oi) && oi > 0) map.set(`oi:${oi}`, { video_url: this.isVideo(vurl) ? vurl : '', reference_image_url: refImg })
                if (refImg) {
                  sc.thumbnail = refImg
                  if (!Array.isArray(sc.clips) || !sc.clips.length) sc.clips = [{ url: refImg, durationMs: 5000 }]
                }
                const isMod = this.isModifyingStatus(vurl)
                if (isMod) {
                  sc.video_url = 'modifying'
                  sc.hasVideo = false
                  sc.clips = []
                  if (idx === this.activeSceneIndex) {
                    const activeThumb = this.cleanUrl(sc.thumbnail || '')
                    this.sceneDetail = { reference_image_url: activeThumb, video_url: null }
                  }
                } else if (this.worksVideoReady && (!vurl || !this.isVideo(vurl))) {
                  // 检查是否是 "replace image" 状态
                  const isReplaceImage = vurl && vurl.toLowerCase() === 'replaceimage'
                  sc.video_url = isReplaceImage ? 'replaceimage' : null
                  sc.hasVideo = false
                  // 关键：把 clips 也更新为图片 URL
                  sc.clips = [{ url: refImg, durationMs: 5000 }]
                  if (idx === this.activeSceneIndex) {
                    const activeThumb = this.cleanUrl(sc.thumbnail || '')
                    this.sceneDetail = { reference_image_url: activeThumb, video_url: isReplaceImage ? 'replaceimage' : null }
                  }
                } else if (vurl && this.isVideo(vurl)) {
                  const first = (sc && Array.isArray(sc.clips) && sc.clips[0]) || null
                  const existingVid = this.cleanUrl((sc && sc.video_url) || (first && first.url) || '')
                  const alreadyProcessed = !!(sc && sc.hasVideo) && (!!existingVid && this.isVideo(existingVid))
                  if (!(alreadyProcessed && existingVid === vurl)) {
                    const k = this.getSceneKey(sc, idx)
                    if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
                    this.pendingVideoSet.add(k)
                    const sceneKey = String(item.scene_number || '').trim()
                    this.queueVideoForScene(idx, vurl, Number.isFinite(oi) ? oi : undefined, sceneKey, k)
                    anyVideoQueued = true
                  }
                }
                if (shotTitle || visualDesc) {
                  const scriptObj = Object.assign({}, sc.scene_script || {})
                  if (shotTitle) scriptObj.shot_title = shotTitle
                  if (visualDesc) scriptObj.visual_description = visualDesc
                  if (this.$set) this.$set(sc, 'scene_script', scriptObj); else sc.scene_script = scriptObj
                  if (visualDesc) sc.description = visualDesc
                }
                if (Number.isFinite(oi) && oi > 0) {
                  sc.order_index = oi
                  sc.title = `分镜${oi}`
                  const key = String(item.scene_number || '').trim()
                  if (key) { sc.scene_number = key; idxMap.set(key, oi) }
                }
              }
              this.imagesDetailMap = map
              if (anyVideoQueued) this.isVideoGenerating = true
              if (idxMap.size > 0) {
                this._orderIndexMap = idxMap
                const complete = Array.isArray(this.scenes) && this.scenes.length > 0 && this.scenes.every(sc => Number(sc.order_index) > 0)
                if (complete) {
                  this.sortScenesByServerOrder()
                  this.updateTimeMarkers()
                }
                try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { void 0 }
              }
              await this.ensurePreviewFromScenes()
              let allReady = false
              if (this.worksVideoReady) {
                allReady = list.length > 0 && list.every(x => {
                  const v = this.cleanUrl(x.video_url || '')
                  return !!v && this.isVideo(v)
                })
              } else {
                allReady = list.every(x => this.cleanUrl(x.reference_image_url || ''))
              }
              if (allReady) { this.pollImagesActive = false; break }

            }
          } catch (e) { void 0 }
          await new Promise(r => {
            if (!this.pollImagesActive) return r()
            const id = setTimeout(() => { this.pollImagesAbortResolve = null; r() }, 30000)
            this.pollImagesTimer = id
            this.pollImagesAbortResolve = r
          })
        }
      } catch (e) { void 0 } finally {
        this.isConverting = false
        if (showSkel) {
          try { localStorage.removeItem(`video-edit:viewStoryboard:${projectId}`) } catch (e) { void 0 }
        }
        this.pollImagesActive = false
      }
    },
    async updateLeftPreviewFromImagesDetail() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const text = await getStoryboardImagesDetail({ videoId, token })
        let resp = null
        try { resp = JSON.parse(text) } catch { resp = null }
        const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
        if (!list.length) return
        const map = new Map()
        for (const item of list) {
          const key = String(item.scene_number || '').trim()
          const oi = Number(item.order_index || item.orderIndex)
          const refImg = this.cleanUrl(item.reference_image_url || '')
          let vurl = this.cleanUrl(item.video_url || '')
          const isMod = this.isModifyingStatus(vurl)
          if (!this.isVideo(vurl)) vurl = ''
          if (key) map.set(key, { video_url: isMod ? '' : vurl, reference_image_url: refImg })
          if (Number.isFinite(oi) && oi > 0) map.set(`oi:${oi}`, { video_url: isMod ? '' : vurl, reference_image_url: refImg })
        }
        this.imagesDetailMap = map
        const active = this.scenes[this.activeSceneIndex] || {}
        const activeIdx = this.activeSceneIndex
        const activeKey = String(active.scene_number || '').trim()
        const oi = Number(active.order_index)
        let match = null
        if (activeKey) match = list.find(x => String(x.scene_number || '').trim() === activeKey) || null
        if (!match && Number.isFinite(oi) && oi > 0) match = list[oi - 1] || null
        if (!match) match = list[activeIdx] || null
        if (!match) return
        const refImg = this.cleanUrl(match.reference_image_url || '')
        let vurl = this.cleanUrl(match.video_url || '')
        const isMod = this.isModifyingStatus(vurl)
        if (!this.isVideo(vurl)) vurl = ''
        const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
        const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
        this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: isMod ? null : ((vLocal || vurl) || null) }
        if (activeIdx >= 0 && activeIdx < this.scenes.length) {
          const sc = this.scenes[activeIdx]
          const shotTitle = (match && match.scene_script && match.scene_script.shot_title) || match.shot_title || ''
          const visualDesc = (match && match.scene_script && match.scene_script.visual_description) || match.visual_description || ''
          const cameraDir = (match && match.scene_script && match.scene_script.camera_direction) || match.camera_direction || ''
          const scriptObj = Object.assign({}, sc.scene_script || {})
          if (shotTitle) scriptObj.shot_title = shotTitle
          if (visualDesc) scriptObj.visual_description = visualDesc
          if (cameraDir) scriptObj.camera_direction = cameraDir
          if (this.$set) this.$set(sc, 'scene_script', scriptObj); else sc.scene_script = scriptObj
          if (visualDesc) sc.description = visualDesc
          if (isMod) { sc.video_url = 'modifying'; sc.hasVideo = false; sc.clips = [] }
        }
      } catch (e) { void 0 }
    },
    startSceneVideoPolling(sceneNumber) {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!videoId || !sceneNumber || !token) return
        if (!this._modifyingPollTimers) this._modifyingPollTimers = new Map()
        const key = String(sceneNumber || '').trim()
        const clearForKey = () => {
          try {
            const pair = this._modifyingPollTimers.get(key)
            if (pair) {
              const { t1, t2 } = pair
              if (t1) clearTimeout(t1)
              if (t2) clearInterval(t2)
            }
            this._modifyingPollTimers.delete(key)
          } catch (e) { void 0 }
        }
        clearForKey()
        const t1 = setTimeout(() => {
          const t2 = setInterval(async() => {
            try {
              const text = await getStoryboardSceneDetail({ videoId, sceneNumber: key, token })
              let json
              try { json = JSON.parse(text) } catch { json = null }
              const data = json && json.data ? json.data : null
              if (!data) return
              const rawV = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
              if (!rawV || !this.isVideo(rawV) || this.isModifyingStatus(rawV)) return
              const vLocal = await this.getLocalUrl(rawV)
              const vFinal = vLocal || rawV
              const idx = this.scenes.findIndex(s => String((s && s.scene_number) || '').trim() === key)
              const targetIndex = idx >= 0 ? idx : this.activeSceneIndex
              if (targetIndex >= 0 && targetIndex < this.scenes.length) {
                const sc = this.scenes[targetIndex]
                const dur = (Number(data.duration) ? Number(data.duration) * 1000 : await this.measureVideoDurationMs(vFinal))
                sc.clips = [{ url: vFinal, durationMs: dur }]
                sc.hasVideo = true
                sc.video_url = vFinal
                try {
                  const kx = this.getSceneKey(sc, targetIndex)
                  if (this.updatingKeySet && this.updatingKeySet.delete) this.updatingKeySet.delete(kx)
                } catch (e) { void 0 }
                if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
                this.durationMap.set(vFinal, dur)
                if (targetIndex === this.activeSceneIndex) {
                  const img = this.cleanUrl(sc.thumbnail || (data.reference_image_url || ''))
                  const imgLocal = img ? await this.getLocalUrl(img) : ''
                  this.sceneDetail = { reference_image_url: imgLocal || img, video_url: vFinal, audio_url: this.cleanUrl((data && data.audio_url) || '') }
                  this.updateActiveSceneDurationFromVideo()
                }
              }
              clearForKey()
            } catch (e) { void 0 }
          }, 5000)
          this._modifyingPollTimers.set(key, { t1: null, t2 })
        }, 5000)
        this._modifyingPollTimers.set(key, { t1, t2: null })
      } catch (e) { void 0 }
    },
    async initLeftPanelScript() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const idx = this.activeSceneIndex
        const sc = this.scenes[idx] || {}
        const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[idx] : '') || '')
        let title = ''
        let visual = ''
        let cameraDir = ''
        let narration = ''
        try {
          const text = await getStoryboardSceneDetail({ videoId, sceneNumber, token })
          let json
          try { json = JSON.parse(text) } catch { json = null }
          const data = json && json.data ? json.data : null
          const content = (data && data.prompt && data.prompt.content) ? data.prompt.content : ((data && data.scene_script && data.scene_script.content) ? data.scene_script.content : null)
          if (content) {
            title = String(content.shot_title || '').trim()
            visual = String(content.visual_description || '').trim()
            cameraDir = String(content.camera_direction || '').trim()
            narration = String(content.dialogue_or_narration || '').trim()
          }
        } catch (e) { void 0 }
        if (!title && !visual) {
          try {
            const text = await getStoryboardImagesDetail({ videoId, token })
            let resp
            try { resp = JSON.parse(text) } catch { resp = null }
            const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
            let match = null
            const key = String(sc.scene_number || '').trim()
            const oi = Number(sc.order_index)
            if (key) match = list.find(x => String(x.scene_number || '').trim() === key) || null
            if (!match && Number.isFinite(oi) && oi > 0) match = list[oi - 1] || null
            if (!match) match = list[idx] || null
            if (match) {
              title = String((match.scene_script && match.scene_script.shot_title) || match.shot_title || '').trim()
              visual = String((match.scene_script && match.scene_script.visual_description) || match.visual_description || '').trim()
              cameraDir = String((match.scene_script && match.scene_script.camera_direction) || match.camera_direction || '').trim()
              narration = String((match.scene_script && match.scene_script.dialogue_or_narration) || match.dialogue_or_narration || '').trim()
            }
          } catch (e) { void 0 }
        }
        if (title || visual || narration || cameraDir) {
          const scriptObj = Object.assign({}, sc.scene_script || {})
          if (title) scriptObj.shot_title = title
          if (visual) scriptObj.visual_description = visual
          if (cameraDir) scriptObj.camera_direction = cameraDir
          if (narration) scriptObj.dialogue_or_narration = narration
          if (this.$set) this.$set(sc, 'scene_script', scriptObj); else sc.scene_script = scriptObj
        }
      } catch (e) { void 0 }
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
            const vurl = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
            const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
            const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
            const incomingKey = String(data.scene_number || '').trim()
            const targetIndex = i
            const duration = Number(data.duration) ? Number(data.duration) * 1000 : undefined
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
                  this.queueVideoForScene(targetIndex, vurl, undefined, incomingKey, k, duration)
                } else {
                  if (duration && first) {
                    first.durationMs = duration
                    if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
                    this.durationMap.set(vurl, duration)
                    if (vLocal) this.durationMap.set(vLocal, duration)
                  }
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
                const firstClip = (target && Array.isArray(target.clips) && target.clips[0]) || null
                const clipUrl = this.cleanUrl((firstClip && firstClip.url) || '')
                const targetVid = this.cleanUrl(target && target.video_url || '')
                const nextVideo = vLocal || vurl || ''
                this.sceneDetail = { reference_image_url: refLocal, video_url: nextVideo }
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
        const prefix = `${String(i)  }:`
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
          const vurl = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
          const incomingKey = String(data.scene_number || '').trim()
          const targetIndex = i
          const duration = Number(data.duration) ? Number(data.duration) * 1000 : undefined
          if (targetIndex >= 0 && targetIndex < this.scenes.length) {
            const target = this.scenes[targetIndex]
            if (refImg) target.thumbnail = refImg
            if (vurl && this.isVideo(vurl)) {
              let dur = duration
              if (!dur) {
                dur = this.isVideo(vurl) ? await this.measureVideoDurationMs(vurl) : 5000
              }
              const vLocal = await this.getLocalUrl(vurl)
              target.clips = [{ url: vLocal || vurl, durationMs: dur }]
              if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
              this.durationMap.set(vurl, dur)
              if (vLocal) this.durationMap.set(vLocal, dur)
            } else if (!this.isVideoGenerating && (!Array.isArray(target.clips) || !target.clips.length)) {
              const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
              target.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
              if (this.isModifyingStatus(vurl)) { target.video_url = 'modifying'; target.hasVideo = false }
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
            const vLocal = (vurl && this.isVideo(vurl)) ? await this.getLocalUrl(vurl) : ''
            this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: (vLocal || (this.isVideo(vurl) ? vurl : '')) || null }
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
      return Math.max(3, actual)
    },
    getActualSceneSeconds(scene) {
      const c = (scene && Array.isArray(scene.clips) && scene.clips[0]) || null
      const key = String(scene && scene.scene_number || '').trim()
      const oi = Number(scene && scene.order_index)
      let prefer = null
      if (key && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(key) || null
      if (!prefer && Number.isFinite(oi) && oi > 0 && this.imagesDetailMap instanceof Map) prefer = this.imagesDetailMap.get(`oi:${oi}`) || null
      const preferUrl = prefer ? this.cleanUrl(prefer.video_url || prefer.reference_image_url || '') : ''
      const urlClip = this.cleanUrl((c && c.url) || '')
      const urlScene = this.cleanUrl((scene && scene.video_url) || '')
      const url = preferUrl || urlClip || urlScene
      const cached = (this.durationMap instanceof Map && url) ? Number(this.durationMap.get(url)) || 0 : 0
      const durMs = Number(c && c.durationMs) || cached
      if (url && this.isVideo(url) && Number(durMs)) {
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
        const s = this.preferMp4(url)
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
        if (!url || !this.isVideo(url)) return
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
        if (!token) { return }
        let balance = 0
        try {
          const status = await getUserBasicStatus(token)
          balance = (status && status.code === 0 && status.data && Number(status.data.pointsBalance)) || 0
        } catch (e) { balance = 0 }
        let estimate = null
        try {
          estimate = await getBillingEstimate({ videoId, genType: 'video', modelName, token })
        } catch (e) { estimate = null }
        const total = estimate && typeof estimate === 'object' ? Number(estimate.total_price || estimate.data && estimate.data.total_price || 0) : 0
        if (Number.isFinite(total) && total > 0 && balance < total) {
          try { window.dispatchEvent(new CustomEvent('open-insufficient-points')) } catch (e) { /* no-op */ }
          return
        }
      } catch (e) { /* no-op */ }
      try {
        this.pollImagesActive = false
        if (this.pollImagesAbortResolve) { try { this.pollImagesAbortResolve() } catch (e) { /* no-op */ } this.pollImagesAbortResolve = null }
        if (this.pollImagesTimer) { try { clearTimeout(this.pollImagesTimer) } catch (e) { /* no-op */ } this.pollImagesTimer = null }
        this.isVideoConverting = true
        this.isConverting = true
        this.isVideoGenerating = true
        const set = new Set()
        for (let i = 0; i < this.scenes.length; i++) {
          const sc = this.scenes[i] || {}
          const hasVid = Array.isArray(sc.clips) && sc.clips.length && this.isVideo(sc.clips[0].url || '')
          if (!hasVid) {
            const k = this.getSceneKey(sc, i)
            set.add(k)
            // 明确标记为等待状态
            sc.video_url = null
          }
        }
        this.pendingVideoSet = set
        const text = await generateStoryboardVideo({ videoId, modelName, token })
        let result
        try { result = JSON.parse(text) } catch { result = { raw: text } }
        console.log('一键转视频接口返回:', result)
        if (result && result.code === 0 && Array.isArray(result.data)) {
          const items = result.data
          let anyImmediateVideo = false
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const sn = String(item.scene_number || '').trim()
            let idx = this.scenes.findIndex(sc => String(sc.scene_number || '').trim() === sn)
            if (idx === -1 && i < this.scenes.length) idx = i
            if (idx >= 0 && idx < this.scenes.length) {
              const sc = this.scenes[idx]
              const oldKey = this.getSceneKey(sc, idx)
              if (!sc.scene_number && sn) sc.scene_number = sn
              const oi = Number(item.order_index)
              if (Number.isFinite(oi)) sc.order_index = oi

              const newKey = this.getSceneKey(sc, idx)
              if (oldKey !== newKey && this.pendingVideoSet instanceof Set && this.pendingVideoSet.has(oldKey)) {
                this.pendingVideoSet.delete(oldKey)
                this.pendingVideoSet.add(newKey)
              }

              if (item.scene_script) {
                if (this.$set) this.$set(sc, 'scene_script', item.scene_script)
                else sc.scene_script = item.scene_script
                const script = item.scene_script
                const parts = []
                if (script.shot_title) parts.push(script.shot_title)
                if (script.visual_description) parts.push(script.visual_description)
                if (script.dialogue_or_narration) parts.push(`旁白：${script.dialogue_or_narration}`)
                sc.description = parts.join('\n')
              }

              const vurl = this.cleanUrl(item.video_url || '')
              if (vurl && this.isVideo(vurl)) {
                const k = this.getSceneKey(sc, idx)
                if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
                this.pendingVideoSet.add(k)
                this.queueVideoForScene(idx, vurl, Number.isFinite(oi) ? oi : undefined, sn, k)
                anyImmediateVideo = true
              }
            }
          }
          if (anyImmediateVideo) {
            this.isVideoConverting = false
            this.isVideoGenerating = true
          }
          const complete = Array.isArray(this.scenes) && this.scenes.length > 0 && this.scenes.every(sc => Number(sc.order_index) > 0)
          if (complete) this.sortScenesByServerOrder()
        }
        this.toastText = '第一个视频会在1分钟左右显示，5~7分钟'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 4000)
        this.updateLeftPreviewFromImagesDetail()
        this.pollImagesActive = true
        this.pollStoryboardImagesDetail()
        // 每30秒轮询一次分镜视频生成状态（localhost）
        if (this._storyboardQueryInterval) clearInterval(this._storyboardQueryInterval)
        this._storyboardQueryInterval = setInterval(async() => {
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
                this.isVideoConverting = false
              }
            }
          } catch (e) {
            console.warn('查询分镜视频生成状态失败:', e)
          }
        }, 30000)
      } catch (err) {
        console.error('一键转视频失败:', err)
        this.isConverting = false
        this.isVideoConverting = false
      }
    },
    async openConvertConfirmModal() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { return }
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const modelName = this.selectedConvertModelName
        let estimate = null
        try { estimate = await getBillingEstimate({ videoId, genType: 'video', modelName, token }) } catch (e) { estimate = null }
        const total = estimate && typeof estimate === 'object' ? Number(estimate.total_price || (estimate.data && estimate.data.total_price) || 0) : 0
        this.convertEstimateTotal = Number.isFinite(total) ? total : 0
        try {
          const status = await getUserBasicStatus(token)
          const balance = (status && status.code === 0 && status.data && Number(status.data.pointsBalance)) || 0
          this.userStore.setUser({
            ...this.userStore.userInfo,
            pointsBalance: balance
          })
        } catch (e) { /* no-op */ }
        this.convertScenesCount = Array.isArray(this.scenes) ? this.scenes.length : 0
        this.canConfirmConvert = ((this.userStore && this.userStore.userInfo && this.userStore.userInfo.pointsBalance) || 0) >= this.convertEstimateTotal
        this.convertConfirmVisible = true
      } catch (e) { void 0 }
    },
    async reestimateConvertBilling() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const modelName = this.selectedConvertModelName
        let estimate = null
        try { estimate = await getBillingEstimate({ videoId, genType: 'video', modelName, token }) } catch (e) { estimate = null }
        const total = estimate && typeof estimate === 'object' ? Number(estimate.total_price || (estimate.data && estimate.data.total_price) || 0) : 0
        this.convertEstimateTotal = Number.isFinite(total) ? total : 0
        this.canConfirmConvert = ((this.userStore && this.userStore.userInfo && this.userStore.userInfo.pointsBalance) || 0) >= this.convertEstimateTotal
      } catch (e) { void 0 }
    },
    closeConvertConfirmModal() {
      this.convertConfirmVisible = false
    },
    confirmConvert() {
      if (!this.canConfirmConvert) return
      this.convertConfirmVisible = false
      this.convertToVideo()
    },
    async exportVideo() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { return }
        this.exportProgressVisible = true
        this.exportProgressPct = 0
        this.exportProgressDone = false
        this.exportManualUrl = ''
        if (this.exportTimer) { try { clearInterval(this.exportTimer) } catch (e) { /* no-op */ } this.exportTimer = null }
        this.exportTimer = setInterval(() => {
          if (this.exportProgressDone) return
          const next = Math.min(96, this.exportProgressPct + (Math.random() * 1.6 + 0.8))
          this.exportProgressPct = next
          if (next >= 96) { try { clearInterval(this.exportTimer) } catch (e) { /* no-op */ } this.exportTimer = null }
        }, 1000)
        const resp = await exportWorksVideoDownload({ videoId, token })
        if (!resp || resp.status !== 200 || !resp.ok || !resp.blob) {
          this.exportProgressDone = false
          this.exportProgressVisible = false
          if (this.exportTimer) { try { clearInterval(this.exportTimer) } catch (e) { /* no-op */ } this.exportTimer = null }
          this.toastText = '导出失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const objUrl = URL.createObjectURL(resp.blob)
        this.exportManualUrl = objUrl
        let filename = this.successFilename || ''
        try {
          const headers = resp.headers
          const cd = headers && headers.get ? headers.get('content-disposition') : ''
          const m = cd && cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
          const fn = (m && (m[1] || m[2])) || ''
          if (fn) filename = fn
        } catch (e) { /* no-op */ }
        const a = document.createElement('a')
        a.href = objUrl
        a.download = filename || `work_${videoId}.mp4`
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        this.exportProgressPct = 100
        this.exportProgressDone = true
      } catch (e) {
        this.toastText = '导出失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
    },
    closeExportProgress() {
      this.exportProgressVisible = false
      if (this.exportTimer) { try { clearInterval(this.exportTimer) } catch (e) { /* no-op */ } this.exportTimer = null }
    },
    async startVoiceAudition() {
      try {
        if (this.isVoiceAuditionPlaying) { this.stopVoiceAudition(); return }
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { return }
        this.toastText = '收到，正在准备'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 1500)
        const text = String(this.voiceScript || '').trim() || String((this.scenes[this.activeSceneIndex] && this.scenes[this.activeSceneIndex].scene_script && this.scenes[this.activeSceneIndex].scene_script.dialogue_or_narration) || (this.scenes[this.activeSceneIndex] && this.scenes[this.activeSceneIndex].scene_script && this.scenes[this.activeSceneIndex].scene_script.visual_description) || '').trim() || '今天很适合吃点好吃的，喝点小酒，快来找我玩吧！'
        const languageType = this.voiceLanguage || 'Chinese'
        const voice = this.voiceName || 'cherry'

        const cacheKey = `ali-tts-cache:${voice}:${languageType}:${text}`
        try {
          const cachedUrl = localStorage.getItem(cacheKey)
          if (cachedUrl) {
            this.isVoiceLoading = false
            this.voiceAudioUrl = cachedUrl
            const el = new Audio(cachedUrl)
            el.addEventListener('ended', () => { this.isVoiceAuditionPlaying = false })
            this.voiceAudioEl = el
            try { await el.play(); this.isVoiceAuditionPlaying = true } catch (e) { this.isVoiceAuditionPlaying = false }
            return
          }
        } catch (e) { /* no-op */ }
        this.isVoiceLoading = true
        const submit = await aliTtsSubmit({ text, languageType, voice, token })
        const taskId = (submit && submit.task_id) || (submit && submit.data && submit.data.task_id) || (typeof submit === 'string' ? (() => { try { const o = JSON.parse(submit); return o && (o.task_id || (o.data && o.data.task_id)) } catch { return '' } })() : '')
        if (!taskId) { this.isVoiceLoading = false; this.toastText = '语音任务创建失败'; this.toastVisible = true; setTimeout(() => { this.toastVisible = false }, 2000); return }
        this.voiceAuditionTaskId = taskId
        if (this.voicePollTimer) { try { clearInterval(this.voicePollTimer) } catch (e) { void 0 } this.voicePollTimer = null }
        this.voicePollTimer = setInterval(async() => {
          try {
            const q = await aliTtsQuery({ taskId, token })
            const obj = typeof q === 'string' ? (() => { try { return JSON.parse(q) } catch { return null } })() : q
            const status = obj && obj.status
            const url = obj && obj.result_url
            if (status === 'SUCCEEDED' && url) {
              try { clearInterval(this.voicePollTimer) } catch (e) { void 0 }
              this.voicePollTimer = null
              this.isVoiceLoading = false
              this.voiceAudioUrl = this.cleanUrl(url)
              try { localStorage.setItem(cacheKey, this.voiceAudioUrl) } catch (e) { /* no-op */ }
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
      this.voiceName = selected.name || selected.voiceName
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
      this.isVoiceLoading = false
      this.isVoiceAuditionPlaying = false
    },
    async applyVoiceover() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { return }
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
          this.voiceApplySuccess = true
          try {
            const appliedAudio = this.cleanUrl(((obj && obj.data && obj.data.audio_url) || audioUrl) || '')
            if (appliedAudio) {
              if (this.$set) this.$set(sc, 'audio_url', appliedAudio); else sc.audio_url = appliedAudio
              const sd = this.sceneDetail || {}
              this.sceneDetail = Object.assign({}, sd, { audio_url: appliedAudio })
            }
          } catch (e) { void 0 }
          try {
            const data = obj.data || {}
            const script = data.scene_script || data.content || {}
            if (script && typeof script === 'object') {
              const shotTitle = String(script.shot_title || (sc.scene_script && sc.scene_script.shot_title) || '').trim()
              const visualDesc = String(script.visual_description || (sc.scene_script && sc.scene_script.visual_description) || '').trim()
              const cameraDir = String(script.camera_direction || (sc.scene_script && sc.scene_script.camera_direction) || '').trim()
              const narration = String(script.dialogue_or_narration || (sc.scene_script && sc.scene_script.dialogue_or_narration) || '').trim()
              const next = Object.assign({}, sc.scene_script || {})
              if (shotTitle) next.shot_title = shotTitle
              if (visualDesc) next.visual_description = visualDesc
              if (cameraDir) next.camera_direction = cameraDir
              if (narration) next.dialogue_or_narration = narration
              if (this.$set) this.$set(sc, 'scene_script', next); else sc.scene_script = next
              if (visualDesc) sc.description = visualDesc
            }
          } catch (e) { /* no-op */ }
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
    async downloadExportVideo() {
      try {
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          /* no-op */
          return
        }
        // 优先使用后端返回的可公开访问地址，借助浏览器原生下载条目
        const directUrl = this.cleanUrl(this.successPreviewUrl || '')
        let filename = this.successFilename || ''
        if (!filename) filename = `work_${videoId}.mp4`
        if (directUrl) {
          const a = document.createElement('a')
          a.href = directUrl
          a.download = filename
          a.target = '_blank'
          a.rel = 'noopener'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          return
        }
        // 回退：走受保护下载接口，生成本地对象链接后触发下载
        const resp = await exportWorksVideoDownload({ videoId, token })
        if (!resp || resp.status !== 200 || !resp.ok || !resp.blob) {
          this.toastText = '下载失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const headers = resp.headers
        const url = URL.createObjectURL(resp.blob)
        try {
          const cd = headers && headers.get ? headers.get('content-disposition') : ''
          const m = cd && cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
          const fn = (m && (m[1] || m[2])) || ''
          if (fn) filename = fn
        } catch (e) { /* no-op */ }
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => { try { URL.revokeObjectURL(url) } catch (e) { /* no-op */ } }, 1000)
      } catch (e) {
        this.toastText = '下载失败'
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
      // 仅在用户点击分镜时请求分镜详情（查看态左侧依赖 getStoryboardSceneDetail）
      this.fetchCurrentSceneDetail()
      try { this.loadSubtitleState() } catch (e) { /* no-op */ }
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
      this.syncPreviewPlayback()
      const durations = this.scenes.map(sc => Math.round(this.getSceneSeconds(sc) * 1000))
      const totalMs = durations.reduce((s, v) => s + v, 0)
      let priorMs = Math.max(0, Math.min(totalMs, (Number(this.playbackPosition) || 0) / 100 * totalMs))
      if (priorMs >= totalMs - 1) {
        priorMs = 0
        this.playbackPosition = 0
        this.activeSceneIndex = 0
      }
      try {
        const mel = this.musicAudioEl
        const murl = this.musicAudioUrl
        if (murl && mel) {
          const t = Math.max(0, priorMs / 1000)
          try { mel.currentTime = t } catch (e) { void 0 }
          if (!this.musicPlaying) {
            try {
              const p = mel.play()
              if (p && p.then) p.then(() => { this.musicPlaying = true }).catch(() => { this.musicPlaying = false })
              else this.musicPlaying = true
            } catch (e) { void 0 }
          }
        }
      } catch (e) { void 0 }
      // 准备并立即启动音频（用户手势触发）
      try {
        const audioEl = this.$refs.previewAudio
        if (audioEl) {
          let acc0 = 0
          let idx0 = 0
          for (let i = 0; i < durations.length; i++) {
            const next = acc0 + durations[i]
            if (priorMs < next) { idx0 = i; break }
            acc0 = next
            idx0 = i
          }
          const sc0 = this.scenes[idx0] || {}
          const a0Scene = this.cleanUrl(sc0.audio_url || '')
          const a0Detail = this.cleanUrl((this.sceneDetail && this.sceneDetail.audio_url) || '')
          const a0 = a0Scene || a0Detail
          if (a0) {
            if (audioEl.src !== a0) {
              audioEl.src = a0
              try { audioEl.load() } catch (e) { void 0 }
            }
          }
          const t0 = Math.max(0, (priorMs - acc0) / 1000)
          try { audioEl.currentTime = t0 } catch (e) { void 0 }
          if (a0 || audioEl.src) {
            try { const p = audioEl.play(); if (p && p.catch) p.catch(() => {}) } catch (e) { void 0 }
          }
        }
      } catch (e) { void 0 }
      const start = performance.now() - priorMs
      if (this._playbackInterval) clearInterval(this._playbackInterval)
      if (this._rafId) cancelAnimationFrame(this._rafId)
      const el = this.$refs.previewVideo
      if (el && this.isVideo(this.currentPreviewUrl)) {
        this.playVideoSafely(el)
      } else {
        // 如果当前不是视频，尝试播放音频
        const audioEl = this.$refs.previewAudio
        if (audioEl && audioEl.src) {
          try {
            const p = audioEl.play()
            if (p && p.catch) p.catch(() => {})
          } catch (e) { void 0 }
        }
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
          try { this.loadSubtitleState() } catch (e) { /* no-op */ }
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
              try { audioEl.currentTime = t } catch (e) { void 0 }
            }
            if (audioEl.paused && this.isPlaying) {
              try {
                const p = audioEl.play()
                if (p && p.catch) p.catch(() => {})
              } catch (e) { void 0 }
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
      try {
        const mel = this.musicAudioEl
        if (mel) { mel.pause(); this.musicPlaying = false }
      } catch (e) { void 0 }
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
      const mel = this.musicAudioEl
      if (mel) {
        try { mel.pause(); mel.currentTime = 0 } catch (e) { void 0 }
        this.musicPlaying = false
      }
    },
    // 图片提示词相关方法
    editPrompt() {
      const currentScene = this.scenes[this.activeSceneIndex]
      const sceneScript = currentScene && currentScene.scene_script ? currentScene.scene_script : {}
      const vd = sceneScript && sceneScript.visual_description ? String(sceneScript.visual_description) : ''
      this.editingPromptText = vd || (currentScene ? currentScene.description : '')
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
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const sc = this.scenes[this.activeSceneIndex] || {}
        const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const text = String(this.editingPromptText || '').trim()
        if (token && videoId && sceneNumber && text) {
          updateVisualDescription({ videoid: String(videoId), scene_number: sceneNumber, text, token })
            .then(resp => {
              const ok = !!(resp && resp.code === 0)
              if (ok) {
                if (!sc.scene_script) sc.scene_script = {}
                sc.scene_script.visual_description = text
                this.scenes[this.activeSceneIndex].description = text
                this.toastText = '提示词已更新'
                this.toastVisible = true
                setTimeout(() => { this.toastVisible = false }, 2000)
              } else {
                const msg = (resp && (resp.message || resp.msg)) ? String(resp.message || resp.msg) : '更新失败'
                this.toastText = msg
                this.toastVisible = true
                setTimeout(() => { this.toastVisible = false }, 2000)
              }
            })
            .catch(() => {
              this.toastText = '更新失败'
              this.toastVisible = true
              setTimeout(() => { this.toastVisible = false }, 2000)
            })
        }
        this.isEditingPrompt = false
        this.editingPromptText = ''
      }
    },
    editShotTitle() {
      const sc = this.scenes[this.activeSceneIndex] || {}
      const t = sc && sc.scene_script && sc.scene_script.shot_title ? String(sc.scene_script.shot_title) : ''
      this.editingShotTitleText = t
      this.isEditingShotTitle = true
    },
    onShotTitleInput(e) {
      try {
        const el = e && e.target
        const val = el && el.innerText ? String(el.innerText) : ''
        this.editingShotTitleText = val
      } catch (err) { /* no-op */ }
    },
    cancelShotTitleEdit() {
      this.isEditingShotTitle = false
      this.editingShotTitleText = ''
    },
    saveShotTitle() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const token = (this.userStore && this.userStore.token) || ''
      const sc = this.scenes[this.activeSceneIndex] || {}
      const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
      const text = String(this.editingShotTitleText || '').trim()
      if (!videoId || !sceneNumber || !token) return
      updateShotTitle({ videoid: String(videoId), scene_number: sceneNumber, text, token }).then(resp => {
        const ok = !!(resp && resp.code === 0)
        if (ok) {
          if (!sc.scene_script) sc.scene_script = {}
          sc.scene_script.shot_title = text
          this.toastText = '标题已更新'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else {
          const msg = (resp && (resp.message || resp.msg)) ? String(resp.message || resp.msg) : '更新失败'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      }).catch(() => {
        this.toastText = '更新失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }).finally(() => {
        this.isEditingShotTitle = false
        this.editingShotTitleText = ''
      })
    },
    editCameraDirection() {
      const sc = this.scenes[this.activeSceneIndex] || {}
      const t = sc && sc.scene_script && sc.scene_script.camera_direction ? String(sc.scene_script.camera_direction) : ''
      this.editingCameraDirectionText = t
      this.isEditingCameraDirection = true
    },
    cancelCameraDirectionEdit() {
      this.isEditingCameraDirection = false
      this.editingCameraDirectionText = ''
    },
    saveCameraDirection() {
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const token = (this.userStore && this.userStore.token) || ''
      const sc = this.scenes[this.activeSceneIndex] || {}
      const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
      const text = String(this.editingCameraDirectionText || '').trim()
      if (!videoId || !sceneNumber || !token) return
      updateCameraDirection({ videoid: String(videoId), scene_number: sceneNumber, text, token }).then(resp => {
        const ok = !!(resp && resp.code === 0)
        if (ok) {
          if (!sc.scene_script) sc.scene_script = {}
          sc.scene_script.camera_direction = text
          this.toastText = '运镜已更新'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else {
          const msg = (resp && (resp.message || resp.msg)) ? String(resp.message || resp.msg) : '更新失败'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      }).catch(() => {
        this.toastText = '更新失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }).finally(() => {
        this.isEditingCameraDirection = false
        this.editingCameraDirectionText = ''
      })
    },
    async sendSceneInput() {
      try {
        const text = String(this.sceneInput || '').trim()
        if (!text) return
        this.sceneInput = ''
        const userMsgId = Date.now()
        this.leftChatMessages.push({ id: userMsgId, side: 'right', text })
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const sc = this.scenes[this.activeSceneIndex] || {}
        const shotId = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        const type = this.determineSceneType(sc)
        const modelname = type === 'video' ? 'wan2.2-i2v-flash' : 'doubao-seedream-4-0-250828'
        if (!token) { return }
        const k = this.getSceneKey(sc, this.activeSceneIndex)
        if (!(this.updatingKeySet instanceof Set)) this.updatingKeySet = new Set()
        this.updatingKeySet.add(k)
        this.subtitleEnabledPrev = this.subtitleEnabled
        this.subtitleEnabled = false
        try {
          if (sc) {
            sc.hasVideo = false
            sc.video_url = null
            sc.clips = []
          }
          const ref = this.cleanUrl((sc && sc.thumbnail) || '')
          const audio = this.cleanUrl((sc && sc.audio_url) || '')
          this.sceneDetail = { reference_image_url: ref || (this.sceneDetail && this.sceneDetail.reference_image_url) || '', video_url: null, audio_url: audio || (this.sceneDetail && this.sceneDetail.audio_url) || '' }
        } catch (e) { void 0 }
        const msgIdPending = Date.now() + 1
        const assistantMsgId = msgIdPending + 1
        const shotTitle = (sc && sc.scene_script && sc.scene_script.shot_title) || ''
        this.leftChatMessages.push({ id: assistantMsgId, type: 'prompt_box', side: 'left', data: { shot_title: shotTitle }, pending: true, imageUrl: '' })
        this._lastPromptBoxId = assistantMsgId
        this.$nextTick(() => { this.scrollLeftToBottom() })

        this.toastText = '小梦收到你的新想法啦'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)

        this._updateSceneCtrl = new AbortController()
        updateSceneStream({
          videoId, shotId, prompt: text, type, modelname, token,
          signal: this._updateSceneCtrl.signal,
          onEvent: (obj) => {
            const code = obj && obj.code
            if (code === 'INSUFFICIENT_POINTS') {
              if (this._updateSceneCtrl && this._updateSceneCtrl.abort) this._updateSceneCtrl.abort()
              const setB = this.updatingKeySet instanceof Set ? this.updatingKeySet : null
              if (setB) { setB.delete(k); this.updatingKeySet = new Set(setB) }
              this.subtitleEnabled = this.subtitleEnabledPrev
              this.toastText = '余额不足'
              this.toastVisible = true
              setTimeout(() => { this.toastVisible = false }, 2000)
              return
            }
            const ev = obj && obj.event
            const tp = obj && obj.type
            if (tp === 'connected') {
              return
            }
            if (tp === 'scene_updated') {
              const raw = String(obj && obj.reference_image_url || '').trim()
              const cleaned = raw.replace(/^`+|`+$/g, '').replace(/\s+/g, ' ').replace(/"/g, '').replace(/\\`/g, '').replace(/`/g, '')
              const imageUrl = this.cleanUrl(cleaned)
              const script = (obj && obj.scene_script) || {}
              const aidx = this.activeSceneIndex
              const target = this.scenes[aidx] || {}
              if (imageUrl) {
                target.thumbnail = imageUrl
                if (type === 'image') {
                  target.hasVideo = false
                  target.video_url = 'replaceimage'
                  target.clips = [{ url: imageUrl, durationMs: 5000 }]
                  this.sceneDetail = { reference_image_url: imageUrl, video_url: 'replaceimage', audio_url: this.cleanUrl(target.audio_url || '') }
                  try {
                    const kk = this.getSceneKey(target, aidx)
                    if (this.updatingKeySet && this.updatingKeySet.delete) this.updatingKeySet.delete(kk)
                  } catch (e) { void 0 }
                } else {
                  this.sceneDetail = { reference_image_url: imageUrl, video_url: this.cleanUrl(target.video_url || ''), audio_url: this.cleanUrl(target.audio_url || '') }
                }
              }
              if (script && Object.keys(script).length) {
                const prev = Object.assign({}, target.scene_script || {})
                const next = { ...prev, ...script }
                if (this.$set) this.$set(target, 'scene_script', next); else target.scene_script = next
                const parts = []
                if (next.shot_title) parts.push(next.shot_title)
                if (next.visual_description) parts.push(next.visual_description)
                target.description = parts.join('：')
                const m = this.leftChatMessages.find(x => x.id === this._lastPromptBoxId)
                if (m) {
                  m.data = { ...(m.data || {}), shot_title: next.shot_title || (m.data && m.data.shot_title) || '', visual_description: next.visual_description || (m.data && m.data.visual_description) || '', camera_direction: next.camera_direction || (m.data && m.data.camera_direction) || '' }
                  if (imageUrl) m.imageUrl = imageUrl
                  m.pending = false
                }
              }
              this.$nextTick(() => { this.scrollLeftToBottom() })
              return
            }
            if (tp === 'finished' || ev === 'node_finished' || ev === 'workflow_finished' || ev === 'succeeded') {
              this.subtitleEnabled = this.subtitleEnabledPrev
              setTimeout(() => {
                Promise.resolve().then(async() => {
                  try {
                    const text = await getStoryboardSceneDetail({ videoId, sceneNumber: shotId, token })
                    let json
                    try { json = JSON.parse(text) } catch { json = null }
                    const data = json && json.data ? json.data : null
                    if (!data) return
                    const refImg = this.cleanUrl(data.reference_image_url || '')
                    let vurl = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
                    const isMod = this.isModifyingStatus(vurl)
                    if (!this.isVideo(vurl)) vurl = ''
                    const refLocal = refImg ? await this.getLocalUrl(refImg) : ''
                    const vLocal = vurl ? await this.getLocalUrl(vurl) : ''
                    const idx = this.activeSceneIndex
                    const sc = this.scenes[idx] || {}
                    // 对于 image 类型（vurl 为空），使用 'replaceimage' 表示图片状态
                    const nextVideoUrl = isMod ? null : (vurl ? (vLocal || vurl) : 'replaceimage')
                    this.sceneDetail = { reference_image_url: refLocal || refImg, video_url: nextVideoUrl, audio_url: this.cleanUrl((data && data.audio_url) || '') }
                    if (sc) {
                      if (isMod) {
                        sc.hasVideo = false
                        sc.video_url = 'modifying'
                        sc.clips = []
                        try { this.startSceneVideoPolling(shotId) } catch (e) { void 0 }
                      } else if (vurl) {
                        const dur = (Number(data.duration) ? Number(data.duration) * 1000 : await this.measureVideoDurationMs(vLocal || vurl))
                        sc.clips = [{ url: vLocal || vurl, durationMs: dur }]
                        sc.hasVideo = true
                        sc.video_url = vLocal || vurl
                        if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
                        this.durationMap.set(vLocal || vurl, dur)
                        if (idx === this.activeSceneIndex) this.updateActiveSceneDurationFromVideo()
                        try {
                          const kk = this.getSceneKey(sc, idx)
                          if (this.updatingKeySet && this.updatingKeySet.delete) this.updatingKeySet.delete(kk)
                        } catch (e) { void 0 }
                      } else {
                        // image 类型：确保 scene 状态也正确设置
                        sc.hasVideo = false
                        sc.video_url = 'replaceimage'
                        if (!Array.isArray(sc.clips) || !sc.clips.length) {
                          sc.clips = [{ url: refLocal || refImg, durationMs: 5000 }]
                        }
                        try {
                          const kk = this.getSceneKey(sc, idx)
                          if (this.updatingKeySet && this.updatingKeySet.delete) this.updatingKeySet.delete(kk)
                        } catch (e) { void 0 }
                      }
                      const content = (data && data.prompt && data.prompt.content) ? data.prompt.content : ((data && data.scene_script && data.scene_script.content) ? data.scene_script.content : null)
                      if (content) {
                        const prev = Object.assign({}, sc.scene_script || {})
                        const title = String(content.shot_title || '').trim()
                        const visual = String(content.visual_description || '').trim()
                        const cameraDir = String(content.camera_direction || '').trim()
                        const narration = String(content.dialogue_or_narration || '').trim()
                        if (title) prev.shot_title = title
                        if (visual) prev.visual_description = visual
                        if (cameraDir) prev.camera_direction = cameraDir
                        if (narration) prev.dialogue_or_narration = narration
                        if (this.$set) this.$set(sc, 'scene_script', prev); else sc.scene_script = prev
                        if (visual) sc.description = visual
                        const m = this.leftChatMessages.find(x => x.id === this._lastPromptBoxId)
                        if (m) {
                          m.data = { ...(m.data || {}), shot_title: title || (m.data && m.data.shot_title) || '', visual_description: visual || (m.data && m.data.visual_description) || '', camera_direction: cameraDir || (m.data && m.data.camera_direction) || '' }
                          if (refLocal || refImg) m.imageUrl = refLocal || refImg
                          m.pending = false
                        }
                      }
                    }
                  } catch (e) { /* no-op */ }
                })
              }, 5000)
              this.updateLeftPreviewFromImagesDetail()
              this.$nextTick(() => { this.scrollLeftToBottom() })
              this.$nextTick(() => { this.fetchSceneHistoryForActiveScene() })

            }
          }
        }).catch(() => {
          const setB = this.updatingKeySet instanceof Set ? this.updatingKeySet : null
          if (setB) { setB.delete(k); this.updatingKeySet = new Set(setB) }
          this.subtitleEnabled = this.subtitleEnabledPrev
          this.$nextTick(() => { this.scrollLeftToBottom() })
          this.toastText = '修改失败'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        })
      } catch (e) { /* no-op */ }
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
        // 立即展示对口型页面（不等待接口返回）
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

        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const shotId = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[this.activeSceneIndex] : `shot_${this.activeSceneIndex + 1}`))
        this.lipSyncVideoId = String(videoId || '')
        this.lipSyncShotId = shotId
        this.lipSyncWorkId = ''

        if (videoId && shotId && token) {
          Promise.resolve().then(async() => {
            try {
              const detResp = await objectDetectionByScene({ videoId, shotId, token })
              const obj = typeof detResp === 'string' ? (() => { try { return JSON.parse(detResp) } catch { return null } })() : detResp
              this.lipSyncDetection = obj || null
            } catch (e) { this.lipSyncDetection = null }
          })
        }
      } catch (e) { console.error(e) }
      console.log('切换对口型页面显示状态:', this.showLipSyncView)
    },
    async onLipSyncTaskCreated(taskId) {
      try { if (this.digitalVideoQueryInterval) { clearInterval(this.digitalVideoQueryInterval); this.digitalVideoQueryInterval = null } } catch (e) { void 0 }
      if (!taskId) return
      this.showLipSyncView = false

      // Setup skeleton state
      this.isVideoGenerating = true
      const idx = this.activeSceneIndex
      const sc = this.scenes[idx] || {}
      const key = this.getSceneKey(sc, idx)
      if (!(this.pendingVideoSet instanceof Set)) this.pendingVideoSet = new Set()
      this.pendingVideoSet.add(key)
      this.pendingVideoSet = new Set(this.pendingVideoSet)

      const token = (this.userStore && this.userStore.token) || ''
      const poll = async() => {
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
            finish(false)
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
            targetSc.video_url = clipUrl
            targetSc.hasVideo = !!videoUrl
            targetSc.audio_url = audioUrl
            targetSc.clips = [{ url: clipUrl, durationMs: durMs }]
            try { if (!(this.durationMap instanceof Map)) this.durationMap = new Map(); if (clipUrl) this.durationMap.set(clipUrl, durMs); if (videoUrl && clipUrl !== videoUrl) this.durationMap.set(videoUrl, durMs) } catch (e) { void 0 }

            // Only update sceneDetail if we are still on the same scene
            if (this.activeSceneIndex === idx) {
              this.sceneDetail = { reference_image_url: imageUrl || '', video_url: clipUrl, audio_url: audioUrl }
              this.updateTimeMarkers()
              this.ensurePreviewFromScenes && this.ensurePreviewFromScenes()
              this.$nextTick(() => { this.tryAttachHls && this.tryAttachHls() })
            }

            finish(true)
          }
        } catch (e) { void 0 }
      }
      poll()
      this.digitalVideoQueryInterval = setInterval(poll, 30000)
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
        if (obj && obj.code === 0 && data) {
          const remote = this.cleanUrl(data.fallback_mp4 || data.video_url || '')
          const url = await this.getLocalUrl(remote)
          const durMs = Number(data.duration) ? Math.round(Number(data.duration) * 1000) : Math.max(1, Number(sel.endMs || 0) - Number(sel.startMs || 0)) || 5000
          if (Array.isArray(scene.clips) && scene.clips.length) {
            scene.clips[0] = { url: remote || this.cleanUrl(scene.thumbnail || ''), durationMs: durMs }
          } else {
            scene.clips = [{ url: remote || this.cleanUrl(scene.thumbnail || ''), durationMs: durMs }]
          }
          scene.hasVideo = !!remote
          scene.video_url = remote || ''
          if (!(this.durationMap instanceof Map)) this.durationMap = new Map()
          if (remote) this.durationMap.set(remote, durMs)
          if (remote && url) this.durationMap.set(url, durMs)
          const thumbLocal = scene.thumbnail ? await this.getLocalUrl(this.cleanUrl(scene.thumbnail || '')) : ''
          this.sceneDetail = { reference_image_url: thumbLocal, video_url: url || '' }
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
          this.updateTimeMarkers()
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
          /* no-op */
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
            if (prev && prev.scene_script) it._prevSceneScript = prev.scene_script
            if (prev && prev.description) it._prevDescription = prev.description
          }
          if (!thumb) {
            const source = prevScenes[index]
            thumb = this.cleanUrl((source && source.thumbnail) || '')
            if (source && source.scene_script) it._prevSceneScript = source.scene_script
            if (source && source.description) it._prevDescription = source.description
          }
          return {
            id: Date.now() + idx,
            title,
            description: it._prevDescription || '分镜视频',
            thumbnail: thumb,
            clips: [{ url, durationMs: dur * 1000 }],
            scene_number: it.scene_number,
            order_index: Number(it.order_index) || idx + 1,
            scene_script: it._prevSceneScript ? { ...it._prevSceneScript } : undefined
          }
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

      this.updateTimeMarkers()
      console.log('删除分镜:', deletedScene.title)
    },
    async deleteSceneRemote(index) {
      try {
        if (this.scenes.length <= 1) {
          return
        }
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const token = (this.userStore && this.userStore.token) || ''
        const sc = this.scenes[index] || {}
        const sceneNumber = String(sc.scene_number || (Array.isArray(this._shotOrder) ? this._shotOrder[index] : `shot_${index + 1}`))
        if (!videoId || !sceneNumber || !token) {
          this.toastText = '缺少参数'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
          return
        }
        const resp = await deleteStoryboardScene({ videoId, sceneNumber, token })
        const ok = !!(resp && resp.code === 0)
        if (ok) {
          this.scenes.splice(index, 1)
          if (this.activeSceneIndex === index) {
            this.activeSceneIndex = Math.min(this.activeSceneIndex, this.scenes.length - 1)
          } else if (this.activeSceneIndex > index) {
            this.activeSceneIndex--
          }
          this.updateTimeMarkers()
          try { localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(this.scenes)) } catch (e) { /* no-op */ }
          this.toastText = '分镜已删除'
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        } else {
          const msg = (resp && (resp.message || resp.msg)) ? String(resp.message || resp.msg) : '删除失败'
          this.toastText = msg
          this.toastVisible = true
          setTimeout(() => { this.toastVisible = false }, 2000)
        }
      } catch (e) {
        this.toastText = '删除失败'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 2000)
      }
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
  border: none;
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn {
  width: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.subtitle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.subtitle-scrollable-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 200px;
  overflow-y: auto;
  height: 0;
  min-height: 0;
  content-visibility: auto;
}

.subtitle-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  background: var(--bg-tertiary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.subtitle-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.subtitle-style-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.subtitle-style-label {
  width: 64px;
  font-size: 13px;
  color: var(--text-secondary);
}

.subtitle-style-input {
  flex: 1;
  height: 32px;
  padding: 6px 10px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.subtitle-style-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.voice-small-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-small-btn:hover {
  background: var(--bg-quaternary);
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

.prompt-content.collapsed {
  max-height: 120px;
  overflow: hidden;
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

.prompt-edit-input::placeholder { color: var(--text-tertiary); }
[data-theme="dark"] .prompt-edit-input { color: #fff; background-color: #1e1e1e; border-color: #333; }
[data-theme="dark"] .prompt-edit-input::placeholder { color: #bbb; }

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

[data-theme="dark"] .scene-input {
  color: #fff;
}

.input-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 4px;
}

.char-counter {
  position: absolute;
  bottom: 16px;
  right: 60px;
  font-size: 12px;
  color: var(--text-tertiary);
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
  padding: 6px 12px;
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

.replace-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  border-radius: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
}
.replace-icon { font-size: 14px; }

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

/* 替换图片裁剪弹窗样式（与数字人保持一致） */
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

/* 时间轴区域 */
.timeline-section {
  position: relative;
  /* 每秒对应的像素宽度，用于控制时间轴比例 */
  --px-per-second: 48px;
  /* 分镜卡片之间的水平间距（置零） */
  --timeline-track-gap: 0px;
}

/* 转视频积分确认弹窗样式 */
.convert-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3200;
}
.convert-modal {
  width: 90%;
  max-width: 460px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.2);
  overflow: hidden;
}
.convert-modal-header {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-secondary);
}
.convert-modal-body {
  padding: 16px;
}
.convert-scenes-stack {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
}
.convert-scenes-stack .stack-icon {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
}
.convert-scenes-stack .stack-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.convert-detail {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px;
}
.convert-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.convert-label {
  color: var(--text-secondary);
  font-size: 14px;
}
.convert-select {
  width: 220px;
  padding: 6px 8px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.convert-value {
  color: var(--text-primary);
  font-weight: 600;
}
.convert-tip {
  margin-top: 8px;
  color: #ef4444;
  font-size: 13px;
}
.convert-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 16px;
}
.convert-cancel-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.convert-confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
}
.convert-confirm-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
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
  padding: 4px 0;
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
  overflow: hidden;
  cursor: move;
}

.bgm-track {
  cursor: default;
}

.timeline-track:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-track.active {
  background: var(--bg-quaternary);
  border-color: var(--primary-color);
}

.track-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-secondary);
  font-size: 12px;
  color: var(--text-tertiary);
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
  padding: 6px 0;
  min-height: 40px;
  background: var(--bg-primary);
}

.bgm-track .track-clips {
  min-height: 28px;
}

.bgm-clip {
  height: 20px;
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
  height: 22px;
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
  position: relative;
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

[data-theme="dark"] .voice-script-input {
  color: #fff;
}

.voice-char-counter {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
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

/* 音乐上传区域 */
.music-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}
.music-scrollable-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 200px;
  overflow-y: auto;
  height: 0;
  min-height: 0;
  content-visibility: auto;
}
.upload-area {
  border: 1px dashed var(--border-color, #e0e0e0);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 10px;
  background-color: var(--bg-tertiary, #f9f9f9);
  transition: all 0.3s;
}
.upload-area:hover {
  border-color: var(--primary-color, #007bff);
  background-color: var(--bg-hover, #f0f7ff);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #666);
}
.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #333);
}
.upload-hint {
  font-size: 12px;
  color: var(--text-hint, #999);
}
.uploaded-audio-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 12px;
}
.audio-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.audio-main { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.audio-title { font-size: 14px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.audio-slider { width: 100%; accent-color: var(--primary-color); }
.audio-actions { display: flex; align-items: center; gap: 8px; }
.audio-time { font-size: 12px; color: var(--text-secondary); }
.delete-audio-btn { border: none; background: transparent; color: var(--error-color); cursor: pointer; padding: 4px; }
.music-apply-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}
.music-apply-btn {
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
.music-apply-btn:hover { background: var(--primary-hover); }

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

.subtitle-overlay {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  /* padding: 8px 16px; */
  border-radius: 4px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  max-width: 80%;
  pointer-events: auto;
  z-index: 10;
  text-shadow: none;
  -webkit-text-stroke: 0.6px #000;
  text-stroke: 0.6px #000;
  white-space: pre-wrap;
}

.subtitle-overlay.portrait-mode {
  max-width: calc(100% - 48px);
}

.subtitle-overlay.fullscreen-mode {
  font-size: clamp(24px, 3vw, 40px);
}

.subtitle-overlay [contenteditable="true"] {
  outline: none;
}

.subtitle-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  border: none;
  border-radius: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.subtitle-edit-input {
  width: 100%;
  min-height: 60px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: inherit;
  line-height: 1.5;
  padding: 10px 12px;
  outline: none;
  backdrop-filter: blur(2px);
}

.subtitle-confirm-btn {
  margin-top: 8px;
  padding: 6px 10px;
  border: none;
  border-radius: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
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
  border-radius: 34px;
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
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(16px);
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

.skeleton-card {
  height: 60px;
  border-radius: 8px;
  margin-top: 8px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-quaternary) 37%, var(--bg-tertiary) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.points-display {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-secondary);
  color: #fbbf24; /* Gold/Yellow for points */
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.points-display:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-1px);
}
.non-member-points {
  color: var(--text-tertiary);
}
.non-member-points .points-icon {
  filter: grayscale(1);
}
</style>
