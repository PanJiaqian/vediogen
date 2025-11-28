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
          </div>
        </div>
        <div class="timeline-area">
          <div class="duration-label">{{ selectedSeconds }}s</div>
          <div ref="timeline" class="timeline" @mousedown="onMouseDown">
            <button class="play-btn" @click="togglePlay">
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
          </div>
        </div>
        <div class="footer">
          <button class="reset-btn" @click="reset">重置修改</button>
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
      dragTarget: null
    }
  },
  watch: {
    visible(v) {
      if (v) this.reset()
      if (!v) this.stopPlayback()
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
      return { left: left + '%', width: width + '%' }
    },
    startStyle() {
      return { left: this.startPct + '%' }
    },
    endStyle() {
      return { left: this.endPct + '%' }
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

.reset-btn {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 14px;
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
