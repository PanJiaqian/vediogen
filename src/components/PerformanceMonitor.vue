<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">FCP</div>
        <div class="metric-value">{{ formatTime(metrics.fcp) }}</div>
        <div class="metric-desc">首次内容绘制</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">LCP</div>
        <div class="metric-value">{{ formatTime(metrics.lcp) }}</div>
        <div class="metric-desc">最大内容绘制</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">CLS</div>
        <div class="metric-value">{{ formatScore(metrics.cls) }}</div>
        <div class="metric-desc">累积布局偏移</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">内存</div>
        <div class="metric-value">{{ formatMemory(memoryUsage) }}</div>
        <div class="metric-desc">已用内存</div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="refreshMetrics" class="refresh-btn">刷新</button>
      <button @click="clearCache" class="clear-btn">清除缓存</button>
    </div>
  </div>
  
  <button v-else @click="toggleMonitor" class="monitor-toggle">
    📊
  </button>
</template>

<script>
import { performanceMonitor, globalCache } from '@/utils/performance'

export default {
  name: 'PerformanceMonitor',
  data() {
    return {
      showMonitor: false,
      metrics: {
        fcp: 0,
        lcp: 0,
        cls: 0
      },
      memoryUsage: 0,
      updateInterval: null
    }
  },
  mounted() {
    this.refreshMetrics()
    this.startAutoUpdate()
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  },
  methods: {
    toggleMonitor() {
      this.showMonitor = !this.showMonitor
      if (this.showMonitor) {
        this.refreshMetrics()
      }
    },
    
    refreshMetrics() {
      this.metrics = performanceMonitor.getMetrics()
      this.updateMemoryUsage()
    },
    
    updateMemoryUsage() {
      if (performance.memory) {
        this.memoryUsage = performance.memory.usedJSHeapSize
      }
    },
    
    clearCache() {
      globalCache.clear()
      this.$message?.success?.('缓存已清除') || alert('缓存已清除')
    },
    
    startAutoUpdate() {
      this.updateInterval = setInterval(() => {
        if (this.showMonitor) {
          this.refreshMetrics()
        }
      }, 5000)
    },
    
    formatTime(time) {
      if (!time) return '-'
      return `${Math.round(time)}ms`
    },
    
    formatScore(score) {
      if (score === undefined || score === null) return '-'
      return score.toFixed(3)
    },
    
    formatMemory(bytes) {
      if (!bytes) return '-'
      const mb = bytes / (1024 * 1024)
      return `${mb.toFixed(1)}MB`
    }
  }
}
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.monitor-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.metric-desc {
  font-size: 10px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.refresh-btn,
.clear-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.refresh-btn:hover {
  background: #0056b3;
}

.clear-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.clear-btn:hover {
  background: #e9ecef;
}

.monitor-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 20px;
  z-index: 9999;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .performance-monitor {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .monitor-toggle {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .performance-monitor {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .monitor-header h4 {
    color: #fff;
  }
  
  .close-btn {
    color: #ccc;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  .metric-card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .metric-value {
    color: #fff;
  }
  
  .clear-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .monitor-toggle {
    background: rgba(30, 30, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>