import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { performanceMonitor, lazyLoadImages } from './utils/performance'

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 性能优化配置
app.config.performance = true

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
  // 在生产环境中，可以将错误发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    // 发送错误到监控服务
    // errorReportingService.report(err, vm, info)
  }
}

// 挂载应用
app.mount('#app')

// 页面加载完成后的优化
document.addEventListener('DOMContentLoaded', () => {
  // 启用图片懒加载
  lazyLoadImages('img[data-src]')

  // 预加载关键资源
  const criticalResources = [
    '/api/user/profile',
    '/api/projects/recent'
  ]

  criticalResources.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
})

// 页面可见性变化时的优化
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 页面隐藏时暂停不必要的操作
    console.log('Page hidden - pausing background tasks')
  } else {
    // 页面显示时恢复操作
    console.log('Page visible - resuming background tasks')
  }
})

// 在开发环境中显示性能指标
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const metrics = performanceMonitor.getMetrics()
    console.log('Performance Metrics:', metrics)
  }, 3000)
}
