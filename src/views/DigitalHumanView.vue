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
      <div class="config-area">
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
            <textarea 
              placeholder="输入想要人物讲述的台词" 
              class="text-input"
            ></textarea>
            
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
          <textarea 
            placeholder="输入对画面内容的描述" 
            class="description-input"
          ></textarea>

          <!-- 分辨率选择 -->
          <div class="resolution-options">
            <button class="resolution-btn">720P</button>
            <button class="resolution-btn premium">1080P <span class="premium-icon">⭐</span></button>
            <button class="generate-video-btn">生成视频</button>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- 创建数字人模态框 -->

</template>

<script>
import { generateAvatarPlaceholder } from '@/utils/placeholder'

export default {
  name: 'DigitalHumanView',
  data() {
    return {
      isDragging: false,
      uploadedImage: null,
      activeCategory: 'all',
      categories: [
        { id: 'all', name: '全部', icon: '👥', count: 12 },
        { id: 'my', name: '我的数字人', icon: '👤', count: 3 },
        { id: 'preset', name: '预设模板', icon: '🎭', count: 9 },
        { id: 'training', name: '训练中', icon: '⏳', count: 2 }
      ],
      humans: [
        {
          id: 1,
          name: '艾米',
          description: '专业的商务主播，适合企业宣传和产品介绍',
          avatar: generateAvatarPlaceholder('艾米', '4A90E2'),
          category: 'business',
          gender: 'female',
          age: '25-30',
          style: 'professional',
          languages: ['中文', '英文'],
          features: ['高清画质', '自然表情', '多语言支持'],
          price: '免费',
          rating: 4.8,
          usageCount: 1234
        },
        {
          id: 2,
          name: '大卫',
          description: '亲和力强的教育主播，适合在线课程和培训视频',
          avatar: generateAvatarPlaceholder('大卫', '7ED321'),
          category: 'education',
          gender: 'male',
          age: '30-35',
          style: 'friendly',
          languages: ['中文', '英文', '日文'],
          features: ['清晰发音', '生动讲解', '互动性强'],
          price: '¥99/月',
          rating: 4.9,
          usageCount: 856
        },
        {
          id: 3,
          name: '小雅',
          description: '时尚活泼的生活主播，适合美妆、时尚类内容',
          avatar: generateAvatarPlaceholder('小雅', 'F5A623'),
          category: 'lifestyle',
          gender: 'female',
          age: '20-25',
          style: 'trendy',
          languages: ['中文', '韩文'],
          features: ['时尚造型', '活泼表情', '年轻化'],
          price: '¥199/月',
          rating: 4.7,
          usageCount: 2341
        },
        {
          id: 4,
          name: '博士',
          description: '权威专业的学术主播，适合科研和技术类内容',
          avatar: generateAvatarPlaceholder('博士', '9013FE'),
          category: 'academic',
          gender: 'male',
          age: '40-45',
          style: 'authoritative',
          languages: ['中文', '英文'],
          features: ['专业权威', '逻辑清晰', '学术风格'],
          price: '¥299/月',
          rating: 4.6,
          usageCount: 567
        },
        {
          id: 5,
          name: '娜娜',
          description: '温柔亲切的客服主播，适合客户服务和咨询类视频',
          avatar: generateAvatarPlaceholder('娜娜', 'D0021B'),
          category: 'service',
          gender: 'female',
          age: '25-30',
          style: 'gentle',
          languages: ['中文'],
          features: ['温柔声音', '亲切笑容', '服务导向'],
          price: '¥149/月',
          rating: 4.8,
          usageCount: 1789
        },
        {
          id: 6,
          name: '杰克',
          description: '动感活力的运动主播，适合健身和体育类内容',
          avatar: generateAvatarPlaceholder('杰克', '50E3C2'),
          category: 'sports',
          gender: 'male',
          age: '25-30',
          style: 'energetic',
          languages: ['中文', '英文'],
          features: ['运动风格', '活力四射', '激励强劲'],
          price: '¥179/月',
          rating: 4.5,
          usageCount: 3456
        }
      ]
    }
  },
  computed: {
    filteredHumans() {
      if (this.activeCategory === 'all') {
        return this.humans
      } else if (this.activeCategory === 'my') {
        return this.humans.filter(human => human.id <= 2) // 模拟用户自己的数字人
      } else if (this.activeCategory === 'preset') {
        return this.humans.filter(human => human.id > 2) // 模拟预设模板
      } else if (this.activeCategory === 'training') {
        return this.humans.filter(human => human.status === 'training')
      }
      return this.humans
    }
  },
  methods: {
    triggerFileUpload(e) {
       this.$refs.fileInput.click();
     },
    handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.validateAndProcessImage(file);
      }
    },
    onDragOver(e) {
      this.isDragging = true;
    },
    onDragLeave(e) {
      this.isDragging = false;
    },
    onDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.validateAndProcessImage(file);
      }
    },
    validateAndProcessImage(file) {
      // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }
      
      // 创建图片对象检查尺寸和比例
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // 检查尺寸
        if (img.width > 300 || img.height > 300) {
          alert('图片尺寸不能大于300px');
          URL.revokeObjectURL(objectUrl);
          return;
        }
        
        // 检查宽高比 (2:3 至 3:2)
        const ratio = img.width / img.height;
        if (ratio < 2/3 || ratio > 3/2) {
          alert('图片宽高比必须在2:3至3:2之间');
          URL.revokeObjectURL(objectUrl);
          return;
        }
        
        // 图片验证通过
        this.uploadedImage = objectUrl;
        console.log('图片上传成功:', file.name);
        // 这里可以添加上传到服务器的逻辑
      };
      
      img.onerror = () => {
        alert('无法加载图片，请检查文件格式');
        URL.revokeObjectURL(objectUrl);
      };
      
      img.src = objectUrl;
    },
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId
    },
    previewHuman(human) {
      console.log('预览数字人:', human.name)
    },
    editHuman(human) {
      console.log('编辑数字人:', human.name)
    },
    deleteHuman(human) {
      if (confirm(`确定要删除数字人 "${human.name}" 吗？`)) {
        const index = this.humans.findIndex(h => h.id === human.id)
        if (index > -1) {
          this.humans.splice(index, 1)
        }
      }
    },
    uploadTrainingData() {
      console.log('上传训练数据')
    },
    getTrainingTime() {
      const times = {
        fast: '30分钟',
        standard: '2小时',
        high: '6小时'
      }
      return times[this.newHuman.trainingQuality] || '2小时'
    },
    getStatusText(status) {
      const statusMap = {
        available: '可用',
        training: '训练中',
        offline: '离线'
      }
      return statusMap[status] || status
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

/* 右侧配置区域 */
.config-area {
  width: 300px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background-color: #fff;
  border-top: 1px solid #eee;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 0;
  margin-bottom: 15px;
  background-color: #f2f2f2;
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
  color: #666;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.tab-button.active {
  background-color: #fff;
  color: #333;
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
  background-color: #f2f2f2;
}

/* 朗读控制 */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 5px;
}

.play-button, .pause-button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.play-button:hover, .pause-button:hover {
  color: #333;
  background-color: #f0f0f0;
}

.play-icon, .pause-icon {
  font-size: 14px;
}

.time-display {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* 声音音色 */
.voice-tone-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.voice-tone-selector {
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
  border-radius: 8px;
  padding: 10px 15px;
}

.voice-tone-selector .play-button {
  margin-right: 10px;
  color: #666;
}

.voice-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.voice-option {
  font-size: 12px;
  color: #666;
  background-color: #e9e9e9;
  padding: 2px 8px;
  border-radius: 10px;
}

.voice-selector-arrow {
  margin-left: 10px;
  color: #999;
}

/* 情绪选择 */
.emotion-selection {
  margin-bottom: 15px;
}

.emotion-dropdown {
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
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
  color: #666;
}

.dropdown-arrow {
  font-size: 12px;
  color: #999;
}

/* 声音音量和语速 */
.voice-volume, .voice-speed {
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
  background: linear-gradient(to right, #4dabf7, #4dabf7);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #4dabf7;
  cursor: pointer;
}

.slider-value {
  margin-left: 10px;
  font-size: 14px;
  color: #333;
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
  background-color: #f2f2f2;
  color: #333;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.add-voiceover-btn:hover {
  background-color: #e6e6e6;
}

/* 画面描述区域 */
.scene-description-area {
  background-color: #fff;
}

.description-input {
  width: 100%;
  height: 80px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  background-color: #f2f2f2;
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
  background-color: #f2f2f2;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
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
  background-color: #0088FF;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* 添加新角色按钮容器 */
.add-role-container {
  padding: 5px ;
  border-bottom: 1px solid #eee;
  text-align: center;
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

.add-role-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #4dabf7;
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
  background-color: #3b99e0;
}

.plus-icon {
  margin-right: 5px;
  font-size: 16px;
}



/* 响应式调整 */
@media (max-width: 768px) {
  .digital-human-container {
    flex-direction: column;
  }
  
  .config-area {
    width: 100%;
  }
}
</style>