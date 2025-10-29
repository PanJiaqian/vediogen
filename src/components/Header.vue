<template>
  <header class="header" :class="{ 'header--sidebar-collapsed': sidebarCollapsed }">
    <div class="header__content">
      <!-- 左侧区域 -->
      <div class="header__left">
        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn visible-mobile" @click="toggleMobileMenu">
          <svg class="mobile-menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 面包屑导航 -->
        <nav class="breadcrumb hidden-mobile">
          <ol class="breadcrumb__list">
            <li class="breadcrumb__item">
              <router-link to="/" class="breadcrumb__link">首页</router-link>
            </li>
            <li class="breadcrumb__separator" v-if="currentPageName">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </li>
            <li class="breadcrumb__item" v-if="currentPageName">
              <span class="breadcrumb__current">{{ currentPageName }}</span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- 右侧区域 -->
      <div class="header__right">
        <!-- 搜索框 -->
        <div class="search-box hidden-mobile">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索项目、模板..."
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <!-- 通知按钮 -->
          <button class="action-btn notification-btn" @click="toggleNotifications">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
          </button>

          <!-- 帮助按钮 -->
          <button class="action-btn help-btn" @click="toggleHelp">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- 用户头像下拉菜单 -->
          <div class="user-dropdown" @click="toggleUserMenu" v-click-outside="closeUserMenu">
            <div class="user-avatar">
              <img :src="userAvatars.small" alt="用户头像" class="avatar-img">
              <span class="user-name hidden-mobile">用户名</span>
              <svg class="dropdown-arrow" :class="{ 'dropdown-arrow--open': userMenuOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- 用户菜单 -->
            <div class="user-menu" v-show="userMenuOpen">
              <div class="user-menu__header">
                <div class="user-info">
                  <img :src="userAvatars.default" alt="用户头像" class="user-info__avatar">
                  <div class="user-info__details">
                    <div class="user-info__name">用户名</div>
                    <div class="user-info__email">user@example.com</div>
                  </div>
                </div>
              </div>
              <div class="user-menu__body">
                <a href="#" class="user-menu__item">
                  <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  个人资料
                </a>
                <a href="#" class="user-menu__item">
                  <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  设置
                </a>
                <div class="user-menu__divider"></div>
                <a href="#" class="user-menu__item user-menu__item--danger" @click="handleLogout">
                  <svg class="menu-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  退出登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { userAvatars } from '@/utils/placeholder'

export default {
  name: 'AppHeader',
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchQuery: '',
      userMenuOpen: false,
      notificationCount: 3,
      userAvatars
    }
  },
  computed: {
    currentPageName() {
      const routeMap = {
        '/': '',
        '/projects': '我的项目',
        '/library': '主体库',
        '/avatar': '数字人模块'
      }
      return routeMap[this.$route.path] || ''
    }
  },
  methods: {
    toggleMobileMenu() {
      this.$emit('toggle-mobile-menu')
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        console.log('搜索:', this.searchQuery)
        // 实现搜索逻辑
      }
    },
    toggleNotifications() {
      console.log('切换通知')
      // 实现通知逻辑
    },
    toggleHelp() {
      console.log('切换帮助')
      // 实现帮助逻辑
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    closeUserMenu() {
      this.userMenuOpen = false
    },
    handleLogout() {
      console.log('退出登录')
      // 实现退出登录逻辑
    }
  },
  directives: {
    'click-outside': {
      bind(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value()
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unbind(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-secondary);
  z-index: 999;
  transition: left var(--transition-normal);
}

.header--sidebar-collapsed {
  left: 64px;
}

.header__content {
  height: 100%;
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 左侧区域 */
.header__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: background-color var(--transition-fast);
}

.mobile-menu-btn:hover {
  background-color: var(--bg-tertiary);
}

.mobile-menu-icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

/* 面包屑导航 */
.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  list-style: none;
}

.breadcrumb__link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.breadcrumb__link:hover {
  color: var(--primary-color);
}

.breadcrumb__separator svg {
  width: 12px;
  height: 12px;
  color: var(--text-quaternary);
}

.breadcrumb__current {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* 右侧区域 */
.header__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

/* 搜索框 */
.search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 300px;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px;
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  background-color: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary-color);
  background-color: var(--bg-primary);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
}

.action-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--error-color);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  padding: 2px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  transition: background-color var(--transition-fast);
}

.user-avatar:hover {
  background-color: var(--bg-tertiary);
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
}

.dropdown-arrow--open {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin-top: var(--spacing-sm);
}

.user-menu__header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.user-info__email {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.user-menu__body {
  padding: var(--spacing-sm) 0;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.user-menu__item:hover {
  background-color: var(--bg-tertiary);
}

.user-menu__item--danger {
  color: var(--error-color);
}

.menu-item-icon {
  width: 16px;
  height: 16px;
  color: currentColor;
}

.user-menu__divider {
  height: 1px;
  background-color: var(--border-secondary);
  margin: var(--spacing-sm) 0;
}

/* 响应式设计 */

/* 超小屏幕 (手机, 小于 480px) */
@media (max-width: 479px) {
  .header {
    left: 0;
    height: 56px;
  }
  
  .header--sidebar-collapsed {
    left: 0;
  }
  
  .header__content {
    padding: 0 var(--spacing-md);
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .search-box {
    display: none;
  }
  
  .action-buttons {
    gap: var(--spacing-xs);
  }
  
  .action-btn {
    padding: var(--spacing-xs);
    min-width: 36px;
    min-height: 36px;
  }
  
  .user-name {
    display: none;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
}

/* 小屏幕 (平板, 480px 到 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .header {
    left: 0;
    height: 60px;
  }
  
  .header--sidebar-collapsed {
    left: 0;
  }
  
  .header__content {
    padding: 0 var(--spacing-lg);
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .breadcrumb__list {
    gap: var(--spacing-xs);
  }
  
  .breadcrumb__link,
  .breadcrumb__current {
    font-size: var(--font-size-xs);
  }
  
  .search-input {
    width: 180px;
  }
  
  .action-buttons {
    gap: var(--spacing-sm);
  }
  
  .user-name {
    display: none;
  }
}

/* 中等屏幕 (小型桌面, 768px 到 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .header {
    left: 240px;
  }
  
  .header--sidebar-collapsed {
    left: 60px;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .search-input {
    width: 220px;
  }
  
  .user-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 大屏幕 (桌面, 992px 到 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .header {
    left: 260px;
  }
  
  .header--sidebar-collapsed {
    left: 64px;
  }
  
  .search-input {
    width: 280px;
  }
}

/* 超大屏幕 (大桌面, 1200px 及以上) */
@media (min-width: 1200px) {
  .header {
    left: 280px;
  }
  
  .header--sidebar-collapsed {
    left: 64px;
  }
  
  .search-input {
    width: 320px;
  }
}

/* 高度适配 */
@media (max-height: 600px) {
  .header {
    height: 56px;
  }
  
  .header__content {
    padding: 0 var(--spacing-lg);
  }
  
  .action-btn {
    padding: var(--spacing-xs);
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .action-btn {
    min-width: 44px;
    min-height: 44px;
    padding: var(--spacing-sm);
  }
  
  .mobile-menu-btn {
    min-width: 44px;
    min-height: 44px;
    padding: var(--spacing-sm);
  }
  
  .user-menu__item {
    min-height: 44px;
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}

/* 横屏模式优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .header {
    height: 48px;
  }
  
  .user-dropdown {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>