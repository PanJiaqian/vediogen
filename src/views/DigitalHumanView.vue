<template>
  <div class="digital-human">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">数字人</h1>
      <p class="page-description">AI驱动的虚拟主播，让您的视频更生动</p>
      <button class="create-btn" @click="showCreateModal = true">
        <i class="plus-icon">+</i>
        创建数字人
      </button>
    </div>

    <!-- 数字人分类 -->
    <div class="category-section">
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['category-tab', { active: activeCategory === category.id }]"
          @click="setActiveCategory(category.id)"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
          <span class="count">({{ category.count }})</span>
        </button>
      </div>
    </div>

    <!-- 数字人网格 -->
    <div class="humans-grid">
      <div 
        v-for="human in filteredHumans" 
        :key="human.id"
        class="human-card"
        @click="selectHuman(human)"
      >
        <div class="human-avatar">
          <img :src="human.avatar" :alt="human.name" />
          <div class="human-status" :class="human.status">
            {{ human.status === 'available' ? '可用' : human.status === 'training' ? '训练中' : '离线' }}
          </div>
          <div class="human-actions">
            <button class="action-btn preview" @click.stop="previewHuman(human)">
              <i class="play-icon">▶</i>
            </button>
            <button class="action-btn edit" @click.stop="editHuman(human)">
              <i class="edit-icon">✏</i>
            </button>
            <button class="action-btn delete" @click.stop="deleteHuman(human)">
              <i class="delete-icon">🗑</i>
            </button>
          </div>
        </div>
        
        <div class="human-info">
          <h3 class="human-name">{{ human.name }}</h3>
          <p class="human-description">{{ human.description }}</p>
          <div class="human-meta">
            <span class="human-type">{{ human.type }}</span>
            <span class="human-language">{{ human.language }}</span>
            <span class="human-voice">{{ human.voice }}</span>
          </div>
          <div class="human-stats">
            <div class="stat">
              <span class="stat-label">使用次数</span>
              <span class="stat-value">{{ human.usageCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">创建时间</span>
              <span class="stat-value">{{ formatDate(human.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建数字人模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content create-modal" @click.stop>
        <div class="modal-header">
          <h2>创建数字人</h2>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="create-steps">
            <div class="step-indicator">
              <div 
                v-for="(step, index) in createSteps" 
                :key="index"
                :class="['step', { active: currentStep === index, completed: currentStep > index }]"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-title">{{ step.title }}</div>
              </div>
            </div>
            
            <!-- 步骤1: 选择模板 -->
            <div v-if="currentStep === 0" class="step-content">
              <h3>选择数字人模板</h3>
              <div class="template-grid">
                <div 
                  v-for="template in humanTemplates" 
                  :key="template.id"
                  :class="['template-card', { selected: selectedTemplate === template.id }]"
                  @click="selectedTemplate = template.id"
                >
                  <img :src="template.avatar" :alt="template.name" />
                  <div class="template-info">
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.description }}</p>
                    <div class="template-tags">
                      <span v-for="tag in template.tags" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 步骤2: 配置属性 -->
            <div v-if="currentStep === 1" class="step-content">
              <h3>配置数字人属性</h3>
              <div class="config-form">
                <div class="form-group">
                  <label>数字人名称</label>
                  <input type="text" v-model="newHuman.name" placeholder="请输入数字人名称" />
                </div>
                
                <div class="form-group">
                  <label>描述</label>
                  <textarea v-model="newHuman.description" placeholder="请输入描述信息"></textarea>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>语言</label>
                    <select v-model="newHuman.language">
                      <option value="zh-CN">中文</option>
                      <option value="en-US">英语</option>
                      <option value="ja-JP">日语</option>
                      <option value="ko-KR">韩语</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>声音类型</label>
                    <select v-model="newHuman.voice">
                      <option value="female-sweet">女声-甜美</option>
                      <option value="female-professional">女声-专业</option>
                      <option value="male-warm">男声-温暖</option>
                      <option value="male-authoritative">男声-权威</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>应用场景</label>
                  <div class="checkbox-group">
                    <label v-for="scene in applicationScenes" :key="scene.id" class="checkbox-item">
                      <input type="checkbox" :value="scene.id" v-model="newHuman.scenes" />
                      <span>{{ scene.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 步骤3: 训练设置 -->
            <div v-if="currentStep === 2" class="step-content">
              <h3>训练设置</h3>
              <div class="training-config">
                <div class="form-group">
                  <label>训练数据</label>
                  <div class="upload-area" @click="uploadTrainingData">
                    <i class="upload-icon">📁</i>
                    <p>点击上传训练视频或音频文件</p>
                    <small>支持 MP4, MOV, MP3, WAV 格式，建议时长 5-30 分钟</small>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>训练质量</label>
                  <div class="quality-options">
                    <label class="radio-item">
                      <input type="radio" value="fast" v-model="newHuman.trainingQuality" />
                      <span>快速训练 (30分钟)</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" value="standard" v-model="newHuman.trainingQuality" />
                      <span>标准训练 (2小时)</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" value="high" v-model="newHuman.trainingQuality" />
                      <span>高质量训练 (6小时)</span>
                    </label>
                  </div>
                </div>
                
                <div class="training-preview">
                  <h4>预计训练时间: {{ getTrainingTime() }}</h4>
                  <p>训练完成后，您将收到邮件通知</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            v-if="currentStep > 0" 
            class="btn btn-secondary" 
            @click="currentStep--"
          >
            上一步
          </button>
          <button 
            v-if="currentStep < createSteps.length - 1" 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="!canProceed"
          >
            下一步
          </button>
          <button 
            v-if="currentStep === createSteps.length - 1" 
            class="btn btn-primary" 
            @click="createHuman"
            :disabled="creating"
          >
            {{ creating ? '创建中...' : '开始训练' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 数字人详情模态框 -->
    <div v-if="selectedHuman" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedHuman.name }}</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="human-detail">
            <div class="detail-avatar">
              <img :src="selectedHuman.avatar" :alt="selectedHuman.name" />
              <div class="avatar-actions">
                <button class="btn btn-primary" @click="useHuman(selectedHuman)">
                  使用此数字人
                </button>
              </div>
            </div>
            
            <div class="detail-info">
              <div class="info-section">
                <h3>基本信息</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">类型:</span>
                    <span class="value">{{ selectedHuman.type }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">语言:</span>
                    <span class="value">{{ selectedHuman.language }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">声音:</span>
                    <span class="value">{{ selectedHuman.voice }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">状态:</span>
                    <span class="value" :class="selectedHuman.status">{{ getStatusText(selectedHuman.status) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-section">
                <h3>使用统计</h3>
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-number">{{ selectedHuman.usageCount }}</div>
                    <div class="stat-label">总使用次数</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{ selectedHuman.totalDuration }}</div>
                    <div class="stat-label">总生成时长</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{ selectedHuman.rating }}</div>
                    <div class="stat-label">用户评分</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateAvatarPlaceholder } from '@/utils/placeholder'

export default {
  name: 'DigitalHumanView',
  data() {
    return {
      activeCategory: 'all',
      showCreateModal: false,
      selectedHuman: null,
      currentStep: 0,
      creating: false,
      selectedTemplate: null,
      newHuman: {
        name: '',
        description: '',
        language: 'zh-CN',
        voice: 'female-sweet',
        scenes: [],
        trainingQuality: 'standard'
      },
      categories: [
        { id: 'all', name: '全部', icon: '👥', count: 12 },
        { id: 'my', name: '我的数字人', icon: '👤', count: 3 },
        { id: 'preset', name: '预设模板', icon: '🎭', count: 9 },
        { id: 'training', name: '训练中', icon: '⏳', count: 2 }
      ],
      createSteps: [
        { title: '选择模板' },
        { title: '配置属性' },
        { title: '训练设置' }
      ],
      humanTemplates: [
        {
          id: 1,
          name: '商务女性',
          description: '专业的商务形象，适合企业宣传',
          avatar: 'https://via.placeholder.com/200x250/4A90E2/ffffff?text=商务女性',
          tags: ['专业', '商务', '企业']
        },
        {
          id: 2,
          name: '亲和主播',
          description: '亲切友好的主播形象，适合直播带货',
          avatar: 'https://via.placeholder.com/200x250/7ED321/ffffff?text=亲和主播',
          tags: ['亲和', '直播', '带货']
        },
        {
          id: 3,
          name: '科技达人',
          description: '现代科技感，适合科技产品介绍',
          avatar: 'https://via.placeholder.com/200x250/9013FE/ffffff?text=科技达人',
          tags: ['科技', '现代', '产品']
        }
      ],
      applicationScenes: [
        { id: 'education', name: '教育培训' },
        { id: 'marketing', name: '营销推广' },
        { id: 'news', name: '新闻播报' },
        { id: 'entertainment', name: '娱乐直播' }
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
    },
    canProceed() {
      if (this.currentStep === 0) {
        return this.selectedTemplate !== null
      } else if (this.currentStep === 1) {
        return this.newHuman.name.trim() !== '' && this.newHuman.description.trim() !== ''
      } else if (this.currentStep === 2) {
        return this.newHuman.trainingQuality !== ''
      }
      return true
    }
  },
  methods: {
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId
    },
    selectHuman(human) {
      this.selectedHuman = human
    },
    closeDetailModal() {
      this.selectedHuman = null
    },
    closeCreateModal() {
      this.showCreateModal = false
      this.currentStep = 0
      this.selectedTemplate = null
      this.newHuman = {
        name: '',
        description: '',
        language: 'zh-CN',
        voice: 'female-sweet',
        scenes: [],
        trainingQuality: 'standard'
      }
    },
    nextStep() {
      if (this.canProceed && this.currentStep < this.createSteps.length - 1) {
        this.currentStep++
      }
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
    useHuman(human) {
      console.log('使用数字人:', human.name)
      this.closeDetailModal()
    },
    uploadTrainingData() {
      console.log('上传训练数据')
    },
    createHuman() {
      this.creating = true
      // 模拟创建过程
      setTimeout(() => {
        const newHuman = {
          id: Date.now(),
          name: this.newHuman.name,
          description: this.newHuman.description,
          avatar: this.humanTemplates.find(t => t.id === this.selectedTemplate)?.avatar || '',
          type: this.humanTemplates.find(t => t.id === this.selectedTemplate)?.name || '',
          language: this.newHuman.language,
          voice: this.newHuman.voice,
          status: 'training',
          usageCount: 0,
          totalDuration: '0分钟',
          rating: 0,
          createdAt: new Date().toISOString().split('T')[0]
        }
        this.humans.unshift(newHuman)
        this.creating = false
        this.closeCreateModal()
        alert('数字人创建成功！正在开始训练，预计完成时间：' + this.getTrainingTime())
      }, 2000)
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
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 8px 0 0 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 分类标签 */
.category-section {
  margin-bottom: 32px;
}

.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.category-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.category-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.count {
  font-size: 12px;
  opacity: 0.8;
}

/* 数字人网格 */
.humans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.human-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  cursor: pointer;
}

.human-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.human-avatar {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
}

.human-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.human-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.human-status.available {
  background: var(--success-light);
  color: var(--success-color);
}

.human-status.training {
  background: var(--warning-light);
  color: var(--warning-color);
}

.human-status.offline {
  background: var(--error-light);
  color: var(--error-color);
}

.human-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.human-card:hover .human-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.action-btn:hover {
  background: var(--primary-color);
  transform: scale(1.1);
}

.human-info {
  padding: 16px;
}

.human-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.human-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.human-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.human-meta span {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.human-stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 24px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-light);
}

/* 创建模态框 */
.create-modal {
  max-width: 900px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 120px;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 60px;
  right: -60px;
  height: 2px;
  background: var(--border-light);
  z-index: 1;
}

.step.completed:not(:last-child)::after {
  background: var(--primary-color);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;
}

.step.active .step-number {
  background: var(--primary-color);
  color: white;
}

.step.completed .step-number {
  background: var(--success-color);
  color: white;
}

.step-title {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.step.active .step-title {
  color: var(--primary-color);
  font-weight: 600;
}

.step-content {
  min-height: 400px;
}

.step-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px 0;
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.template-card {
  border: 2px solid var(--border-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.template-card:hover {
  border-color: var(--primary-color);
}

.template-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.template-card img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.template-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.template-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.template-tags {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 配置表单 */
.config-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
}

.quality-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  width: auto;
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.upload-area p {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.upload-area small {
  font-size: 12px;
  color: var(--text-secondary);
}

.training-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.training-preview h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.training-preview p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* 详情模态框 */
.human-detail {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}

.detail-avatar {
  text-align: center;
}

.detail-avatar img {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.avatar-actions .btn {
  width: 100%;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.info-item .value.available {
  color: var(--success-color);
}

.info-item .value.training {
  color: var(--warning-color);
}

.info-item .value.offline {
  color: var(--error-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-card .stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .digital-human {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    font-size: 24px;
  }

  .humans-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .create-modal {
    max-width: none;
  }

  .step-indicator {
    flex-direction: column;
    gap: 16px;
  }

  .step:not(:last-child)::after {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .human-detail {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .detail-avatar img {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .humans-grid {
    grid-template-columns: 1fr;
  }

  .category-tabs {
    justify-content: center;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>