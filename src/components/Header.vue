<template>
  <header class="header">
    <div class="header__content">
      <!-- 左侧Logo -->
      <div class="header__left">
        <div class="logo" @click="goHome">
          <img src="/logo.png" alt="VideoGen" class="logo-icon" />
          <span class="logo-text">织梦</span>
        </div>
      </div>

      <!-- 右侧功能区 -->
      <div class="header__right">
        <div class="header-items">
          <div class="header-item points-display" @click="showPointsModal = true" v-if="isLoggedIn">
            <span class="points-val">✨ {{ userBasicInfo.pointsBalance || 0 }}</span>
          </div>
          <div class="header-item membership-btn" @click="showMembershipModal = true">开通会员</div>
          <div class="header-item theme-toggle" @click="toggleTheme" :aria-label="isDark ? '切换为浅色' : '切换为深色'">
            <svg v-if="!isDark" class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="header-item">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <div class="header-item">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>

          <!-- 用户登录状态 -->
          <div v-if="isLoggedIn" class="user-info" @click="toggleUserMenu">
            <img :src="userBasicInfo.avatar || currentUser.avatar" :alt="userBasicInfo.nickname || currentUser.name" class="user-avatar">
            <span class="user-name">{{ userBasicInfo.nickname || currentUser.name }}</span>

            <!-- 用户菜单下拉 -->
            <div v-if="showUserMenu" class="user-menu-popover" @click.stop>
              <div class="user-card-header">
                <div class="user-card-avatar-wrapper" @click="triggerAvatarUpload">
                  <img :src="userBasicInfo.avatar || currentUser.avatar" class="user-card-avatar" />
                  <input type="file" ref="avatarInput" accept="image/*" style="display:none" @change="handleAvatarChange" />
                </div>
                <div class="user-card-info">
                  <div class="user-card-name-row">
                    <span v-if="!isEditingName" class="user-card-name">{{ userBasicInfo.nickname || currentUser.name }}</span>
                    <input v-else v-model="editingName" class="user-name-input" @blur="saveNickname" @keyup.enter="saveNickname" ref="nameInput" />
                  </div>
                  <!-- <div class="user-card-uid" @click="copyUid">复制UID</div> -->
                </div>
                <div class="user-card-edit-btn" @click="openEditProfileModal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
              </div>

              <div class="vip-card">
                <svg class="vip-card-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
                <div class="vip-status">
                  <div class="vip-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                  </div>
                  <span class="vip-text">{{ userBasicInfo.vipStatus === 'ACTIVE' ? 'VIP会员' : '免费会员' }}</span>
                </div>
                <div class="vip-divider"></div>
                <div class="points-info">
                  <div class="points-row">
                    <span class="points-label">当前积分</span>
                    <span class="points-value">{{ userBasicInfo.pointsBalance || 0 }}</span>
                  </div>
                  <!-- <div class="points-row">
                    <span class="points-label">付费积分</span>
                    <span class="points-value">0</span>
                  </div>
                  <div class="points-row">
                    <span class="points-label">赠送积分</span>
                    <span class="points-value">{{ userBasicInfo.pointsBalance || 0 }}</span>
                  </div> -->
                </div>
                <div class="menu-actions">
                  <div class="action-btn">订阅管理</div>
                  <div class="action-divider">|</div>
                  <div class="action-btn">订单记录</div>
                </div>
              </div>

              <div class="logout-btn" @click="logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                   <polyline points="16 17 21 12 16 7"></polyline>
                   <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>退出登录</span>
              </div>
            </div>
          </div>

          <!-- 登录按钮（未登录时显示） -->
          <button v-else class="login-btn" @click="showLoginModal">
            <svg class="login-icon" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="2" />
              <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2" />
              <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" />
            </svg>
            登录
          </button>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <LoginModal :visible="loginModalVisible" @close="hideLoginModal" @success="handleLoginSuccess"
      @social-login="handleSocialLogin" />

    <!-- 会员弹窗 -->
    <MembershipModal :visible="showMembershipModal" :user-info="{ ...currentUser, ...userBasicInfo }" @close="showMembershipModal = false" />

    <PointsModal :visible="showPointsModal" :user-info="{ ...currentUser, ...userBasicInfo }" @close="showPointsModal = false" />
    <UserProfileEditModal :visible="editProfileModalVisible" :userInfo="{ ...currentUser, ...userBasicInfo }" @close="editProfileModalVisible = false" @save="handleProfileUpdate" />


    <div v-if="centerPromptVisible" class="center-prompt-overlay" @click="closeCenterPrompt">
      <div class="center-prompt" @click.stop>
        <div class="prompt-text">{{ centerPromptText }}</div>
        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="prompt-close-btn" @click="closeCenterPrompt">确定</button>
          <button v-if="centerPromptAction === 'recharge'" class="prompt-close-btn" @click="openPointsRecharge">充值</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import LoginModal from './LoginModal.vue'
import MembershipModal from '@/components/MembershipModal.vue'
import PointsModal from '@/components/PointsModal.vue'
import UserProfileEditModal from '@/components/UserProfileEditModal.vue'
import { useUserStore } from '@/stores/user'
import { getUserBasicStatus, updateAvatarAndNickname } from '@/api'

export default {
  name: 'AppHeader',
  components: {
    LoginModal,
    MembershipModal,
    PointsModal,
    UserProfileEditModal
  },
  data() {
    return {
      loginModalVisible: false,
      showUserMenu: false,
      centerPromptVisible: false,
      centerPromptText: '',
      centerPromptAction: '',
      isDark: false,
      showMembershipModal: false,
      showPointsModal: false,
      editProfileModalVisible: false,
      userBasicInfo: {},
      isEditingName: false,
      editingName: ''
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    currentUser() {
      return this.userStore.userInfo
    }
  },
  mounted() {
    // 点击外部关闭用户菜单
    document.addEventListener('click', this.handleClickOutside)
    // 监听全局事件以弹出登录弹窗
    window.addEventListener('open-login-modal', this.showLoginModal)
    window.addEventListener('auth-401', this.handleAuth401)
    window.addEventListener('open-points-modal', this.openPointsRecharge)
    this._onInsufficientPoints = () => { this.centerPromptText = '积分不足，请充值'; this.centerPromptAction = 'recharge'; this.centerPromptVisible = true }
    window.addEventListener('open-insufficient-points', this._onInsufficientPoints)
    this._onCenterPrompt = (e) => {
      const d = (e && e.detail) || {}
      this.centerPromptText = String(d.text || '提示')
      this.centerPromptAction = String(d.action || '')
      this.centerPromptVisible = true
    }
    window.addEventListener('open-center-prompt', this._onCenterPrompt)
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true' || saved === '1') {
      document.documentElement.setAttribute('data-theme', 'dark')
      this.isDark = true
    } else if (saved === 'false' || saved === '0') {
      document.documentElement.removeAttribute('data-theme')
      this.isDark = false
    } else {
      this.isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    }
    if (this.userStore && this.userStore.isLoggedIn && this.userStore.token) {
      this.fetchUserBasicStatus()
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('open-login-modal', this.showLoginModal)
    window.removeEventListener('auth-401', this.handleAuth401)
    window.removeEventListener('open-points-modal', this.openPointsRecharge)
    if (this._onInsufficientPoints) window.removeEventListener('open-insufficient-points', this._onInsufficientPoints)
    if (this._onCenterPrompt) window.removeEventListener('open-center-prompt', this._onCenterPrompt)
  },
  methods: {
    // 显示登录弹窗
    showLoginModal() {
      this.loginModalVisible = true
    },

    // 隐藏登录弹窗
    hideLoginModal() {
      this.loginModalVisible = false
    },

    // 登录成功处理
  handleLoginSuccess(payload) {
    const user = payload?.user || payload || {}
    const name = user.name || user.phone || user.email
    this.userStore.setUser({
      id: user.id || Date.now(),
      name,
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || '/logo.png'
    })
    if (user.token) {
      this.userStore.setToken(user.token)
    }
    this.hideLoginModal()
    const t = String(payload && payload.type || '').toLowerCase()
    this.openCenterPrompt(t === 'register' ? '注册成功！' : '登录成功！')
    if (this.userStore && this.userStore.token) {
      this.fetchUserBasicStatus()
    }
  },

    // 第三方登录处理
    handleSocialLogin(provider, userData) {
      console.log(`${provider} 登录:`, userData)

      // 模拟第三方登录成功
      this.handleLoginSuccess({
        id: userData.id || Date.now(),
        name: userData.name || `${provider}用户`,
        email: userData.email || '',
        phone: userData.phone || '',
        avatar: userData.avatar || '/logo.png'
      })
    },

    // 检查登录状态（由 main.js 已加载，这里无需额外处理）

    // 切换用户菜单显示
    async toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      if (this.showUserMenu) {
        await this.fetchUserBasicStatus()
      }
    },

    async fetchUserBasicStatus() {
      const token = this.userStore.token
      if (!token) return
      try {
        const res = await getUserBasicStatus(token)
        if (res && res.code === 0 && res.data) {
          this.userBasicInfo = res.data
          // 更新 store
          this.userStore.setUser({
            ...this.currentUser,
            name: res.data.nickname || this.currentUser.name,
            avatar: res.data.avatar || this.currentUser.avatar
          })
        }
      } catch (e) {
        console.warn('获取用户状态失败:', e)
      }
    },

    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },

    async handleAvatarChange(e) {
      const file = e.target.files[0]
      if (!file) return
      
      const token = this.userStore.token
      try {
        const res = await updateAvatarAndNickname({
          token,
          imageFile: file
        })
        if (res && res.code === 0 && res.data) {
          this.userBasicInfo.avatar = res.data.avatar
          this.userStore.setUser({
            ...this.currentUser,
            avatar: res.data.avatar
          })
          this.openCenterPrompt('头像更新成功')
        } else {
          this.openCenterPrompt(res.message || '头像更新失败')
        }
      } catch (e) {
        console.error('更新头像失败:', e)
        this.openCenterPrompt('更新头像失败')
      }
      // 重置 input
      e.target.value = ''
    },

    startEditName() {
      this.editingName = this.userBasicInfo.nickname || this.currentUser.name
      this.isEditingName = true
      this.$nextTick(() => {
        if (this.$refs.nameInput) this.$refs.nameInput.focus()
      })
    },

    async saveNickname() {
      if (!this.isEditingName) return
      const newName = this.editingName.trim()
      if (!newName) {
        this.isEditingName = false
        return
      }
      if (newName === (this.userBasicInfo.nickname || this.currentUser.name)) {
        this.isEditingName = false
        return
      }

      const token = this.userStore.token
      try {
        const res = await updateAvatarAndNickname({
          token,
          nickname: newName
        })
        if (res && res.code === 0 && res.data) {
          this.userBasicInfo.nickname = res.data.nickname
          this.userStore.setUser({
            ...this.currentUser,
            name: res.data.nickname
          })
          this.openCenterPrompt('昵称更新成功')
        } else {
          this.openCenterPrompt(res.message || '昵称更新失败')
        }
      } catch (e) {
        console.error('更新昵称失败:', e)
        this.openCenterPrompt('更新昵称失败')
      } finally {
        this.isEditingName = false
      }
    },

    copyUid() {
      // UID 好像不在 basicStatus 里，或者在 claims 里。
      // 假设 basicStatus 没返回 id，我们可以用 currentUser.id 或者 claims 解析。
      // 示例图里显示 "复制UID"。
      // 暂时用 store 里的 id
      const uid = this.currentUser.id || '未知'
      navigator.clipboard.writeText(String(uid)).then(() => {
        this.openCenterPrompt('UID 已复制')
      }).catch(() => {
        this.openCenterPrompt('复制失败')
      })
    },

    // 点击外部关闭用户菜单
    handleClickOutside(event) {
      const userInfo = this.$el?.querySelector('.user-info')
      if (userInfo && !userInfo.contains(event.target)) {
        this.showUserMenu = false
      }
    },

    // 查看个人资料
    viewProfile() {
      this.showUserMenu = false
      console.log('查看个人资料')
      // 这里可以跳转到个人资料页面
    },

    // 查看设置
    viewSettings() {
      this.showUserMenu = false
      console.log('查看设置')
      // 这里可以跳转到设置页面
    },

    // 退出登录
    logout() {
      this.userStore.logout()
      this.showUserMenu = false
      this.openCenterPrompt('已退出登录')
    }
    ,
    toggleTheme() {
      const root = document.documentElement
      const next = root.getAttribute('data-theme') === 'dark' ? null : 'dark'
      if (next) {
        root.setAttribute('data-theme', next)
        this.isDark = true
        try { localStorage.setItem('darkMode', 'true') } catch (e) { /* no-op */ }
      } else {
        root.removeAttribute('data-theme')
        this.isDark = false
        try { localStorage.setItem('darkMode', 'false') } catch (e) { /* no-op */ }
      }
    }
    ,
    // 处理 401 未授权提示
    handleAuth401() {
      this.openCenterPrompt('请重新登录')
      this.showLoginModal()
    }
    ,
    openCenterPrompt(text) {
      this.centerPromptText = String(text || '').trim() || '提示'
      this.centerPromptVisible = true
    },
    closeCenterPrompt() {
      this.centerPromptVisible = false
      this.centerPromptAction = ''
    },
    goHome() {
      this.$router.push('/')
    },
    openEditProfileModal() {
      this.editProfileModalVisible = true
      this.showUserMenu = false
    },
    async handleProfileUpdate({ nickname, avatarFile }) {
      const token = this.userStore.token
      try {
        if (avatarFile) {
           const res = await updateAvatarAndNickname({ token, imageFile: avatarFile })
           if (res && res.code === 0 && res.data) {
             this.userBasicInfo.avatar = res.data.avatar
             this.userStore.setUser({ ...this.currentUser, avatar: res.data.avatar })
           }
        }
        if (nickname && nickname !== (this.userBasicInfo.nickname || this.currentUser.name)) {
           const res = await updateAvatarAndNickname({ token, nickname })
           if (res && res.code === 0 && res.data) {
             this.userBasicInfo.nickname = res.data.nickname
             this.userStore.setUser({ ...this.currentUser, name: res.data.nickname })
           }
        }
        this.openCenterPrompt('更新成功')
        this.editProfileModalVisible = false
      } catch (e) {
        console.error('Update failed:', e)
        this.openCenterPrompt('更新失败')
      }
    }
    ,
    openPointsRecharge() {
      this.showPointsModal = true
      this.centerPromptVisible = false
      this.centerPromptAction = ''
    }
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-secondary);
  z-index: 2000;
}

.header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 2rem;
  padding-left: 2rem;
}

.header__left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
}

.membership-btn {
  background-color: var(--bg-tertiary);
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
  color: #fbbf24; /* Gold/Yellow for points */
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.2s;
}

.points-display:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-1px);
}

.points-icon {
  width: 16px;
  height: 16px;
}


.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--bg-tertiary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 登录按钮样式 */
.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.center-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.center-prompt {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 280px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.prompt-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.prompt-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: #ffffff;
  cursor: pointer;
}

.login-icon {
  width: 16px;
  height: 16px;
}

/* 用户菜单下拉样式 */
.user-menu-popover {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 320px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 3000;
  overflow: hidden;
  cursor: default;
}

.user-card-header {
  padding: 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-card-edit-btn {
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: auto;
}

.user-card-edit-btn:hover {
  color: var(--primary-color);
  background: var(--bg-tertiary);
}

.user-card-avatar-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}

.user-card-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card-info {
  flex: 1;
  min-width: 0;
}

.user-card-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name-input {
  font-size: 16px;
  padding: 2px 4px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 120px;
}

.user-card-uid {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.user-card-uid:hover {
  color: var(--text-secondary);
}

.vip-card {
  margin: 15px 20px;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.vip-card-watermark {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 80px;
  height: 80px;
  opacity: 0.05;
  transform: rotate(15deg);
  pointer-events: none;
  color: currentColor;
}

[data-theme='dark'] .vip-card {
  background: var(--bg-tertiary);
  color: #ffffff;
}

.vip-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

[data-theme='dark'] .vip-status {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.vip-icon {
  width: 16px;
  height: 16px;
}

.points-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.points-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.sub-points {
  font-size: 12px;
  opacity: 0.8;
}

.points-value {
  font-weight: 600;
}

.menu-actions {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--border-secondary);
}

.action-btn {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-btn:hover {
  color: var(--primary-color);
}

.action-divider {
  color: var(--border-secondary);
  font-size: 12px;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  color: var(--error-color);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border-top: 1px solid var(--border-secondary);
}

.logout-btn:hover {
  background: var(--bg-tertiary);
}

.logout-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    left: 0;
    padding: 0 1rem;
  }

}

.user-name {
  display: none;
}
</style>
