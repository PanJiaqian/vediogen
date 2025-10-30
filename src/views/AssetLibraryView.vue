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

    <!-- 资产详情模态框 -->
    <div v-if="selectedAsset" class="asset-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-preview">
          <img :src="selectedAsset.thumbnail" :alt="selectedAsset.title" />
        </div>
        <div class="modal-info">
          <h2>{{ selectedAsset.title }}</h2>
          <p>{{ selectedAsset.description }}</p>
          <div class="modal-meta">
            <div class="meta-item">
              <span class="label">时长:</span>
              <span class="value">{{ selectedAsset.duration }}</span>
            </div>
            <div class="meta-item">
              <span class="label">格式:</span>
              <span class="value">{{ selectedAsset.format }}</span>
            </div>
            <div class="meta-item">
              <span class="label">大小:</span>
              <span class="value">{{ selectedAsset.size }}</span>
            </div>
            <div class="meta-item">
              <span class="label">分辨率:</span>
              <span class="value">{{ selectedAsset.resolution }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary">下载资产</button>
            <button class="btn btn-secondary">添加到项目</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateGradientPlaceholder } from '@/utils/placeholder'

export default {
  name: 'AssetLibraryView',
  data() {
    return {
      activeTab: 'public',
      searchQuery: '',
      categoryFilter: '',
      timeFilter: '',
      gradeFilter: '',
      selectedAsset: null,
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
    }
  }
}
</script>

<style scoped>
.asset-library {
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

/* 模态框 */
.asset-modal {
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

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  z-index: 1;
}

.modal-preview {
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.modal-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info {
  padding: 24px;
}

.modal-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.modal-info p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.modal-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item .label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.meta-item .value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

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

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .modal-info {
    padding: 16px;
  }

  .modal-actions {
    flex-direction: column;
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
}
</style>