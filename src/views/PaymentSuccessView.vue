// 支付成功页：展示支付结果并引导用户回首页或查看订单
<template>
  <div class="payment-success-view">
    <div class="success-card">
      <div class="success-icon-wrapper">
        <svg class="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#22C55E" />
          <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <h1 class="success-title">支付成功!</h1>
      <p class="success-subtitle">恭喜您，支付已完成</p>

      <div class="actions">
        <button class="btn btn-outline" @click="viewOrder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          查看订单
        </button>
        <button class="btn btn-primary" @click="goHome">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'PaymentSuccessView',
  methods: {
    goHome() {
      this.$router.push('/')
    },
    async viewOrder() {
      await this.$router.push('/')
      try {
        window.dispatchEvent(new CustomEvent('open-order-records-modal'))
      } catch (e) { /* no-op */ }
    }
  }
}
</script>

<style scoped>
.payment-success-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

[data-theme="dark"] .payment-success-view {
  background: #000000;
}

.success-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  width: 480px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: slideUp 0.5s ease-out;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

[data-theme="dark"] .success-card {
  background: #141414;
  color: #ffffff;
  border: 1px solid #333;
  box-shadow: none;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.success-icon-wrapper {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

.success-icon {
  width: 100%;
  height: 100%;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

[data-theme="dark"] .success-title {
  color: #f9fafb;
}

.success-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
}

[data-theme="dark"] .success-subtitle {
  color: #9ca3af;
}

.benefits-card {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  margin-bottom: 32px;
  color: #374151;
}

[data-theme="dark"] .benefits-card {
  background: #1f1f1f;
  border: 1px solid #333;
  color: #e5e7eb;
}

.benefits-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #111827;
}

[data-theme="dark"] .benefits-header {
  color: #fff;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  justify-content: flex-start;
  padding-left: 10px;
}

.actions {
  display: flex;
  gap: 16px;
  width: 100%;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-outline {
  background: #fff;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  background: #f9f9f9;
  border-color: #ccc;
}

[data-theme="dark"] .btn-outline {
  background: transparent;
  border-color: #444;
  color: #ccc;
}

[data-theme="dark"] .btn-outline:hover {
  background: rgba(255,255,255,0.05);
}

.btn-primary {
  background: #1890ff;
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-primary:hover {
  background: #096dd9;
  transform: translateY(-1px);
}
</style>
