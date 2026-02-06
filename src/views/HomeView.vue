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
            <div v-if="selectedSubjects.length || selectedStyles.length" class="input-chip-row">
              <span v-for="n in selectedSubjects" :key="'subj-' + n" class="input-chip">
                @{{ n }}
                <button type="button" class="chip-close" @click="removeSubjectChip(n)">×</button>
              </span>
              <span v-for="s in selectedStyles" :key="'style-' + s" class="input-chip">
                #{{ s }}
                <button type="button" class="chip-close" @click="removeStyleChip(s)">×</button>
              </span>
            </div>
            <textarea v-model="searchQuery" rows="3" maxlength="240" class="search-input" :placeholder="selectedSubjects.length ? '' : '输入你的想法，小梦会帮你自动为你创作'"
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
                  <span>主体</span>
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
                <span class="count">{{ (searchQuery || '').length }}/240</span>
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
            @click="applySuggestion(suggestion)">
            <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {{ truncateSuggestion(suggestion) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="recommendations-section">
      <div class="recommendations-header">
        <h2 class="recommendations-title">灵感广场</h2>
        <button class="upload-work-btn" @click="openUploadModal">发布作品</button>
      </div>

      <div class="recommendations-grid">
        <div v-for="item in recommendations" :key="item.id" class="recommendation-card" :class="{ 'own-work': item.isCurrentUsersWork }"
          @click="openRecommendation(item)">
          <img :src="item.image" :alt="item.title" class="card-image" />
          <div class="card-content">
            <h3 class="card-title">{{item.title }}</h3>
          </div>
        </div>
      </div>
    </div>
    <div v-if="uploadModalVisible" class="upload-overlay" @click.self="closeUploadModal">
      <div class="upload-modal">
        <div class="upload-modal-header">
          <div class="upload-modal-title">发布作品</div>
          <button class="upload-close-btn" @click="closeUploadModal">×</button>
        </div>
        <div class="upload-modal-body">
          <div class="upload-left">
            <div class="upload-drop-zone" @dragover.prevent @drop.prevent="onUploadDrop">
              <template v-if="uploadVideoPreview">
                <video :src="uploadVideoPreview" controls class="upload-video-preview" @click="openUploadPreview('video')"></video>
                <button class="upload-delete-btn" title="删除视频" @click="clearUploadVideo">×</button>
              </template>
              <template v-else>
                <div class="upload-placeholder">
                  <div class="upload-placeholder-icon">🎬</div>
                  <div class="upload-placeholder-text">点击或拖拽上传视频</div>
                  <button class="upload-select-btn" @click="triggerVideoSelect">选择视频</button>
                </div>
              </template>
            </div>
          </div>
          <div class="upload-right">
            <div class="upload-field">
              <div class="upload-label">标题</div>
              <input class="upload-input" v-model="uploadTitle" maxlength="26" placeholder="为你的作品起个标题" />
              <div class="upload-counter">{{ (uploadTitle || '').length }}/26</div>
            </div>
            <div class="upload-field">
              <div class="upload-label">作品简介</div>
              <textarea class="upload-textarea" v-model="uploadDescription" maxlength="500" placeholder="简单介绍一下你的作品"></textarea>
              <div class="upload-counter">{{ (uploadDescription || '').length }}/500</div>
            </div>
            <div class="upload-field">
              <div class="upload-label">剧本描述</div>
              <textarea class="upload-textarea" v-model="uploadScriptContent" maxlength="200" placeholder="描述一下你的剧本提示词"></textarea>
            </div>
            <div class="upload-field">
              <div class="upload-label">封面图</div>
              <div class="cover-row">
                <div class="cover-preview" v-if="uploadCoverPreview">
                  <img :src="uploadCoverPreview" alt="封面预览" @click="openUploadPreview('image')" />
                  <button class="upload-delete-btn" title="删除封面" @click="clearUploadCover">×</button>
                </div>
                <button class="upload-select-btn" v-if="!uploadCoverPreview" @click="triggerCoverSelect">选择封面</button>
              </div>
            </div>
          </div>
        </div>
        <div class="upload-modal-footer">
          <input ref="videoInput" type="file" accept="video/*" style="display:none" @change="onVideoSelected" />
          <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverSelected" />
          <button class="upload-submit-btn" :disabled="uploadSubmitting" @click="submitUpload">发布作品</button>
        </div>
      </div>
    </div>

    <div v-if="uploadPreviewVisible" class="upload-preview-overlay" @click.self="closeUploadPreview">
      <div class="upload-preview-content">
        <button class="upload-preview-close" @click="closeUploadPreview">×</button>
        <template v-if="uploadPreviewType === 'video'">
          <video :src="uploadPreviewSrc" controls autoplay></video>
        </template>
        <template v-else>
          <img :src="uploadPreviewSrc" alt="预览图片" />
        </template>
      </div>
    </div>

    <!-- 创建新主体弹窗 -->
    <CreateSubjectModal :visible="showCreateModal" @close="closeCreateModal" @submit="handleSubjectSubmit" />
  </div>
</template>

<script>
// 首页视图：提供灵感搜索、主体与画风选择以及作品广场展示
import { getCreativeWorkList, getMaterialsList, addCreativeWork } from '@/api'
import { useUserStore } from '@/stores/user'
import { projectPlaceholders } from '@/utils/placeholder'
import { ART_STYLES, SCRIPT_SUGGESTIONS, NARRATION_SUGGESTIONS } from '@/utils/homeData'
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
      // 已选择的主体ID列表（支持多主体）
      selectedSubjectIds: [],
      // 已选择的主体名称（用于替换“主体”字样）
      selectedSubjectName: '',
      // 主体数据
      subjects: [],
      // 画风数据
      artStyles: ART_STYLES,
      selectedSubjects: [],
      selectedStyles: [],
      selectedStyleName: '',
      searchSuggestions: [],
      scriptSuggestionPool: SCRIPT_SUGGESTIONS,
      narrationSuggestionPool: NARRATION_SUGGESTIONS,
      recommendations: [],
      // 页面消息
      message: {
        show: false,
        text: '',
        type: 'success'
      },
      uploadModalVisible: false,
      uploadTitle: '',
      uploadDescription: '',
      uploadScriptContent: '',
      uploadCoverFile: null,
      uploadVideoFile: null,
      uploadCoverPreview: '',
      uploadVideoPreview: '',
      uploadSubmitting: false,
      uploadPreviewVisible: false,
      uploadPreviewType: '',
      uploadPreviewSrc: ''
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
      const chips = localStorage.getItem('home:selectedSubjects')
      if (chips) {
        let arr
        try { arr = JSON.parse(chips) } catch (e) { arr = null }
        if (Array.isArray(arr)) this.selectedSubjects = arr.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim())
      }
      const styleChips = localStorage.getItem('home:selectedStyles')
      if (styleChips) {
        let arr
        try { arr = JSON.parse(styleChips) } catch (e) { arr = null }
        if (Array.isArray(arr)) this.selectedStyles = arr.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim())
      }
      const ids = localStorage.getItem('home:selectedSubjectIds')
      if (ids) {
        let arr2
        try { arr2 = JSON.parse(ids) } catch (e) { arr2 = null }
        if (Array.isArray(arr2)) this.selectedSubjectIds = arr2.filter(x => x != null).map(x => String(x))
      }
      this.refreshSuggestions()
    } catch (e) { /* no-op */ }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    searchQuery(val) {
      try { localStorage.setItem('home:searchQuery', String(val || '')) } catch (e) { /* no-op */ }
    },
    activeFeature(val) {
      this.refreshSuggestions()
    }
  },
  methods: {
    openUploadModal() {
      this.uploadModalVisible = true
    },
    closeUploadModal() {
      this.uploadModalVisible = false
      this.uploadTitle = ''
      this.uploadDescription = ''
      this.uploadScriptContent = ''
      this.uploadCoverFile = null
      this.uploadVideoFile = null
      this.uploadCoverPreview = ''
      this.uploadVideoPreview = ''
      this.uploadSubmitting = false
    },
    triggerVideoSelect() {
      const el = this.$refs.videoInput
      if (el) { try { el.value = null } catch (e) { /* no-op */ } el.click() }
    },
    triggerCoverSelect() {
      const el = this.$refs.coverInput
      if (el) el.click()
    },
    onVideoSelected(e) {
      const f = e && e.target && e.target.files && e.target.files[0]
      if (!f) return
      this.uploadVideoFile = f
      try { this.uploadVideoPreview = URL.createObjectURL(f) } catch (e2) { this.uploadVideoPreview = '' }
    },
    onCoverSelected(e) {
      const f = e && e.target && e.target.files && e.target.files[0]
      if (!f) return
      this.uploadCoverFile = f
      try { this.uploadCoverPreview = URL.createObjectURL(f) } catch (e2) { this.uploadCoverPreview = '' }
    },
    onUploadDrop(ev) {
      const files = ev && ev.dataTransfer && ev.dataTransfer.files
      if (!files || !files.length) return
      const f = files[0]
      if (/video\//i.test(f.type)) {
        this.uploadVideoFile = f
        try { this.uploadVideoPreview = URL.createObjectURL(f) } catch (e2) { this.uploadVideoPreview = '' }
      } else if (/image\//i.test(f.type)) {
        this.uploadCoverFile = f
        try { this.uploadCoverPreview = URL.createObjectURL(f) } catch (e2) { this.uploadCoverPreview = '' }
      }
    },
    openUploadPreview(type) {
      this.uploadPreviewVisible = true
      this.uploadPreviewType = type
      this.uploadPreviewSrc = type === 'video' ? this.uploadVideoPreview : this.uploadCoverPreview
    },
    closeUploadPreview() {
      this.uploadPreviewVisible = false
      this.uploadPreviewSrc = ''
      this.uploadPreviewType = ''
    },
    clearUploadVideo() {
      try { if (this.uploadVideoPreview) URL.revokeObjectURL(this.uploadVideoPreview) } catch (e) { /* no-op */ }
      this.uploadVideoFile = null
      this.uploadVideoPreview = ''
      try { const el = this.$refs.videoInput; if (el) el.value = null } catch (e) { /* no-op */ }
    },
    clearUploadCover() {
      try { if (this.uploadCoverPreview) URL.revokeObjectURL(this.uploadCoverPreview) } catch (e) { /* no-op */ }
      this.uploadCoverFile = null
      this.uploadCoverPreview = ''
    },
    async submitUpload() {
      if (!this.userStore?.isLoggedIn) {
        return
      }
      const title = String(this.uploadTitle || '').trim()
      if (!title) { this.showMessage('请输入标题', 'error'); return }
      if (!this.uploadVideoFile) { this.showMessage('请选择视频文件', 'error'); return }
      const form = new FormData()
      form.append('title', title)
      form.append('description', String(this.uploadDescription || ''))
      form.append('scriptContent', String(this.uploadScriptContent || ''))
      if (this.uploadCoverFile) form.append('coverImage', this.uploadCoverFile)
      form.append('video', this.uploadVideoFile)
      form.append('videoProjectId', '')
      this.uploadSubmitting = true
      try {
        const token = this.userStore?.token || ''
        const text = await addCreativeWork({ token, formData: form })
        let resp = null
        try { resp = JSON.parse(text) } catch (e) { resp = null }
        const ok = !!(resp && resp.code === 0 && resp.data && resp.data.id)
        this.showMessage(ok ? '发布成功' : ((resp && resp.message) || '发布失败'), ok ? 'success' : 'error')
        if (ok) {
          this.closeUploadModal()
          this.loadCreativeWorks()
        }
      } catch (e) {
        this.showMessage('发布失败', 'error')
      } finally {
        this.uploadSubmitting = false
      }
    },
    refreshSuggestions() {
      if (this.activeFeature === 'script') {
        const items = this.pickRandomItems(this.scriptSuggestionPool, 3)
        this.searchSuggestions = items.map((it, i) => ({
          id: (it && it.id) || (i + 1),
          text: (it && it.prompt) || '',
          prompt: (it && it.prompt) || '',
          style: (it && it.style) || ''
        }))
      } else {
        const items = this.pickRandomItems(this.narrationSuggestionPool, 3)
        this.searchSuggestions = items.map((it, i) => ({
          id: (it && it.id) || (i + 1),
          text: (it && it.narration) || '',
          narration: (it && it.narration) || '',
          style: (it && it.style) || ''
        }))
      }
    },
    pickRandomItems(arr, n) {
      const source = Array.isArray(arr) ? arr.slice() : []
      const result = []
      const len = Math.min(n, source.length)
      for (let i = 0; i < len; i++) {
        const idx = Math.floor(Math.random() * source.length)
        result.push(source[idx])
        source.splice(idx, 1)
      }
      return result
    },
    showMessage(text, type = 'success') {
      this.message = { show: true, text, type }
      setTimeout(() => { this.message.show = false }, 3000)
    },
    handleSearch() {
      // 未登录时拦截
      if (!this.userStore?.isLoggedIn) {
        return
      }

      if (!this.searchQuery.trim()) {
        this.showMessage('请输入提示词后再提交', 'error')
        return
      }

      let stageDirections = this.searchQuery.trim()
      if (Array.isArray(this.selectedStyles) && this.selectedStyles.length) {
        const styleText = this.selectedStyles.join(' ')
        stageDirections = stageDirections ? `${stageDirections} 画风:${styleText} ` : `画风:${styleText} `
      }
      const category = this.activeFeature === 'script' ? '0' : '1'
      const materialIds = Array.isArray(this.selectedSubjectIds) ? this.selectedSubjectIds.filter(x => String(x).trim()).map(x => String(x).trim()) : []
      const materialId = materialIds.length ? materialIds.join(',') : (this.selectedSubjectId ? String(this.selectedSubjectId) : '')

      const projectId = Date.now().toString()
      try {
        localStorage.setItem(`project:prompt:${projectId}`, stageDirections)
        localStorage.setItem(`project:category:${projectId}`, category)
        if (materialId) localStorage.setItem(`project:materialId:${projectId}`, materialId)
        localStorage.setItem(`project:videoId:${projectId}`, projectId)
      } catch (e) { /* no-op */ }
      this.$router.push({ name: 'ProjectDetail', params: { id: projectId }, query: { q: stageDirections, category, materialId } })
      this.searchQuery = ''
      this.selectedSubjects = []
      this.selectedStyles = []
      this.selectedSubjectIds = []
      this.selectedSubjectId = null
      this.selectedSubjectName = ''
      try {
        localStorage.setItem('home:selectedSubjects', JSON.stringify(this.selectedSubjects))
        localStorage.setItem('home:selectedStyles', JSON.stringify(this.selectedStyles))
        localStorage.setItem('home:selectedSubjectIds', JSON.stringify(this.selectedSubjectIds))
      } catch (e) { /* no-op */ }
    },
    applySuggestion(suggestion) {
      if (suggestion && typeof suggestion === 'object' && (suggestion.prompt || suggestion.narration)) {
        const content = String((suggestion.prompt || suggestion.narration || '')).trim()
        const style = String(suggestion.style || '').trim()
        this.searchQuery = content
        if (style) {
          this.selectedStyles = [style]
          try { localStorage.setItem('home:selectedStyles', JSON.stringify(this.selectedStyles)) } catch (e) { /* no-op */ }
        }
      } else {
        const suggestionText = typeof suggestion === 'string' ? suggestion : String(suggestion && suggestion.text || '')
        this.searchQuery = suggestionText
      }
      try {
        const input = this.$el && this.$el.querySelector && this.$el.querySelector('.search-input')
        if (input) {
          input.focus()
          const len = String(this.searchQuery || '').length
          if (input.setSelectionRange) input.setSelectionRange(len, len)
        }
      } catch (e) { /* no-op */ }
    },
    truncateText(text, maxLen = 12) {
      const s = String(text || '')
      return s.length > maxLen ? (`${s.slice(0, maxLen)  }…`) : s
    },
    truncateSuggestion(suggestion) {
      const base = (suggestion && (suggestion.text || suggestion.prompt || suggestion.narration)) || ''
      return this.truncateText(base, 12)
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
      // 允许选择最多四个主体，作为输入内容前缀（@名称），后续输入跟在其后
      const name = String(subject?.name || '').trim()
      if (!name) return
      if (!this.selectedSubjects.includes(name)) {
        if (this.selectedSubjects.length >= 4) {
          this.showMessage('最多选择4个主体', 'error')
        } else {
          this.selectedSubjects.push(name)
          try { localStorage.setItem('home:selectedSubjects', JSON.stringify(this.selectedSubjects)) } catch (e) { /* no-op */ }
        }
      }
      this.selectedSubjectId = subject.id
      if (!this.selectedSubjectIds.includes(String(subject.id))) {
        if (this.selectedSubjectIds.length < 4) {
          this.selectedSubjectIds.push(String(subject.id))
          try { localStorage.setItem('home:selectedSubjectIds', JSON.stringify(this.selectedSubjectIds)) } catch (e) { /* no-op */ }
        } else {
          this.showMessage('最多选择4个主体', 'error')
        }
      }
      this.selectedSubjectName = subject.name
      this.showSubjectDropdown = false
    },

    selectStyle(style) {
      console.log('选择画风:', style)
      const name = String(style?.name || '').trim()
      if (!name) return
      // 画风只能选择一个：直接替换为当前选择
      this.selectedStyles = [name]
      try { localStorage.setItem('home:selectedStyles', JSON.stringify(this.selectedStyles)) } catch (e) { /* no-op */ }
      this.selectedStyleName = name
      this.showStyleDropdown = false
    },
    replaceFieldInQuery(field, value) {
      try {
        const f = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(`(?:^|\\r?\\n|[ \\t])${f}[ \\t]*:[^\\r\\n]*`, 'g')
        const base = String(this.searchQuery || '').replace(re, '').trim()
        const addition = `${field}:${value}`
        return base ? `${base} ${addition} ` : `${addition} `
      } catch (e) {
        return `${field}:${value} `
      }
    },
    stripSubjectTokens(text) {
      try {
        const s = String(text || '')
        return s.replace(/(?:^|\s)@[^\s]+/g, '').trim()
      } catch (e) {
        return String(text || '')
      }
    },
    removeSubjectChip(name) {
      const idx = this.selectedSubjects.indexOf(name)
      if (idx >= 0) this.selectedSubjects.splice(idx, 1)
      try { localStorage.setItem('home:selectedSubjects', JSON.stringify(this.selectedSubjects)) } catch (e) { /* no-op */ }
      try {
        const subj = (this.subjects || []).find(s => String(s?.name || '').trim() === String(name).trim())
        const idStr = subj && subj.id != null ? String(subj.id) : ''
        if (idStr) {
          const i2 = this.selectedSubjectIds.indexOf(idStr)
          if (i2 >= 0) this.selectedSubjectIds.splice(i2, 1)
          try { localStorage.setItem('home:selectedSubjectIds', JSON.stringify(this.selectedSubjectIds)) } catch (e) { /* no-op */ }
        }
      } catch (e) { /* no-op */ }
    },
    removeStyleChip(name) {
      const idx = this.selectedStyles.indexOf(name)
      if (idx >= 0) this.selectedStyles.splice(idx, 1)
      try { localStorage.setItem('home:selectedStyles', JSON.stringify(this.selectedStyles)) } catch (e) { /* no-op */ }
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
          // 过滤掉不公开的作品，并转换为推荐卡片格式
          const list = Array.isArray(data.data) ? data.data.filter(item => item && item.isPublic !== false) : []
          const currentUserId = this.userStore?.userInfo?.id
          list.forEach(item => {
            /* console.log('作品与用户对比', {
              workId: item.id,
              workUserId: item.userId,
              currentUserId,
              isCurrentUsersWork: String(item.userId) === String(currentUserId)
            }) */
          })
          const sorted = currentUserId != null
            ? [
              ...list.filter(item => String(item.userId) === String(currentUserId)),
              ...list.filter(item => String(item.userId) !== String(currentUserId))
            ]
            : list
          this.recommendations = sorted.map(item => ({
            id: item.id,
            title: item.title,
            image: item.coverImageUrl || '/api/placeholder/300/200',
            videoUrl: item.videoUrl,
            description: item.description,
            author: {
              name: `用户${  item.userId}`,
              avatar: '/logo.png'
            },
            publishTime: item.createTime,
            tags: [],
            views: 0,
            likes: item.likeCount || 0,
            status: item.status,
            isCurrentUsersWork: String(item.userId) === String(currentUserId)
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
  z-index: 5000;
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
  background: var(--bg-secondary);
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
  color: var(--text-primary);
  margin-bottom: 2rem;
  letter-spacing: -0.025em;
}

.feature-tags {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  background: var(--bg-tertiary);
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
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.feature-tag:hover {
  color: var(--text-secondary);
}

.feature-tag.active {
  background: var(--bg-primary);
  color: var(--primary-color);
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
  min-height: 160px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 30px;
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  justify-content: space-between;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.search-input-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-secondary);
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
  color: var(--text-tertiary);
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
  color: var(--text-tertiary);
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
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 20px;
  color: var(--text-tertiary);
  font-size: 0.87rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.action-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  margin-right: 4px;
}

.at-symbol {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-tertiary);
}

.paint-icon {
  position: relative;
  width: 14px;
  height: 14px;
  background-color: var(--text-tertiary);
  border-radius: 2px;
}

.paint-icon:before,
.paint-icon:after {
  content: '';
  position: absolute;
  background-color: var(--bg-tertiary);
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
  background: var(--bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.search-submit-btn.active {
  background: var(--primary-color);
  color: #ffffff;
}

.search-submit-btn:hover {
  background: var(--bg-quaternary);
  color: var(--text-secondary);
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
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 400;
  box-shadow: var(--shadow-sm);
}

.suggestion-tag:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
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
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: left;
}
.recommendations-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.upload-work-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
}

.recommendations-grid {
  display: flex;
  gap: 1.25rem;
  width: 100%;
  max-width: 600px;
}

.recommendation-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  flex: 1;
  position: relative;
}

.recommendation-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.recommendation-card.own-work {
  border: 1px solid var(--primary-color);
}

.recommendation-card.own-work:hover::after {
  content: '个人作品';
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid var(--primary-color);
  border-radius: 6px;
}

.card-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  object-position: top center;
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

.upload-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}
.upload-modal {
  width: 900px;
  max-height: 90vh;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.upload-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
}
.upload-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.upload-close-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}
.upload-modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
}
.upload-left {
  display: flex;
}
.upload-drop-zone {
  flex: 1;
  height: 480px;
  max-height: 70vh;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px dashed var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
}
.upload-select-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
}
.upload-video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}
.upload-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.upload-field {
  position: relative;
}
.upload-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.upload-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  border-radius: 10px;
  color: var(--text-primary);
  outline: none;
}
.upload-textarea {
  width: 100%;
  min-height: 96px;
  padding: 10px 12px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  border-radius: 10px;
  color: var(--text-primary);
  outline: none;
  resize: vertical;
}
.upload-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: var(--text-quaternary);
}
.cover-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  position: relative;
}
.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
}
.upload-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
.upload-delete-btn:hover {
  color: #ef4444;
}
.upload-video-preview {
  cursor: zoom-in;
}

.upload-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.upload-preview-content {
  position: relative;
  max-width: 80vw;
  max-height: 80vh;
}
.upload-preview-content img,
.upload-preview-content video {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}
.upload-preview-close {
  position: absolute;
  top: -28px;
  right: 0;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.upload-modal-footer {
  padding: 12px 20px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.upload-submit-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
}
.upload-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
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
  border-bottom: 1px solid var(--bg-tertiary);
}

.category-tabs {
  display: flex;
  gap: 8px;
}

.category-tab {
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background: var(--bg-primary);
  color: var(--text-tertiary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.category-tab:hover:not(.active) {
  background: var(--bg-secondary);
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  border: 1px dashed var(--border-tertiary);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-new-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.create-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
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
  background: var(--bg-secondary);
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
  color: var(--text-secondary);
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
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 10px;
}

.load-more {
  text-align: center;
  padding: 12px;
  color: var(--text-tertiary);
  font-size: 0.875rem;
  cursor: pointer;
  border-top: 1px solid var(--bg-tertiary);
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
.input-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.input-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #60a5fa;
  color: #ffffff;
  border-radius: 999px;
  font-size: 0.9rem;
}

.chip-close {
  background: transparent;
  border: none;
  color: #e5f0ff;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
}
</style>
