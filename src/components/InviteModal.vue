<template>
  <div v-if="visible" class="invite-overlay" @click="handleOverlayClick">
    <div class="invite-modal" @click.stop>
      <button class="close-btn" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="invite-header">
        <h2 class="title">织梦 邀请有礼</h2>
        <p class="subtitle">邀请好友开启创作之旅，一起分享更多奖励</p>
        <p class="subtitle highlight">每成功邀请1位好友注册，即可双方各获得100积分</p>
      </div>

      <div class="gold-card">
        <div class="card-content">
          <div class="card-label">你的专属邀请码</div>
          <div class="card-code">{{ displayCode }}</div>
          <button class="copy-btn" @click="copyShareLink">复制邀请码</button>
        </div>
        <div class="card-decoration">
          <!-- Silver/Gold Badge Representation -->
          <div class="badge-icon">
             <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
               <circle cx="12" cy="12" r="10" fill="#e0e0e0" stroke="#fff" stroke-width="2"/>
               <path d="M12 7v10M7 12h10" stroke="#999" stroke-width="2" stroke-linecap="round"/>
               <path d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12" stroke="#e0e0e0" stroke-width="2"/>
             </svg>
             <div class="ribbon-tail"></div>
          </div>
        </div>
      </div>

      <div class="section-title">邀请奖励</div>
      <div class="rewards-card">
        <div class="progress-container">
          <div class="progress-line"></div>
          <div class="progress-nodes">
            <div class="node" v-for="i in 8" :key="i">
              <div class="node-dot">◆</div>
              <div class="node-val">100</div>
            </div>
            <div class="node special">
              <div class="node-icon-star">✨</div>
              <div class="node-val">200</div>
              <div class="node-label">满十人</div>
            </div>
            <div class="node">
              <div class="node-dot">◆</div>
              <div class="node-val">100</div>
              <div class="node-label">后续</div>
            </div>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-label">累计邀请 {{ totalInvites }}</div>
          </div>
          <div class="stat-divider">|</div>
          <div class="stat-item">
            <div class="stat-label">获得积分 {{ totalPoints }}</div>
          </div>
        </div>
      </div>

      <div class="section-title">邀请步骤</div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div class="step-name">第一步</div>
          <div class="step-desc">复制链接分享邀请码</div>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="step-name">第二步</div>
          <div class="step-desc">邀请好友注册 织梦</div>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="20 12 20 22 4 22 4 12"></polyline>
              <rect x="2" y="7" width="20" height="5"></rect>
              <line x1="12" y1="22" x2="12" y2="7"></line>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
            </svg>
          </div>
          <div class="step-name">第三步</div>
          <div class="step-desc">双方均获得积分奖励</div>
        </div>
      </div>

      <div v-if="toastVisible" class="toast">{{ toastText }}</div>
    </div>
  </div>
</template>

<script>
import { getInvitationCode, getInvitationStats } from '@/api'

export default {
  name: 'InviteModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  data() {
    return {
      loading: false,
      invitationCode: '',
      stats: null,
      toastVisible: false,
      toastText: ''
    }
  },
  computed: {
    displayCode() {
      return this.invitationCode || '—'
    },
    totalInvites() {
      const d = this.stats || {}
      return d.totalInvites != null ? d.totalInvites : (d.inviteCount != null ? d.inviteCount : (d.data && d.data.totalInvites != null ? d.data.totalInvites : 0))
    },
    totalPoints() {
      const d = this.stats || {}
      return d.totalPoints != null ? d.totalPoints : (d.points != null ? d.points : (d.data && d.data.totalPoints != null ? d.data.totalPoints : 0))
    }
  },
  watch: {
    visible(v) {
      if (v) this.fetchAll()
    }
  },
  methods: {
    async fetchAll() {
      if (this.loading) return
      this.loading = true
      try {
        let codeRes = null
        try { codeRes = await getInvitationCode({ token: this.token }) } catch (e) { codeRes = null }
        let statsRes = null
        try { statsRes = await getInvitationStats({ token: this.token }) } catch (e) { statsRes = null }
        
        let codeStr = ''
        try {
          const obj = typeof codeRes === 'string' ? JSON.parse(codeRes) : codeRes
          codeStr = obj && (obj.code || (obj.data && (obj.data.code || obj.data.invitationCode)) || obj.invitationCode || '')
        } catch (e) {
          codeStr = ''
        }
        this.invitationCode = String(codeStr || '').replace(/[`]/g, '').trim()
        
        try {
          this.stats = typeof statsRes === 'string' ? JSON.parse(statsRes) : statsRes
        } catch (e) {
          this.stats = { totalInvites: 0, totalPoints: 0 }
        }

        if (!this.invitationCode) {
          this.showToast('邀请接口连接失败')
        }
      } finally {
        this.loading = false
      }
    },
    handleOverlayClick() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
    async copyShareLink() {
      const code = String(this.invitationCode || '').trim()
      try {
        if (!code) {
          this.showToast('复制失败')
          return
        }
        await navigator.clipboard.writeText(code)
        this.showToast('邀请码已复制')
      } catch (e) {
        this.showToast('复制失败')
      }
    },
    showToast(msg) {
      this.toastText = msg
      this.toastVisible = true
      setTimeout(() => { this.toastVisible = false }, 1500)
    }
  }
}
</script>

<style scoped>
.invite-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3100;
  backdrop-filter: blur(5px);
}

.invite-modal {
  background: #ffffff;
  width: 600px;
  max-width: 90vw;
  border-radius: 24px;
  padding: 32px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  color: #333;
  transition: all 0.3s ease;
}

[data-theme="dark"] .invite-modal {
  background: #141414;
  color: #fff;
  border: 1px solid #333;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0,0,0,0.05);
}

[data-theme="dark"] .close-btn:hover {
  background: rgba(255,255,255,0.1);
}

.invite-header {
  text-align: center;
  margin-bottom: 16px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
}


.subtitle {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

[data-theme="dark"] .subtitle {
  color: #aaa;
}

.subtitle.highlight {
  color: #999;
  font-size: 13px;
}

/* Gold Card */
.gold-card {
  background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(237, 143, 3, 0.3);
}

.card-content {
  position: relative;
  z-index: 2;
  text-align: center;
  flex: 1;
}

.card-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-bottom: 8px;
}

.card-code {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.copy-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #d97706;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.1s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.copy-btn:active {
  transform: scale(0.96);
}

.card-decoration {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;
}

.badge-icon svg {
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

/* Rewards Section */
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

[data-theme="dark"] .section-title {
  color: #ddd;
}

.rewards-card {
  background: #f9f9f9;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

[data-theme="dark"] .rewards-card {
  background: #2a2a2a;
}

.progress-container {
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}


.progress-line {
  position: absolute;
  top: 50%;
  left: 10px;
  right: 10px;
  height: 2px;
  background: #ddd;
  transform: translateY(-50%);
  z-index: 1;
}

[data-theme="dark"] .progress-line {
  background: #444;
}

.progress-nodes {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 2;
  padding: 0 10px;
}

.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.node-dot {
  color: #ccc;
  font-size: 10px;
  background: #f9f9f9;
  padding: 0 2px;
}

[data-theme="dark"] .node-dot {
  background: #2a2a2a;
  color: #555;
}

.node-val {
  font-size: 10px;
  color: #999;
}

.node.special .node-icon-star {
  font-size: 16px;
  background: #f9f9f9;
  padding: 0 4px;
}

[data-theme="dark"] .node.special .node-icon-star {
  background: #2a2a2a;
}

.node.special .node-val {
  color: #d97706;
  font-weight: 600;
}

.node-label {
  font-size: 10px;
  color: #666;
  position: absolute;
  bottom: -18px;
  white-space: nowrap;
}

[data-theme="dark"] .node-label {
  color: #999;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

[data-theme="dark"] .stats-row {
  border-top-color: #333;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

[data-theme="dark"] .stat-label {
  color: #bbb;
}

.stat-divider {
  color: #ddd;
}

/* Steps Section */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.step-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

[data-theme="dark"] .step-card {
  background: #2a2a2a;
}

.step-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  margin-bottom: 12px;
  color: #666;
}

[data-theme="dark"] .step-icon {
  background: rgba(255,255,255,0.1);
  color: #ddd;
}

.step-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

[data-theme="dark"] .step-desc {
  color: #eee;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
