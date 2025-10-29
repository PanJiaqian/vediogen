<template>
  <div class="home">
    <!-- 主搜索区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">今天有什么可以帮到您？</h1>
        <div class="search-container">
          <div class="search-wrapper">
            <div class="search-input-group">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input 
                type="text" 
                class="search-input" 
                placeholder="输入您的想法，让我来帮您实现吧"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <!-- 搜索建议标签 -->
            <div class="search-suggestions">
              <button 
                v-for="suggestion in searchSuggestions" 
                :key="suggestion.id"
                class="suggestion-tag"
                @click="applySuggestion(suggestion.text)"
              >
                <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ suggestion.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐内容区域 -->
    <section class="recommendations-section">
      <div class="section-header">
        <h2 class="section-title">灵感广场</h2>
        <div class="section-tabs">
          <button 
            v-for="tab in recommendationTabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ 'tab-btn--active': activeTab === tab.id }"
            @click="setActiveTab(tab.id)"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
      
      <div class="recommendations-grid">
        <div 
          v-for="item in filteredRecommendations" 
          :key="item.id"
          class="recommendation-card"
          @click="openRecommendation(item)"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.title" />
            <div class="card-overlay">
              <button class="play-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-description">{{ item.description }}</p>
            <div class="card-meta">
              <span class="card-category">{{ item.category }}</span>
              <span class="card-duration">{{ item.duration }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多按钮 -->
      <div class="load-more-section">
        <button class="load-more-btn" @click="loadMore">
          查看更多内容
          <svg class="load-more-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { projectPlaceholders } from '@/utils/placeholder'

export default {
  name: 'HomeView',
  data() {
    return {
      searchQuery: '',
      activeTab: 'all',
      searchSuggestions: [
        { id: 1, text: '小红书种草视频', icon: 'lightbulb' },
        { id: 2, text: '名人名言合集', icon: 'quote' },
        { id: 3, text: '朋友圈配文', icon: 'message' },
        { id: 4, text: '视频配音解说', icon: 'mic' }
      ],
      recommendationTabs: [
        { id: 'all', name: '全部' },
        { id: 'popular', name: '热门' },
        { id: 'new', name: '最新' },
        { id: 'template', name: '模板' }
      ],
      recommendations: [
        {
          id: 1,
          title: '探索宇宙',
          description: '带您领略宇宙的奥秘与美丽',
          category: '科普教育',
          duration: '3分钟',
          image: projectPlaceholders.space,
          type: 'popular'
        },
        {
          id: 2,
          title: '城市风光',
          description: '现代都市的繁华与魅力',
          category: '风景纪录',
          duration: '2分钟',
          image: projectPlaceholders.city,
          type: 'new'
        },
        {
          id: 3,
          title: '美食制作',
          description: '学习制作精美的料理',
          category: '生活方式',
          duration: '5分钟',
          image: projectPlaceholders.food,
          type: 'template'
        },
        {
          id: 4,
          title: '运动健身',
          description: '保持健康的运动指南',
          category: '健康生活',
          duration: '4分钟',
          image: projectPlaceholders.sports,
          type: 'popular'
        },
        {
          id: 5,
          title: '艺术创作',
          description: '发现艺术创作的灵感',
          category: '艺术文化',
          duration: '6分钟',
          image: projectPlaceholders.art,
          type: 'new'
        },
        {
          id: 6,
          title: '科技前沿',
          description: '了解最新的科技发展',
          category: '科技资讯',
          duration: '3分钟',
          image: projectPlaceholders.tech,
          type: 'template'
        }
      ]
    }
  },
  computed: {
    filteredRecommendations() {
      if (this.activeTab === 'all') {
        return this.recommendations
      }
      return this.recommendations.filter(item => item.type === this.activeTab)
    }
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        console.log('搜索:', this.searchQuery)
        // 实现搜索逻辑
      }
    },
    applySuggestion(text) {
      this.searchQuery = text
      this.handleSearch()
    },
    setActiveTab(tabId) {
      this.activeTab = tabId
    },
    openRecommendation(item) {
      console.log('打开推荐内容:', item)
      // 实现打开推荐内容逻辑
    },
    loadMore() {
      console.log('加载更多内容')
      // 实现加载更多逻辑
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

/* 主搜索区域 */
.hero-section {
  text-align: center;
  padding: var(--spacing-3xl) 0;
  margin-bottom: var(--spacing-3xl);
}

.hero-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xl);
  line-height: var(--line-height-tight);
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: 50px;
  padding: var(--spacing-sm);
  transition: border-color var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.search-input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  margin-left: var(--spacing-md);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  flex-shrink: 0;
}

.search-btn:hover {
  background-color: var(--primary-hover);
}

.search-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* 搜索建议 */
.search-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.suggestion-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.suggestion-tag:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: rgba(24, 144, 255, 0.05);
}

.suggestion-icon {
  width: 14px;
  height: 14px;
  color: currentColor;
}

/* 推荐内容区域 */
.recommendations-section {
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.section-tabs {
  display: flex;
  gap: var(--spacing-sm);
}

.tab-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-btn--active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* 推荐网格 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.recommendation-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-image {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.recommendation-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.recommendation-card:hover .card-overlay {
  opacity: 1;
}

.play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.play-btn:hover {
  background-color: white;
  transform: scale(1.1);
}

.play-btn svg {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
  margin-left: 2px;
}

.card-content {
  padding: var(--spacing-lg);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-tight);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.card-category {
  background-color: var(--bg-tertiary);
  padding: 2px var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

/* 加载更多 */
.load-more-section {
  text-align: center;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  background-color: transparent;
  border: 2px solid var(--border-primary);
  border-radius: 50px;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: rgba(24, 144, 255, 0.05);
}

.load-more-icon {
  width: 16px;
  height: 16px;
  color: currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-2xl);
  }
  
  .search-container {
    max-width: 100%;
    padding: 0 var(--spacing-lg);
  }
  
  .search-suggestions {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--spacing-sm);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-tabs {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--spacing-sm);
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .search-input-group {
    padding: 4px;
  }
  
  .search-btn {
    width: 40px;
    height: 40px;
  }
  
  .search-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
