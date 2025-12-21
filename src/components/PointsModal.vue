<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="modal-header">
        <h2 class="title">选择适合你的积分套餐</h2>
        <p class="subtitle">或订阅织梦会员套餐</p>
      </div>

      <div class="plans-container">
        <div class="plan-card" v-for="(plan, index) in plans" :key="index">
          <div class="plan-header">
            <div class="points-amount">✨ {{ plan.points }}</div>
          </div>
          <div class="plan-desc">
            约生成{{ Math.floor(plan.points / 10) }}个视频片段<br>或{{ plan.points }}张图片
          </div>
          <div class="plan-footer">
            <div class="plan-price">¥{{ plan.price }}</div>
            <button class="buy-btn" @click="buyPoints(plan)">立即购买</button>
          </div>
        </div>
      </div>
      
      <div class="modal-footer-note">
        ① 积分不可兑换会员，不可转赠或提现；充值后有效期为2年，不支持退换或反向兑换成人民币。
      </div>

      <PaymentModal 
        :visible="showPayment" 
        :plan="selectedPlan" 
        :user-info="userInfo" 
        @close="showPayment = false" 
        @success="close"
      />
    </div>
  </div>
</template>

<script>
import PaymentModal from './PaymentModal.vue'
import { createRechargeOrder } from '../api'
import { useUserStore } from '../stores/user'

export default {
  name: 'PointsModal',
  components: {
    PaymentModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  data() {
    return {
      plans: [
        { points: 500, price: 50 },
        { points: 1000, price: 98 },
        { points: 3000, price: 280 }
      ],
      showPayment: false,
      selectedPlan: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async buyPoints(plan) {
      try {
        const userStore = useUserStore()
        const res = await createRechargeOrder({
          token: userStore.token,
          amount: plan.price,
          rechargePoints: plan.points
        })
        
        if (res.code === 0) {
          this.selectedPlan = {
            name: plan.points + '积分',
            price: plan.price,
            points: plan.points,
            orderNo: res.data.orderNo
          }
          this.showPayment = true
        } else {
          console.error('Failed to create order:', res.message)
        }
      } catch (error) {
        console.error('Error creating order:', error)
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(to bottom, #e6f7ff 0%, #f0f9ff 20%, #ffffff 40%);
  width: 900px;
  max-width: 95vw;
  border-radius: 24px;
  padding: 40px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: linear-gradient(to bottom, #001529 0%, #001f3d 20%, #141414 40%);
    color: #e0e0e0;
  }
}

[data-theme="dark"] .modal-content {
  background: linear-gradient(to bottom, #001529 0%, #001f3d 20%, #141414 40%);
  color: #e0e0e0;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0,0,0,0.05);
}

[data-theme="dark"] .close-btn {
  color: #ccc;
}

[data-theme="dark"] .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

[data-theme="dark"] .title {
  color: #fff;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

[data-theme="dark"] .subtitle {
  color: #aaa;
}

.plans-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.plan-card {
  background: #fff;
  border: 1px solid #eef0f5;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

[data-theme="dark"] .plan-card {
  background: #1f1f1f;
  border-color: #333;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border-color: #bce3ff;
}

[data-theme="dark"] .plan-card:hover {
  border-color: #163a5e;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.points-amount {
  font-size: 28px;
  font-weight: 700;
  color: #333; /* Greenish teal */
  margin-bottom: 12px;
}

.plan-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin-bottom: 30px;
  flex: 1;
}

[data-theme="dark"] .plan-desc {
  color: #aaa;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-price {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

[data-theme="dark"] .plan-price {
  color: #fff;
}

.buy-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

[data-theme="dark"] .buy-btn {
  background: #333;
  border-color: #444;
  color: #ccc;
}

.buy-btn:hover {
  border-color: #00b96b;
  color: #00b96b;
}

[data-theme="dark"] .buy-btn:hover {
  border-color: #00b96b;
  color: #00b96b;
}

.modal-footer-note {
  text-align: center;
  font-size: 12px;
  color: #bbb;
  margin-top: 20px;
}
</style>
