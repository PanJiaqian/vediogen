<template>
  <div v-if="visible" class="payment-modal-overlay" @click.self="close">
    <div class="payment-modal">
      <button class="close-btn" @click="close">×</button>
      
      <div class="pay-summary" v-if="plan">
        <div class="summary-line">
          <span class="label">购买项目：</span>
          <span class="value">{{ plan.name || (plan.points + '积分') }}</span>
        </div>
        <div class="summary-line">
          <span class="label">价格：</span>
          <span class="value">¥{{ plan.price }}</span>
        </div>
      </div>
      
      <div class="pay-summary" v-if="userInfo">
        <div class="summary-line">
          <span class="label">用户昵称:</span>
          <span class="value">{{ userInfo.nickname || userInfo.name }}</span>
        </div>
        <div class="summary-line">
          <span class="label">用户id:</span>
          <span class="value">
            {{ userInfo.id }}
          </span>
        </div>
      </div>
      
      <div class="pay-title">请选择支付方式</div>
      <div class="pay-option-card selected">
        <div class="option-left">
          <svg class="option-check" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#1890ff" />
            <polyline points="8 12 11 15 16 9" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <img src="/Alipay.png" alt="支付宝" class="alipay-logo" />
          <div class="brand-text">
            <div class="cn">支付宝</div>
            <div class="en">ALIPAY</div>
          </div>
        </div>
        <img src="/tuijian.png" alt="推荐" class="recommend-badge" />
      </div>
      <button class="go-pay" @click="confirmPayment">去支付</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    plan: {
      type: Object,
      default: null
    },
    userInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close')
    },
    confirmPayment() {
      this.$router.push('/payment/success')
      this.$emit('success')
      this.close()
    },
  }
}
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3500;
  /* backdrop-filter: blur(4px); removed as requested */
}

.payment-modal {
  background: var(--bg-primary, #fff);
  border-radius: 12px;
  padding: 30px;
  box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
  position: relative;
  min-width: 360px;
  color: var(--text-primary, #333);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-tertiary, #999);
  font-size: 20px;
  cursor: pointer;
}

.pay-summary {
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-line:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--text-secondary, #666);
}

.value {
  font-weight: 500;
  color: var(--text-primary, #333);
}

.pay-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 16px;
}

.pay-option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-secondary, #e5e7eb);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-option-card.selected {
  border-color: #1890ff;
  background: var(--bg-secondary, #f0f9ff);
}

[data-theme="dark"] .pay-option-card.selected {
  background: rgba(24, 144, 255, 0.1);
}

.option-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-check {
  display: block;
}

.alipay-logo {
  height: 24px;
  width: auto;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.cn {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 4px; /* Added spacing */
}

.en {
  font-size: 10px;
  color: var(--text-tertiary, #999);
}

.recommend-badge {
  height: 18px;
  width: auto;
}

.go-pay {
  width: 100%;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.go-pay:hover {
  background: #096dd9;
}

/* Dark mode overrides if variables are not enough */
@media (prefers-color-scheme: dark) {
  .payment-modal {
    background: #1f1f1f;
    color: #e0e0e0;
  }
  
  .pay-summary {
    background: #141414;
  }
  
  .pay-option-card {
    background: #1f1f1f;
    border-color: #333;
  }
  
  .cn {
    color: #e0e0e0;
  }
}

[data-theme="dark"] .payment-modal {
  background: #1f1f1f;
  color: #e0e0e0;
}

[data-theme="dark"] .pay-summary {
  background: #141414;
}

[data-theme="dark"] .pay-option-card {
  background: #1f1f1f;
  border-color: #333;
}

[data-theme="dark"] .cn {
  color: #e0e0e0;
}
</style>
