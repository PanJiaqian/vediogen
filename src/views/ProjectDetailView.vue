<template>
  <div class="project-detail">
    <!-- 左侧内容区域 -->
    <div class="left-content" ref="leftContent">
      <!-- 题目和时间 -->
      <div class="project-header">
        <div class="project-title-row">
          <h1 class="project-title">{{ project.title }}</h1>
          <div class="version-selector">
            <button class="version-button" @click.prevent.stop="toggleVersions">历史文件</button>
            <div v-if="versionsMenuOpen" class="version-popover" @click.stop>
              <div v-for="(v, idx) in versions" :key="v.videoId || idx" class="version-item" :class="{ selected: idx === selectedVersionIndex }" @click.prevent.stop="selectVersion(idx)">
                <div class="version-item-left">
                  <svg class="version-doc-icon" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#e5e7eb"/><path d="M14 2v6h6" fill="#f3f4f6"/></svg>
                  <div class="version-item-text">
                    <div class="version-title">{{ v.title || '未命名版本' }}</div>
                    <div class="version-time">{{ formatDateTime(v.createdAt) }}</div>
                  </div>
                </div>
                <div class="version-tag">{{ 'V' + (idx + 1) }}</div>
              </div>
            </div>
          </div>
        </div>
        <p class="project-time">创建于 {{ project.createdAt }}</p>
      </div>
      <div>
        <h3 class="section-title">艺术指导建议</h3>
        <div v-if="isSubmitting && loadingSections.art" class="skeleton-block">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div v-else-if="generated.artDirection">
          <div>基础风格：{{ generated.artDirection.base_style || '-' }}</div>
          <div>整体视觉策略：{{ generated.artDirection.overall_visual_approach || '-' }}</div>
          <div
            v-if="generated.artDirection.color_palette_progression && generated.artDirection.color_palette_progression.length">
            <div v-for="(palette, idx) in generated.artDirection.color_palette_progression" :key="idx">
              <div v-for="(desc, key) in palette" :key="key">{{ key }}：{{ desc }}</div>
            </div>
          </div>
        </div>

        <h3 class="section-title">音乐风格</h3>
        <div v-if="isSubmitting && loadingSections.music" class="skeleton-block">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div v-else-if="generated.musicStyle && generated.musicStyle.length">
          <div v-for="(m, idx) in generated.musicStyle" :key="idx">
            <div>音乐流派：{{ m.Music_Genre }}</div>
            <div>情绪氛围：{{ m.Emotional_Atmosphere }}</div>
            <div>关键乐器：{{ m.Key_Instruments }}</div>
            <div>节奏特征：{{ m.Rhythmic_Characteristics }}</div>
          </div>
        </div>

        <h3 class="section-title">剧本摘要</h3>
        <div v-if="isSubmitting && loadingSections.summary" class="skeleton-block">
          <div class="skeleton-paragraph"></div>
          <div class="skeleton-paragraph short"></div>
        </div>
        <div v-else-if="generated.scriptSummary" class="section-content"
          v-html="renderMarkdown(generated.scriptSummary)">
        </div>

        <h3 class="section-title">人物信息</h3>
        <div v-if="isSubmitting && loadingSections.people" class="card-scroller">
          <div v-for="n in 3" :key="'pskel-' + n" class="detail-card">
            <div class="detail-card-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line short"></div>
            </div>
            <div class="detail-card-image">
              <div class="skeleton-image"></div>
            </div>
          </div>
        </div>
        <div v-else-if="generated.people && generated.people.length" class="card-scroller">
          <div v-for="(p, idx) in generated.people" :key="idx" class="detail-card">
            <div class="detail-card-text">
              <div class="detail-title">姓名：{{ p.Character_Name }}</div>
              <div class="detail-sub">身份：{{ p.Role_in_Story }}</div>
              <div class="detail-sub">外观：{{ p.Appearance }}</div>
            </div>
            <div class="detail-card-image">
              <img v-if="p.Character_picture && !isGenerateFailed(p.Character_picture)"
                :src="cleanUrl(p.Character_picture)" alt="人物图片" class="image-clickable"
                @click="openImagePreview(cleanUrl(p.Character_picture))" />
              <div v-else class="detail-card-placeholder" @click="handleRegenerateCharacter(p)">重新生成</div>
            </div>
          </div>
        </div>

        <h3 class="section-title">场景集合</h3>
        <div v-if="isSubmitting && loadingSections.scene" class="card-scroller">
          <div v-for="n in 3" :key="'sskel-' + n" class="detail-card">
            <div class="detail-card-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
            <div class="detail-card-image">
              <div class="skeleton-image"></div>
            </div>
          </div>
        </div>
        <div v-else-if="generated.scenes && generated.scenes.length" class="card-scroller">
          <div v-for="(s, idx) in generated.scenes" :key="idx" class="detail-card">
            <div class="detail-card-text">
              <div class="detail-title">场景名称：{{ s.Scene_Name }}</div>
              <div class="detail-sub">场景元素：{{ s.Scene_Elements }}</div>
            </div>
            <div class="detail-card-image">
              <img v-if="s.Scene_picture_url && !isGenerateFailed(s.Scene_picture_url)"
                :src="cleanUrl(s.Scene_picture_url)" alt="场景图片" class="image-clickable"
                @click="openImagePreview(cleanUrl(s.Scene_picture_url))" />
              <div v-else class="detail-card-placeholder" @click="handleRegenerateScene(s)">重新生成</div>
            </div>
          </div>
        </div>

        <h3 class="section-title">分镜故事板</h3>
        <div v-if="isSubmitting && loadingSections.storyboard" class="skeleton-block">
          <div v-for="n in 2" :key="'sbskel-' + n" style="margin-bottom:10px;">
            <div class="skeleton-line"></div>
            <div class="skeleton-card" v-for="m in 2" :key="'sbc-' + n + '-' + m"></div>
          </div>
        </div>
        <div v-else-if="generated.storyboard && generated.storyboard.length">
          <div v-for="(scene, sIdx) in generated.storyboard" :key="sIdx" style="margin-bottom: 10px;">
            <div>场景：{{ scene.scene_title }}</div>
            <div v-if="scene.shots && scene.shots.length">
              <div v-for="(shot, idx) in scene.shots" :key="idx"
                style="margin: 6px 0; padding: 6px 8px; border: 1px solid #eee; border-radius: 6px;">
                <div style="font-weight:600;color:#1f2937;margin-bottom:4px;">分镜{{ (shot.shot_code || shot.shot_id) ?
                  (shot.shot_code || shot.shot_id).toString().replace(/^shot_/, '').replace(/^scene_/, '') : (sIdx + 1) +
                  '_' + (idx + 1) }}</div>
                <div>镜头：{{ shot.shot_title }}</div>
                <div>画面：{{ shot.visual_description }}</div>
                <div>机位：{{ shot.camera_direction }}</div>
                <div>旁白：{{ shot.dialogue_or_narration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <!-- 可滚动内容区域 -->
      <div class="scrollable-content">


        <!-- 思考生成步骤 -->
        <div class="thinking-steps">
          <h3 class="section-title">思考生成步骤</h3>
          <div class="step-list">
            <div class="step-item" :class="{ completed: artDone }" @click="scrollToSection('艺术指导建议')">
              <div class="step-icon" :class="{ active: artDone }">{{ artDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">艺术指导建议</div>
                <div class="step-description">设定整体视觉与风格方向</div>
              </div>
            </div>
            <div class="step-item" :class="{ completed: musicDone }" @click="scrollToSection('音乐风格')">
              <div class="step-icon" :class="{ active: musicDone }">{{ musicDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">音乐风格</div>
                <div class="step-description">明确音乐基调与节奏</div>
              </div>
            </div>
            <div class="step-item" :class="{ completed: summaryDone }" @click="scrollToSection('剧本摘要')">
              <div class="step-icon" :class="{ active: summaryDone }">{{ summaryDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">剧本摘要</div>
                <div class="step-description">概述剧本核心内容</div>
              </div>
            </div>
            <div class="step-item" :class="{ completed: peopleDone }" @click="scrollToSection('人物信息')">
              <div class="step-icon" :class="{ active: peopleDone }">{{ peopleDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">人物信息</div>
                <div class="step-description">梳理主要角色信息</div>
              </div>
            </div>
            <div class="step-item" :class="{ completed: sceneDone }" @click="scrollToSection('场景集合')">
              <div class="step-icon" :class="{ active: sceneDone }">{{ sceneDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">场景集合</div>
                <div class="step-description">汇总关键场景要素</div>
              </div>
            </div>
            <div class="step-item" :class="{ completed: storyboardDone }" @click="scrollToSection('分镜故事板')">
              <div class="step-icon" :class="{ active: storyboardDone }">{{ storyboardDone ? '✓' : '⏳' }}</div>
              <div class="step-content">
                <div class="step-title">分镜故事板</div>
                <div class="step-description">组织分镜与镜头安排</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 问答消息列表 -->
        <div class="qa-messages">
          <div v-for="(m, i) in messages" :key="m.id" class="qa-message"
            :class="{ 'qa-message-left': m.side === 'left' }">
            <div class="qa-message-text">{{ m.text }}</div>
            <div class="qa-message-status" v-if="m.status && m.status !== '思考中'">{{ m.status }}</div>
          </div>
          <div v-if="isSubmitting" class="qa-center-status">生成中...</div>
        </div>

        <!-- 操作按钮 -->
        <div class="aspect-ratio-select" v-show="!isSubmitting && !canViewStoryboard">
          <span class="aspect-label">画面比例</span>
          <div class="aspect-options">
            <button type="button" class="aspect-option" :class="{ active: project.aspectRatio === '16:9' }"
              @click="project.aspectRatio = '16:9'">16:9</button>
            <button type="button" class="aspect-option" :class="{ active: project.aspectRatio === '9:16' }"
              @click="project.aspectRatio = '9:16'">9:16</button>
            <button type="button" class="aspect-option" :class="{ active: project.aspectRatio === '1:1' }"
              @click="project.aspectRatio = '1:1'">1:1</button>
          </div>
        </div>
        <div class="action-buttons" v-show="!isSubmitting">
          <!-- <button class="action-btn save-script">保存剧本</button>
          <button class="action-btn add-scene">添加场景</button> -->
          <button class="action-btn generate-video" @click="handleViewOrGenerate"
            :disabled="!canViewStoryboard && !allImagesReady">{{ canViewStoryboard ? '查看分镜' : '生成分镜' }}</button>
        </div>
      </div>


      <!-- 固定在底部的输入框 -->
      <div class="input-section">
        <div class="input-container">
          <input v-model="userInput" placeholder="输入你的想法" class="user-input" />
          <button class="submit-btn" @click="submitInput" :disabled="isSubmitting">
            <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            ↑
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="imagePreviewVisible" class="image-preview-overlay" @click="closeImagePreview">
    <img :src="imagePreviewSrc" class="image-preview-img" @click.stop />
  </div>
</template>

<script>
import { scriptModifyStream, regenerateImage, queryRegenerateImage, getScriptDetailByVideo, getWorksVideoStatus, queryStoryboardVideoStatus, getStoryboardImagesDetail, scriptGenStream } from '@/api'
import { getMyWorksList, getVideoVersionsByConversation, getConversationMessages } from '@/api/index.js'
import { useUserStore } from '@/stores/user'
import { cleanUrl as cleanUrlUtil, isGenerateFailed as isGenerateFailedUtil, shouldRenderImage as shouldRenderImageUtil } from '@/utils/media'
export default {
  name: 'ProjectDetailView',
  components: {},
  data() {
    return {
      userInput: '',
      videoId: '',
      messages: [],
      isSubmitting: false,
      prompt: '',
      category: '',
      materialId: '',
      imagePreviewVisible: false,
      imagePreviewSrc: '',
      loadingSections: { art: false, music: false, summary: false, people: false, scene: false, storyboard: false },
      generated: {
        scriptSummary: '',
        artDirection: null,
        musicStyle: [],
        storyboard: [],
        people: [],
        scenes: []
      },
      worksStatusVideo: false,
      worksStatusPicture: false,
      project: {
        title: '',
        createdAt: '',
        duration: '',
        aspectRatio: '16:9',
        wordCount: '',
        videoType: '',
        contentSummary: '',
        highlights: [],
        scenes: []
      },
      versionsMenuOpen: false,
      versions: [],
      selectedVersionIndex: null
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
    ,
    artDone() {
      return !!this.generated.artDirection
    },
    musicDone() {
      return Array.isArray(this.generated.musicStyle) && this.generated.musicStyle.length > 0
    },
    summaryDone() {
      return !!this.generated.scriptSummary
    },
    peopleDone() {
      return Array.isArray(this.generated.people) && this.generated.people.length > 0
    },
    sceneDone() {
      return Array.isArray(this.generated.scenes) && this.generated.scenes.length > 0
    },
    storyboardDone() {
      return Array.isArray(this.generated.storyboard) && this.generated.storyboard.length > 0
    },
    canViewStoryboard() {
      return this.worksStatusVideo || this.worksStatusPicture
    },
    allImagesReady() {
      try {
        const scenes = Array.isArray(this.generated?.scenes) ? this.generated.scenes : []
        const people = Array.isArray(this.generated?.people) ? this.generated.people : []
        const expectAny = scenes.length > 0 || people.length > 0
        if (!expectAny) return false
        const sceneOk = scenes.every(s => {
          const u = this.cleanUrl(s?.Scene_picture_url || '')
          return !!u && !this.isGenerateFailed(u)
        })
        const peopleOk = people.every(p => {
          const u = this.cleanUrl(p?.Character_picture || '')
          return !!u && !this.isGenerateFailed(u)
        })
        return sceneOk && peopleOk
      } catch (e) {
        return false
      }
    }
  },
  methods: {
    async resolveConversationIdViaMyWorks() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return ''
        const projectId = this.$route.params.id
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        const text = await getMyWorksList(token)
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const arr = obj && Array.isArray(obj.data) ? obj.data : []
        const found = arr.find(it => String(it.recentVideoId || '') === String(videoId))
        const cid = found && found.conversationId ? String(found.conversationId) : ''
        if (cid) {
          try { localStorage.setItem(`project:conversationId:${projectId}`, cid) } catch (e) { /* no-op */ }
        }
        return cid
      } catch (e) { return '' }
    },
    async loadVersionList() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const projectId = this.$route.params.id
        let conversationId = await this.resolveConversationIdViaMyWorks()
        if (!conversationId) {
          conversationId = localStorage.getItem(`project:conversationId:${projectId}`) || ''
        }
        if (!conversationId) return
        const text2 = await getVideoVersionsByConversation({ conversationId, token })
        let obj2 = null
        try { obj2 = JSON.parse(text2) } catch (e) { obj2 = null }
        const list = obj2 && obj2.code === 0 && Array.isArray(obj2.data) ? obj2.data : []
        this.versions = list.map(it => ({
          videoId: it.video_id,
          title: it.title,
          outline: it.script_outline || '',
          createdAt: it.created_at,
          updatedAt: it.updated_at
        }))
        // 默认选中与当前项目匹配的版本或第一个
        const byTitle = this.versions.findIndex(v => String(v.title || '').trim() === String(this.project.title || '').trim())
        const byVideo = this.versions.findIndex(v => String(v.videoId || '') === String(this.videoId || this.$route.params.id))
        const idx = byTitle >= 0 ? byTitle : (byVideo >= 0 ? byVideo : 0)
        this.selectedVersionIndex = idx >= 0 ? idx : 0
        const chosen = this.versions[this.selectedVersionIndex]
        if (chosen && chosen.createdAt) {
          this.project.createdAt = this.formatDateTime(chosen.createdAt)
        }
      } catch (e) { /* no-op */ }
    },
    async loadConversationMessages() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const projectId = this.$route.params.id
        let conversationId = await this.resolveConversationIdViaMyWorks()
        if (!conversationId) {
          conversationId = localStorage.getItem(`project:conversationId:${projectId}`) || ''
        }
        if (!conversationId) return
        const text2 = await getConversationMessages({ conversationId, token })
        let obj2 = null
        try { obj2 = JSON.parse(text2) } catch (e) { obj2 = null }
        const list = obj2 && obj2.code === 0 && Array.isArray(obj2.data) ? obj2.data : []
        const merged = []
        for (let idx = 0; idx < list.length; idx++) {
          const it = list[idx]
          const baseId = Date.now() + idx * 2
          merged.push({
            id: baseId,
            text: it.content || '',
            side: String(it.role || '').toLowerCase() === 'user' ? 'right' : 'left'
          })
          merged.push({
            id: baseId + 1,
            text: '小梦收到了您的新idea！原来这样改故事会更精彩，让我现在来优化这个故事吧！',
            side: 'left'
          })
        }
        this.messages = merged
      } catch (e) { /* no-op */ }
    },
    toggleVersions() {
      this.versionsMenuOpen = !this.versionsMenuOpen
      if (this.versionsMenuOpen && !this.versions.length) {
        this.loadVersionList()
      }
    },
    selectVersion(idx) {
      this.selectedVersionIndex = idx
      const v = this.versions[idx]
      if (!v) return
      if (v.title) this.project.title = v.title
      if (v.outline) {
        this.generated.scriptSummary = v.outline
        this.project.contentSummary = v.outline
      }
      if (v.createdAt) {
        this.project.createdAt = this.formatDateTime(v.createdAt)
      }
      this.versionsMenuOpen = false
    },
    async startScriptGenStream() {
      const projectId = this.$route.params.id
      const stageDirections = (this.$route.query.q || '').trim()
      const category = this.$route.query.category || '0'
      const materialId = this.$route.query.materialId || ''
      const token = (this.userStore && this.userStore.token) || ''
      if (!stageDirections || !token) return
      this.isSubmitting = true
      this.loadingSections = { art: true, music: true, summary: true, people: true, scene: true, storyboard: true }
      try {
        this._sseGenCtrl = new AbortController()
        await scriptGenStream({
          stageDirections, materialId, category, token, signal: this._sseGenCtrl.signal, onEvent: (obj) => {
            if (!obj || obj.type === 'connected') return
            this.applyParsedData([obj])
          }
        })
      } catch (e) {
        console.warn('脚本生成流式接口错误:', e)
      } finally {
        this.isSubmitting = false
      }
    },
    async fetchWorksStatus() {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) return
        const videoId = this.videoId || this.$route.params.id
        const text = await getWorksVideoStatus({ videoId, token })
        let obj = null
        try { obj = JSON.parse(text) } catch (e) { obj = null }
        const data = obj && obj.data ? obj.data : obj
        this.worksStatusVideo = !!(data && data.video === true)
        this.worksStatusPicture = !!(data && data.picture === true)
      } catch (e) {
        console.warn('查询作品状态失败:', e)
      }
    },
    async handleViewOrGenerate() {
      if (this.canViewStoryboard) {
        const projectId = this.$route.params.id
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
          return
        }
        const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
        let entryMode = 'canvas'
        let scenes = []
        if (this.worksStatusVideo) {
          try {
            const statusText = await queryStoryboardVideoStatus({ videoId, token })
            let statusJson = null
            try { statusJson = JSON.parse(statusText) } catch (e) { statusJson = null }
            const items = statusJson && Array.isArray(statusJson.items) ? statusJson.items : []
            const succeeded = items.filter(it => it && it.status === 'SUCCEEDED' && it.video_url)
            if (succeeded.length) {
              entryMode = 'crop'
              scenes = succeeded.map((it, idx) => {
                const url = String(it.video_url || '').trim()
                return { id: idx + 1, title: `分镜${idx + 1}`, description: '分镜视频', thumbnail: url, clips: [{ url, durationMs: 5000 }], scene_number: it.scene_number }
              })
            }
          } catch (e) { console.warn('查询分镜视频状态失败:', e) }
        } else if (this.worksStatusPicture) {
          try {
            const text = await getStoryboardImagesDetail({ videoId, token })
            let resp = null
            try { resp = JSON.parse(text) } catch (e) { console.warn('分镜图片详情解析失败:', e) }
            const list = resp && resp.code === 0 && Array.isArray(resp.data) ? resp.data : []
            scenes = list.map((item, idx) => {
              const content = (item && item.scene_script && item.scene_script.content) || {}
              const title = content.shot_title || item.scene_number || `分镜${idx + 1}`
              const descParts = []
              if (content.visual_description) descParts.push(content.visual_description)
              if (content.camera_direction) descParts.push(`机位：${content.camera_direction}`)
              if (content.dialogue_or_narration) descParts.push(`旁白：${content.dialogue_or_narration}`)
              const rawUrl = String(item.reference_image_url || '').trim()
              const cleanedUrl = rawUrl.replace(/^`+|`+$/g, '').replace(/\s+/g, ' ').replace(/"/g, '').replace(/\\`/g, '').replace(/`/g, '')
              return { id: idx + 1, title, description: descParts.join(' | '), thumbnail: cleanedUrl, scene_number: item.scene_number }
            })
          } catch (e) { console.warn('查询分镜图片详情失败:', e) }
        }
        try {
          localStorage.setItem(`video-edit:entryMode:${projectId}`, entryMode)
          localStorage.setItem(`video-edit:scenes:${projectId}`, JSON.stringify(scenes))
          localStorage.setItem(`project:prompt:${projectId}`, String(this.project.title || this.prompt || ''))
        } catch (e) { console.warn('保存编辑页数据失败:', e) }
        this.$router.push(`/video-edit/${projectId}`)
      } else {
        await this.generateVideo()
      }
    },
    async generateVideo() {
      const projectId = this.$route.params.id
      const token = (this.userStore && this.userStore.token) || ''
      if (!token) {
        console.warn('未登录，无法生成分镜图片')
        try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
        return
      }
      try { localStorage.setItem(`video-edit:generateStoryboard:${projectId}`, '1') } catch (e) { /* no-op */ }
      this.$router.push(`/video-edit/${projectId}`)
    },
    saveProject() {
      console.log('保存项目')
      // 实现保存项目逻辑
    },
    shareProject() {
      console.log('分享项目')
      // 实现分享项目逻辑
    },
    async submitInput() {
      const suggestion = (this.userInput || '').trim()
      if (!suggestion) return
      // 追加问答消息
      const msg = { id: Date.now(), text: suggestion, status: '思考中' }
      this.messages.push(msg)
      this.messages.push({ id: Date.now() + 1, text: '小梦收到了您的新idea！原来这样改故事会更精彩，让我现在来优化这个故事吧！', side: 'left' })
      this.isSubmitting = true
      this.loadingSections = { art: true, music: true, summary: true, people: true, scene: true, storyboard: true }
      // 发送后清空输入框
      this.userInput = ''
      const projectId = this.$route.params.id
      const videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      const token = (this.userStore && this.userStore.token) || ''
      if (!token) {
        console.warn('未找到token，无法提交修改请求')
        this.isSubmitting = false
        return
      }
      try {
        this._sseModCtrl = new AbortController()
        await scriptModifyStream({
          modificationSuggestions: suggestion,
          videoId,
          token,
          signal: this._sseModCtrl.signal,
          onEvent: (obj) => {
            if (!obj || obj.type === 'connected') return
            this.applyParsedData([obj])
          }
        })
      } catch (e) {
        console.warn('接口调用失败:', e)
      } finally {
        // 接口完成后在发送内容下添加节点“思考完成”，并恢复按钮显示
        const lastIndex = this.messages.length - 1
        if (lastIndex >= 0) {
          this.messages[lastIndex].status = '思考完成'
        }
        this.isSubmitting = false
      }
    },
    // 代理到通用工具，方便其他页面统一复用
    cleanUrl(u) {
      return cleanUrlUtil(u)
    },
    // 接口生成失败检测：包含“失败/fail/error”则视为失败
    isGenerateFailed(u) {
      return isGenerateFailedUtil(u)
    },
    shouldRenderImage(u) {
      return shouldRenderImageUtil(u)
    },
    openImagePreview(url) {
      this.imagePreviewSrc = url
      this.imagePreviewVisible = true
    },
    closeImagePreview() {
      this.imagePreviewVisible = false
      this.imagePreviewSrc = ''
    },
    scrollToSection(title) {
      try {
        const container = this.$refs && this.$refs.leftContent
        if (!container) return
        const titles = container.querySelectorAll('h3.section-title')
        let target = null
        for (const el of titles) {
          if (String(el.textContent).trim() === String(title).trim()) { target = el; break }
        }
        if (!target) return
        const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
        container.scrollTo({ top, behavior: 'smooth' })
      } catch (e) {
        console.warn('滚动定位失败:', e)
      }
    },
    // 简易 Markdown 渲染：加粗与段落换行
    renderMarkdown(text) {
      if (!text) return '';
      const escaped = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const bold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return bold
        .split(/\n{2,}/)
        .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    },
    parseSSEText(text) {
      const chunks = text.split(/\n\n+/)
      const objs = []
      for (const chunk of chunks) {
        const m = chunk.match(/data:(.*)/s)
        if (m && m[1]) {
          const jsonText = m[1].trim()
          try {
            const obj = JSON.parse(jsonText)
            objs.push(obj)
          } catch (e) {
            console.warn('JSON 解析失败:', e)
          }
        }
      }
      return objs
    },
    formatDateTime(str) {
      const s = String(str || '').trim()
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        const pad = n => String(n).padStart(2, '0')
        const y = d.getFullYear()
        const m = pad(d.getMonth() + 1)
        const dd = pad(d.getDate())
        const hh = pad(d.getHours())
        const mm = pad(d.getMinutes())
        const ss = pad(d.getSeconds())
        return `${y}-${m}-${dd} ${hh}:${mm}:${ss}`
      }
      return s
    },
    async handleRegenerateScene(s) {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          console.warn('未登录，无法重新生成场景图片')
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
          return
        }
        const videoId = this.videoId || this.$route.params.id
        const type = 'scene'
        const name = (s.Scene_Name || '').toString().trim() || 'scene'
        const resp = await regenerateImage({ videoId, type, name, token })
        const respMsg = String((resp && (resp.message || resp.msg || resp.meg)) || '').trim()
        const respSensitive = (resp && resp.success === false) || /敏感/i.test(respMsg)
        if (respSensitive) {
          try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { /* no-op */ }
          return
        }
        const generateUuid = resp.generate_uuid || (resp.raw && resp.raw.data && resp.raw.data.generateUuid)
        if (!generateUuid) {
          return
        }
        const q = await queryRegenerateImage({ videoId, type, name, generateUuid, token })
        const url = (q && q.urls && q.urls[0] && q.urls[0].imageUrl) || (q && q.raw && q.raw.data && q.raw.data.images && q.raw.data.images[0] && q.raw.data.images[0].imageUrl)
        const msgText = String((q && (q.message || q.msg || q.meg)) || '').trim()
        const isSensitive = (q && q.success === false) || /敏感/i.test(msgText)
        if (isSensitive) {
          try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { /* no-op */ }
          return
        }
        if (msgText) {
          console.warn('重生成场景图片接口返回错误:', msgText)
          return
        }
        if (url) {
          s.Scene_picture_url = url
          try {
            const projectId = this.$route.params.id
            const key = `video-edit:scenes:${projectId}`
            const text = localStorage.getItem(key) || ''
            if (text) {
              let arr = []
              try { arr = JSON.parse(text) || [] } catch (e) { arr = [] }
              const t = s.Scene_Name || s.scene_title || ''
              let changed = false
              for (const item of arr) {
                if (String(item.title || '').trim() === String(t).trim()) {
                  item.thumbnail = this.cleanUrl(url)
                  changed = true
                  break
                }
              }
              if (changed) {
                try { localStorage.setItem(key, JSON.stringify(arr)) } catch (e) { console.warn('更新场景缩略图缓存失败:', e) }
              }
            }
          } catch (e) { console.warn('同步场景图到列表失败:', e) }
        }
      } catch (e) {
        console.warn('重新生成场景图片失败:', e)
      }
    },
    async handleRegenerateCharacter(p) {
      try {
        const token = (this.userStore && this.userStore.token) || ''
        if (!token) {
          console.warn('未登录，无法重新生成人物图片')
          try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
          return
        }
        const videoId = this.videoId || this.$route.params.id
        const type = 'character_gen'
        const name = (p.Character_Name || '').toString().trim() || 'character'
        const resp = await regenerateImage({ videoId, type, name, token })
        const respMsg = String((resp && (resp.message || resp.msg || resp.meg)) || '').trim()
        const respSensitive = (resp && resp.success === false) || /敏感/i.test(respMsg)
        if (respSensitive) {
          try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { /* no-op */ }
          return
        }
        const generateUuid = resp.generate_uuid || (resp.raw && resp.raw.data && resp.raw.data.generateUuid)
        if (!generateUuid) {
          return
        }
        const q = await queryRegenerateImage({ videoId, type, name, generateUuid, token })
        const url = (q && q.urls && q.urls[0] && q.urls[0].imageUrl) || (q && q.raw && q.raw.data && q.raw.data.images && q.raw.data.images[0] && q.raw.data.images[0].imageUrl)
        const msgText = String((q && (q.message || q.msg || q.meg)) || '').trim()
        const isSensitive = (q && q.success === false) || /敏感/i.test(msgText)
        if (isSensitive) {
          try { alert('生成包含敏感信息，请修改画面描述') } catch (e) { /* no-op */ }
          return
        }
        if (msgText) {
          console.warn('重生成人物图片接口返回错误:', msgText)
          return
        }
        if (url) {
          p.Character_picture = url
        }
      } catch (e) {
        console.warn('重新生成人物图片失败:', e)
      }
    },
    applyParsedData(objs) {
      for (const o of objs) {
        if (!o || o.type === 'connected') continue
        if (o.Art_Direction_Suggestions) {
          const ads = Array.isArray(o.Art_Direction_Suggestions)
            ? o.Art_Direction_Suggestions[0]
            : o.Art_Direction_Suggestions
          this.generated.artDirection = ads
          this.loadingSections.art = false
        }
        if (o.Music_Style) {
          this.generated.musicStyle = Array.isArray(o.Music_Style) ? o.Music_Style : [o.Music_Style]
          this.loadingSections.music = false
        }
        if (o.Script_Summary) {
          this.generated.scriptSummary = o.Script_Summary
          this.project.contentSummary = o.Script_Summary
          this.loadingSections.summary = false
        }
        if (o.Storyboard) {
          // 兼容返回结构：可能为{ scene_id, scene_title, shots, Storyboard:[...] }或纯数组
          const raw = o.Storyboard
          let scenes = []
          if (Array.isArray(raw)) {
            if (raw.length && raw[0] && raw[0].content) {
              const grouped = {}
              for (const item of raw) {
                const c = item.content || {}
                const sceneTitle = c.scene_title || c.scene_id || '未命名场景'
                if (!grouped[sceneTitle]) grouped[sceneTitle] = []
                grouped[sceneTitle].push({
                  shot_title: c.shot_title || '',
                  visual_description: c.visual_description || '',
                  camera_direction: c.camera_direction || '',
                  dialogue_or_narration: c.dialogue_or_narration || '',
                  shot_code: item.shot_code || c.shot_id || ''
                })
              }
              scenes = Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] }))
            } else {
              scenes = raw
            }
          } else if (raw && typeof raw === 'object') {
            // 外层自身有一个场景
            if (Array.isArray(raw.shots) && raw.shots.length) {
              scenes.push({
                scene_title: raw.scene_title || raw.scene_id || '未命名场景',
                shots: raw.shots
              })
            }
            // 内层 Storyboard 列表再追加
            if (Array.isArray(raw.Storyboard)) {
              const inner = raw.Storyboard
              if (inner.length && inner[0] && inner[0].content) {
                const grouped = {}
                for (const item of inner) {
                  const c = item.content || {}
                  const sceneTitle = c.scene_title || c.scene_id || '未命名场景'
                  if (!grouped[sceneTitle]) grouped[sceneTitle] = []
                  grouped[sceneTitle].push({
                    shot_title: c.shot_title || '',
                    visual_description: c.visual_description || '',
                    camera_direction: c.camera_direction || '',
                    dialogue_or_narration: c.dialogue_or_narration || '',
                    shot_code: item.shot_code || c.shot_id || ''
                  })
                }
                scenes.push(...Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] })))
              } else {
                scenes.push(...inner)
              }
            }
          }
          this.generated.storyboard = scenes
          this.loadingSections.storyboard = false
        }
        if (o.people) {
          this.generated.people = o.people
          this.loadingSections.people = false
        }
        if (o.Scene) {
          if (typeof o.Scene === 'string') {
            try {
              const cleaned = o.Scene.replace(/\\`/g, '').replace(/`/g, '')
              const arr = JSON.parse(cleaned)
              this.generated.scenes = Array.isArray(arr) ? arr : []
              // 若看起来是镜头数组（含 content 字段），转换为 storyboard 结构
              if (Array.isArray(this.generated.scenes) && this.generated.scenes.length && this.generated.scenes[0] && this.generated.scenes[0].content) {
                const grouped = {}
                for (const item of this.generated.scenes) {
                  const c = item.content || {}
                  const sceneTitle = c.scene_title || c.scene_id || '未命名场景'
                  if (!grouped[sceneTitle]) grouped[sceneTitle] = []
                  grouped[sceneTitle].push({
                    shot_title: c.shot_title || '',
                    visual_description: c.visual_description || '',
                    camera_direction: c.camera_direction || '',
                    dialogue_or_narration: c.dialogue_or_narration || '',
                    shot_code: item.shot_code || c.shot_id || ''
                  })
                }
                this.generated.storyboard = Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] }))
              }
              this.loadingSections.scene = false
            } catch (e) {
              console.warn('Scene 解析失败:', e)
            }
          } else if (Array.isArray(o.Scene)) {
            this.generated.scenes = o.Scene
            // 若看起来是镜头数组（含 content 字段），转换为 storyboard 结构
            if (this.generated.scenes.length && this.generated.scenes[0] && this.generated.scenes[0].content) {
              const grouped = {}
              for (const item of this.generated.scenes) {
                const c = item.content || {}
                const sceneTitle = c.scene_title || c.scene_id || '未命名场景'
                if (!grouped[sceneTitle]) grouped[sceneTitle] = []
                grouped[sceneTitle].push({
                  shot_title: c.shot_title || '',
                  visual_description: c.visual_description || '',
                  camera_direction: c.camera_direction || '',
                  dialogue_or_narration: c.dialogue_or_narration || '',
                  shot_code: item.shot_code || c.shot_id || ''
                })
              }
              this.generated.storyboard = Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] }))
            }
            this.loadingSections.scene = false
          }
        }
      }
      // 映射到左侧排版数据
      if (this.category) {
        this.project.videoType = this.category
      }
      // 合并接口中的 Scene 与 Storyboard 到左侧“场景描述”
      const mergedScenes = []
      if (this.generated.scenes && this.generated.scenes.length) {
        const fromScenes = this.generated.scenes.map(s => ({
          opening: s.Scene_Name || '',
          vivid: s.Scene_Elements || '',
          action: s.Scene_picture_url ? `图片：${this.cleanUrl(s.Scene_picture_url)}` : ''
        }))
        mergedScenes.push(...fromScenes)
      }
      if (this.generated.storyboard && this.generated.storyboard.length) {
        const fromStoryboard = this.generated.storyboard.map(sb => {
          const opening = sb.scene_title || ''
          let vivid = ''
          let action = ''
          if (Array.isArray(sb.shots)) {
            const visuals = sb.shots.map(sh => sh.visual_description).filter(Boolean)
            const cameras = sb.shots.map(sh => sh.camera_direction).filter(Boolean)
            const dialogues = sb.shots.map(sh => sh.dialogue_or_narration).filter(Boolean)
            if (visuals.length) vivid = visuals.join('；')
            const parts = []
            if (cameras.length) parts.push(`镜头：${cameras.join('，')}`)
            if (dialogues.length) parts.push(`旁白：${dialogues.join('，')}`)
            if (parts.length) action = parts.join(' | ')
          }
          return { opening, vivid, action }
        })
        mergedScenes.push(...fromStoryboard)
      }
      if (mergedScenes.length) {
        this.project.scenes = mergedScenes
      }
      const highlights = []
      if (this.generated.artDirection && this.generated.artDirection.base_style) {
        highlights.push(`艺术风格：${this.generated.artDirection.base_style}`)
      }
      if (this.generated.artDirection && this.generated.artDirection.overall_visual_approach) {
        highlights.push(`视觉策略：${this.generated.artDirection.overall_visual_approach}`)
      }
      if (this.generated.musicStyle && this.generated.musicStyle.length) {
        for (const m of this.generated.musicStyle) {
          const parts = []
          if (m.Music_Genre) parts.push(m.Music_Genre)
          if (m.Emotional_Atmosphere) parts.push(m.Emotional_Atmosphere)
          if (m.Key_Instruments) parts.push(m.Key_Instruments)
          if (m.Rhythmic_Characteristics) parts.push(m.Rhythmic_Characteristics)
          if (parts.length) highlights.push(`音乐风格：${parts.join(' | ')}`)
        }
      }
      if (this.generated.people && this.generated.people.length) {
        for (const p of this.generated.people) {
          const extras = []
          if (p.Role_in_Story) extras.push(p.Role_in_Story)
          if (p.Appearance) extras.push(p.Appearance)
          const base = `角色：${p.Character_Name || ''}`
          highlights.push(extras.length ? `${base}（${extras.join(' | ')}）` : base)
        }
      }
      if (this.generated.storyboard && this.generated.storyboard.length) {
        highlights.push(`分镜数量：${this.generated.storyboard.length}`)
      }
      if (highlights.length) {
        this.project.highlights = highlights
      }
    }
  },
  async mounted() {
    // 根据路由参数获取项目详情
    const projectId = this.$route.params.id
    console.log('项目ID:', projectId)
    try {
      this.videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
      await this.fetchWorksStatus()
      const sseText = localStorage.getItem(`project:script:${projectId}`) || ''
      this.prompt = localStorage.getItem(`project:prompt:${projectId}`) || ''
      this.category = localStorage.getItem(`project:category:${projectId}`) || ''
      this.materialId = localStorage.getItem(`project:materialId:${projectId}`) || ''
      if (this.prompt) {
        this.project.title = this.prompt
      }
      if (sseText) {
        const objs = this.parseSSEText(sseText)
        this.applyParsedData(objs)
      }

      // 优先使用从编辑页保存的剧本详情 JSON
      const detailText = localStorage.getItem(`project:script_detail_json:${projectId}`) || ''
      if (detailText) {
        let obj = null
        try { obj = JSON.parse(detailText) } catch (e) { console.warn('剧本详情JSON解析失败:', e) }
        const dataObj = obj && obj.data ? obj.data : obj
        if (dataObj) {
          if (dataObj.title) this.project.title = dataObj.title
          this.applyParsedData([dataObj])
        }
      } else {
        await this.startScriptGenStream()
      }
      await this.loadVersionList()
      await this.loadConversationMessages()
    } catch (e) {
      console.warn('读取生成内容失败:', e)
    }
  }
  ,beforeUnmount() {
    try { if (this._sseGenCtrl && this._sseGenCtrl.abort) this._sseGenCtrl.abort() } catch (e) { void e }
    try { if (this._sseModCtrl && this._sseModCtrl.abort) this._sseModCtrl.abort() } catch (e) { void e }
  }
}
</script>

<style scoped>
.project-detail {
  position: fixed;
  top: 60px;
  /* 从header下方开始 */
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1500;
  display: flex;
  height: calc(100vh - 60px);
  /* 减去header高度 */
  --font-scale: 1.1;
}

.left-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  /* 允许上下滚动 */
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.right-content {
  width: 320px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scrollable-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  padding-bottom: 100px;
  /* 为固定输入框留出空间 */
}

/* 左侧样式 */
.project-header {
  margin-bottom: 16px;
  flex-shrink: 0;
  position: relative;
}

.project-title {
  font-size: calc(24px * var(--font-scale));
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  line-height: 1.2;
}
.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.version-selector {
  position: absolute;
  top: 0;
  right: 0;
}
.version-button {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
}
.version-popover {
  position: absolute;
  top: 36px;
  right: 0;
  width: 280px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-radius: 12px;
  padding: 12px;
  z-index: 10;
}
.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
}
.version-item:hover {
  background: #f9fafb;
}
.version-item.selected {
  border-color: #3b82f6;
}
.version-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.version-doc-icon {
  width: 24px;
  height: 24px;
}
.version-item-text {
  display: flex;
  flex-direction: column;
}
.version-title {
  font-size: 13px;
  color: #111827;
}
.version-time {
  font-size: 12px;
  color: #6b7280;
}
.version-tag {
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 12px;
}

.project-time {
  font-size: calc(13px * var(--font-scale));
  color: #6b7280;
}

.section-title {
  font-size: calc(16px * var(--font-scale));
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
}

/* 左右滚动条隐藏（保持可滚动） */
.left-content::-webkit-scrollbar,
.scrollable-content::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.left-content {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.scrollable-content {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

/* 左侧标题与分块美化 */
.left-content .section-title {
  font-size: calc(18px * var(--font-scale));
  font-weight: 700;
  color: #222;
  margin: 18px 0 10px;
  padding-left: 8px;
  border-left: 3px solid #3b82f6;
  border-bottom: none;
}

.left-content .section-title+div {
  margin-bottom: 16px;
}

.left-content .section-title+div>div {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: calc(13px * var(--font-scale));
  color: #374151;
}

/* Markdown 文本样式 */
.left-content .section-content {
  color: #4b5563;
  font-size: calc(14px * var(--font-scale));
  line-height: 1.7;
}

/* 场景图片样式 */
.scene-image {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #eee;
  display: block;
  margin-top: 6px;
}

/* 人物信息样式 */
.character-item {
  margin-bottom: 10px;
}

.character-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.character-avatar {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #eee;
  margin-right: 8px;
}

.character-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  font-size: calc(12px * var(--font-scale));
  cursor: pointer;
}

.character-info {
  flex: 1;
}

.character-name {
  font-weight: 600;
  color: #374151;
}

/* 场景图片失败占位 */
.scene-image-placeholder {
  width: 100%;
  height: 160px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  cursor: pointer;
}

/* 策划摘要样式 */
.planning-summary {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: calc(13px * var(--font-scale));
  line-height: 1.4;
}

.summary-bullet {
  color: #374151;
  margin-right: 8px;
  font-weight: 600;
}

.summary-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 80px;
  flex-shrink: 0;
}

.summary-content {
  color: #6b7280;
  flex: 1;
}

/* 创作亮点样式 */
.creative-highlights {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: calc(13px * var(--font-scale));
  line-height: 1.4;
}

.highlight-icon {
  margin-right: 8px;
  font-size: calc(14px * var(--font-scale));
}

.highlight-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 60px;
  flex-shrink: 0;
}

.highlight-content {
  color: #6b7280;
  flex: 1;
}

/* 场景描述样式 */
.scene-description {
  flex: 1;
  overflow-y: auto;
}

.scene-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.scene-header {
  margin-bottom: 8px;
}

.scene-label {
  font-weight: 600;
  font-size: calc(13px * var(--font-scale));
  color: #374151;
  background-color: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.scene-content {
  margin-left: 0;
}

.scene-detail {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
  font-size: calc(12px * var(--font-scale));
  line-height: 1.4;
}

.scene-detail-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 70px;
  flex-shrink: 0;
}

.scene-detail-text {
  color: #6b7280;
  flex: 1;
}

/* 右侧样式（去除信息统计相关样式） */

.thinking-steps {
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
}

.step-list {
  position: relative;
  padding: 0 0 0 18px;
}

.step-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  font-size: calc(12px * var(--font-scale));
  padding: 8px 8px 8px 6px;
  border-radius: 8px;
  background: transparent;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-item:hover {
  background: rgba(243, 244, 246, 0.6);
}

.step-icon {
  display: none;
}

.step-icon.active {
  color: #3b82f6;
}

.step-item::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.step-item.completed::before {
  background: #3b82f6;
}

.step-item::after {
  content: '';
  position: absolute;
  left: -9px;
  top: 24px;
  width: 2px;
  height: calc(100% - 24px);
  background: #e5e7eb;
}

.step-item:last-child::after {
  display: none;
}

.step-item.completed .step-icon {
  border-color: #3b82f6;
  color: #3b82f6;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.step-description {
  color: #6b7280;
  line-height: 1.4;
  font-size: 12px;
}

.action-buttons {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 右侧问答消息气泡样式 */
.qa-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.qa-message {
  max-width: 85%;
  align-self: flex-end;
  /* 发送者气泡靠右 */
  background: #e1f0ff;
  border: 1px solid #cfe3ff;
  padding: 8px 12px;
  border-radius: 16px 16px 4px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.qa-message-left {
  align-self: flex-start;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 16px 4px 16px 16px;
}

.qa-message-text {
  color: #0f172a;
  font-size: calc(13px * var(--font-scale));
  line-height: 1.5;
}

.qa-message-status {
  margin-top: 4px;
  font-size: calc(12px * var(--font-scale));
  color: #6b7280;
}

.qa-center-status {
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

.qa-thinking {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.qa-thinking .dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  animation: qa-bounce 1.2s infinite;
  opacity: 0.8;
}

.qa-thinking .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.qa-thinking .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes qa-bounce {

  0%,
  80%,
  100% {
    transform: scale(0.85);
    opacity: 0.6;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: calc(12px * var(--font-scale));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.save-script {
  background: #343a40;
  color: white;
}

.action-btn.save-script:hover {
  background: #23272b;
}

.action-btn.add-scene {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.action-btn.add-scene:hover {
  background: #e9ecef;
}

.action-btn.generate-video {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.action-btn.generate-video:hover {
  background: #e9ecef;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 60px;
}

.input-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.user-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: calc(14px * var(--font-scale));
  color: #333;
  background: transparent;
}

.user-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: calc(16px * var(--font-scale));
  font-weight: bold;
  flex-shrink: 0;
}

.submit-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.submit-icon {
  display: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.card-scroller {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.detail-card {
  flex: 0 0 260px;
  width: 260px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.detail-card-text {
  padding: 12px;
}

.detail-title {
  font-size: calc(15px * var(--font-scale));
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.detail-sub {
  font-size: calc(13px * var(--font-scale));
  color: #4b5563;
  line-height: 1.5;
}

.detail-card-image img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.detail-card-placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  font-size: calc(14px * var(--font-scale));
  cursor: pointer;
}

/* Skeleton */
.skeleton-block {
  padding: 10px 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-paragraph {
  height: 80px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-paragraph.short {
  height: 40px;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-card {
  height: 60px;
  border-radius: 8px;
  margin-top: 8px;
  background: linear-gradient(90deg, #eceff1 25%, #f5f7fa 37%, #eceff1 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.image-clickable {
  cursor: zoom-in;
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.image-preview-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card-scroller {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.detail-card {
  flex: 0 0 260px;
  width: 260px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.detail-card-text {
  padding: 12px;
}

.detail-title {
  font-size: calc(15px * var(--font-scale));
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.detail-sub {
  font-size: calc(13px * var(--font-scale));
  color: #4b5563;
  line-height: 1.5;
}

.detail-card-image img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.detail-card-placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  font-size: calc(14px * var(--font-scale));
  cursor: pointer;
}

.aspect-ratio-select {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
}

.aspect-label {
  color: #374151;
  font-size: calc(12px * var(--font-scale));
}

.aspect-options {
  display: inline-flex;
  gap: 8px;
}

.aspect-option {
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  background: #fff;
  color: #374151;
  font-size: calc(12px * var(--font-scale));
  cursor: pointer;
  transition: all 0.2s ease;
}

.aspect-option:hover {
  background: #F9FAFB;
}

.aspect-option.active {
  background: rgba(59, 130, 246, 0.10);
  border-color: #3b82f6;
  color: #1f2937;
}
</style>
