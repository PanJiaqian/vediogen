<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Logo区域 -->
    <div class="sidebar__logo">
      <div class="logo">
        <svg class="logo__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo__text" v-if="!collapsed">织梦</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar__nav">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link 
            to="/" 
            class="nav-link"
            active-class="nav-link--active"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">首页</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link 
            to="/my-projects" 
            class="nav-link"
            active-class="nav-link--active"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">我的项目</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link 
            to="/asset-library" 
            class="nav-link"
            :class="{ 'nav-link--active': $route.path === '/asset-library' }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text" v-if="!collapsed">素材库</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link 
            to="/digital-human" 
            class="nav-link"
            :class="{ 'nav-link--active': $route.path === '/digital-human' }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 4h4v3h-4V4zm8 16H6v-9h12v9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text" v-if="!collapsed">数字人</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 折叠按钮 -->
    <div class="sidebar__toggle" @click="toggleSidebar">
      <svg class="toggle-icon" :class="{ 'toggle-icon--rotated': collapsed }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppSidebar',
  data() {
    return {
      collapsed: false
    }
  },
  methods: {
    toggleSidebar() {
      this.collapsed = !this.collapsed
      this.$emit('toggle', this.collapsed)
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  z-index: 1000;
}

.sidebar--collapsed {
  width: 64px;
}

/* Logo区域 */
.sidebar__logo {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo__icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.logo__text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
}

/* 导航区域 */
.sidebar__nav {
  flex: 1;
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
}

.nav-item {
  margin-bottom: var(--spacing-xs);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 0 24px 24px 0;
  margin-right: var(--spacing-lg);
}

.nav-link:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link--active {
  background-color: var(--primary-color);
  color: white;
}

.nav-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--primary-color);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
}

.nav-badge {
  background-color: var(--error-color);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

/* 折叠按钮 */
.sidebar__toggle {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-secondary);
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.sidebar__toggle:hover {
  background-color: var(--bg-tertiary);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  transition: transform var(--transition-normal);
}

.toggle-icon--rotated {
  transform: rotate(180deg);
}

/* 响应式设计 */

/* 超小屏幕 (手机, 小于 480px) */
@media (max-width: 479px) {
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar--mobile-open {
    transform: translateX(0);
  }
  
  .sidebar__logo {
    padding: var(--spacing-md);
  }
  
  .logo__text {
    font-size: var(--font-size-md);
  }
  
  .nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
    margin-right: var(--spacing-md);
  }
  
  .nav-text {
    font-size: var(--font-size-sm);
  }
  
  .sidebar__toggle {
    padding: var(--spacing-md);
  }
}

/* 小屏幕 (平板, 480px 到 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .sidebar {
    width: 300px;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar--mobile-open {
    transform: translateX(0);
  }
}

/* 中等屏幕 (小型桌面, 768px 到 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .sidebar {
    width: 240px;
  }
  
  .sidebar--collapsed {
    width: 60px;
  }
  
  .nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
    margin-right: var(--spacing-md);
  }
}

/* 大屏幕 (桌面, 992px 到 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .sidebar {
    width: 260px;
  }
  
  .sidebar--collapsed {
    width: 64px;
  }
}

/* 超大屏幕 (大桌面, 1200px 及以上) */
@media (min-width: 1200px) {
  .sidebar {
    width: 280px;
  }
  
  .sidebar--collapsed {
    width: 64px;
  }
}

/* 高度适配 */
@media (max-height: 600px) {
  .sidebar__logo {
    padding: var(--spacing-sm) var(--spacing-lg);
  }
  
  .sidebar__nav {
    padding: var(--spacing-sm) 0;
  }
  
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-lg);
  }
  
  .sidebar__toggle {
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-link {
    padding: var(--spacing-md) var(--spacing-lg);
    min-height: 48px;
  }
  
  .sidebar__toggle {
    min-height: 48px;
    padding: var(--spacing-md) var(--spacing-lg);
  }
}
</style>