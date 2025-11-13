import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
  },
  {
    path: '/my-projects',
    name: 'MyProjects',
    component: () => import(/* webpackChunkName: "my-projects" */ '../views/MyProjectsView.vue')
  },
  {
    path: '/asset-library',
    name: 'AssetLibrary',
    component: () => import(/* webpackChunkName: "asset-library" */ '../views/AssetLibraryView.vue')
  },
  {
    path: '/digital-human',
    name: 'DigitalHuman',
    component: () => import(/* webpackChunkName: "digital-human" */ '../views/DigitalHumanView.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import(/* webpackChunkName: "project-detail" */ '../views/ProjectDetailView.vue')
  },
  {
    path: '/conversation',
    name: 'Conversation',
    component: () => import(/* webpackChunkName: "conversation" */ '../views/ConversationView.vue'),
    meta: { hideSidebar: true }
  },
  {
    path: '/generation-steps/:id',
    name: 'GenerationSteps',
    component: () => import(/* webpackChunkName: "generation-steps" */ '../views/GenerationStepsView.vue')
  },
  {
    path: '/video-edit/:id',
    name: 'VideoEdit',
    component: () => import(/* webpackChunkName: "video-edit" */ '../views/VideoEditView.vue')
  },
  {
    path: '/inspiration/:id',
    name: 'InspirationDetail',
    component: () => import(/* webpackChunkName: "inspiration-detail" */ '../views/InspirationDetailView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 全局登录拦截：未登录时点击侧边栏受限页面弹出登录框
router.beforeEach((to, from, next) => {
  const protectedNames = ['MyProjects', 'AssetLibrary', 'DigitalHuman']
  try {
    const { useUserStore } = require('../stores/user')
    const userStore = useUserStore()
    if (!userStore?.isLoggedIn && protectedNames.includes(to.name)) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return next(false)
    }
  } catch (e) {
    // store 加载失败时不拦截，避免阻塞导航
  }
  next()
})

export default router
