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
        <div class="crop-modal-body">
          <div class="crop-preview" :style="aspectStyle">
            <img :src="selectedImageUrl" class="crop-image" />
          </div>
        </div>
        <div class="crop-modal-footer">
          <div class="ratio-buttons">
            <button :class="['ratio-btn', {active: cropRatio==='free'}]" @click="cropRatio='free'">自由</button>
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
      selectedImageUrl: null
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
            let targetW = img.width
            let targetH = img.height
            if (ratioName && ratioName !== 'free') {
              const parts = ratioName.split(':')
              const rw = parseFloat(parts[0]) || 1
              const rh = parseFloat(parts[1]) || 1
              const ratio = rw / rh
              const imgRatio = img.width / img.height
              let cropW, cropH
              if (imgRatio > ratio) {
                cropH = img.height
                cropW = Math.round(cropH * ratio)
              } else {
                cropW = img.width
                cropH = Math.round(cropW / ratio)
              }
              const startX = Math.floor((img.width - cropW) / 2)
              const startY = Math.floor((img.height - cropH) / 2)
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
            ctx.drawImage(img, 0, 0)
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
  max-width: 100%;
  max-height: 100%;
  border: 1px dashed var(--border-secondary);
  border-radius: 8px;
  overflow: hidden;
}
.crop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
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
