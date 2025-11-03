// 性能优化工具函数

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @param {boolean} immediate 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 图片懒加载
 * @param {string} selector 图片选择器
 * @param {Object} options 配置选项
 */
export function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }

  const config = { ...defaultOptions, ...options }

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    }, config)

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img)
    })
  } else {
    // 降级处理
    document.querySelectorAll(selector).forEach(img => {
      img.src = img.dataset.src
      img.classList.remove('lazy')
      img.classList.add('loaded')
    })
  }
}

/**
 * 虚拟滚动类
 */
export class VirtualScroll {
  constructor(container, items, itemHeight, renderItem) {
    this.container = container
    this.items = items
    this.itemHeight = itemHeight
    this.renderItem = renderItem
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2
    this.startIndex = 0
    this.endIndex = this.visibleCount

    this.init()
  }

  init() {
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'

    // 创建虚拟容器
    this.virtualContainer = document.createElement('div')
    this.virtualContainer.style.height = `${this.items.length * this.itemHeight}px`
    this.container.appendChild(this.virtualContainer)

    // 创建可见区域容器
    this.visibleContainer = document.createElement('div')
    this.visibleContainer.style.position = 'absolute'
    this.visibleContainer.style.top = '0'
    this.visibleContainer.style.left = '0'
    this.visibleContainer.style.right = '0'
    this.virtualContainer.appendChild(this.visibleContainer)

    this.render()
    this.bindEvents()
  }

  render() {
    const visibleItems = this.items.slice(this.startIndex, this.endIndex)
    this.visibleContainer.innerHTML = ''

    visibleItems.forEach((item, index) => {
      const element = this.renderItem(item, this.startIndex + index)
      element.style.position = 'absolute'
      element.style.top = `${(this.startIndex + index) * this.itemHeight}px`
      element.style.left = '0'
      element.style.right = '0'
      element.style.height = `${this.itemHeight}px`
      this.visibleContainer.appendChild(element)
    })
  }

  bindEvents() {
    this.container.addEventListener('scroll', throttle(() => {
      const scrollTop = this.container.scrollTop
      this.startIndex = Math.floor(scrollTop / this.itemHeight)
      this.endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length)
      this.render()
    }, 16))
  }

  updateItems(newItems) {
    this.items = newItems
    this.virtualContainer.style.height = `${this.items.length * this.itemHeight}px`
    this.render()
  }
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.observers = []
  }

  // 监控页面加载性能
  measurePageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0]
        this.metrics.pageLoad = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        }
      })
    }
  }

  // 监控首次内容绘制
  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    }
  }

  // 监控最大内容绘制
  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    }
  }

  // 监控累积布局偏移
  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.metrics.cls = clsValue
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    }
  }

  // 获取所有性能指标
  getMetrics() {
    return this.metrics
  }

  // 清理观察者
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * 内存优化工具
 */
export const MemoryUtils = {
  // 清理未使用的对象引用
  cleanup(obj) {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
          this.cleanup(obj[key])
        }
        delete obj[key]
      })
    }
  },

  // 检查内存使用情况
  checkMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  },

  // 强制垃圾回收（仅在开发环境）
  forceGC() {
    if (process.env.NODE_ENV === 'development' && window.gc) {
      window.gc()
    }
  }
}

/**
 * 缓存管理
 */
export class CacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key) {
    if (this.cache.has(key)) {
      // 移动到最后（LRU策略）
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// 创建全局缓存实例
export const globalCache = new CacheManager(200)

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 自动启动性能监控
if (typeof window !== 'undefined') {
  performanceMonitor.measurePageLoad()
  performanceMonitor.measureFCP()
  performanceMonitor.measureLCP()
  performanceMonitor.measureCLS()
}
