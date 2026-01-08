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
    path: '/digital-video/:taskId?',
    name: 'DigitalVideo',
    component: () => import(/* webpackChunkName: "digital-video" */ '../views/DigitalVideo.vue')
  },
  {
    path: '/inspiration/:id',
    name: 'InspirationDetail',
    component: () => import(/* webpackChunkName: "inspiration-detail" */ '../views/InspirationDetailView.vue')
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import(/* webpackChunkName: "payment-success" */ '../views/PaymentSuccessView.vue'),
    meta: { hideSidebar: true }
  },
  {
    path: '/invited/:code',
    name: 'Invited',
    beforeEnter: (to, from, next) => {
      try { localStorage.setItem('app:invitationCode', String(to.params.code || '')) } catch (e) { /* no-op */ }
      next({ name: 'Home', query: { invited: String(to.params.code || '') } })
      setTimeout(() => {
        try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
      }, 50)
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 全局登录拦截：未登录时点击侧边栏受限页面弹出登录框
router.beforeEach((to, from, next) => {
  // 邀请链接全局兜底处理：任何 /invited/:code 都跳转到首页并弹出登录
  if (typeof to.path === 'string' && to.path.startsWith('/invited/')) {
    const parts = to.path.split('/')
    const code = (to.params && to.params.code) || (parts.length >= 3 ? parts[2] : '')
    try { localStorage.setItem('app:invitationCode', String(code || '')) } catch (e) { /* no-op */ }
    setTimeout(() => {
      try { window.dispatchEvent(new CustomEvent('open-login-modal')) } catch (e) { /* no-op */ }
    }, 50)
    return next({ name: 'Home', query: { invited: String(code || '') } })
  }
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
