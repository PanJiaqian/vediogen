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
          <div class="header-item membership-btn">开通会员</div>
          <div class="header-item">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
            <img :src="currentUser.avatar" :alt="currentUser.name" class="user-avatar">
            <span class="user-name">{{ currentUser.name }}</span>

            <!-- 用户菜单下拉 -->
            <div v-if="showUserMenu" class="user-menu">
              <div class="menu-item" @click="viewProfile">
                <svg class="menu-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                </svg>
                个人资料
              </div>
              <div class="menu-item" @click="viewSettings">
                <svg class="menu-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                    stroke="currentColor" stroke-width="2" />
                </svg>
                设置
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item logout" @click="logout">
                <svg class="menu-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" />
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" />
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" />
                </svg>
                退出登录
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

    <div v-if="centerPromptVisible" class="center-prompt-overlay" @click="closeCenterPrompt">
      <div class="center-prompt" @click.stop>
        <div class="prompt-text">{{ centerPromptText }}</div>
        <button class="prompt-close-btn" @click="closeCenterPrompt">确定</button>
      </div>
    </div>
  </header>
</template>

<script>
import LoginModal from './LoginModal.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'AppHeader',
  components: {
    LoginModal
  },
  data() {
    return {
      loginModalVisible: false,
      showUserMenu: false,
      centerPromptVisible: false,
      centerPromptText: ''
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
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('open-login-modal', this.showLoginModal)
    window.removeEventListener('auth-401', this.handleAuth401)
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
      this.openCenterPrompt('登录成功！')
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
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
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
    },
    goHome() {
      this.$router.push('/')
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
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
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
  color: #111827;
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
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
}

.header-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.membership-btn {
  background-color: #f3f4f6;
  color: #111827;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
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
  background-color: #f9fafb;
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
  color: #374151;
}

/* 登录按钮样式 */
.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
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
  background: #2563eb;
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
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 280px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.prompt-text {
  font-size: 14px;
  color: #111827;
  margin-bottom: 12px;
}

.prompt-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  cursor: pointer;
}

.login-icon {
  width: 16px;
  height: 16px;
}

/* 用户菜单下拉样式 */
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 3000;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f9fafb;
}

.menu-item.logout {
  color: #dc2626;
}

.menu-item.logout:hover {
  background-color: #fef2f2;
}

.menu-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.25rem 0;
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
