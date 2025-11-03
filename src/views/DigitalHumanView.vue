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
        <div class="upload-content">
          <div class="upload-icon">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDEyVjQyIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNyAyN0wzMiAxMkw0NyAyNyIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgNDJINTJWNTJIMTJWNDJaIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=" alt="上传图标" />
          </div>
          <div class="upload-text">
            <p>点击/拖拽添加支持上传图片</p>
            <p class="upload-specs">上传尺寸不大于 300px，大小不超过 10MB，宽高比 2:3 至 3:2 之间</p>
          </div>
        </div>
      </div>

      <!-- 右侧工具栏 -->
      <DigitalHumanToolbar />
    </div>
  </div>

</template>

<script>
import DigitalHumanToolbar from '@/components/DigitalHumanToolbar.vue'

export default {
  name: 'DigitalHumanView',
  components: {
    DigitalHumanToolbar
  },
  data() {
    return {
      isDragging: false,
      uploadedImage: null,
      activeCategory: 'all'
    }
  },
  computed: {
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
    validateAndProcessImage(file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB')
        return
      }

      // 创建图片对象检查尺寸和比例
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        if (img.width > 300 || img.height > 300) {
          alert('图片尺寸不能大于300px')
          URL.revokeObjectURL(objectUrl)
          return
        }

        const ratio = img.width / img.height
        if (ratio < 2 / 3 || ratio > 3 / 2) {
          alert('图片宽高比必须在2:3至3:2之间')
          URL.revokeObjectURL(objectUrl)
          return
        }

        this.uploadedImage = objectUrl
      }

      img.onerror = () => {
        alert('无法加载图片，请检查文件格式')
        URL.revokeObjectURL(objectUrl)
      }

      img.src = objectUrl
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
  background-color: #f8f9fa;
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
  background-color: #fff;
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
  background-color: #f9f9f9;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #4dabf7;
  background-color: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #4dabf7;
  background-color: #e6f4ff;
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
  color: #666;
}

.upload-specs {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .digital-human-container {
    flex-direction: column;
  }
}
</style>
