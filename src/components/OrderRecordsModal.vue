<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class="modal-header">
        <h3 class="modal-title">订单记录</h3>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="!orders || orders.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
             <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
             <rect x="9" y="3" width="6" height="4" rx="2" />
             <circle cx="14" cy="14" r="4" />
             <path d="M17 17l2 2" />
          </svg>
          <p>暂无购买订单记录</p>
        </div>

        <div v-else class="table-container">
          <table class="order-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>类型</th>
                <th>金额</th>
                <th>分类</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="col-id">{{ order.id }}</td>
                <td>{{ order.title }}</td>
                <td class="col-amount">{{ order.amount }}</td>
                <td>
                  <span class="status-badge status-gray">
                    {{ order.category }}
                  </span>
                </td>
                <td class="col-time">{{ formatTime(order.time) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrdersList } from '@/api'
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
      orders: []
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchOrders()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async fetchOrders() {
      const userStore = useUserStore()
      if (!userStore.token) return

      this.loading = true
      try {
        const res = await getOrdersList({ token: userStore.token, days: 90 })
        // Handle various response structures
        let list = []
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            list = res.data
          } else if (res.data.records && Array.isArray(res.data.records)) {
            list = res.data.records
          }
        } else if (Array.isArray(res)) {
          list = res
        }
        this.orders = list
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        this.loading = false
      }
    },
    formatTime(time) {
      if (!time) return '-'
      try {
        const date = new Date(time)
        return date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return time
      }
    }
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
  width: 700px;
  max-width: 100%;
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
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-light, #eee);
}

[data-theme="dark"] .modal-header {
  border-bottom-color: #333;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  min-height: 300px;
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
  border-top-color: var(--primary-color, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.order-table th {
  text-align: left;
  padding: 16px 24px;
  background: var(--bg-secondary, #f9f9f9);
  color: var(--text-secondary, #666);
  font-weight: 500;
  white-space: nowrap;
}

[data-theme="dark"] .order-table th {
  background: #2a2a2a;
  color: #aaa;
}

.order-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light, #eee);
  color: var(--text-primary, #333);
}

[data-theme="dark"] .order-table td {
  border-bottom-color: #333;
  color: #e0e0e0;
}

.col-id {
  font-family: monospace;
  color: var(--text-secondary, #666);
}

.col-amount {
  font-weight: 600;
}

.col-time {
  color: var(--text-secondary, #999);
  font-size: 13px;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.status-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.status-gray { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

[data-theme="dark"] .status-green { background: rgba(34, 197, 94, 0.2); }
[data-theme="dark"] .status-orange { background: rgba(249, 115, 22, 0.2); }
[data-theme="dark"] .status-red { background: rgba(239, 68, 68, 0.2); }
[data-theme="dark"] .status-gray { background: rgba(107, 114, 128, 0.2); }
</style>
