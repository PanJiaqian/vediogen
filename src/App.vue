<template>
  <div id="app">
    <!-- 侧边栏 -->
    <Sidebar 
      :isCollapsed="sidebarCollapsed" 
      @toggle="toggleSidebar"
      class="sidebar"
      :class="{ 'sidebar--collapsed': sidebarCollapsed }"
    />
    
    <!-- 主要内容区域 -->
    <div class="main-layout" :class="{ 'main-layout--expanded': sidebarCollapsed }">
      <!-- 顶部导航 -->
      <Header 
        @toggle-mobile-menu="toggleMobileMenu"
        class="header"
      />
      
      <!-- 页面内容 -->
      <main class="main-content">
        <router-view/>
      </main>
    </div>
    
    <!-- 移动端遮罩 -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>
    

  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
// 导入全局样式
import '@/assets/css/global.css'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
  },
  data() {
    return {
      sidebarCollapsed: false,
      mobileMenuOpen: false
    }
  },
  computed: {
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    }
  }
}
</script>

<style>
@import '@/styles/global.css';

#app {
  /* display: flex; */
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: transform var(--transition-normal);
}

.sidebar--collapsed {
  transform: translateX(-240px);
}

/* 主布局区域 */
.main-layout {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-normal);
}

.main-layout--expanded {
  margin-left: 60px;
}

/* 顶部导航 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 1;
  transition: opacity var(--transition-fast);
}

/* 响应式设计 */

/* 超小屏幕 (手机, 小于 480px) */
@media (max-width: 479px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar--collapsed {
    transform: translateX(0);
  }
  
  .main-layout {
    margin-left: 0;
    margin-top: 56px;
  }
  
  .main-layout--expanded {
    margin-left: 0;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - 56px);
  }
}

/* 小屏幕 (平板, 480px 到 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar--collapsed {
    transform: translateX(0);
  }
  
  .main-layout {
    margin-left: 0;
    margin-top: 60px;
  }
  
  .main-layout--expanded {
    margin-left: 0;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - 60px);
  }
}

/* 中等屏幕 (小型桌面, 768px 到 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .main-layout {
    margin-left: 240px;
    margin-top: var(--header-height);
  }
  
  .main-layout--expanded {
    margin-left: 60px;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - var(--header-height));
  }
}

/* 大屏幕 (桌面, 992px 到 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .main-layout {
    margin-left: 260px;
    margin-top: var(--header-height);
  }
  
  .main-layout--expanded {
    margin-left: 64px;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - var(--header-height));
  }
}

/* 超大屏幕 (大桌面, 1200px 及以上) */
@media (min-width: 1200px) {
  .main-layout {
    margin-left: 280px;
    margin-top: var(--header-height);
  }
  
  .main-layout--expanded {
    margin-left: 64px;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - var(--header-height));
  }
}

/* 高度适配 */
@media (max-height: 600px) {
  .main-content {
    padding: 0;
  }
}

/* 横屏模式优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .main-layout {
    margin-top: 48px;
  }
  
  .main-content {
    padding: 0;
    min-height: calc(100vh - 48px);
  }
}

/* 打印样式 */
@media print {
  .sidebar,
  .header,
  .mobile-overlay {
    display: none !important;
  }
  
  .main-layout {
    margin: 0 !important;
  }
  
  .main-content {
    padding: 0 !important;
    min-height: auto !important;
  }
}
</style>
