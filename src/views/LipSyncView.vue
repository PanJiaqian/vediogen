<template>
  <div class="lip-sync-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回
        </button>
        <span class="page-title">对口型</span>
      </div>
      <div class="navbar-right">
        <div class="header-items">
          <div class="header-item points-display" @click="showPointsModal = true" v-if="isLoggedIn">
            <span class="points-val">✨ {{ userBasicInfo.pointsBalance || 0 }}</span>
          </div>
          <div class="header-item membership-btn" v-if="!isVip" @click="showMembershipModal = true">开通会员</div>
          <div class="header-item invite-btn" @click="showInviteModal = true">邀请有礼</div>
          <div class="header-item theme-toggle" @click="toggleTheme" :aria-label="isDark ? '切换为浅色' : '切换为深色'">
            <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="isLoggedIn" class="user-info">
            <img :src="userBasicInfo.avatar || currentUser.avatar || '/logo.png'" class="user-avatar" alt="avatar">
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧分镜图片区域 -->
      <div class="left-panel">
        <div class="scene-preview">
          <div class="scene-image-container">
            <img :src="imageUrl || '/logo.png'" alt="分镜图片" class="scene-image" />
          </div>
          <!-- <div class="scene-info">
            <h3 class="scene-title">{{ sceneTitle || '分镜' }}</h3>
            <p class="scene-description">{{ sceneDescription || '' }}</p>
          </div> -->
        </div>
      </div>

      <!-- 右侧数字人工具栏区域 -->
      <div class="right-panel">
        <DigitalHumanToolbar ref="toolbar" :detection="detection" :imageFile="null" :videoId="videoId" :shotId="shotId" :workId="workId" @task-created="$emit('task-created', $event)" />
      </div>
    </div>
    <MembershipModal :visible="showMembershipModal" @close="showMembershipModal = false" />
    <PointsModal :visible="showPointsModal" :userInfo="{ ...currentUser, ...userBasicInfo }" @close="showPointsModal = false" />
    <InviteModal :visible="showInviteModal" @close="showInviteModal = false" :token="userStore.token" />
  </div>
</template>

<script>
import DigitalHumanToolbar from '@/components/DigitalHumanToolbar.vue'
import MembershipModal from '@/components/MembershipModal.vue'
import PointsModal from '@/components/PointsModal.vue'
import InviteModal from '@/components/InviteModal.vue'
import { useUserStore } from '@/stores/user'
import { getUserBasicStatus } from '@/api'

export default {
  name: 'LipSyncView',
  components: {
    DigitalHumanToolbar,
    MembershipModal,
    PointsModal,
    InviteModal
  },
  props: {
    imageUrl: { type: String, default: '' },
    sceneTitle: { type: String, default: '' },
    sceneDescription: { type: String, default: '' },
    detection: { type: [Object, String], default: null },
    videoId: { type: [String, Number], default: '' },
    shotId: { type: String, default: '' }
    , workId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      // 页面数据
      showMembershipModal: false,
      showPointsModal: false,
      showInviteModal: false,
      userBasicInfo: {},
      isDark: false
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isLoggedIn() {
      return this.userStore && this.userStore.isLoggedIn
    },
    currentUser() {
      return (this.userStore && this.userStore.userInfo) || {}
    },
    isVip() {
      const a = this.userBasicInfo && this.userBasicInfo.vipStatus
      const b = this.userStore && this.userStore.userInfo && this.userStore.userInfo.vipStatus
      return a === 'ACTIVE' || b === 'ACTIVE'
    }
  },
  mounted() {
    try {
      const token = this.userStore && this.userStore.token
      if (token) {
        getUserBasicStatus(token).then(res => {
          if (res && res.code === 0 && res.data) {
            this.userBasicInfo = res.data
          }
        }).catch(() => {})
      }
    } catch (e) { /* no-op */ }
    try {
      const dm = localStorage.getItem('darkMode')
      this.isDark = String(dm || '').toLowerCase() === 'true'
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    } catch (e) { /* no-op */ }
  },
  methods: {
    goBack() {
      // 触发父组件的关闭事件，关闭对口型页面覆盖层
      this.$emit('close')
    },
    toggleTheme() {
      this.isDark = !this.isDark
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
        try { localStorage.setItem('darkMode', 'true') } catch (e) { /* no-op */ }
      } else {
        document.documentElement.removeAttribute('data-theme')
        try { localStorage.setItem('darkMode', 'false') } catch (e) { /* no-op */ }
      }
    }
  }
}
</script>

<style scoped>
.lip-sync-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-navbar {
  height: 60px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: var(--bg-quaternary);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.navbar-right {
  display: flex;
  gap: 12px;
}

.header-items {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  cursor: pointer;
}
.theme-toggle {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  /* background: var(--bg-tertiary); */
  color: var(--text-primary);
}
[data-theme="dark"] .theme-toggle {
  background: #1f1f1f;
}
.membership-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}
.invite-btn {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}
.points-display {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-secondary);
  color: #fbbf24;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.2s;
}
.points-display:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-1px);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.navbar-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius:20px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.navbar-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}


.navbar-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分镜图片区域 */
.left-panel {
  flex: 1;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  height: 100%;
  position: relative;
}

.scene-preview {
  max-width: 600px;
  width: 100%;
  height: 100%;
}

.scene-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.scene-info {
  margin-top: 24px;
  text-align: center;
}

.scene-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.scene-description {
  font-size: 16px;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
}

/* 右侧数字人工具栏区域 */
.right-panel {
  width: 400px;
  background: var(--bg-primary);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
}


/* 响应式设计 */
@media (max-width: 1400px) {
  .right-panel {
    width: 380px;
  }
}

@media (max-width: 1200px) {
  .right-panel {
    width: 350px;
  }
  
  .left-panel {
    padding: 30px;
  }
}

@media (max-width: 1024px) {
  .right-panel {
    width: 320px;
  }
  
  .scene-preview {
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-panel {
    flex: none;
    height: 50vh;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
    padding: 20px;
  }
  
  .right-panel {
    width: 100%;
    flex: 1;
  }
  
  .scene-preview {
    max-width: 350px;
  }
  
  .scene-title {
    font-size: 20px;
  }
  
  .scene-description {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .left-panel {
    padding: 15px;
    height: 45vh;
  }
  
  .scene-preview {
    max-width: 280px;
  }
  
  .scene-title {
    font-size: 18px;
  }
  
  .scene-description {
    font-size: 13px;
  }
  
  .top-navbar {
    padding: 0 15px;
  }
  
  .navbar-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
