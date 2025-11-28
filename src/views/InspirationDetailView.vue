<template>
  <div class="inspiration-detail">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      返回
    </button>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧视频区域 -->
      <div class="video-section">
        <div class="video-container">
          <video 
            :src="inspirationData.videoUrl" 
            :poster="inspirationData.thumbnail"
            controls
            class="video-player"
          >
            您的浏览器不支持视频播放。
          </video>
        </div>
      </div>

      <!-- 右侧资料区域 -->
      <div class="info-section">
        <div class="info-content">
          <!-- 标题 -->
          <h1 class="title">{{ inspirationData.title }}</h1>
          
          <!-- 作者信息 -->
          <div class="author-info">
            <div class="author-avatar">
              <img :src="inspirationData.author.avatar" :alt="inspirationData.author.name" />
            </div>
            <div class="author-details">
              <div class="author-name">{{ inspirationData.author.name }}</div>
              <div class="publish-time">{{ formatTime(inspirationData.publishTime) }}</div>
            </div>
          </div>

          <!-- 描述内容 -->
          <div class="description">
            <p>{{ inspirationData.description }}</p>
          </div>

          <!-- 标签 -->
          <div class="tags">
            <span 
              v-for="tag in inspirationData.tags" 
              :key="tag" 
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 统计信息 -->
          <div class="stats">
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{{ inspirationData.views }}</span>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ inspirationData.likes }}</span>
            </div>
          </div>

          <!-- 生成同款视频按钮 -->
          <!-- <button class="generate-btn" @click="generateSimilarVideo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            生成同款视频
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCreativeWorkById } from '@/api'
import { useUserStore } from '@/stores/user'
export default {
  name: 'InspirationDetailView',
  data() {
    return {
      inspirationData: {
        id: null,
        title: '',
        videoUrl: '',
        thumbnail: '',
        description: '',
        author: {
          name: '',
          avatar: '/logo.png'
        },
        publishTime: '',
        tags: [],
        views: 0,
        likes: 0
      }
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  mounted() {
    // 获取路由参数中的ID
    const id = this.$route.params.id
    if (id) {
      this.inspirationData.id = id
      this.loadInspirationData(id)
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    async loadInspirationData(id) {
      // 这里可以根据ID加载具体的灵感数据
      console.log('Loading inspiration data for ID:', id)
      
      try {
        // 接口不需要 token
        const result = await getCreativeWorkById({ id })
        const data = JSON.parse(result)
        
        console.log('获取作品详情响应:', data)
        
        if (data.code === 0 && data.data) {
          const item = data.data
          // 更新页面数据
          this.inspirationData = {
            id: item.id,
            title: item.title,
            videoUrl: item.videoUrl || '/api/placeholder/video.mp4',
            thumbnail: item.coverImageUrl || '/api/placeholder/600/400',
            description: item.description,
            author: {
              name: '用户' + item.userId,
              avatar: '/logo.png'
            },
            publishTime: item.createTime,
            tags: [], // API没有返回标签数据
            views: 0, // API没有返回观看数
            likes: item.likeCount || 0,
            status: item.status
          }
        } else {
          console.error('获取作品详情失败:', data.message)
        }
        
      } catch (error) {
        console.error('获取作品详情失败:', error)
        // 保持使用模拟数据
      }
    },
    formatTime(timeString) {
      // 格式化时间显示
      return timeString
    },
    generateSimilarVideo() {
      // 创建基于当前灵感的新项目
      const newProjectId = Date.now() // 简单的ID生成
      
      // 这里可以调用API创建新项目，传递当前灵感的相关信息
      const projectData = {
        id: newProjectId,
        title: `基于"${this.inspirationData.title}"的创作`,
        template: this.inspirationData.id,
        createdAt: new Date().toISOString()
      }
      
      console.log('Creating new project based on inspiration:', projectData)
      
      // 跳转到生成步骤页面
      this.$router.push(`/generation-steps/${newProjectId}`)
    }
  }
}
</script>

<style scoped>
.inspiration-detail {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.video-section {
  flex: 1;
  max-width: 700px;
}

.video-container {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  flex: 0 0 400px;
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.publish-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.description {
  margin-bottom: 20px;
}

.description p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.stat-item svg {
  width: 16px;
  height: 16px;
}

.generate-btn {
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.generate-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.generate-btn svg {
  width: 18px;
  height: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .info-section {
    flex: none;
  }
}
</style>
