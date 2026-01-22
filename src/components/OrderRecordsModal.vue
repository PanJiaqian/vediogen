// 订单记录弹窗：查询最近订单并按类型筛选展示
<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="modal-header">
        <h3 class="modal-title">积分明细</h3>
        <!-- <span class="points-rules" @click="openRules">积分规则</span> -->
      </div>

      <div class="modal-body-custom">
        <!-- 顶部积分卡片 -->
        <!-- <div class="points-card">
          <div class="points-info">
            <div class="points-label">当前积分</div>
            <div class="points-value">{{ pointsBalance }}</div>
          </div>
          <button class="buy-btn" @click="openMembership">
            购买订阅
          </button>
        </div> -->

        <!-- 标签页切换 -->
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </div>
        </div>

        <!-- 列表内容 -->
        <div class="list-container">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>

          <div v-else-if="!filteredOrders || filteredOrders.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
               <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
               <rect x="9" y="3" width="6" height="4" rx="2" />
               <circle cx="14" cy="14" r="4" />
               <path d="M17 17l2 2" />
            </svg>
            <p>暂无记录</p>
          </div>

          <div v-else class="records-list">
            <div v-for="order in filteredOrders" :key="order.id" class="record-item">
              <div class="record-left">
                <div class="record-title">{{ order.title }}</div>
                <div class="record-time">{{ formatTime(order.time) }}</div>
              </div>
              <div class="record-right">
                <div class="record-amount" :class="{ 'positive': isPositive(order), 'negative': !isPositive(order) }">
                  {{ order.amount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { getOrdersList, getUserBasicStatus } from '@/api'
import { useUserStore } from '@/stores/user'

export default {
  name: 'OrderRecordsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      loading: false,
      orders: [],
      pointsBalance: 0,
      activeTab: 'all',
      tabs: [
        { id: 'all', name: '全部' },
        { id: 'consumption', name: '消费' },
        { id: 'subscription', name: '订阅' },
        { id: 'recharge', name: '充值' }
      ]
    }
  },
  computed: {
    filteredOrders() {
      if (!this.orders) return []

      return this.orders.filter(order => {
        if (this.activeTab === 'all') return true

        const categoryCn = String(order.category || '').trim()
        const title = String(order.title || '').toLowerCase()
        const type = String(order.orderType || '').toUpperCase()
        if (this.activeTab === 'consumption') {
          return categoryCn === '消耗' || type === 'CONSUMPTION' || title.includes('消费') || title.includes('扣除') || title.includes('使用')
        }
        if (this.activeTab === 'subscription') {
          return categoryCn === '订阅' || type === 'SUBSCRIPTION' || title.includes('会员') || title.includes('订阅')
        }
        if (this.activeTab === 'recharge') {
          return categoryCn === '充值' || type === 'RECHARGE' || title.includes('充值') || title.includes('积分')
        }
        return true
      })
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchData()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async fetchData() {
      const userStore = useUserStore()
      if (!userStore.token) return

      this.loading = true
      try {
        // 并行获取用户状态和订单列表
        const [statusRes, ordersRes] = await Promise.all([
          getUserBasicStatus(userStore.token),
          getOrdersList({ token: userStore.token, days: 90 })
        ])

        if (statusRes && statusRes.code === 0 && statusRes.data) {
          this.pointsBalance = Number(statusRes.data.pointsBalance) || 0
        }

        let list = []
        if (ordersRes && ordersRes.data) {
          if (Array.isArray(ordersRes.data)) {
            list = ordersRes.data
          } else if (ordersRes.data.records && Array.isArray(ordersRes.data.records)) {
            list = ordersRes.data.records
          }
        } else if (Array.isArray(ordersRes)) {
          list = ordersRes
        }
        this.orders = list
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        this.loading = false
      }
    },
    formatTime(time) {
      if (!time) return '-'
      try {
        const date = new Date(time)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return time
      }
    },
    isPositive(order) {
      const amt = String(order && order.amount || '').trim()
      if (amt.startsWith('-')) return false
      const cat = String(order && order.category || '').trim()
      if (cat === '消耗') return false
      return true
    },
    openMembership() {
      // 触发全局事件打开会员弹窗
      window.dispatchEvent(new CustomEvent('open-membership-modal'))
      // 可选：关闭当前弹窗
      // this.close()
    }
    // openRules() {
    //   alert('积分规则：\n1. 充值可获得积分\n2. 订阅会员每月赠送积分\n3. 生成视频消耗积分')
    // }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3200;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary, #ffffff);
  width: 500px; /* 调整宽度更像移动端/卡片风格 */
  max-width: 100%;
  height: 600px;
  max-height: 80vh;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: var(--text-primary, #333);
}

[data-theme="dark"] .modal-content {
  background: #1f1f1f;
  border: 1px solid #333;
  color: #e0e0e0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: var(--text-tertiary, #999);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text-primary, #333);
}

[data-theme="dark"] .close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.modal-header {
  padding: 20px;
  text-align: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.points-rules {
  position: absolute;
  right: 60px;
  top: 22px;
  font-size: 14px;
  color: var(--text-secondary, #666);
  cursor: pointer;
}

.modal-body-custom {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  overflow: hidden;
}

/* 积分卡片 */
.points-card {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
}

.points-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.buy-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.buy-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 标签页 */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-light, #eee);
  margin-bottom: 0;
}

[data-theme="dark"] .tabs {
  border-bottom-color: #333;
}

.tab-item {
  padding: 12px 20px;
  font-size: 14px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-item.active {
  color: var(--primary-color, #6366f1);
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--primary-color, #6366f1);
  border-radius: 2px 2px 0 0;
}

/* 列表容器 */
.list-container {
  flex: 1;
  overflow-y: auto;
  padding-top: 10px;
}

.records-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-light, #f5f5f5);
}

[data-theme="dark"] .record-item {
  border-bottom-color: #333;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #333);
}

[data-theme="dark"] .record-title {
  color: #e0e0e0;
}

.record-time {
  font-size: 12px;
  color: var(--text-tertiary, #999);
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
}

.record-amount.positive {
  color: #ef4444; /* 红色通常表示收入/增加，或者根据设计图调整 */
}

.record-amount.negative {
  color: #333;
}

[data-theme="dark"] .record-amount.negative {
  color: #e0e0e0;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-secondary, #666);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: var(--primary-color, #6366f1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
