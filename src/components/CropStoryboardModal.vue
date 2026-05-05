// 分镜裁剪弹窗：选择分镜视频片段并返回裁剪区间
<template>
  <div v-if="visible" class="modal-overlay" @click="emitClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-title">裁剪视频</div>
        <button class="close-btn" @click="emitClose">×</button>
      </div>
      <div class="modal-body">
        <div class="preview-area">
          <div class="preview-box">
            <video v-if="isVideo" ref="previewVideo" :src="clean(videoUrl)" :poster="clean(imageUrl)"
              class="preview-video" muted loop playsinline preload="metadata"></video>
            <img v-else :src="clean(imageUrl)" class="preview-image" />
            
            <!-- 严肃纠正遮罩层 -->
            <div v-if="isCorrecting" class="correcting-overlay">
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="correcting-text">{{ correctionText }}</div>
              </div>
            </div>
            
            <!-- 气泡提示 -->
            <div v-if="showCorrectionToast" class="correction-toast">
              <span>✓ 当前内容和原要求一致，无需修改</span>
            </div>
          </div>
        </div>
        <div class="timeline-area">
          <div class="duration-label">{{ selectedSeconds }}s</div>
          <div ref="timeline" class="timeline" @mousedown="onMouseDown">
            <button class="play-btn" @click="togglePlay" :disabled="isCorrecting">
              <span v-if="!playing">▶</span>
              <span v-else>⏸</span>
            </button>
            <div ref="trackInner" class="track-inner">
              <div class="frames" :style="{ backgroundImage: 'url(' + clean(frameUrl) + ')' }"></div>
              <div class="selection" :style="selectionStyle"></div>
              <div class="handle handle-start" :style="startStyle" @mousedown.stop="onHandleDown('start', $event)">
              </div>
              <div class="handle handle-end" :style="endStyle" @mousedown.stop="onHandleDown('end', $event)"></div>
            </div>
            
            <!-- 轨道严肃纠正遮罩层 -->
            <div v-if="isCorrecting" class="timeline-correcting-overlay">
              <div class="loading-spinner timeline-spinner"></div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="left-actions">
            <button class="reset-btn" @click="reset">重置修改</button>
            <button class="serious-btn" @click="handleSeriousCorrect" :disabled="isCorrecting">严肃纠正</button>
          </div>
          <button class="apply-btn" @click="apply">应用修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { cleanUrl } from '@/utils/media'
import Hls from 'hls.js'

export default {
  name: 'CropStoryboardModal',
  props: {
    visible: { type: Boolean, default: false },
    videoUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    durationMs: { type: Number, default: 5000 }
  },
  data() {
    return {
      playing: false,
      startPct: 0,
      endPct: 100,
      dragTarget: null,
      isCorrecting: false,
      correctionText: '',
      showCorrectionToast: false
    }
  },
  watch: {
    visible(v) {
      if (v) this.reset()
      if (!v) {
        this.stopPlayback()
        this.isCorrecting = false
        this.showCorrectionToast = false
        clearTimeout(this._correctionTimer)
        clearTimeout(this._toastTimer)
      }
    }
  },
  computed: {
    isVideo() {
      const s = this.clean(this.videoUrl)
      if (!s) return false
      if (/\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(s)) return false
      if (/^blob:/i.test(s)) return true
      if (/^data:video\//i.test(s)) return true
      if (/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(s)) return true
      const lower = s.toLowerCase()
      if (lower.includes('type=video') || lower.includes('mediatype=video')) return true
      return false
    },
    frameUrl() {
      return this.clean(this.imageUrl || this.videoUrl)
    },
    selectionStyle() {
      const left = this.startPct
      const width = Math.max(0, this.endPct - this.startPct)
      return { left: `${left  }%`, width: `${width  }%` }
    },
    startStyle() {
      return { left: `${this.startPct  }%` }
    },
    endStyle() {
      return { left: `${this.endPct  }%` }
    },
    selectedMs() {
      const total = Math.max(1, Number(this.durationMs) || 5000)
      const span = Math.max(0, this.endPct - this.startPct) / 100
      return Math.round(total * span)
    },
    selectedSeconds() {
      return (this.selectedMs / 1000).toFixed(2)
    }
  },
  methods: {
    /**
     * 模拟严肃纠正流程
     * 依次显示：回溯素材设计(5s) -> 反思纠正步骤(3s) -> 正在生成中(5s)
     */
    async handleSeriousCorrect() {
      if (this.isCorrecting) return
      this.isCorrecting = true
      
      const delay = (ms) => new Promise(resolve => {
        this._correctionTimer = setTimeout(resolve, ms)
      })
      
      try {
        this.showCorrectionToast = false
        this.correctionText = '回溯素材设计'
        await delay(5000)
        if (!this.isCorrecting) return
        
        this.correctionText = '反思纠正步骤'
        await delay(3000)
        if (!this.isCorrecting) return
        
        this.correctionText = '正在生成中'
        await delay(5000)
        if (!this.isCorrecting) return
        
        // 流程结束，显示提示气泡
        this.showCorrectionToast = true
        this._toastTimer = setTimeout(() => {
          this.showCorrectionToast = false
        }, 3000) // 气泡显示3秒后自动消失
      } finally {
        this.isCorrecting = false
        this.correctionText = ''
        clearTimeout(this._correctionTimer)
      }
    },
    clean(u) {
      return cleanUrl(u)
    },
    isM3u8(u) {
      const s = this.clean(u || '')
      return /\.m3u8(\?|#|$)/i.test(s)
    },
    async attachHls(videoEl, src) {
      if (!videoEl) return null
      const url = this.clean(src || '')
      if (!this.isM3u8(url)) {
        try { videoEl.src = url } catch (e) { void 0 }
        return null
      }
      try {
        if (videoEl.canPlayType && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          try { videoEl.src = url } catch (e) { void 0 }
          return null
        }
      } catch (e) { void 0 }
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 10 })
        hls.loadSource(url)
        hls.attachMedia(videoEl)
        return hls
      }
      try { videoEl.src = url } catch (e) { void 0 }
      return null
    },
    emitClose() {
      this.$emit('close')
    },
    reset() {
      this.startPct = 0
      this.endPct = 100
    },
    apply() {
      const total = Math.max(1, Number(this.durationMs) || 5000)
      const minSpanMs = 1000
      let startMs = Math.round(total * (this.startPct / 100))
      let endMs = Math.round(total * (this.endPct / 100))
      if (endMs - startMs < minSpanMs) {
        endMs = Math.min(total, startMs + minSpanMs)
        startMs = Math.max(0, endMs - minSpanMs)
      }
      this.$emit('apply', { startMs, endMs })
      this.emitClose()
    },
    togglePlay() {
      if (!this.isVideo) return
      if (this.playing) {
        this.stopPlayback()
        return
      }
      const el = this.$refs.previewVideo
      if (!el) return
      this.attachHls(el, this.videoUrl)
      const start = () => {
        const dur = Number(el.duration) || Math.max(1, (Number(this.durationMs) || 5000) / 1000)
        const s = Math.max(0, Math.min(dur, (this.startPct / 100) * dur))
        const e = Math.max(s + 0.05, Math.min(dur, (this.endPct / 100) * dur))
        try { el.loop = false } catch (err) { void 0 }
        try { el.muted = true } catch (err) { void 0 }
        try { el.playsInline = true } catch (err) { void 0 }
        try { el.currentTime = s } catch (err) { void 0 }
        this._endBoundary = e
        const onTime = () => {
          if (el.currentTime >= this._endBoundary) {
            try { el.pause() } catch (err) { void 0 }
            el.removeEventListener('timeupdate', onTime)
            this.playing = false
          }
        }
        el.addEventListener('timeupdate', onTime)
        const p = el.play()
        this.playing = true
        if (p && p.catch) { p.catch(() => { this.playing = false }) }
      }
      if (isFinite(Number(el.duration)) && Number(el.duration) > 0) {
        start()
      } else {
        const meta = () => { el.removeEventListener('loadedmetadata', meta); start() }
        el.addEventListener('loadedmetadata', meta)
        try { el.load() } catch (err) { void 0 }
      }
    },
    stopPlayback() {
      const el = this.$refs.previewVideo
      if (!el) return
      try { el.pause() } catch (err) { void 0 }
      this.playing = false
    },
    onMouseDown(e) {
      if (this.isCorrecting) return
      const inner = this.$refs.trackInner || this.$refs.timeline
      const rect = inner.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
      const distStart = Math.abs(pct - this.startPct)
      const distEnd = Math.abs(pct - this.endPct)
      this.dragTarget = distStart < distEnd ? 'start' : 'end'
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
      this.updatePct(pct)
    },
    onHandleDown(target, e) {
      if (this.isCorrecting) return
      this.dragTarget = target
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    },
    onMouseMove(e) {
      const inner = this.$refs.trackInner || this.$refs.timeline
      const rect = inner.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
      this.updatePct(pct)
    },
    onMouseUp() {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
      this.dragTarget = null
    },
    updatePct(pct) {
      const total = Math.max(1, Number(this.durationMs) || 5000)
      const minSpanPct = Math.min(100, (1000 / total) * 100)
      if (this.dragTarget === 'start') {
        const maxStart = this.endPct - minSpanPct
        this.startPct = Math.max(0, Math.min(maxStart, pct))
      } else if (this.dragTarget === 'end') {
        const minEnd = this.startPct + minSpanPct
        this.endPct = Math.max(minEnd, Math.min(100, pct))
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 92%;
  max-width: 960px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-tertiary);
  padding: 6px;
  border-radius: 8px;
}

.close-btn:hover {
  background: var(--bg-tertiary);
}

.modal-body {
  padding: 0 24px 24px;
}

.preview-area {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.preview-box {
  width: 100%;
  height: 360px;
  background: var(--bg-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.correcting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  /* 添加毛玻璃效果和更细腻的背景过渡 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: fadeIn 0.3s ease-in-out;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-tertiary, #f3f4f6);
  border-radius: 50%;
  border-top-color: var(--success-color, #10b981);
  border-right-color: rgba(16, 185, 129, 0.4);
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  margin-bottom: 0;
}

/* 深色模式下的蓝色加载圈 */
:root[data-theme="dark"] .loading-spinner {
  border-top-color: var(--primary-color, #3b82f6);
  border-right-color: rgba(59, 130, 246, 0.4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.correcting-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-primary, #111827);
  background: linear-gradient(90deg, var(--text-primary, #111827), var(--success-color, #10b981), var(--text-primary, #111827));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
}

.correction-toast {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 0.85);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toastSlideDown {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* 深色模式下的气泡样式微调 */
:root[data-theme="dark"] .correction-toast {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 深色模式下的蓝色渐变文字 */
:root[data-theme="dark"] .correcting-text {
  background: linear-gradient(90deg, var(--text-primary, #e5e7eb), var(--primary-color, #3b82f6), var(--text-primary, #e5e7eb));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes shimmer {
  to { background-position: 200% center; }
}

.preview-video,
.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.timeline-area {
  margin-top: 20px;
  padding-top: 16px;
  position: relative;
}

.duration-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -20px;
  background: #10b981;
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.timeline {
  position: relative;
  height: 88px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px 40px 16px 56px;
  overflow: hidden;
}

.timeline-correcting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-tertiary, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-in-out;
}

.timeline-spinner {
  width: 28px;
  height: 28px;
  border-width: 3px;
  margin-bottom: 0;
}

.track-inner {
  position: absolute;
  left: 56px;
  right: 40px;
  top: 16px;
  bottom: 16px;
}

.frames {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-size: contain;
  background-repeat: repeat-x;
  filter: brightness(1.1);
}

.selection {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(16, 185, 129, 0.18);
  border: 2px solid var(--success-color);
  border-radius: 6px;
}

.handle {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: var(--success-color);
  border-radius: 4px;
  cursor: ew-resize;
}

.handle-start {
  left: 0;
}

.handle-end {
  left: calc(100% - 8px);
}

.play-btn {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--success-color);
  color: #fff;
  border: none;
  cursor: pointer;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 14px;
}

.serious-btn {
  background: none;
  border: none;
  color: var(--text-tertiary, #999);
  cursor: pointer;
  font-size: 14px;
}

.serious-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apply-btn {
  background: var(--success-color);
  border: none;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
