<template>
  <div class="digital-human">
    <div class="digital-human-container">
      <!-- 左侧上传区域 -->
      <div class="upload-area"
           @click="triggerFileUpload"
           @dragover.prevent="onDragOver"
           @dragleave.prevent="onDragLeave"
           @drop.prevent="onDrop"
           :class="{ 'drag-over': isDragging }">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none;"
          @change="handleFileUpload"
        />
        <div v-if="!uploadedImage" class="upload-content">
          <div class="upload-icon">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDEyVjQyIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNyAyN0wzMiAxMkw0NyAyNyIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgNDJINTJWNTJIMTJWNDJaIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=" alt="上传图标" />
          </div>
          <div class="upload-text">
            <p>点击/拖拽添加支持上传图片</p>
            <p class="upload-specs">上传尺寸不大于 300px，大小不超过 10MB，宽高比 2:3 至 3:2 之间</p>
          </div>
        </div>
        <img v-else :src="uploadedImage" class="uploaded-image" />
        <button v-if="uploadedImage" class="replace-btn" @click.stop="triggerFileUpload">
          <span class="replace-icon">⟲</span>
          替换
        </button>
      </div>

      <!-- 右侧工具栏 -->
      <DigitalHumanToolbar :detection="detection" :imageFile="uploadedImageFile" />
    </div>
    <div v-if="uploadToastVisible" class="floating-toast">{{ uploadToastText }}</div>
    <div v-if="showCropModal" class="crop-modal-overlay" @click.self="cancelCrop">
      <div class="crop-modal">
        <div class="crop-modal-header">裁剪图片</div>
        <div class="crop-modal-body" @mousemove="onMouseMove" @mouseup="onMouseUp">
          <div class="crop-preview" ref="cropPreview">
            <img :src="selectedImageUrl" class="crop-image" ref="cropImage" @load="onCropImageLoad" />
            <div v-if="cropRatio!=='free'" class="crop-select" :style="cropSelectBoxStyle" @mousedown.prevent="onSelectMouseDown">
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
            <button class="crop-cancel" @click="cancelCrop">取消</button>
            <button class="crop-apply" @click="applyCrop">应用</button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import DigitalHumanToolbar from '@/components/DigitalHumanToolbar.vue'
import { objectDetectionSeedream } from '@/api'
import { useUserStore } from '@/stores/user'

export default {
  name: 'DigitalHumanView',
  components: {
    DigitalHumanToolbar
  },
  data() {
    return {
      isDragging: false,
      uploadedImage: null,
      uploadedImageFile: null,
      detection: null,
      activeCategory: 'all',
      uploadToastVisible: false,
      uploadToastText: '',
      showCropModal: false,
      cropRatio: 'free',
      selectedImageFile: null,
      selectedImageUrl: null,
      cropSelX: 0,
      cropSelY: 0,
      cropSelW: 0,
      cropSelH: 0,
      isDraggingSel: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartSelX: 0,
      dragStartSelY: 0,
      isResizingSel: false,
      resizeDir: '',
      dragStartW: 0,
      dragStartH: 0,
      displayRect: null
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
    , aspectStyle() {
      const r = String(this.cropRatio || '').trim()
      if (!r || r === 'free') return {}
      const parts = r.split(':')
      const rw = parseFloat(parts[0]) || 1
      const rh = parseFloat(parts[1]) || 1
      return { aspectRatio: `${rw} / ${rh}` }
    }
    , cropSelectBoxStyle() {
      const r = String(this.cropRatio || '').trim()
      if (!r || r === 'free' || !this.displayRect) return {}
      const x = Math.round(this.cropSelX)
      const y = Math.round(this.cropSelY)
      const w = Math.round(this.cropSelW)
      const h = Math.round(this.cropSelH)
      return { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }
    }
  },
  watch: {
    cropRatio(val) {
      if (val && val !== 'free') {
        this.$nextTick(() => { this.initSelection() })
      }
    }
  },
  methods: {
    triggerFileUpload(e) {
      this.$refs.fileInput.click()
    },
    handleFileUpload(e) {
      const file = e.target.files[0]
      if (file) {
        this.validateAndProcessImage(file)
      }
    },
    onDragOver(e) {
      this.isDragging = true
    },
    onDragLeave(e) {
      this.isDragging = false
    },
    onDrop(e) {
      this.isDragging = false
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.validateAndProcessImage(file)
      }
    },
    async validateAndProcessImage(file) {
      if (file.size > 10 * 1024 * 1024) {
        this.showUploadToast('图片大小不能超过10MB')
        return
      }
      const objectUrl = URL.createObjectURL(file)
      this.selectedImageFile = file
      this.selectedImageUrl = objectUrl
      this.cropRatio = 'free'
      this.showCropModal = true
    },
    onCropImageLoad() {
      this.computeDisplayRect()
      if (this.cropRatio && this.cropRatio !== 'free') {
        this.initSelection()
      }
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
      if (!this.displayRect || !r || r === 'free') return
      const parts = r.split(':')
      const rw = parseFloat(parts[0]) || 1
      const rh = parseFloat(parts[1]) || 1
      const ratio = rw / rh
      const W = this.displayRect.width
      const H = this.displayRect.height
      let w, h
      if (W / H > ratio) {
        h = H
        w = Math.round(h * ratio)
      } else {
        w = W
        h = Math.round(w / ratio)
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
    cancelCrop() {
      this.showCropModal = false
      this.selectedImageFile = null
      this.selectedImageUrl = null
      this.cropRatio = 'free'
    },
    async applyCrop() {
      try {
        const file = this.selectedImageFile
        const url = this.selectedImageUrl
        if (!file || !url) { this.cancelCrop(); return }
        const cropped = await this.cropToRatio(url, this.cropRatio)
        const previewUrl = URL.createObjectURL(cropped)
        this.uploadedImage = previewUrl
        this.uploadedImageFile = cropped
        this.showCropModal = false
        const token = (this.userStore && this.userStore.token) || ''
        const resp = await objectDetectionSeedream({ imageFile: cropped, token })
        if (resp) {
          resp.timestamp = Date.now()
        }
        this.detection = resp
        if (!resp || resp.success === false) {
          this.showUploadToast('主体检测失败')
        }
      } catch (e) {
        this.showUploadToast('裁剪失败')
      }
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
            const canvas = document.createElement('canvas')
            canvas.width = targetW
            canvas.height = targetH
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, nW, nH, 0, 0, targetW, targetH)
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
    showUploadToast(text) {
      this.uploadToastText = String(text || '')
      this.uploadToastVisible = true
      setTimeout(() => { this.uploadToastVisible = false }, 2000)
    },
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.digital-human {
  padding: 10px;
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

.digital-human-container {
  display: flex;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 10px;
  min-height: 400px;
  height: 90vh;
}

/* 左侧上传区域 */
.upload-area {
  flex: 1;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 上传区域样式 */
.upload-area {
  position: relative;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  margin: 20px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-tertiary);
  overflow: hidden;
}

.upload-area:hover {
  border-color: #4dabf7;
  background-color: var(--bg-quaternary);
}

.upload-area.drag-over {
  border-color: #4dabf7;
  background-color: var(--bg-quaternary);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  width: 100%;
}

.upload-icon {
  margin-bottom: 15px;
}

.upload-icon img {
  width: 64px;
  height: 64px;
  opacity: 0.7;
}

.upload-text p {
  margin: 5px 0;
  color: var(--text-secondary);
}

.upload-specs {
  font-size: 12px;
  color: var(--text-quaternary);
  margin-top: 5px;
}

.uploaded-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
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
.crop-cancel { padding: 6px 12px; border: 1px solid var(--border-secondary); border-radius: 8px; background: var(--bg-primary); }
.crop-apply { padding: 6px 12px; border: none; border-radius: 8px; background: var(--primary-color); color: #fff; }

/* 响应式调整 */
@media (max-width: 768px) {
  .digital-human-container {
    flex-direction: column;
  }
}
</style>
