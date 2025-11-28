<template>
  <div class="digital-human-toolbar">
    <!-- 添加新角色按钮 -->
    <div class="add-role-container">
      <button class="add-role-btn">
        <span class="plus-icon">+</span> 添加新角色
      </button>
    </div>

    <div class="voice-processing-area">
      <div class="tab-navigation">
        <button class="tab-button active">文本朗读</button>
        <button class="tab-button">上传配音</button>
      </div>
      <div class="text-input-section">
        <textarea placeholder="输入想要人物讲述的台词" class="text-input"></textarea>

        <!-- 朗读控制 -->
        <div class="playback-controls">
          <button class="play-button">
            <span class="play-icon">▶</span>
          </button>
          <button class="pause-button">
            <span class="pause-icon">⏸</span>
          </button>
          <div class="time-display">约 0s 音频 0/240</div>
        </div>
      </div>

      <!-- 声音音色 -->
      <div class="voice-tone-section">
        <h3 class="section-title">声音音色</h3>
        <div class="voice-tone-selector">
          <div class="play-button">▶</div>
          <div class="voice-options">
            <span class="voice-option">温柔女声</span>
            <span class="voice-option">女性</span>
            <span class="voice-option">青年</span>
            <span class="voice-option">普通话</span>
          </div>
          <div class="voice-selector-arrow">⟩</div>
        </div>
      </div>

      <!-- 情绪选择 -->
      <div class="emotion-selection">
        <div class="emotion-dropdown">
          <span class="emotion-icon">😊</span>
          <span class="emotion-text">情绪: 默认</span>
          <span class="dropdown-arrow">▼</span>
        </div>
      </div>

      <!-- 声音音量 -->
      <div class="voice-volume">
        <h3 class="section-title">声音音量</h3>
        <div class="slider-container">
          <input type="range" min="0" max="100" value="100" class="slider" id="volume-slider">
          <span class="slider-value">100</span>
        </div>
      </div>

      <!-- 声音语速 -->
      <div class="voice-speed">
        <h3 class="section-title">声音语速</h3>
        <div class="slider-container">
          <input type="range" min="0.5" max="2" step="0.1" value="1.0" class="slider" id="speed-slider">
          <span class="slider-value">1.0 x</span>
        </div>
      </div>

      <!-- 添加配音按钮 -->
      <div class="action-buttons">
        <button class="add-voiceover-btn">添加配音</button>
      </div>
    </div>

    <!-- 下部分：画面描述区域（固定高度） -->
    <div class="scene-description-area">
      <h3 class="section-title">画面描述 (选填)</h3>
      <textarea placeholder="输入对画面内容的描述" class="description-input"></textarea>

      <!-- 分辨率选择 -->
      <div class="resolution-options">
        <button class="resolution-btn">720P</button>
        <button class="resolution-btn premium">1080P <span class="premium-icon">⭐</span></button>
        <button class="generate-video-btn">生成视频</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DigitalHumanToolbar',
  data() {
    return {
      // 可以添加组件内部状态
    }
  },
  methods: {
    // 可以添加组件方法
  }
}
</script>

<style scoped>
.digital-human-toolbar {
  width: 300px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

/* 上部分：声音处理区域（可滚动） */
.voice-processing-area {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

/* 下部分：画面描述区域（固定高度） */
.scene-description-area {
  padding: 15px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-secondary);
}

/* 添加新角色按钮容器 */
.add-role-container {
  padding: 5px;
  border-bottom: 1px solid var(--border-secondary);
  text-align: center;
}

.add-role-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.add-role-btn:hover {
  background-color: var(--primary-hover);
}

.plus-icon {
  margin-right: 5px;
  font-size: 16px;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 0;
  margin-bottom: 15px;
  background-color: var(--bg-tertiary);
  border-radius: 20px;
  padding: 3px;
}

.tab-button {
  flex: 1;
  padding: 8px 15px;
  background-color: transparent;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.tab-button.active {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 文本输入区域 */
.text-input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.text-input {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  background-color: var(--bg-tertiary);
}

/* 朗读控制 */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 5px;
}

.play-button,
.pause-button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.play-button:hover,
.pause-button:hover {
  color: var(--text-primary);
  background-color: var(--bg-quaternary);
}

.play-icon,
.pause-icon {
  font-size: 14px;
}

.time-display {
  font-size: 12px;
  color: var(--text-quaternary);
  margin-left: auto;
}

/* 声音音色 */
.voice-tone-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.voice-tone-selector {
  display: flex;
  align-items: center;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  padding: 10px 15px;
}

.voice-tone-selector .play-button {
  margin-right: 10px;
  color: var(--text-secondary);
}

.voice-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.voice-option {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-quaternary);
  padding: 2px 8px;
  border-radius: 10px;
}

.voice-selector-arrow {
  margin-left: 10px;
  color: var(--text-quaternary);
}

/* 情绪选择 */
.emotion-selection {
  margin-bottom: 15px;
}

.emotion-dropdown {
  display: flex;
  align-items: center;
  background-color: var(--bg-tertiary);
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.emotion-icon {
  margin-right: 10px;
  font-size: 16px;
}

.emotion-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--text-quaternary);
}

/* 声音音量和语速 */
.voice-volume,
.voice-speed {
  padding: 0 10px;
  margin-bottom: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: normal;
  color: #333;
  margin: 0 0 10px 0;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: linear-gradient(to right, var(--primary-color), var(--primary-color));
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 2px solid var(--primary-color);
  cursor: pointer;
}

.slider-value {
  margin-left: 10px;
  font-size: 14px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}

/* 添加配音按钮 */
.action-buttons {
  margin-top: 15px;
  margin-bottom: 10px;
}

.add-voiceover-btn {
  width: 100%;
  padding: 10px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.add-voiceover-btn:hover {
  background-color: var(--bg-quaternary);
}

/* 画面描述区域 */
.scene-description-area {
  background-color: var(--bg-primary);
}

.description-input {
  width: 100%;
  height: 80px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  background-color: var(--bg-tertiary);
  margin-bottom: 15px;
}

/* 分辨率选择 */
.resolution-options {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.resolution-btn {
  padding: 6px 12px;
  background-color: var(--bg-tertiary);
  border: none;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.resolution-btn.premium {
  display: flex;
  align-items: center;
}

.premium-icon {
  margin-left: 5px;
  color: #ffc107;
}

.generate-video-btn {
  margin-left: auto;
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .digital-human-toolbar {
    width: 100%;
  }
}
</style>
