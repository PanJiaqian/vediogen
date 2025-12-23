import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    token: '',
    tokenSetAt: 0,
    logoutTimerId: null,
    userInfo: {
      id: null,
      name: '',
      email: '',
      phone: '',
      avatar: '/logo.png'
    }
  }),
  getters: {
    hasToken: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token || ''
      if (token) {
        this.tokenSetAt = Date.now()
        // 持久化 token 与时间戳
        try {
          localStorage.setItem('token', token)
          localStorage.setItem('tokenSetAt', String(this.tokenSetAt))
        } catch (e) { console.warn('保存 token 失败:', e) }
        // 安排自动登出
        this.scheduleAutoLogout()
      } else {
        this.tokenSetAt = 0
        this.clearAutoLogoutTimer()
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('tokenSetAt')
        } catch (e) { console.warn('移除 token 失败:', e) }
      }
    },
    setUser(user) {
      const merged = {
        id: user?.id ?? this.userInfo.id,
        name: user?.name ?? this.userInfo.name,
        email: user?.email ?? this.userInfo.email,
        phone: user?.phone ?? this.userInfo.phone,
        avatar: user?.avatar ?? this.userInfo.avatar,
        vipStatus: user?.vipStatus ?? this.userInfo.vipStatus
      }
      this.userInfo = merged
      this.isLoggedIn = true
      try {
        localStorage.setItem('userInfo', JSON.stringify(merged))
        localStorage.setItem('isLoggedIn', 'true')
      } catch (e) { console.warn('保存用户信息失败:', e) }
    },
    logout() {
      this.isLoggedIn = false
      this.token = ''
       this.tokenSetAt = 0
       this.clearAutoLogoutTimer()
      this.userInfo = {
        id: null,
        name: '',
        email: '',
        phone: '',
        avatar: '/logo.png'
      }
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenSetAt')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('isLoggedIn')
      } catch (e) { console.warn('清理本地用户数据失败:', e) }
    },
    // 安排自动登出（5天）
    scheduleAutoLogout() {
      const EXPIRE_MS = 5 * 24 * 60 * 60 * 1000
      const now = Date.now()
      const setAt = this.tokenSetAt || now
      const remain = Math.max(EXPIRE_MS - (now - setAt), 0)
      this.clearAutoLogoutTimer()
      if (remain > 0) {
        this.logoutTimerId = setTimeout(() => {
          this.logout()
          try { window.dispatchEvent(new CustomEvent('auth-401')) } catch (e) { console.warn('auth-401 事件分发失败:', e) }
        }, remain)
      } else {
        // 已过期，立即登出
        this.logout()
      }
    },
    clearAutoLogoutTimer() {
      if (this.logoutTimerId) {
        clearTimeout(this.logoutTimerId)
        this.logoutTimerId = null
      }
    },
    loadFromStorage() {
      try {
        const token = localStorage.getItem('token') || ''
        const tokenSetAtStr = localStorage.getItem('tokenSetAt') || '0'
        const userInfoStr = localStorage.getItem('userInfo')
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        this.token = token
        this.tokenSetAt = Number(tokenSetAtStr) || 0
        if (userInfoStr) {
          try {
            this.userInfo = JSON.parse(userInfoStr)
          } catch (e) { console.warn('解析用户信息失败:', e) }
        }
        // 判断 token 是否过期（5天）
        const EXPIRE_MS = 5 * 24 * 60 * 60 * 1000
        const expired = this.token && this.tokenSetAt && (Date.now() - this.tokenSetAt >= EXPIRE_MS)
        if (expired) {
          this.logout()
        } else {
          this.isLoggedIn = isLoggedIn && !!this.token
          if (this.isLoggedIn) this.scheduleAutoLogout()
        }
      } catch (e) {
        console.warn('从本地存储加载用户信息失败:', e)
      }
    }
  }
})
