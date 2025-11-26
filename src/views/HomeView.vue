<template>
  <div class="home">
    <!-- 页面内消息提示 -->
    <div v-if="message.show" :class="['message-toast', message.type]">{{ message.text }}</div>
    <!-- 主要内容区域 -->
    <div class="home-content">
      <h1 class="main-title">今天有什么新灵感？</h1>
      <!-- 功能标签 -->
      <div class="feature-tags">
        <button class="feature-tag" :class="{ active: activeFeature === 'script' }" @click="setActiveFeature('script')">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          剧本创作
        </button>
        <button class="feature-tag" :class="{ active: activeFeature === 'video' }" @click="setActiveFeature('video')">
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
            <textarea v-model="searchQuery" rows="3" maxlength="250" class="search-input" placeholder="输入你的想法，小梦会帮你自动为你创作"
              @keyup.enter="handleSearch"></textarea>
          </div>
          <div class="search-actions-container">
            <div class="left-actions">
              <!-- 主体下拉框 -->
              <div class="dropdown-container">
                <button class="action-btn" @click="toggleSubjectDropdown">
                  <div class="action-icon-wrapper">
                    <span class="at-symbol">@</span>
                  </div>
                  <span>{{ selectedSubjectName || '主体' }}</span>
                </button>

                <!-- 主体下拉菜单 -->
                <div v-if="showSubjectDropdown" class="dropdown-menu subject-dropdown">
                  <div class="dropdown-header">
                    <button class="category-tab" :class="{ active: activeSubjectCategory === 'all' }"
                      @click="setSubjectCategory('all')">
                      全部
                    </button>
                    <button class="category-tab" :class="{ active: activeSubjectCategory === 'public' }"
                      @click="setSubjectCategory('public')">
                      公共
                    </button>
                    <button class="category-tab" :class="{ active: activeSubjectCategory === 'personal' }"
                      @click="setSubjectCategory('personal')">
                      个人
                    </button>
                  </div>

                  <div class="dropdown-content">
                    <!-- 创建新主体按钮（全部和个人分类显示） -->
                    <div v-if="activeSubjectCategory !== 'public'" class="create-new-item" @click="createNewSubject">
                      <div class="create-icon">+</div>
                      <span>创建新主体</span>
                    </div>

                    <!-- 主体列表 -->
                    <div class="subjects-list">
                      <div v-for="subject in filteredSubjects" :key="subject.id" class="subject-item"
                        @click="selectSubject(subject)">
                        <img :src="subject.avatar" :alt="subject.name" class="subject-avatar">
                        <div class="subject-info">
                          <div class="subject-name">{{ subject.name }}</div>
                          <div class="subject-tags">
                            <span v-for="tag in subject.tags" :key="tag" class="subject-tag">{{ tag }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="filteredSubjects.length === 0" class="empty-state">
                      暂无更多内容
                    </div>
                  </div>
                </div>
              </div>

              <!-- 画风下拉框 -->
              <div class="dropdown-container">
                <button class="action-btn" @click="toggleStyleDropdown">
                  <div class="action-icon-wrapper">
                    <img src="/home_draw.svg" alt="draw" />
                  </div>
                  <span>画风</span>
                </button>

                <!-- 画风下拉菜单 -->
                <div v-if="showStyleDropdown" class="dropdown-menu style-dropdown">
                  <div class="styles-list">
                    <div v-for="style in artStyles" :key="style.id" class="style-item" @click="selectStyle(style)">
                      <img :src="style.image" :alt="style.name" class="style-image">
                      <div class="style-name">{{ style.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="right-actions">
              <div class="input-counter">
                <span class="count">{{ (searchQuery || '').length }}/250</span>
              </div>
              <button class="search-submit-btn" :class="{ active: searchQuery.trim().length > 0 }" @click="handleSearch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 搜索建议 -->
        <div class="search-suggestions">
          <button v-for="suggestion in searchSuggestions" :key="suggestion.id" class="suggestion-tag"
            @click="applySuggestion(suggestion.text)">
            <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
        <div v-for="item in recommendations" :key="item.id" class="recommendation-card"
          @click="openRecommendation(item)">
          <img :src="item.image" :alt="item.title" class="card-image" />
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新主体弹窗 -->
    <CreateSubjectModal :visible="showCreateModal" @close="closeCreateModal" @submit="handleSubjectSubmit" />
  </div>
</template>

<script>
import { getCreativeWorkList, getMaterialsList } from '@/api'
import { useUserStore } from '@/stores/user'
import { projectPlaceholders } from '@/utils/placeholder'
import CreateSubjectModal from '@/components/CreateSubjectModal.vue'

export default {
  name: 'HomeView',
  components: {
    CreateSubjectModal
  },
  data() {
    return {
      searchQuery: '',
      activeFeature: 'script',
      // 下拉框状态
      showSubjectDropdown: false,
      showStyleDropdown: false,
      activeSubjectCategory: 'all',
      // 弹窗状态
      showCreateModal: false,
      // 已选择的主体ID（用于 materialId）
      selectedSubjectId: null,
      // 已选择的主体名称（用于替换“主体”字样）
      selectedSubjectName: '',
      // 主体数据
      subjects: [],
      // 画风数据
      artStyles: [
        {
          id: 1,
          name: '皮克斯',
          image: '/api/placeholder/120/80'
        },
        {
          id: 2,
          name: '2D古风',
          image: '/api/placeholder/120/80'
        },
        {
          id: 3,
          name: '3D古风',
          image: '/api/placeholder/120/80'
        },
        {
          id: 4,
          name: '韩漫二次元',
          image: '/api/placeholder/120/80'
        },
        {
          id: 5,
          name: '现代都市',
          image: '/api/placeholder/120/80'
        },
        {
          id: 6,
          name: '3D卡通',
          image: '/api/placeholder/120/80'
        },
        {
          id: 7,
          name: '日漫二次元',
          image: '/api/placeholder/120/80'
        },
        {
          id: 8,
          name: '中国工笔画',
          image: '/api/placeholder/120/80'
        },
        {
          id: 9,
          name: '写实',
          image: '/api/placeholder/120/80'
        },
        {
          id: 10,
          name: '水彩',
          image: '/api/placeholder/120/80'
        },
        {
          id: 11,
          name: '油画',
          image: '/api/placeholder/120/80'
        },
        {
          id: 12,
          name: '素描',
          image: '/api/placeholder/120/80'
        }
      ],
      searchSuggestions: [
        { id: 1, text: '小羊介绍新疆伊犁的自然风光' },
        { id: 2, text: '女娲后人与修道者大战' },
        { id: 3, text: '末世逃亡' }
      ],
      recommendations: [],
      // 页面消息
      message: {
        show: false,
        text: '',
        type: 'success'
      }
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    filteredSubjects() {
      if (this.activeSubjectCategory === 'all') {
        return this.subjects
      }
      return this.subjects.filter(subject => subject.category === this.activeSubjectCategory)
    }
  },
  mounted() {
    // 点击外部关闭下拉框
    document.addEventListener('click', this.handleClickOutside)
    this.loadCreativeWorks()
    this.loadPersonalSubjects()
    try {
      const saved = localStorage.getItem('home:searchQuery')
      if (typeof saved === 'string') this.searchQuery = saved
    } catch (e) { /* no-op */ }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    searchQuery(val) {
      try { localStorage.setItem('home:searchQuery', String(val || '')) } catch (e) { /* no-op */ }
    }
  },
  methods: {
    showMessage(text, type = 'success') {
      this.message = { show: true, text, type }
      setTimeout(() => { this.message.show = false }, 3000)
    },
    handleSearch() {
      // 未登录时拦截并弹出登录框
      if (!this.userStore?.isLoggedIn) {
        window.dispatchEvent(new CustomEvent('open-login-modal'))
        return
      }

      if (!this.searchQuery.trim()) {
        this.showMessage('请输入提示词后再提交', 'error')
        return
      }

      const stageDirections = this.searchQuery.trim()
      const category = this.activeFeature === 'script' ? '0' : '1'
      const materialId = this.selectedSubjectId ? String(this.selectedSubjectId) : ''

      const projectId = Date.now().toString()
      try {
        localStorage.setItem(`project:prompt:${projectId}`, stageDirections)
        localStorage.setItem(`project:category:${projectId}`, category)
        if (materialId) localStorage.setItem(`project:materialId:${projectId}`, materialId)
        localStorage.setItem(`project:videoId:${projectId}`, projectId)
      } catch (e) { /* no-op */ }
      this.$router.push({ name: 'ProjectDetail', params: { id: projectId }, query: { q: stageDirections, category, materialId } })
      this.searchQuery = ''
    },
    applySuggestion(suggestionText) {
      this.searchQuery = suggestionText
      try {
        const input = this.$el && this.$el.querySelector && this.$el.querySelector('.search-input')
        if (input) {
          input.focus()
          const len = String(this.searchQuery || '').length
          if (input.setSelectionRange) input.setSelectionRange(len, len)
        }
      } catch (e) { /* no-op */ }
    },
    openRecommendation(item) {
      // 跳转到灵感详情页面
      this.$router.push(`/inspiration/${item.id}`)
    },
    setActiveFeature(feature) {
      this.activeFeature = feature
    },

    // 下拉框相关方法
    toggleSubjectDropdown() {
      this.showSubjectDropdown = !this.showSubjectDropdown
      this.showStyleDropdown = false
      // 打开主体下拉时加载个人主体
      if (this.showSubjectDropdown && this.activeSubjectCategory !== 'public') {
        this.loadPersonalSubjects()
      }
    },

    toggleStyleDropdown() {
      this.showStyleDropdown = !this.showStyleDropdown
      this.showSubjectDropdown = false
    },

    setSubjectCategory(category) {
      this.activeSubjectCategory = category
      if (category !== 'public') {
        this.loadPersonalSubjects()
      }
    },

    createNewSubject() {
      console.log('创建新主体')
      this.showSubjectDropdown = false
      this.showCreateModal = true
    },

    selectSubject(subject) {
      console.log('选择主体:', subject)
      // 不再把主体拼接到输入框，直接记录选择并替换按钮文字
      this.selectedSubjectId = subject.id
      this.selectedSubjectName = subject.name
      this.showSubjectDropdown = false
    },

    selectStyle(style) {
      console.log('选择画风:', style)
      this.searchQuery += `画风:${style.name} `
      this.showStyleDropdown = false
    },

    handleClickOutside(event) {
      const subjectDropdown = this.$el?.querySelector('.subject-dropdown')
      const styleDropdown = this.$el?.querySelector('.style-dropdown')
      const subjectBtn = this.$el?.querySelector('.dropdown-container:first-child .action-btn')
      const styleBtn = this.$el?.querySelector('.dropdown-container:last-child .action-btn')

      if (subjectDropdown && !subjectDropdown.contains(event.target) && !subjectBtn?.contains(event.target)) {
        this.showSubjectDropdown = false
      }

      if (styleDropdown && !styleDropdown.contains(event.target) && !styleBtn?.contains(event.target)) {
        this.showStyleDropdown = false
      }
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
      // 页面消息提示
      this.showMessage('主体创建成功！')

      // 可以显示成功提示
      alert('主体创建成功！')
    },

    // 加载主体（包含公共与个人）
    async loadPersonalSubjects() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        const result = await getMaterialsList(token)
        let data
        try { data = JSON.parse(result) } catch { data = null }
        if (data && data.code === 0 && Array.isArray(data.data)) {
          const subjects = data.data.map(item => {
            const rawUrl = String(item.fileUrl || '').trim().replace(/^`+|`+$/g, '')
            const isHttp = /^https?:\/\//i.test(rawUrl)
            return {
              id: item.id,
              name: item.name,
              avatar: isHttp ? rawUrl : '/api/placeholder/40/40',
              tags: [item.gender || '全部', item.ageRange || '全部'].filter(Boolean),
              category: String(item.type || '').toUpperCase() === 'COMMUNITY' ? 'public' : 'personal'
            }
          })
          this.subjects = subjects
        }
      } catch (e) {
        console.warn('加载个人主体失败:', e)
      }
    },

    // 获取创意作品列表
    async loadCreativeWorks() {
      try {
        // 接口不需要 token
        const result = await getCreativeWorkList()
        const data = JSON.parse(result)

        console.log('获取作品列表响应:', data)

        if (data.code === 0 && data.data) {
          // 将API数据转换为推荐卡片格式
          this.recommendations = data.data.map(item => ({
            id: item.id,
            title: item.title,
            image: item.coverImageUrl || '/api/placeholder/300/200',
            videoUrl: item.videoUrl,
            description: item.description,
            author: {
              name: '用户' + item.userId,
              avatar: '/logo.png'
            },
            publishTime: item.createTime,
            tags: [],
            views: 0,
            likes: item.likeCount || 0,
            status: item.status
          }))
        } else {
          console.error('获取作品列表失败:', data.message)
        }

      } catch (error) {
        console.error('获取作品列表失败:', error)
        // 保持使用模拟数据
      }
    }
  }
}
</script>

<style scoped>
/* 页面消息样式 */
.message-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-toast.success {
  background: #10b981;
  color: #fff;
}

.message-toast.error {
  background: #ef4444;
  color: #fff;
}

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
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  resize: none;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.search-input::-webkit-scrollbar {
  display: none;
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

.input-counter {
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #6b7280;
  font-size: 0.675rem;
}

.input-counter .count {
  font-weight: 500;
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

.paint-icon:before,
.paint-icon:after {
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

.search-submit-btn.active {
  background: #3b82f6;
  color: #ffffff;
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

/* 下拉框样式 */
.dropdown-container {
  position: relative;
}

.subject-dropdown,
.style-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 480px;
  max-height: 500px;
  overflow-y: auto;
  margin-top: 8px;
}

.subject-dropdown {
  min-width: 520px;
}

.dropdown-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.category-tabs {
  display: flex;
  gap: 8px;
}

.category-tab {
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab.active {
  color: #3b82f6;
  border-color: #3b82f6;
}

.category-tab:hover:not(.active) {
  background: #f9fafb;
  color: #374151;
}

.dropdown-content {
  padding: 12px;
}

.create-new-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-new-item:hover {
  background: #e0f2fe;
  border-color: #3b82f6;
}

.create-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.subjects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  padding: 12px;
}

.styles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  padding: 12px;
}

.subject-item,
.style-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.subject-item:hover,
.style-item:hover {
  background: #f8fafc;
}

.subject-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 6px;
}

.style-image {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-bottom: 6px;
}

.subject-info {
  width: 100%;
  text-align: center;
}

.subject-name,
.style-name {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.subject-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.subject-tag {
  font-size: 0.625rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
}

.load-more {
  text-align: center;
  padding: 12px;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  border-top: 1px solid #f3f4f6;
  margin-top: 8px;
}

.load-more:hover {
  color: #3b82f6;
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
