// 顶部导航：负责登录、会员与积分入口以及通知与用户菜单
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
          <div class="header-item points-display" :class="{ 'non-member-points': !isVip }" :title="!isVip ? '会员已过期，请重新订阅' : ''" @click="showPointsModal = true" v-if="isLoggedIn">
            <span class="points-val">✨ {{ userBasicInfo.pointsBalance || 0 }}</span>
          </div>
          <div class="header-item membership-btn" v-if="!isVip" @click="showMembershipModal = true">开通会员</div>
          <div class="header-item invite-btn" @click="showInviteModal = true">邀请有礼</div>
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
          <div class="header-item notification-bell" @click.stop="toggleNotificationsMenu" v-if="isLoggedIn">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="notificationsUnreadCount > 0" class="notif-badge">{{ notificationsUnreadCount }}</span>
            <div v-if="showNotificationsMenu" class="notifications-popover" @click.stop>
              <div class="notifications-header">
                <div class="notif-title">通知</div>
                <div class="notif-actions">
                  <button class="notif-refresh" @click.stop="markAllAsRead">标记全部已读</button>
                  <button class="notif-refresh" @click.stop="refreshNotifications">刷新</button>
                </div>
              </div>
              <div class="notifications-body">
                <div v-if="notificationsLoading" class="notif-loading">加载中...</div>
                <div v-else-if="!notificationsList.length" class="notif-empty">暂无通知</div>
                <div v-else>
                  <div v-for="n in notificationsList" :key="'notif-'+n.id" class="notif-item" :class="{ unread: n.isRead === 0 }">
                    <div class="notif-item-main">
                      <div class="notif-item-title">{{ n.title || '通知' }}</div>
                      <div class="notif-item-content">{{ parseNotificationContent(n.content) }}</div>
                    </div>
                    <div class="notif-item-meta">
                      <span class="notif-item-time">{{ formatDateTime(n.createdAt || n.updatedAt) }}</span>
                      <div class="notif-item-actions">
                        <button v-if="n.isRead === 0" class="notif-action" @click.stop="markAsRead(n)">标记已读</button>
                        <button class="notif-action danger" @click.stop="deleteNotif(n)">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <div class="bind-status-trigger" @click="openBindStatusModal">
                <svg class="bind-status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1v22"></path>
                  <path d="M5 5h14v14H5z"></path>
                </svg>
                <span class="bind-status-text">多登陆方式状态</span>
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
                  <span v-if="userBasicInfo.vipStatus === 'ACTIVE' && userBasicInfo.vipExpireTime" class="vip-expire" style="margin-left: 20px;">至{{ formatDateTime(userBasicInfo.vipExpireTime) }}</span>
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
                  <!-- <div class="action-btn">订阅管理</div> -->
                  <div class="action-divider">|</div>
                  <div class="action-btn" @click="showOrderRecordsModal = true">订单记录</div>
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
    <InviteModal :visible="showInviteModal" @close="showInviteModal = false" :token="userStore.token" />
    <OrderRecordsModal :visible="showOrderRecordsModal" @close="showOrderRecordsModal = false" />


    <div v-if="centerPromptVisible" class="center-prompt-overlay" @click="closeCenterPrompt">
      <div class="center-prompt" @click.stop>
        <div class="prompt-text">{{ centerPromptText }}</div>
        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="prompt-close-btn" @click="closeCenterPrompt">确定</button>
          <button v-if="centerPromptAction === 'recharge'" class="prompt-close-btn" @click="openPointsRecharge">充值</button>
        </div>
      </div>
    </div>
    <div v-if="showBindStatusModal" class="bind-status-overlay" @click="closeBindStatusModal">
      <div class="bind-status-modal" @click.stop>
        <div class="bind-status-header">
          <div class="bind-status-title">多登陆方式绑定</div>
          <button class="bind-status-close-icon" @click="closeBindStatusModal">×</button>
        </div>
        <div class="bind-summary">
          <div class="summary-item">
            <div class="summary-label">手机号</div>
            <div class="summary-value">{{ bindStatus.PHONE ? maskPhone(bindStatus.PHONE) : '未绑定' }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">邮箱</div>
            <div class="summary-value">{{ bindStatus.EMAIL ? maskEmail(bindStatus.EMAIL) : '未绑定' }}</div>
          </div>
        </div>
        <div class="bind-section">
          <div class="bind-section-title">绑定手机号</div>
          <div class="bind-form">
            <input v-model="phoneBindPhone" type="tel" class="bind-input" placeholder="请输入手机号" />
            <button class="bind-send-btn" @click="sendBindPhoneCode" :disabled="phoneCodeSending || phoneCodeCountdown > 0 || !/^1[3-9]\d{9}$/.test(String(phoneBindPhone||''))">
              <span v-if="phoneCodeSending">发送中...</span>
              <span v-else-if="phoneCodeCountdown > 0">{{ phoneCodeCountdown }}s后重发</span>
              <span v-else>发送验证码</span>
            </button>
          </div>
          <div class="bind-form">
            <input v-model="phoneBindCode" type="text" class="bind-input" placeholder="请输入短信验证码" />
            <button class="bind-confirm-btn" @click="submitBindPhone" :disabled="bindSubmitting">绑定</button>
          </div>
        </div>
        <div class="bind-section">
          <div class="bind-section-title">绑定邮箱</div>
          <div class="bind-form">
            <input v-model="emailBindEmail" type="email" class="bind-input" placeholder="请输入邮箱地址" />
            <button class="bind-send-btn" @click="sendBindEmailCode" :disabled="emailCodeSending || emailCodeCountdown > 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailBindEmail||''))">
              <span v-if="emailCodeSending">发送中...</span>
              <span v-else-if="emailCodeCountdown > 0">{{ emailCodeCountdown }}s后重发</span>
              <span v-else>发送验证码</span>
            </button>
          </div>
          <div class="bind-form">
            <input v-model="emailBindCode" type="text" class="bind-input" placeholder="请输入邮箱验证码" />
            <button class="bind-confirm-btn" @click="submitBindEmail" :disabled="bindSubmitting">绑定</button>
          </div>
        </div>
      </div>
      <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>
    </div>
  </header>
</template>

<script>

import LoginModal from './LoginModal.vue'
import MembershipModal from '@/components/MembershipModal.vue'
import PointsModal from '@/components/PointsModal.vue'
import UserProfileEditModal from '@/components/UserProfileEditModal.vue'
import InviteModal from '@/components/InviteModal.vue'
import OrderRecordsModal from '@/components/OrderRecordsModal.vue'
import { useUserStore } from '@/stores/user'
import { getUserBasicStatus, updateAvatarAndNickname, getBindStatus, bindPhone, bindEmail, sendSmsCodeByPhone, sendCheckCodeByEmail, getNotificationsList, getNotificationsUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/api'

export default {
  name: 'AppHeader',
  components: {
    LoginModal,
    MembershipModal,
    PointsModal,
    UserProfileEditModal,
    InviteModal,
    OrderRecordsModal
  },
  data() {
    return {
      loginModalVisible: false,
      showUserMenu: false,
      showNotificationsMenu: false,
      centerPromptVisible: false,
      centerPromptText: '',
      centerPromptAction: '',
      isDark: false,
      showMembershipModal: false,
      showPointsModal: false,
      showInviteModal: false,
      showOrderRecordsModal: false,
      editProfileModalVisible: false,
      userBasicInfo: {},
      isEditingName: false,
      editingName: '',
      showBindStatusModal: false,
      bindStatus: { PHONE: null, EMAIL: null }
      , phoneBindPhone: ''
      , phoneBindCode: ''
      , phoneCodeSending: false
      , phoneCodeCountdown: 0
      , phoneCodeTimer: null
      , emailBindEmail: ''
      , emailBindCode: ''
      , emailCodeSending: false
      , emailCodeCountdown: 0
      , emailCodeTimer: null
      , bindSubmitting: false
      , toastVisible: false
      , toastText: ''
      , notificationsList: []
      , notificationsLoading: false
      , notificationsUnreadCount: 0
      , notifWS: null
      , notifWsAttempt: 0
      , notifWsTimer: null
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
    },
    isVip() {
      const a = this.userBasicInfo && this.userBasicInfo.vipStatus
      const b = this.userStore && this.userStore.userInfo && this.userStore.userInfo.vipStatus
      return a === 'ACTIVE' || b === 'ACTIVE'
    }
  },
  mounted() {
    // 点击外部关闭用户菜单
    document.addEventListener('click', this.handleClickOutside)
    // 监听全局事件以弹出登录弹窗
    window.addEventListener('open-login-modal', this.showLoginModal)
    window.addEventListener('auth-401', this.handleAuth401)
    window.addEventListener('open-points-modal', this.openPointsRecharge)
    this._onOpenOrderRecords = () => { this.showOrderRecordsModal = true }
    window.addEventListener('open-order-records-modal', this._onOpenOrderRecords)
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
      this.fetchNotificationsUnreadCount()
      this.initNotificationsWebSocket()
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('open-login-modal', this.showLoginModal)
    window.removeEventListener('auth-401', this.handleAuth401)
    window.removeEventListener('open-points-modal', this.openPointsRecharge)
    if (this._onOpenOrderRecords) window.removeEventListener('open-order-records-modal', this._onOpenOrderRecords)
    if (this._onInsufficientPoints) window.removeEventListener('open-insufficient-points', this._onInsufficientPoints)
    if (this._onCenterPrompt) window.removeEventListener('open-center-prompt', this._onCenterPrompt)
    if (this.phoneCodeTimer) { clearInterval(this.phoneCodeTimer); this.phoneCodeTimer = null }
    if (this.emailCodeTimer) { clearInterval(this.emailCodeTimer); this.emailCodeTimer = null }
    this.teardownNotificationsWebSocket()
  },
  watch: {
    isLoggedIn(val) {
      if (val) this.initNotificationsWebSocket()
      else this.teardownNotificationsWebSocket()
    },
    'userStore.token'(tok) {
      if (tok) this.initNotificationsWebSocket()
    }
  },
  methods: {
    async toggleNotificationsMenu() {
      this.showNotificationsMenu = !this.showNotificationsMenu
      if (this.showNotificationsMenu) {
        await this.fetchNotificationsUnreadCount()
        await this.fetchNotificationsList()
      }
    },
    async refreshNotifications() {
      await this.fetchNotificationsUnreadCount()
      await this.fetchNotificationsList()
    },
    async fetchNotificationsList() {
      try {
        const token = this.userStore && this.userStore.token
        if (!token) return
        this.notificationsLoading = true
        const res = await getNotificationsList({ token })
        const ok = res && res.code === 0 && Array.isArray(res.data)
        this.notificationsList = ok ? res.data : []
      } catch (e) {
        this.notificationsList = []
      } finally {
        this.notificationsLoading = false
      }
    },
    async fetchNotificationsUnreadCount() {
      try {
        const token = this.userStore && this.userStore.token
        if (!token) return
        const res = await getNotificationsUnreadCount({ token })
        const ok = res && res.code === 0 && res.data && typeof res.data.count !== 'undefined'
        this.notificationsUnreadCount = ok ? Number(res.data.count) || 0 : 0
      } catch (e) {
        this.notificationsUnreadCount = 0
      }
    },
    async markAsRead(n) {
      try {
        const token = this.userStore && this.userStore.token
        if (!token || !n || !n.id) return
        const res = await markNotificationRead({ id: n.id, token })
        const ok = res && res.code === 0
        if (ok) {
          const idx = this.notificationsList.findIndex(x => x.id === n.id)
          if (idx >= 0) this.$set ? this.$set(this.notificationsList[idx], 'isRead', 1) : (this.notificationsList[idx].isRead = 1)
          await this.fetchNotificationsUnreadCount()
        }
      } catch (e) { /* no-op */ }
    },
    async markAllAsRead() {
      try {
        const token = this.userStore && this.userStore.token
        if (!token) return
        const res = await markAllNotificationsRead({ token })
        const ok = (res && (res.code === 0 || res.success === true)) || typeof res === 'string'
        if (ok && Array.isArray(this.notificationsList) && this.notificationsList.length) {
          this.notificationsList.forEach(n => { n.isRead = 1 })
          this.notificationsUnreadCount = 0
        }
        await this.fetchNotificationsUnreadCount()
      } catch (e) { /* no-op */ }
    },
    async deleteNotif(n) {
      try {
        const token = this.userStore && this.userStore.token
        if (!token || !n || !n.id) return
        const res = await deleteNotification({ id: n.id, token })
        const ok = res && res.code === 0
        if (ok) {
          this.notificationsList = this.notificationsList.filter(x => x.id !== n.id)
          await this.fetchNotificationsUnreadCount()
        }
      } catch (e) { /* no-op */ }
    },
    parseNotificationContent(s) {
      try {
        const obj = JSON.parse(String(s || ''))
        return String(obj && obj.message ? obj.message : s || '')
      } catch (e) {
        return String(s || '')
      }
    },
    formatDateTime(s) {
      try {
        const d = new Date(String(s || '').replace('T', ' '))
        if (Number.isFinite(d.getTime())) {
          const pad = n => String(n).padStart(2, '0')
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
        }
        return String(s || '')
      } catch (e) {
        return String(s || '')
      }
    },
    openBindStatusModal() {
      this.showUserMenu = false
      this.showBindStatusModal = true
      this.fetchBindStatus()
    },
    closeBindStatusModal() {
      this.showBindStatusModal = false
    },
    async fetchBindStatus() {
      try {
        const token = this.userStore && this.userStore.token
        if (!token) return
        const res = await getBindStatus(token)
        const ok = res && (res.code === 200 || res.code === 0)
        const data = ok ? (res.data || {}) : {}
        this.bindStatus = { PHONE: data.PHONE || null, EMAIL: data.EMAIL || null }
      } catch (e) { /* no-op */ }
    },
    async sendBindPhoneCode() {
      if (this.phoneCodeSending) return
      const phone = String(this.phoneBindPhone || '').trim()
      if (!/^1[3-9]\d{9}$/.test(phone)) { this.openCenterPrompt('请输入正确的手机号'); return }
      this.phoneCodeSending = true
      try {
        const resText = await sendSmsCodeByPhone({ phone })
        let obj = null
        try { obj = JSON.parse(resText) } catch { obj = null }
        const ok = obj ? (obj.code === 0 || obj.code === 200) : true
        if (ok) {
          this.phoneCodeCountdown = 60
          if (this.phoneCodeTimer) { clearInterval(this.phoneCodeTimer); this.phoneCodeTimer = null }
          this.phoneCodeTimer = setInterval(() => {
            this.phoneCodeCountdown--
            if (this.phoneCodeCountdown <= 0) { clearInterval(this.phoneCodeTimer); this.phoneCodeTimer = null }
          }, 1000)
          this.showToast('验证码已发送')
        } else {
          const msg = String((obj && (obj.message || obj.msg)) || '').trim()
          this.openCenterPrompt(msg || '验证码发送失败')
        }
      } catch (e) { this.openCenterPrompt('验证码发送失败') }
      finally { this.phoneCodeSending = false }
    },
    async submitBindPhone() {
      if (this.bindSubmitting) return
      const token = this.userStore && this.userStore.token
      if (!token) { this.showLoginModal(); return }
      const phone = String(this.phoneBindPhone || '').trim()
      const code = String(this.phoneBindCode || '').trim()
      if (!/^1[3-9]\d{9}$/.test(phone)) { this.openCenterPrompt('请输入正确的手机号'); return }
      if (!/^\d{4,6}$/.test(code)) { this.openCenterPrompt('请输入正确的验证码'); return }
      this.bindSubmitting = true
      try {
        const res = await bindPhone({ token, phone, code })
        const ok = res && (res.code === 0 || res.code === 200)
        if (ok) {
          this.openCenterPrompt('手机号绑定成功')
          this.showToast('绑定成功')
          this.phoneBindPhone = ''
          this.phoneBindCode = ''
          await this.fetchBindStatus()
        } else {
          const msg = String((res && (res.message || res.msg)) || '').trim()
          this.openCenterPrompt(msg || '绑定失败')
        }
      } catch (e) { this.openCenterPrompt('绑定失败') }
      finally { this.bindSubmitting = false }
    },
    async sendBindEmailCode() {
      if (this.emailCodeSending) return
      const email = String(this.emailBindEmail || '').trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.openCenterPrompt('请输入正确的邮箱'); return }
      this.emailCodeSending = true
      try {
        const resText = await sendCheckCodeByEmail({ email })
        let obj = null
        try { obj = JSON.parse(resText) } catch { obj = null }
        const ok = obj ? (obj.code === 0 || obj.code === 200) : true
        if (ok) {
          this.emailCodeCountdown = 60
          if (this.emailCodeTimer) { clearInterval(this.emailCodeTimer); this.emailCodeTimer = null }
          this.emailCodeTimer = setInterval(() => {
            this.emailCodeCountdown--
            if (this.emailCodeCountdown <= 0) { clearInterval(this.emailCodeTimer); this.emailCodeTimer = null }
          }, 1000)
          this.showToast('验证码已发送')
        } else {
          const msg = String((obj && (obj.message || obj.msg)) || '').trim()
          this.openCenterPrompt(msg || '验证码发送失败')
        }
      } catch (e) { this.openCenterPrompt('验证码发送失败') }
      finally { this.emailCodeSending = false }
    },
    async submitBindEmail() {
      if (this.bindSubmitting) return
      const token = this.userStore && this.userStore.token
      if (!token) { this.showLoginModal(); return }
      const email = String(this.emailBindEmail || '').trim()
      const code = String(this.emailBindCode || '').trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.openCenterPrompt('请输入正确的邮箱'); return }
      if (!/^[A-Za-z0-9]{4,6}$/.test(code)) { this.openCenterPrompt('请输入正确的验证码'); return }
      this.bindSubmitting = true
      try {
        const res = await bindEmail({ token, email, code })
        const ok = res && (res.code === 0 || res.code === 200)
        if (ok) {
          this.openCenterPrompt('邮箱绑定成功')
          this.showToast('绑定成功')
          this.emailBindEmail = ''
          this.emailBindCode = ''
          await this.fetchBindStatus()
        } else {
          const msg = String((res && (res.message || res.msg)) || '').trim()
          this.openCenterPrompt(msg || '绑定失败')
        }
      } catch (e) { this.openCenterPrompt('绑定失败') }
      finally { this.bindSubmitting = false }
    },
    showToast(text) {
      this.toastText = String(text || '').trim() || '提示'
      this.toastVisible = true
      setTimeout(() => { this.toastVisible = false }, 1800)
    },
    maskPhone(s) {
      let v = ''
      if (typeof s === 'string') v = s.trim()
      else if (typeof s === 'number') v = String(s)
      else return '无'
      if (!v) return '无'
      const digits = v.replace(/\D+/g, '')
      if (digits.length < 7) return v
      return `${digits.slice(0, 6)  }xxxx`
    },
    maskEmail(s) {
      let v = ''
      if (typeof s === 'string') v = s.trim()
      else if (typeof s === 'number') v = String(s)
      else return '无'
      if (!v) return '无'
      const at = v.indexOf('@')
      if (at <= 1) return v
      const head = v.slice(0, Math.min(3, at))
      const tail = v.slice(at)
      return `${head  }***${  tail}`
    },
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
            id: res.data.id ?? this.currentUser.id,
            name: res.data.nickname || this.currentUser.name,
            avatar: String(res.data.avatar || this.currentUser.avatar).trim().replace(/^`+|`+$/g, ''),
            vipStatus: res.data.vipStatus || this.currentUser.vipStatus,
            pointsBalance: (res.data && typeof res.data.pointsBalance !== 'undefined')
              ? Number(res.data.pointsBalance) || 0
              : (this.currentUser && this.currentUser.pointsBalance) || 0
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
      if (userInfo && !userInfo.contains(event.target)) this.showUserMenu = false
      const notif = this.$el?.querySelector('.notification-bell')
      if (notif && !notif.contains(event.target)) this.showNotificationsMenu = false
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
    },
    initNotificationsWebSocket() {
      try { if (this.notifWS) { this.notifWS.close(); this.notifWS = null } } catch (e) { /* no-op */ }
      let token = this.userStore && this.userStore.token
      if (!token) {
        try { token = (localStorage.getItem('token') || '').trim() } catch (e) { token = '' }
      }
      if (!token) { console.warn('[notif-ws] skip: no token'); return }
      if (this.notifWsTimer) { clearTimeout(this.notifWsTimer); this.notifWsTimer = null }
      const t = encodeURIComponent(String(token).trim())
      const candidates = [
        `ws://182.92.68.240:1790/ws/notification?token=${t}`,
        `ws://182.92.68.240:1790/ws/notification?${t}`,
        `ws://182.92.68.240:1790/ws/notification?token-${t}`,
        `ws://182.92.68.240:1790/notification/ws?token=${t}`
        // `wss://www.xydriftcraft.com:1770/ws/notification?token=${t}`,
        // `wss://www.xydriftcraft.com:1770/ws/notification?${t}`,
        // `wss://www.xydriftcraft.com:1770/ws/notification?token-${t}`,
        // `wss://www.xydriftcraft.com:1770/notification/ws?token=${t}`
      ]
      const tryConnect = (i) => {
        if (i >= candidates.length) { this.scheduleNotifWsReconnect(); return }
        const url = candidates[i]
        console.log('[notif-ws] connecting to', url)
        const ws = new WebSocket(url)
        this.notifWS = ws
        ws.onopen = () => {
          console.log('[notif-ws] connected to', url)
          this.notifWsAttempt = 0
          this.fetchNotificationsUnreadCount()
        }
        ws.onmessage = (ev) => {
          console.log('[notif-ws] message received')
          let obj = null
          try { obj = JSON.parse(String(ev.data || '')) } catch (e) { obj = null }
          if (obj && typeof obj === 'object') {
            if (typeof obj.unreadCount !== 'undefined') {
              this.notificationsUnreadCount = Number(obj.unreadCount) || 0
            } else {
              this.fetchNotificationsUnreadCount()
            }
            if (obj.notification || obj.list) {
              this.fetchNotificationsList()
            }
          } else {
            this.fetchNotificationsUnreadCount()
            this.fetchNotificationsList()
          }
        }
        ws.onclose = () => {
          console.warn('[notif-ws] closed', url)
          this.scheduleNotifWsReconnect()
        }
        ws.onerror = () => {
          console.error('[notif-ws] error on', url)
          try { ws.close() } catch (e) { /* no-op */ }
          tryConnect(i + 1)
        }
      }
      tryConnect(0)
    },
    scheduleNotifWsReconnect() {
      let token = this.userStore && this.userStore.token
      if (!token) {
        try { token = (localStorage.getItem('token') || '').trim() } catch (e) { token = '' }
      }
      if (!token) { console.warn('[notif-ws] reconnect aborted: no token'); return }
      if ((this.notifWsAttempt || 0) > 8) return
      if (this.notifWsTimer) { clearTimeout(this.notifWsTimer); this.notifWsTimer = null }
      const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(this.notifWsAttempt || 0, 5)))
      this.notifWsAttempt = (this.notifWsAttempt || 0) + 1
      console.warn('[notif-ws] reconnect attempt', this.notifWsAttempt, 'in', delay, 'ms')
      this.notifWsTimer = setTimeout(() => { this.initNotificationsWebSocket() }, delay)
    },
    teardownNotificationsWebSocket() {
      try {
        if (this.notifWS) {
          console.log('[notif-ws] teardown: closing current connection')
          this.notifWS.onopen = null
          this.notifWS.onmessage = null
          this.notifWS.onclose = null
          this.notifWS.onerror = null
          this.notifWS.close()
        }
      } catch (e) { /* no-op */ }
      this.notifWS = null
      if (this.notifWsTimer) { clearTimeout(this.notifWsTimer); this.notifWsTimer = null }
      this.notifWsAttempt = 0
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
.notification-bell {
  position: relative;
}
.notif-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--error-color);
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  padding: 0 6px;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
}
.notifications-popover {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 380px;
  max-width: 80vw;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 3000;
  overflow: hidden;
}
.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
}
.notif-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.notif-refresh {
  font-size: 12px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  margin-right: 10px;
}
.notifications-body {
  max-height: 360px;
  overflow: auto;
}
.notif-loading, .notif-empty {
  padding: 14px;
  font-size: 13px;
  color: var(--text-secondary);
}
.notif-item {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-secondary);
}
.notif-item.unread {
  background: var(--bg-tertiary);
}
.notif-item-main {
  margin-bottom: 8px;
}
.notif-item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.notif-item-content {
  font-size: 13px;
  color: var(--text-secondary);
}
.notif-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notif-item-time {
  font-size: 12px;
  color: var(--text-tertiary);
}
.notif-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notif-action {
  font-size: 12px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
}
.notif-action.danger {
  color: var(--error-color);
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
.non-member-points {
  color: var(--text-tertiary);
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

/* 绑定状态入口 */
.bind-status-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-secondary);
  cursor: pointer;
  color: var(--text-secondary);
}
.bind-status-trigger:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}
.bind-status-icon {
  width: 16px;
  height: 16px;
}
.bind-status-text {
  font-size: 13px;
}

/* 绑定状态弹窗 */
.bind-status-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2600;
}
.bind-status-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  padding: 20px;
  width: 520px;
  max-width: calc(100% - 40px);
}
.bind-status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-secondary);
}
.bind-status-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}
.bind-status-close-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}
.bind-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-secondary);
}
.summary-item {
  background: var(--bg-tertiary);
  border-radius: 10px;
  padding: 12px;
}
.summary-label {
  font-size: 12px;
  color: var(--text-tertiary);
}
.summary-value {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}
.bind-section {
  padding: 14px 0;
}
.bind-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.bind-form {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.bind-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}
.bind-send-btn {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
}
.bind-confirm-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
}
.floating-toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 0.9);
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 4000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
