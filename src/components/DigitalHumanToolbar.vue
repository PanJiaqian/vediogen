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
        <button class="tab-button" :class="{ active: activeTab === 'text' }" @click="activeTab = 'text'">文本朗读</button>
        <button class="tab-button" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">上传配音</button>
      </div>

      <!-- 文本朗读模式 -->
      <div v-if="activeTab === 'text'" class="tab-content">
        <div class="text-input-section">
          <textarea v-model="textInput" placeholder="输入想要人物讲述的台词" class="text-input"></textarea>

          <!-- 朗读控制 -->
          <div class="playback-controls">
            <button class="play-button" @click="handlePlay">
              <div v-if="isVoiceLoading" class="spinner" style="width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
              <span v-else class="play-icon">▶</span>
            </button>
            <button class="pause-button" @click="handlePause">
              <span class="pause-icon">⏸</span>
            </button>
            <!-- <div class="time-display">约 0s 音频 0/240</div> -->
          </div>
        </div>

        <!-- 声音音色 -->
        <div class="voice-tone-section">
          <h3 class="section-title">声音音色</h3>
          <div class="voice-tone-selector" @click="showToneSelector = true">
            <div class="play-button" @click.stop="handlePlay">
              <div v-if="isVoiceLoading" class="spinner" style="width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
              <span v-else>▶</span>
            </div>
            <div class="voice-options">
              <span class="voice-option">{{ voiceName }}</span>
              <span class="voice-option">{{ voiceGender }}</span>
              <span class="voice-option">{{ voiceAge }}</span>
              <!-- <span class="voice-option">{{ voiceStyle }}</span> -->
            </div>
            <div class="voice-selector-arrow">⟩</div>
          </div>
        </div>

        <!-- 语种选择（点击弹窗） -->
        <div class="language-select">
          <div class="language-row">
            <h3 class="section-title">语种选择</h3>
            <div v-if="!voiceName" class="no-voice-tip">请先选择音色</div>
            <select v-else v-model="voiceLanguage" class="filter-select" style="min-width: 140px; margin-left:auto;">
              <option v-for="lang in supportedLanguages" :key="lang" :value="lang">{{ toZhLanguage(lang) }}</option>
            </select>
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

        <!-- 声音音量（已注释） -->
        <!--
        <div class="voice-volume">
          <h3 class="section-title">声音音量</h3>
          <div class="slider-container">
            <input type="range" min="0" max="100" value="100" class="slider" id="volume-slider">
            <span class="slider-value">100</span>
          </div>
        </div>
        -->

        <!-- 声音语速（已注释） -->
        <!--
        <div class="voice-speed">
          <h3 class="section-title">声音语速</h3>
          <div class="slider-container">
            <input type="range" min="0.5" max="2" step="0.1" value="1.0" class="slider" id="speed-slider">
            <span class="slider-value">1.0 x</span>
          </div>
        </div>
        -->

        <!-- 添加配音按钮 -->
        <!-- <div class="action-buttons">
          <button class="add-voiceover-btn">添加配音</button>
        </div> -->
      </div>

      <!-- 上传配音模式 -->
      <div v-if="activeTab === 'upload'" class="tab-content upload-content">
        <div class="upload-area" @click="$refs.fileInput.click()">
          <div class="upload-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="upload-text">点击 or 将文件拖拽到这里上传</p>
            <p class="upload-hint">支持 MP3、WAV 格式，时长 0.3s - 60s</p>
          </div>
          <input type="file" accept=".mp3,.wav" style="display:none" ref="fileInput">
        </div>
        
        <div class="upload-note">
          <span class="info-icon">ⓘ</span> 上传配音暂不支持生成字幕
        </div>

        <!-- 声音音量（已注释） -->
        <!--
        <div class="voice-volume">
          <h3 class="section-title">声音音量</h3>
          <div class="slider-container">
            <input type="range" min="0" max="100" v-model="uploadVolume" class="slider">
            <span class="slider-value">{{ uploadVolume }}</span>
          </div>
        </div>
        -->

        <!-- 添加配音按钮 -->
        <!-- <div class="action-buttons">
          <button class="add-voiceover-btn">添加配音</button>
        </div> -->
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
            <button class="generate-video-btn" @click="handleGenerateVideo">生成视频</button>
          </div>
    </div>
    <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>
    <ToneSelector v-if="showToneSelector" :visible="true" @close="showToneSelector = false" @select="handleToneSelect"
      :token="userStore.token" modelName="qwen3-TTS-Flash" />
    
  </div>
</template>

<script>
import { aliTtsSubmit, aliTtsQuery, digitalhumanGen } from '@/api'
import { useUserStore } from '@/stores/user'
import ToneSelector from '@/components/ToneSelector.vue'

export default {
  name: 'DigitalHumanToolbar',
  components: {
    ToneSelector
  },
  props: {
    detection: {
      type: Object,
      default: null
    }
    , imageFile: {
      type: [File, Object],
      default: null
    }
  },
  data() {
    return {
      textInput: '',
      isPlaying: false,
      isVoiceLoading: false,
      voicePollTimer: null,
      voiceAudioEl: null,
      voiceAudioUrl: '',
      toastVisible: false,
      toastText: '',
      voiceName: '',
      voiceLanguage: 'Chinese',
      voiceGender: '女性',
      voiceAge: '青年',
      voiceStyle: '普通话',
      showToneSelector: false,
      activeTab: 'text', // text | upload
      uploadVolume: 100,
      supportedLanguages: []
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  methods: {
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
    async handlePlay() {
      try {
        if (this.isVoiceLoading) return
        if (this.isPlaying) { this.handlePause(); return }
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ } return }
        this.toastText = '收到，正在准备'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 1500)
        this.isVoiceLoading = true
        const text = String(this.textInput || '').trim() || '你好，欢迎体验数字人朗读'
        const languageType = this.voiceLanguage || 'Chinese'
        const voice = this.voiceName || 'cherry'

        const cacheKey = `ali-tts-cache:${voice}:${languageType}:${text}`
        try {
          const cachedUrl = localStorage.getItem(cacheKey)
          if (cachedUrl) {
            this.isVoiceLoading = false
            this.voiceAudioUrl = cachedUrl
            const el = new Audio(cachedUrl)
            el.addEventListener('ended', () => { this.isPlaying = false })
            this.voiceAudioEl = el
            try { await el.play(); this.isPlaying = true } catch (e) { this.isPlaying = false }
            return
          }
        } catch (e) { /* no-op */ }

        const submit = await aliTtsSubmit({ text, languageType, voice, token })
        const taskId = (submit && submit.task_id) || (submit && submit.data && submit.data.task_id) || (typeof submit === 'string' ? (() => { try { const o = JSON.parse(submit); return o && (o.task_id || (o.data && o.data.task_id)) } catch { return '' } })() : '')
        if (!taskId) { this.isVoiceLoading = false; return }
        if (this.voicePollTimer) { try { clearInterval(this.voicePollTimer) } catch (e) { /* no-op */ } this.voicePollTimer = null }
        this.voicePollTimer = setInterval(async () => {
          try {
            const q = await aliTtsQuery({ taskId, token })
            const obj = typeof q === 'string' ? (() => { try { return JSON.parse(q) } catch { return null } })() : q
            const status = obj && obj.status
            const url = obj && obj.result_url
            if (status === 'SUCCEEDED' && url) {
              try { clearInterval(this.voicePollTimer) } catch (e) { /* no-op */ }
              this.voicePollTimer = null
              this.isVoiceLoading = false
              const u = String(url).trim()
              try { localStorage.setItem(cacheKey, u) } catch (e) { /* no-op */ }
              this.voiceAudioUrl = u
              const el = new Audio(u)
              el.addEventListener('ended', () => { this.isPlaying = false })
              this.voiceAudioEl = el
              try { await el.play(); this.isPlaying = true } catch (e) { this.isPlaying = false }
            }
          } catch (e) { /* no-op */ }
        }, 3000)
      } catch (e) { this.isVoiceLoading = false; /* no-op */ }
    },
    async handleGenerateVideo() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) { try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ } return }
        const imgFile = this.imageFile || null
        const audioUrl = this.voiceAudioUrl || null
        const det = this.detection || null
        let masks = ''
        try {
          if (det && (Date.now() - (det.timestamp || 0) < 3600 * 1000)) {
            masks = (det.maskurl) || (det.data && det.data.maskurl) || (det.maskUrls) || (det.data && det.data.maskUrls) || ''
          }
        } catch (e) { masks = '' }
        if (!masks) {
          masks = 'https://v3-default.365yg.com/c4d3a34d98215985a686b8a264395c1f/6932628e/video/tos/cn/tos-cn-i-242bcc/oMfeATHAlp8UEgi0VYKi5KlBCcAFMI1yR7DUAA/?a=0&ch=0&cr=0&dr=0&&br=0&bt=0&ft=Oi.pi77JWH6BM~hPLvr0PD1IN&mime_type=video_mp4&rc=QGlAYSNz&btag=c0000000008000&cquery=10gd&dy_q=1764906110&l=2025120511415069F525013617108D3BF3'
        }
        const resp = await digitalhumanGen({ imageFile: imgFile, audioUrl, maskUrls: masks, token })
        const obj = typeof resp === 'string' ? (() => { try { return JSON.parse(resp) } catch { return null } })() : resp
        const taskId = (obj && (obj.task_id || obj.taskId)) || ''
        if (!taskId) { return }
        this.toastText = '任务创建成功'
        this.toastVisible = true
        setTimeout(() => { this.toastVisible = false }, 1500)
        this.$router.push({ name: 'DigitalVideo', params: { taskId } })
      } catch (e) { /* no-op */ }
    },
    handlePause() {
      try {
        if (this.voiceAudioEl) { try { this.voiceAudioEl.pause() } catch (e) { /* no-op */ } this.voiceAudioEl = null }
        if (this.voicePollTimer) { try { clearInterval(this.voicePollTimer) } catch (e) { /* no-op */ } this.voicePollTimer = null }
      } catch (e) { /* no-op */ }
      this.isPlaying = false
    }
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


.language-modal-overlay {
  display: none;
}

.language-modal {
  display: none;
}

.language-modal-title {
  display: none;
}

.language-modal-body {
  display: none;
}

.language-chip {
  padding: 6px 10px;
  border: 1px solid var(--border-secondary);
  border-radius: 100px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
}

.language-select-trigger {
  display: none;
}

.language-row {
  display: flex;
  align-items: center;
  gap: 8px;
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
.upload-note {
  font-size: 12px;
  color: var(--text-secondary, #666);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.info-icon {
  font-style: normal;
  color: var(--text-hint, #999);
}

.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-color, #eee);
  padding-bottom: 0;
}
.tab-button {
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary, #666);
  position: relative;
  font-weight: 500;
}
.tab-button.active {
  color: var(--primary-color, #007bff);
}
/* .tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color, #007bff);
} */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  z-index: 4000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .digital-human-toolbar {
    width: 100%;
  }
}

.no-voice-tip {
  font-size: 14px;
  color: #999;
  margin-left: auto;
  padding: 6px 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>
