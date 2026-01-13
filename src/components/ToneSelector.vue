<template>
  <div v-if="visible" class="tone-selector-overlay" @click.self="close">
    <div class="tone-selector-modal">
      <div class="modal-header">
        <h3 class="modal-title">音色选择</h3>
        <button class="close-btn" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="filter-bar">
        <div class="tabs">
          <!-- <div
            class="tab-item"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            所有音色
          </div> -->
          <!-- <div
            class="tab-item"
            :class="{ active: activeTab === 'favorites' }"
            @click="activeTab = 'favorites'"
          >
            收藏音色
          </div> -->
        </div>

        <div class="filter-group">
          <div class="select-wrapper">
            <select v-model="selectedGender" class="custom-select">
              <option value="">性别</option>
              <option v-for="gender in uniqueGenders" :key="gender" :value="gender">{{ toZhGender(gender) }}</option>
            </select>
            <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- <div class="select-wrapper">
            <select v-model="selectedAge" class="custom-select">
              <option value="">年龄</option>
              <option value="少年">少年</option>
              <option value="青年">青年</option>
              <option value="中年">中年</option>
              <option value="老年">老年</option>
            </select>
            <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div> -->
          <!-- <div class="select-wrapper">
            <select v-model="selectedLanguageFilter" class="custom-select">
              <option value="">语言</option>
              <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">{{ toZhLanguage(lang) }}</option>
            </select>
            <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div> -->
        </div>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>加载音色列表中...</span>
        </div>
        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>
        <div v-else class="tone-grid">
          <div
            v-for="tone in filteredTones"
            :key="tone.voiceName"
            class="tone-card"
            :class="{ selected: selectedToneId === tone.voiceName }"
            @click="selectToneLocal(tone)"
          >
            <div class="tone-icon-wrapper" @click.stop="playSample(tone)">
               <svg v-if="currentPlaying !== tone.voiceName" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                 <path d="M8 5v14l11-7z"/>
               </svg>
               <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                 <rect x="6" y="4" width="4" height="16" rx="1" />
                 <rect x="14" y="4" width="4" height="16" rx="1" />
               </svg>
            </div>
            <div class="tone-info">
              <div class="tone-name">{{ tone.name || tone.voiceName }}</div>
              <div class="tone-tags">
                <span class="tag">{{ toZhGender(tone.gender) }}</span>
                <span class="tag">{{ tone.ageTag || tone.ageGroup }}</span>
                <!-- <span class="tag">{{ getDisplayLanguage(tone) }}</span> -->
                 <span class="tag">多语种</span>
              </div>
            </div>
            <!-- <div class="tone-favorite" @click.stop="toggleFavorite(tone)">
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(tone) ? '#FFC107' : 'none'" :stroke="isFavorite(tone) ? '#FFC107' : 'currentColor'" stroke-width="2">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div> -->
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="confirm-btn" @click="confirmSelection" :disabled="!selectedToneId">
          选择音色
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getTonesList } from '@/api'
import { useUserStore } from '@/stores/user'

export default {
  name: 'ToneSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modelName: {
      type: String,
      default: 'qwen3-TTS-Flash'
    }
  },
  emits: ['close', 'select'],
  data() {
    return {
      tones: [],
      loading: false,
      error: null,
      currentPlaying: null,
      audioPlayer: null,
      selectedGender: '',
      selectedAge: '',
      selectedLanguageFilter: '',
      activeTab: 'all',
      selectedToneId: null,
      selectedToneData: null,
      favorites: []
    }
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  mounted() {
    if (this.visible) {
      this.fetchTones()
    }
    // Load favorites from local storage
    try {
      const saved = localStorage.getItem('favoriteTones')
      if (saved) {
        this.favorites = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load favorites', e)
    }
  },
  computed: {
    uniqueGenders() {
      const genders = new Set(this.tones.map(t => t.gender).filter(Boolean))
      return Array.from(genders)
    },
    uniqueLanguages() {
      const langs = new Set()
      this.tones.forEach(t => {
        if (t.supportedLanguages && Array.isArray(t.supportedLanguages)) {
          t.supportedLanguages.forEach(l => langs.add(l))
        } else if (t.language) {
          langs.add(t.language)
        }
      })
      return Array.from(langs)
    },
    filteredTones() {
      let result = this.tones

      if (this.activeTab === 'favorites') {
        result = result.filter(t => this.favorites.includes(t.voiceName))
      }

      return result.filter(tone => {
        const matchGender = !this.selectedGender || tone.gender === this.selectedGender
        const age = tone.ageTag || tone.ageGroup
        const matchAge = !this.selectedAge || age === this.selectedAge

        let matchLang = !this.selectedLanguageFilter
        if (!matchLang) {
          if (tone.supportedLanguages && Array.isArray(tone.supportedLanguages)) {
            matchLang = tone.supportedLanguages.includes(this.selectedLanguageFilter)
          } else {
            matchLang = tone.language === this.selectedLanguageFilter
          }
        }
        return matchGender && matchAge && matchLang
      })
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchTones()
        this.selectedToneId = null
        this.selectedToneData = null
      } else {
        this.stopPlayback()
      }
    }
  },
  methods: {
    toZhGender(g) {
      const s = String(g || '').trim().toLowerCase()
      const map = {
        'male': '男性',
        'man': '男性',
        'boy': '男性',
        'female': '女性',
        'woman': '女性',
        'girl': '女性',
        'neutral': '中性',
        'unknown': '未知'
      }
      return map[s] || g
    },
    getDisplayLanguage(tone) {
      const lang = (tone.supportedLanguages && tone.supportedLanguages[0]) || tone.language
      return this.toZhLanguage(lang)
    },
    toZhLanguage(lang) {
      const s = String(lang || '').trim().toLowerCase()
      const map = {
        'chinese': '普通话', 'zh': '普通话', 'zh-cn': '普通话', 'zh-tw': '普通话', 'cn': '普通话', 'yue': '粤语', 'cantonese': '粤语',
        'english': '英语', 'en': '英语',
        'japanese': '日语', 'ja': '日语',
        'korean': '韩语', 'ko': '韩语',
        'french': '法语', 'fr': '法语',
        'german': '德语', 'de': '德语',
        'spanish': '西班牙语', 'es': '西班牙语',
        'italian': '意大利语', 'it': '意大利语',
        'russian': '俄语', 'ru': '俄语',
        'portuguese': '葡萄牙语', 'pt': '葡萄牙语',
        'hindi': '印地语', 'hi': '印地语',
        'arabic': '阿拉伯语', 'ar': '阿拉伯语'
      }
      return map[s] || lang
    },
    async fetchTones() {
      this.loading = true
      this.error = null
      try {
        const res = await getTonesList({
          modelName: this.modelName,
          token: this.userStore.token
        })
        let data
        try {
          data = JSON.parse(res)
        } catch (e) {
          data = res
        }

        if (data && (data.code === 200 || data.code === 0)) {
          this.tones = Array.isArray(data.data) ? data.data : []
        } else {
          this.error = (data && data.message) || '获取音色列表失败'
        }
      } catch (e) {
        console.error(e)
        this.error = '网络错误'
      } finally {
        this.loading = false
      }
    },
    playSample(tone) {
      if (this.currentPlaying === tone.voiceName) {
        this.stopPlayback()
        return
      }

      this.stopPlayback()
      const url = tone.sampleAudioUrl || tone.sampleUrl || tone.previewUrl || tone.url
      if (url) {
        this.audioPlayer = new Audio(url)
        this.audioPlayer.onended = () => {
          this.currentPlaying = null
        }
        this.audioPlayer.play().catch(e => console.error(e))
        this.currentPlaying = tone.voiceName
      }
    },
    stopPlayback() {
      if (this.audioPlayer) {
        this.audioPlayer.pause()
        this.audioPlayer = null
      }
      this.currentPlaying = null
    },
    selectToneLocal(tone) {
      this.selectedToneId = tone.voiceName
      this.selectedToneData = tone
    },
    confirmSelection() {
      if (this.selectedToneData) {
        const tone = this.selectedToneData
        const languages = Array.isArray(tone.supportedLanguages) ? tone.supportedLanguages : []
        const lang = languages.length > 0 ? languages[0] : (tone.language || 'Chinese')

        this.$emit('select', {
          name: tone.name || tone.voiceName,
          voiceName: tone.voiceName,
          language: lang,
          gender: tone.gender,
          age: tone.ageTag || tone.ageGroup,
          style: lang || tone.language,
          supportedLanguages: Array.isArray(tone.supportedLanguages) ? tone.supportedLanguages : ((tone.language && [tone.language]) || [])
        })
        this.close()
      }
    },
    isFavorite(tone) {
      return this.favorites.includes(tone.voiceName)
    },
    toggleFavorite(tone) {
      const idx = this.favorites.indexOf(tone.voiceName)
      if (idx === -1) {
        this.favorites.push(tone.voiceName)
      } else {
        this.favorites.splice(idx, 1)
      }
      localStorage.setItem('favoriteTones', JSON.stringify(this.favorites))
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.tone-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.tone-selector-modal {
  background: #fff;
  width: 900px;
  height: 600px;
  max-height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes modalSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 24px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.filter-bar {
  padding: 0 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 24px;
}

.tab-item {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: color 0.2s;
}

.tab-item.active {
  color: #333;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #1890ff;
  border-radius: 2px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select {
  appearance: none;
  padding: 6px 32px 6px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 80px;
}

.custom-select:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #999;
  width: 14px;
  height: 14px;
}

.custom-select:hover + .select-arrow {
  color: #1890ff;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #f8f9fa;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #eee;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tone-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tone-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  position: relative;
}

.tone-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.tone-card.selected {
  border-color: #1890ff;
}

.tone-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #e6f7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #1890ff;
  flex-shrink: 0;
  transition: background 0.2s;
}

.tone-icon-wrapper:hover {
  background: #1890ff;
  color: #fff;
}

.tone-info {
  flex: 1;
  overflow: hidden;
}

.tone-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tone-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.tone-favorite {
  padding: 8px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.tone-favorite:hover {
  color: #FFC107;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background: #fff;
}

.confirm-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  padding: 10px 32px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-btn:hover {
  background: #096dd9;
}

.confirm-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .tone-selector-modal {
    background: #1f1f1f;
  }
  .modal-title {
    color: #fff;
  }
  .close-btn {
    color: #ccc;
  }
  .close-btn:hover {
    color: #fff;
  }
  .filter-bar {
    border-bottom-color: #333;
  }
  .tab-item {
    color: #aaa;
  }
  .tab-item.active {
    color: #fff;
  }
  .custom-select {
    background: #1f1f1f;
    border-color: #333;
    color: #ccc;
  }
  .custom-select:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
  .select-arrow {
    color: #666;
  }
  .modal-body {
    background: #141414;
  }
  .tone-card {
    background: #1f1f1f;
    border-color: transparent;
  }
  .tone-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    background: #262626;
  }
  .tone-card.selected {
    border-color: #1890ff;
  }
  .tone-name {
    color: #fff;
  }
  .tag {
    background: #333;
    color: #aaa;
  }
  .modal-footer {
    background: #1f1f1f;
    border-top-color: #333;
  }
  .tone-icon-wrapper {
    background: rgba(24, 144, 255, 0.15);
  }
  .tone-icon-wrapper:hover {
    background: #1890ff;
  }
  .confirm-btn:disabled {
    background: #333;
    color: #666;
  }
}

[data-theme="dark"] .tone-selector-modal {
  background: #1f1f1f;
}
[data-theme="dark"] .modal-title {
  color: #fff;
}
[data-theme="dark"] .close-btn {
  color: #ccc;
}
[data-theme="dark"] .close-btn:hover {
  color: #fff;
}
[data-theme="dark"] .filter-bar {
  border-bottom-color: #333;
}
[data-theme="dark"] .tab-item {
  color: #aaa;
}
[data-theme="dark"] .tab-item.active {
  color: #fff;
}
[data-theme="dark"] .custom-select {
  background: #1f1f1f;
  border-color: #333;
  color: #ccc;
}
[data-theme="dark"] .custom-select:hover {
  border-color: #1890ff;
  color: #1890ff;
}
[data-theme="dark"] .select-arrow {
  color: #666;
}
[data-theme="dark"] .modal-body {
  background: #141414;
}
[data-theme="dark"] .tone-card {
  background: #1f1f1f;
  border-color: transparent;
}
[data-theme="dark"] .tone-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  background: #262626;
}
[data-theme="dark"] .tone-card.selected {
  border-color: #1890ff;
}
[data-theme="dark"] .tone-name {
  color: #fff;
}
[data-theme="dark"] .tag {
  background: #333;
  color: #aaa;
}
[data-theme="dark"] .modal-footer {
  background: #1f1f1f;
  border-top-color: #333;
}
[data-theme="dark"] .tone-icon-wrapper {
  background: rgba(24, 144, 255, 0.15);
}
[data-theme="dark"] .tone-icon-wrapper:hover {
  background: #1890ff;
}
[data-theme="dark"] .confirm-btn:disabled {
  background: #333;
  color: #666;
}
</style>
