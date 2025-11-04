<template>
  <div class="asset-library">
    <!-- 顶部标签导航 -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { 'tab-button--active': activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-dropdown">
          <select v-model="categoryFilter">
            <option value="">类别</option>
            <option value="video">人物</option>
            <option value="audio">动物</option>
            <option value="image">其他</option>
          </select>
        </div>

        <div class="filter-dropdown">
          <select v-model="timeFilter">
            <option value="">性别</option>
            <option value="today">全部</option>
            <option value="week">男</option>
            <option value="month">女</option>
          </select>
        </div>

        <div class="filter-dropdown">
          <select v-model="gradeFilter">
            <option value="">年龄</option>
            <option value="elementary">全部</option>
            <option value="middle">儿童</option>
            <option value="high">少年</option>
            <option value="high">青年</option>
            <option value="high">成年</option>
            <option value="high">老年</option>
          </select>
        </div>

        <div class="search-box">
          <input
            type="text"
            placeholder="输入主体名称进行搜索"
            v-model="searchQuery"
            @input="handleSearch"
          />
          <img src="/zhuti_search.svg" class="search-icon" alt="search" />
        </div>

        <button v-if="activeTab === 'personal'" class="create-subject-btn" @click="createNewSubject">
          <span class="plus-icon">+</span>
          创建新主体
        </button>
      </div>
    </div>

    <!-- 资产网格 -->
    <div class="assets-container">
      <div class="assets-grid">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="asset-card"
          @click="selectAsset(asset)"
        >
          <div class="asset-preview">
            <img :src="asset.thumbnail" :alt="asset.title" />
          </div>

          <div class="asset-info">
            <h3 class="asset-title">{{ asset.title }}</h3>
          </div>
        </div>
      </div>

      <!-- 暂无更多内容 -->
      <div class="empty-message">
        暂无更多内容
      </div>
    </div>

    <!-- 资产详情页面 -->
    <div v-if="selectedAsset" class="asset-detail-page">
      <!-- 顶部导航栏 -->
      <div class="detail-header">
        <button class="back-btn" @click="closeModal">
          <span class="back-icon">×</span>
        </button>
        <button class="favorite-btn">
          <span class="star-icon">☆</span>
        </button>
      </div>

      <!-- 主要内容区域 -->
      <div class="detail-content">
        <!-- 左侧图片区域 -->
        <div class="detail-image-section" :class="{ 'compressed': showInputBox }">
          <div class="image-container">
            <img :src="selectedAsset.thumbnail" :alt="selectedAsset.title" />
          </div>

          <!-- 图片下方输入框 -->
          <div v-if="showInputBox" class="input-box-container">
            <div class="input-box">
              <div class="input-content">
                <span v-if="showTag" class="name-tag" @click="removeTag">
                  @{{ selectedAsset.title }}
                  <span class="tag-close">×</span>
                </span>
                <textarea
                  v-model="inputText"
                  placeholder="输入你的想法，小梦会帮你自动为你创作"
                  class="text-input"
                  @keyup.enter="sendMessage"
                  @focus="handleInputFocus"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <button class="send-btn" @click="sendMessage">
              <span class="send-icon">↑</span>
            </button>
          </div>
        </div>

        <!-- 右侧信息区域 -->
        <div class="detail-info-section">
          <h2 class="info-title">{{ selectedAsset.title }}</h2>
          <div class="info-row">
            <span class="info-label">类别</span>
            <span class="info-value">动物</span>
          </div>

          <div class="info-row">
            <span class="info-label">性别</span>
            <span class="info-value">无</span>
            <span class="info-label">年龄</span>
            <span class="info-value">无</span>
          </div>

          <div class="info-row">
            <span class="info-label">主体描述</span>
          </div>

          <div class="description-text">
            皮克斯版，皮克斯版，卡通风格，全身，正面回视，
            独头鹰，动物，绿色的毛，人眼睛，黄色嘴，橙
            色脚，我有白色头毛
          </div>

          <div class="info-footer">
            <span class="creator-info">内容由 AI 生成</span>
          </div>

          <!-- 使用主体按钮 -->
          <button class="use-subject-btn" @click="toggleInputBox">
            <span class="plus-icon">+</span>
            使用主体
          </button>
        </div>
      </div>
    </div>

    <!-- 创建新主体弹窗 -->
    <!-- 创建新主体弹窗 -->
    <CreateSubjectModal 
      :visible="showCreateModal" 
      @close="closeCreateModal"
      @submit="handleSubjectSubmit"
    />
  </div>
</template>

<script>
import { generateGradientPlaceholder } from '@/utils/placeholder'
import CreateSubjectModal from '@/components/CreateSubjectModal.vue'

export default {
  name: 'AssetLibraryView',
  components: {
    CreateSubjectModal
  },
  data() {
    return {
      activeTab: 'public',
      searchQuery: '',
      categoryFilter: '',
      timeFilter: '',
      gradeFilter: '',
      selectedAsset: null,
      showInputBox: false,
      inputText: '',
      showTag: false,
      showCreateModal: false,
      tabs: [
        { id: 'public', name: '公共' },
        { id: 'personal', name: '个人' }
      ],
      assets: [
        {
          id: 1,
          title: '首选版kitty',
          thumbnail: generateGradientPlaceholder('首选版kitty', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        },
        {
          id: 2,
          title: '多儿',
          thumbnail: generateGradientPlaceholder('多儿', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        },
        {
          id: 3,
          title: 'Chou Chou',
          thumbnail: generateGradientPlaceholder('Chou Chou', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        },
        {
          id: 4,
          title: 'Mokoko',
          thumbnail: generateGradientPlaceholder('Mokoko', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        },
        {
          id: 5,
          title: 'Zimomo',
          thumbnail: generateGradientPlaceholder('Zimomo', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        },
        {
          id: 6,
          title: 'Labubu',
          thumbnail: generateGradientPlaceholder('Labubu', 'E8E8E8', 'F8F9FA'),
          type: 'public'
        }
      ]
    }
  },
  computed: {
    filteredAssets() {
      let filtered = this.assets

      // 按标签页筛选
      filtered = filtered.filter(asset => asset.type === this.activeTab)

      // 按搜索关键词筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(asset =>
          asset.title.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  },
  methods: {
    setActiveTab(tabId) {
      this.activeTab = tabId
    },
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    selectAsset(asset) {
      this.selectedAsset = asset
    },
    closeModal() {
      this.selectedAsset = null
    },
    createNewSubject() {
      this.showCreateModal = true
    },
    closeCreateModal() {
      this.showCreateModal = false
    },
    handleSubjectSubmit(subjectData) {
      // 处理从CreateSubjectModal组件提交的数据
      console.log('提交新主体:', subjectData)
      
      // 这里可以添加提交到后端的逻辑
      
      // 关闭弹窗
      this.closeCreateModal()

      // 可以显示成功提示
      alert('主体创建成功！')
    },
    toggleInputBox() {
      this.showInputBox = !this.showInputBox
      if (this.showInputBox) {
        // 当显示输入框时，显示标签并清空文本
        this.showTag = true
        this.inputText = ''
        // 延迟聚焦到输入框
        this.$nextTick(() => {
          const input = this.$el.querySelector('.text-input')
          if (input) {
            input.focus()
          }
        })
      } else {
        this.showTag = false
        this.inputText = ''
      }
    },
    removeTag() {
      this.showTag = false
      // 聚焦到输入框
      this.$nextTick(() => {
        const input = this.$el.querySelector('.text-input')
        if (input) {
          input.focus()
        }
      })
    },
    handleInputFocus() {
      // 当输入框获得焦点时的处理
    },
    sendMessage() {
      if (this.inputText.trim()) {
        // 处理发送消息的逻辑
        console.log('发送消息:', this.inputText)
        // 清空输入框
        this.inputText = ''
        // 可以选择隐藏输入框或保持显示
        // this.showInputBox = false
      }
    }
  }
}
</script>

<style scoped>
.asset-library {
  position: relative;
  max-width: 1200px;
  margin: 0;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  margin-bottom: 30px;
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #495057;
}

.tab-button--active {
  color: #007bff;
  border-bottom-color: #007bff;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-dropdown select {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #666666;
  font-size: 14px;
  min-width: 80px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0px center;
  background-size: 16px;
  padding-right: 24px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  margin-left: auto;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 20px;
  border: 1px solid #F0F0F0;
  border-radius: 100px;
  font-size: 14px;
  background: #FFFFFF;
  color: #333;
}

.search-box input::placeholder {
  color: #999;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
  opacity: 0.6;
}

/* 创建新主体按钮 */
.create-subject-btn {
  height: 35px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #4dabf7;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.create-subject-btn:hover {
  background: #0088FF;
  transform: translateY(-1px);
}

.create-subject-btn .plus-icon {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

/* 资产网格 */
.assets-container {
  margin-bottom: 40px;
}

.assets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
}

.asset-card {
  width: 200px;
  height: 280px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.asset-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-info {
  padding: 16px;
  height: 100px;
}

.asset-title {
  font-size: 16px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.4;
}

.empty-message {
  width: 100%;
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  font-size: 16px;
}

/* 资产详情页面 */
.asset-detail-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f8f9fa;
}

.back-icon {
  font-size: 35px;
  color: #6c757d;
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.favorite-btn:hover {
  background: #f8f9fa;
}

.star-icon {
  font-size: 20px;
  color: #6c757d;
}

/* 主要内容区域 */
.detail-content {
  flex: 1;
  display: flex;
  padding: 40px;
  gap: 150px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;
}

/* 左侧图片区域 */
.detail-image-section {
  flex: 2;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 0.3s ease;
}

.detail-image-section.compressed .image-container {
  height: calc(100% - 150px);
  max-height: 350px;
}

.image-container {
  width: 100%;
  height: 100%;
  max-height: 450px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s ease;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧信息区域 */
.detail-info-section {
  flex: 1;
  max-height: 500px;
  max-width: 320px;
  padding: 15px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.info-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.info-label {
  font-size: 14px;
  color: #6c757d;
  min-width: 60px;
}

.info-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.description-text {
  font-size: 14px;
  color: #495057;
  line-height: 1.6;
  margin-bottom: 30px;
  padding: 16px;
}

.info-footer {
  margin-bottom: 30px;
}

.creator-info {
  font-size: 12px;
  color: #6c757d;
}

/* 使用主体按钮 */
.use-subject-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4dabf7;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.use-subject-btn:hover {
  background: #0088FF;
  transform: translateY(-1px);
}

.use-subject-btn .plus-icon {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

/* 底部输入框容器 */
.input-box-container {
  position: relative;
  width: 100%;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 10px;
  margin-top: 10px;
}

/* 输入框 */
.input-box {
  background: white;
  border: 2px solid #4dabf7;
  border-radius: 25px;
  padding: 16px;
  width: 100%;
  min-height: 120px;
  position: relative;
}

/* 输入内容区域 */
.input-content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

/* 名称标签 */
.name-tag {
  display: inline-flex;
  align-items: center;
  background: #4dabf7;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  margin-top: 2px;
}

.name-tag:hover {
  background: #0088FF;
}

.tag-close {
  margin-left: 4px;
  font-size: 16px;
  font-weight: bold;
  opacity: 0.7;
}

.name-tag:hover .tag-close {
  opacity: 1;
}

/* 文本输入框 */
.text-input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  resize: none;
  padding-right: 50px;
  padding-bottom: 10px;
  font-family: inherit;
}

.text-input::placeholder {
  color: #999;
}

/* 发送按钮 */
.send-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: #4dabf7;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 1;
}

.send-btn:hover {
  background: #0088FF;
}

.send-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 创建新主体弹窗样式 */
/* 响应式设计 */
@media (max-width: 768px) {
  .asset-library {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .filter-section {
    padding: 16px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .assets-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .assets-grid.list .asset-card {
    flex-direction: column;
  }

  .assets-grid.list .asset-preview {
    width: 100%;
  }

  /* 详情页面响应式 */
  .detail-content {
    flex-direction: column;
    padding: 20px;
    gap: 30px;
  }

  .detail-image-section {
    max-width: 100%;
  }

  .detail-info-section {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .assets-grid.grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: center;
  }

  .filter-tab {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }

  .detail-content {
    padding: 16px;
    gap: 20px;
  }

  .detail-header {
    padding: 12px 16px;
  }

  .detail-title {
    font-size: 18px;
  }
}
</style>
