<template>
  <div class="home">
    <!-- 主要内容区域 -->
    <div class="home-content">
      <h1 class="main-title">今天有什么可以帮到您？</h1>
      <!-- 功能标签 -->
      <div class="feature-tags">
        <button 
          class="feature-tag"
          :class="{ active: activeFeature === 'script' }"
          @click="setActiveFeature('script')"
        >
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          剧本创作
        </button>
        <button 
          class="feature-tag"
          :class="{ active: activeFeature === 'video' }"
          @click="setActiveFeature('video')"
        >
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          旁白成片
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-box">
          <div class="search-input-container">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="输入你的想法，小梦会帮你自动为你创作"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="search-actions-container">
            <div class="left-actions">
              <button class="action-btn">
                <div class="action-icon-wrapper">
                  <span class="at-symbol">@</span>
                </div>
                <span>主体</span>
              </button>
              <button class="action-btn">
                <div class="action-icon-wrapper">
                  <img src="/home_draw.svg" alt="draw" />
                </div>
                <span>画风</span>
              </button>
            </div>
            <div class="right-actions">
              <button class="search-submit-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12l5 5L20 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 搜索建议 -->
        <div class="search-suggestions">
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion.id"
            class="suggestion-tag"
            @click="applySuggestion(suggestion.text)"
          >
            <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {{ suggestion.text }}
          </button>
        </div>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="recommendations-section">
      <h2 class="recommendations-title">灵感广场</h2>
      
      <div class="recommendations-grid">
        <div
          v-for="item in recommendations"
          :key="item.id"
          class="recommendation-card"
          @click="openRecommendation(item)"
        >
          <img :src="item.image" :alt="item.title" class="card-image" />
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectPlaceholders } from '@/utils/placeholder'

export default {
  name: 'HomeView',
  data() {
    return {
      searchQuery: '',
      activeFeature: 'script',
      searchSuggestions: [
        { id: 1, text: '小羊介绍新疆伊犁的...' },
        { id: 2, text: '女娲后人与修道者三...' },
        { id: 3, text: '婚礼现场揭穿未婚夫...' }
      ],
      recommendations: [
        {
          id: 1,
          title: '探索宇宙',
          image: projectPlaceholders.space
        },
        {
          id: 2,
          title: '城市风光',
          image: projectPlaceholders.city
        }
      ]
    }
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        // 实现搜索逻辑
      }
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.text
      this.handleSearch()
    },
    openRecommendation(item) {
      // 实现打开推荐内容逻辑
    },
    setActiveFeature(feature) {
      this.activeFeature = feature
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  max-width: 1200px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 100vh;
}

.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.main-title {
  font-size: 1.75rem;
  color: #1f2937;
  margin-bottom: 2rem;
  letter-spacing: -0.025em;
}

.feature-tags {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  background: #e5e7eb;
  border-radius: 25px;
  padding: 4px;
  height: 40px;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 21px;
  color: #000000;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.feature-tag:hover {
  color: #374151;
}

.feature-tag.active {
  background: #FFFFFF;
  color: #3b82f6;
}

.feature-icon {
  width: 16px;
  height: 16px;
}

.search-container {
  width: 100%;
  max-width: 800px;
  margin-top: 0;
}

.search-box {
  display: flex;
  flex-direction: column;
  height: 160px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  padding: 1rem 1.25rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transition: all 0.2s ease;
  justify-content: space-between;
}

.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.search-input-container {
  width: 100%;
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #374151;
  background: transparent;
  padding: 0.5rem 0;
  text-align: left;
}

.search-input::placeholder {
  color: #6b7280;
  font-size: 0.95rem;
  text-align: left;
}

.search-actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left-actions {
  display: flex;
  gap: 0.75rem;
}

.right-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  color: #6b7280;
  font-size: 0.87rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.action-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f3f4f6;
  margin-right: 4px;
}

.at-symbol {
  font-size: 16px;
  font-weight: bold;
  color: #6b7280;
}

.paint-icon {
  position: relative;
  width: 14px;
  height: 14px;
  background-color: #6b7280;
  border-radius: 2px;
}

.paint-icon:before, .paint-icon:after {
  content: '';
  position: absolute;
  background-color: #f3f4f6;
  width: 10px;
  height: 1px;
  transform: rotate(45deg);
  top: 6.5px;
  left: 2px;
}

.paint-icon:after {
  transform: rotate(-45deg);
}

.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.search-submit-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.search-submit-btn svg {
  width: 16px;
  height: 16px;
}

.search-suggestions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.suggestion-tag {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #374151;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 400;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.suggestion-tag:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-icon {
  width: 14px;
  height: 14px;
  color: #fbbf24;
}

.recommendations-section {
  padding: 2.5rem 2rem 3rem;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.recommendations-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: left;
}

.recommendations-grid {
  display: flex;
  gap: 1.25rem;
  width: 100%;
  max-width: 600px;
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  flex: 1;
  position: relative;
}

.recommendation-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 2rem 1rem 1rem;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  text-align: left;
  margin: 0;
  line-height: 1.3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-content {
    padding: 1.5rem 1rem;
    max-width: 100%;
  }
  
  .recommendations-section {
    padding: 1.5rem 1rem 2rem;
  }
  
  .recommendations-grid {
    flex-direction: column;
    max-width: 400px;
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .feature-tags {
    margin-bottom: 1.5rem;
  }
  
  .feature-tag {
    font-size: 0.8rem;
    padding: 0.6rem 1.2rem;
  }
  
  .search-box {
    padding: 0.6rem 0.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    order: -1;
    text-align: center;
  }
  
  .search-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .home-content {
    padding: 1rem;
  }
  
  .search-suggestions {
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .suggestion-tag {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .feature-tag {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
  
  .feature-icon {
    width: 14px;
    height: 14px;
  }
  
  .action-btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
}
</style>
