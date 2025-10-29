<template>
  <div class="asset-library">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">资产库</h1>
      <p class="page-description">丰富的视频素材，助力您的创作</p>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['filter-tab', { active: activeCategory === category.id }]"
          @click="setActiveCategory(category.id)"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>
      
      <div class="filter-controls">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input 
            type="text" 
            placeholder="搜索资产..." 
            v-model="searchQuery"
            @input="handleSearch"
          />
        </div>
        
        <div class="filter-dropdown">
          <select v-model="sortBy" @change="handleSort">
            <option value="newest">最新上传</option>
            <option value="popular">最受欢迎</option>
            <option value="name">按名称</option>
            <option value="duration">按时长</option>
          </select>
        </div>
        
        <div class="view-toggle">
          <button 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            <i class="grid-icon">⊞</i>
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <i class="list-icon">☰</i>
          </button>
        </div>
      </div>
    </div>

    <!-- 资产网格/列表 -->
    <div class="assets-container">
      <div :class="['assets-grid', viewMode]">
        <div 
          v-for="asset in filteredAssets" 
          :key="asset.id"
          class="asset-card"
          @click="selectAsset(asset)"
        >
          <div class="asset-preview">
            <img :src="asset.thumbnail" :alt="asset.title" />
            <div class="asset-overlay">
              <button class="preview-btn">预览</button>
              <button class="download-btn">下载</button>
            </div>
            <div class="asset-duration">{{ asset.duration }}</div>
            <div class="asset-type">{{ asset.type }}</div>
          </div>
          
          <div class="asset-info">
            <h3 class="asset-title">{{ asset.title }}</h3>
            <p class="asset-description">{{ asset.description }}</p>
            <div class="asset-meta">
              <span class="asset-size">{{ asset.size }}</span>
              <span class="asset-format">{{ asset.format }}</span>
              <span class="asset-downloads">{{ asset.downloads }} 下载</span>
            </div>
            <div class="asset-tags">
              <span 
                v-for="tag in asset.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多 -->
      <div class="load-more-section" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
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
      activeCategory: 'all',
      searchQuery: '',
      sortBy: 'newest',
      viewMode: 'grid',
      loading: false,
      hasMore: true,
      selectedAsset: null,
      categories: [
        { id: 'all', name: '全部', icon: '📁' },
        { id: 'video', name: '视频', icon: '🎬' },
        { id: 'audio', name: '音频', icon: '🎵' },
        { id: 'image', name: '图片', icon: '🖼️' },
        { id: 'template', name: '模板', icon: '📋' },
        { id: 'effect', name: '特效', icon: '✨' },
        { id: 'transition', name: '转场', icon: '🔄' }
      ],
      assets: [
        {
          id: 1,
          title: '城市夜景延时摄影',
          description: '繁华都市夜晚的美丽景色，适合商业宣传片',
          thumbnail: generateGradientPlaceholder('城市夜景', '4A90E2', 'F8F9FA'),
          duration: '00:30',
          type: 'video',
          size: '45.2 MB',
          format: 'MP4',
          resolution: '1920x1080',
          downloads: 1234,
          tags: ['城市', '夜景', '延时', '商业']
        },
        {
          id: 2,
          title: '自然风光音乐',
          description: '轻松舒缓的背景音乐，适合自然风光视频',
          thumbnail: generateGradientPlaceholder('自然音乐', '7ED321', 'F8F9FA'),
          duration: '02:15',
          type: 'audio',
          size: '8.7 MB',
          format: 'MP3',
          resolution: '320kbps',
          downloads: 856,
          tags: ['音乐', '自然', '舒缓', '背景']
        },
        {
          id: 3,
          title: '科技感转场效果',
          description: '现代科技风格的转场动画效果',
          thumbnail: generateGradientPlaceholder('科技转场', '9013FE', 'F8F9FA'),
          duration: '00:03',
          type: 'effect',
          size: '12.1 MB',
          format: 'MOV',
          resolution: '1920x1080',
          downloads: 2341,
          tags: ['转场', '科技', '动画', '特效']
        },
        {
          id: 4,
          title: '企业宣传片模板',
          description: '专业的企业宣传片制作模板',
          thumbnail: generateGradientPlaceholder('企业模板', 'F5A623', 'F8F9FA'),
          duration: '01:30',
          type: 'template',
          size: '156.8 MB',
          format: 'AEP',
          resolution: '1920x1080',
          downloads: 567,
          tags: ['模板', '企业', '宣传', '专业']
        },
        {
          id: 5,
          title: '美食摄影素材',
          description: '高清美食摄影图片素材集合',
          thumbnail: generateGradientPlaceholder('美食摄影', 'D0021B', 'F8F9FA'),
          duration: '-',
          type: 'image',
          size: '25.4 MB',
          format: 'JPG',
          resolution: '4000x3000',
          downloads: 1789,
          tags: ['美食', '摄影', '高清', '素材']
        },
        {
          id: 6,
          title: '粒子爆炸特效',
          description: '震撼的粒子爆炸视觉特效',
          thumbnail: generateGradientPlaceholder('粒子特效', '50E3C2', 'F8F9FA'),
          duration: '00:05',
          type: 'effect',
          size: '78.9 MB',
          format: 'MOV',
          resolution: '1920x1080',
          downloads: 3456,
          tags: ['特效', '粒子', '爆炸', '震撼']
        }
      ]
    }
  },
  computed: {
    filteredAssets() {
      let filtered = this.assets

      // 按分类筛选
      if (this.activeCategory !== 'all') {
        filtered = filtered.filter(asset => asset.type === this.activeCategory)
      }

      // 按搜索关键词筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(asset => 
          asset.title.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }

      // 排序
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'popular':
            return b.downloads - a.downloads
          case 'name':
            return a.title.localeCompare(b.title)
          case 'duration':
            return a.duration.localeCompare(b.duration)
          default: // newest
            return b.id - a.id
        }
      })

      return filtered
    }
  },
  methods: {
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId
    },
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    handleSort() {
      // 排序逻辑已在computed中处理
    },
    selectAsset(asset) {
      this.selectedAsset = asset
    },
    closeModal() {
      this.selectedAsset = null
    },
    loadMore() {
      this.loading = true
      // 模拟加载更多数据
      setTimeout(() => {
        this.loading = false
        this.hasMore = false // 模拟没有更多数据
      }, 1000)
    }
  }
}
</script>

<style scoped>
.asset-library {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* 筛选区域 */
.filter-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid var(--border-light);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.filter-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary);
}

.filter-dropdown select {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  padding: 10px 12px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: var(--bg-hover);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
}

/* 资产网格 */
.assets-container {
  margin-bottom: 32px;
}

.assets-grid {
  display: grid;
  gap: 24px;
}

.assets-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.assets-grid.list {
  grid-template-columns: 1fr;
}

.asset-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  cursor: pointer;
}

.asset-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.asset-preview {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.asset-card:hover .asset-overlay {
  opacity: 1;
}

.preview-btn,
.download-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn {
  background: var(--primary-color);
  color: white;
}

.download-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.asset-duration,
.asset-type {
  position: absolute;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.asset-duration {
  bottom: 8px;
  right: 8px;
}

.asset-type {
  top: 8px;
  left: 8px;
  text-transform: uppercase;
}

.asset-info {
  padding: 16px;
}

.asset-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.asset-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.asset-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.asset-meta span {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.asset-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 列表视图样式 */
.assets-grid.list .asset-card {
  display: flex;
  align-items: center;
}

.assets-grid.list .asset-preview {
  width: 200px;
  flex-shrink: 0;
  aspect-ratio: 16/9;
}

.assets-grid.list .asset-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 加载更多 */
.load-more-section {
  text-align: center;
  margin-top: 32px;
}

.load-more-btn {
  padding: 12px 32px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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