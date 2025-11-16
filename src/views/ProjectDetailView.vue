<template>
  <div class="project-detail">
    <!-- 左侧内容区域 -->
    <div class="left-content">
      <!-- 题目和时间 -->
      <div class="project-header">
        <h1 class="project-title">{{ project.title }}</h1>
        <p class="project-time">创建于 {{ project.createdAt }}</p>
        <!-- <p class="project-time">视频ID：{{ videoId }}</p> -->
      </div>
      <div>
        <h3 class="section-title">艺术指导建议</h3>
        <div v-if="generated.artDirection">
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
        <div v-if="generated.musicStyle && generated.musicStyle.length">
          <div v-for="(m, idx) in generated.musicStyle" :key="idx">
            <div>音乐流派：{{ m.Music_Genre }}</div>
            <div>情绪氛围：{{ m.Emotional_Atmosphere }}</div>
            <div>关键乐器：{{ m.Key_Instruments }}</div>
            <div>节奏特征：{{ m.Rhythmic_Characteristics }}</div>
          </div>
        </div>

        <h3 class="section-title">剧本摘要</h3>
        <div v-if="generated.scriptSummary" class="section-content" v-html="renderMarkdown(generated.scriptSummary)">
        </div>

        <h3 class="section-title">人物信息</h3>
        <div v-if="generated.people && generated.people.length">
          <div v-for="(p, idx) in generated.people" :key="idx" class="character-item">
            <div class="character-header">
              <img
                v-if="p.Character_picture && !isGenerateFailed(p.Character_picture)"
                :src="cleanUrl(p.Character_picture)"
                alt="人物图片"
                class="character-avatar"
              />
              <div v-else class="character-avatar character-avatar--placeholder" @click="handleRegenerateCharacter(p)">重新生成</div>
              <div class="character-info">
                <div class="character-name">姓名：{{ p.Character_Name }}</div>
                <div>身份：{{ p.Role_in_Story }}</div>
                <div>外观：{{ p.Appearance }}</div>
              </div>
            </div>
          </div>
        </div>

        <h3 class="section-title">场景集合</h3>
        <div v-if="generated.scenes && generated.scenes.length">
          <div v-for="(s, idx) in generated.scenes" :key="idx" style="margin-bottom: 10px;">
            <div>场景名称：{{ s.Scene_Name }}</div>
            <div>场景元素：{{ s.Scene_Elements }}</div>
            <div v-if="s.Scene_picture_url">
              图片：
              <template v-if="!isGenerateFailed(s.Scene_picture_url)">
                <img :src="cleanUrl(s.Scene_picture_url)" alt="场景图片" class="scene-image" />
              </template>
              <div v-else class="scene-image-placeholder" @click="handleRegenerateScene(s)">重新生成</div>
            </div>
          </div>
        </div>

        <h3 class="section-title">分镜故事板</h3>
        <div v-if="generated.storyboard && generated.storyboard.length">
          <div v-for="(scene, sIdx) in generated.storyboard" :key="sIdx" style="margin-bottom: 10px;">
            <div>场景：{{ scene.scene_title }}</div>
            <div v-if="scene.shots && scene.shots.length">
              <div v-for="(shot, idx) in scene.shots" :key="idx"
                style="margin: 6px 0; padding: 6px 8px; border: 1px solid #eee; border-radius: 6px;">
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
            <div class="step-item completed">
              <div class="step-icon">✓</div>
              <div class="step-content">
                <div class="step-title">剧本摘要</div>
                <div class="step-description">概述剧本核心内容</div>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">✓</div>
              <div class="step-content">
                <div class="step-title">艺术指导建议</div>
                <div class="step-description">设定整体视觉与风格方向</div>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">✓</div>
              <div class="step-content">
                <div class="step-title">音乐风格</div>
                <div class="step-description">明确音乐基调与节奏</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">⏳</div>
              <div class="step-content">
                <div class="step-title">角色信息</div>
                <div class="step-description">梳理主要角色信息</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">⏳</div>
              <div class="step-content">
                <div class="step-title">场景集合</div>
                <div class="step-description">汇总关键场景要素</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-icon">⏳</div>
              <div class="step-content">
                <div class="step-title">分镜故事板</div>
                <div class="step-description">组织分镜与镜头安排</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 问答消息列表 -->
        <div class="qa-messages">
          <div v-for="(m, i) in messages" :key="m.id" class="qa-message">
            <div class="qa-message-text">{{ m.text }}</div>
            <div class="qa-message-status" v-if="m.status"><span v-if="m.status === '思考中'" class="qa-thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span><span v-else>{{ m.status }}</span></div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons" v-show="!isSubmitting">
          <!-- <button class="action-btn save-script">保存剧本</button>
          <button class="action-btn add-scene">添加场景</button> -->
          <button class="action-btn generate-video" @click="generateVideo">生成分镜</button>
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
</template>

<script>
import { scriptModifyStream, regenerateImage, queryRegenerateImage, getScriptDetailByVideo } from '@/api'
import { useUserStore } from '@/stores/user'
export default {
  name: 'ProjectDetailView',
  data() {
    return {
      userInput: '',
      videoId: '',
      messages: [],
      isSubmitting: false,
      prompt: '',
      category: '',
      materialId: '',
      generated: {
        scriptSummary: '',
        artDirection: null,
        musicStyle: [],
        storyboard: [],
        people: [],
        scenes: []
      },
      project: {
        title: '十二生肖起源记',
        createdAt: '2023/11/20 02:05',
        duration: '9:16',
        aspectRatio: '16:9',
        wordCount: '4.4',
        videoType: '教育科普类',
        contentSummary: '以幽默风趣的方式来讲述中国传统十二生肖的起源故事，讲述各种动物为争夺生肖排名的故事，作者通过现代化的叙述手法来十二生肖的起源故事中的传统文化。',
        highlights: [
          '开篇直接切入情境，通过开篇的问题引入',
          '主题突出：以幽默有趣的大对话'
        ],
        scenes: [
          {
            opening: '在很久很久以前，玉帝决定为十二种动物命名为生肖，举行了一场比赛。',
            vivid: '动物竞赛大对决',
            action: '工作画面展示，老鼠偷偷爬到牛背上，在最后一刻跳下来，成为第一名。'
          },
          {
            opening: '生动有趣：动物竞赛大对决',
            vivid: '动作场景：工作画面展示，各动物奋勇争先，老鼠坐在牛背上，最后跳下终点线。',
            action: '老鼠偷偷爬到牛背上，在最后一刻跳下来，成为第一名。'
          }
        ]
      }
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  methods: {
    async generateVideo() {
      const projectId = this.$route.params.id
      const token = (this.userStore && this.userStore.token) || ''
      if (!token) {
        console.warn('未登录，无法生成分镜图片')
        try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
        return
      }
      // 跳转到生成步骤页，流式生成在 GenerationStepsView 中进行
      this.$router.push(`/generation-steps/${projectId}`)
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
      this.isSubmitting = true
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
        await scriptModifyStream({
          modificationSuggestions: suggestion,
          videoId,
          token,
          onEvent: (obj) => {
            if (!obj || obj.type === 'connected') return
            this.applyParsedData([obj])
          }
        })
      } catch (e) {
        console.error('剧本修改接口调用失败:', e)
      } finally {
        // 接口完成后在发送内容下添加节点“思考完成”，并恢复按钮显示
        const lastIndex = this.messages.length - 1
        if (lastIndex >= 0) {
          this.messages[lastIndex].status = '思考完成'
        }
        this.isSubmitting = false
      }
    },
    cleanUrl(u) {
      const str = (u || '').toString()
      return str.replace(/`/g, '').trim()
    },
    // 接口生成失败检测：包含“失败/fail/error”则视为失败
    isGenerateFailed(u) {
      const s = (u || '').toString().trim()
      if (!s) return false // 空不视为失败，仅当接口明确返回失败信息时显示占位
      return /失败|fail|error/i.test(s)
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
        const generateUuid = resp.generate_uuid || (resp.raw && resp.raw.data && resp.raw.data.generateUuid)
        if (!generateUuid) {
          console.warn('未获取到 generateUuid，无法查询结果', resp)
          return
        }
        const q = await queryRegenerateImage({ videoId, type, name, generateUuid, token })
        const url = (q && q.urls && q.urls[0] && q.urls[0].imageUrl) || (q && q.raw && q.raw.data && q.raw.data.images && q.raw.data.images[0] && q.raw.data.images[0].imageUrl)
        if (url) {
          s.Scene_picture_url = url
        } else {
          console.warn('查询接口未返回图片地址', q)
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
        const generateUuid = resp.generate_uuid || (resp.raw && resp.raw.data && resp.raw.data.generateUuid)
        if (!generateUuid) {
          console.warn('未获取到 generateUuid，无法查询结果', resp)
          return
        }
        const q = await queryRegenerateImage({ videoId, type, name, generateUuid, token })
        const url = (q && q.urls && q.urls[0] && q.urls[0].imageUrl) || (q && q.raw && q.raw.data && q.raw.data.images && q.raw.data.images[0] && q.raw.data.images[0].imageUrl)
        if (url) {
          p.Character_picture = url
        } else {
          console.warn('查询接口未返回图片地址', q)
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
        }
        if (o.Music_Style) {
          this.generated.musicStyle = Array.isArray(o.Music_Style) ? o.Music_Style : [o.Music_Style]
        }
        if (o.Script_Summary) {
          this.generated.scriptSummary = o.Script_Summary
          this.project.contentSummary = o.Script_Summary
        }
        if (o.Storyboard) {
          const sb = o.Storyboard.Storyboard || o.Storyboard
          this.generated.storyboard = Array.isArray(sb) ? sb : []
        }
        if (o.people) {
          this.generated.people = o.people
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
                    dialogue_or_narration: c.dialogue_or_narration || ''
                  })
                }
                this.generated.storyboard = Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] }))
              }
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
                  dialogue_or_narration: c.dialogue_or_narration || ''
                })
              }
              this.generated.storyboard = Object.keys(grouped).map(t => ({ scene_title: t, shots: grouped[t] }))
            }
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
      const sseText = localStorage.getItem(`project:script:${projectId}`) || ''
      this.videoId = localStorage.getItem(`project:videoId:${projectId}`) || projectId
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
        // 无缓存时回退调用接口
        const token = (this.userStore && this.userStore.token) || ''
        if (token) {
          try {
            const text = await getScriptDetailByVideo({ videoId: this.videoId || projectId, token })
            let obj = null
            try { obj = JSON.parse(text) } catch (e) { console.warn('剧本详情接口返回解析失败:', e) }
            const dataObj = obj && obj.data ? obj.data : obj
            if (dataObj) {
              try { localStorage.setItem(`project:script_detail_json:${projectId}`, text) } catch (e) { /* no-op */ }
              if (dataObj.title) this.project.title = dataObj.title
              this.applyParsedData([dataObj])
            }
          } catch (e) {
            console.error('获取剧本详情失败:', e)
          }
        }
      }
    } catch (e) {
      console.warn('读取生成内容失败:', e)
    }
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
}

.project-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  line-height: 1.2;
}

.project-time {
  font-size: 13px;
  color: #6b7280;
}

.section-title {
  font-size: 16px;
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
  font-size: 18px;
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
  font-size: 13px;
  color: #374151;
}

/* Markdown 文本样式 */
.left-content .section-content {
  color: #4b5563;
  font-size: 14px;
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
  font-size: 12px;
  cursor: pointer;
}
.character-info { flex: 1; }
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
  font-size: 13px;
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
  font-size: 13px;
  line-height: 1.4;
}

.highlight-icon {
  margin-right: 8px;
  font-size: 14px;
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
  font-size: 13px;
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
  font-size: 12px;
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
  background: transparent;
  border-radius: 8px;
  padding: 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 12px;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-item.completed:nth-child(1) {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-item.completed:nth-child(2) {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-item.completed:nth-child(3) {
  background: #cce7ff;
  border-left-color: #007bff;
}

.step-item:not(.completed) {
  background: #f8f9fa;
  border-left-color: #dee2e6;
}

.step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-right: 8px;
  flex-shrink: 0;
}

.step-item.completed .step-icon {
  background: #28a745;
  color: white;
}

.step-item:not(.completed) .step-icon {
  background: #6c757d;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.step-description {
  color: #666;
  line-height: 1.4;
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
  align-self: flex-end; /* 发送者气泡靠右 */
  background: #e1f0ff;
  border: 1px solid #cfe3ff;
  padding: 8px 12px;
  border-radius: 16px 16px 4px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.qa-message-text {
  color: #0f172a;
  font-size: 13px;
  line-height: 1.5;
}

.qa-message-status {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
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

.qa-thinking .dot:nth-child(2) { animation-delay: 0.2s; }
.qa-thinking .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes qa-bounce {
  0%, 80%, 100% { transform: scale(0.85); opacity: 0.6; }
  40% { transform: scale(1); opacity: 1; }
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
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
  font-size: 14px;
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
  font-size: 16px;
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
</style>
