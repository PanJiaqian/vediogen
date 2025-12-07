<template>
  <div v-if="visible" class="membership-modal-overlay" @click.self="close">
    <div class="membership-modal">
      <button class="close-btn" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="modal-header">
        <h2 class="title">订阅 织梦 畅享更多权益</h2>
        <p class="subtitle">选择适合你的会员套餐或<span class="link">购买积分</span></p>
      </div>

      <div class="plan-tabs">
        <div class="tab active">单月购买</div>
        <!-- <div class="tab">按年购买 <span class="discount">8折起</span></div> -->
      </div>

      <div class="plans-container">
        <!-- 免费会员 -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-icon">✨</div>
            <div class="plan-name">免费会员</div>
          </div>
          <div class="plan-price">
            <span class="currency">¥</span>
            <span class="amount">0</span>
            <span class="period">/月</span>
          </div>
          <button class="plan-btn disabled">当前计划</button>
          <div class="plan-features">
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              每日登录赠送积分
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              成片支持生成最多30个分镜
            </div>
          </div>
        </div>

        <!-- 标准会员 -->
        <div class="plan-card highlight">
          <div class="plan-header">
            <div class="plan-icon">👑</div>
            <div class="plan-name">标准会员</div>
          </div>
          <div class="plan-price">
            <span class="currency">¥</span>
            <span class="amount">50</span>
            <div class="price-info">
              <span class="original">首购特惠</span>
              <span class="period">原价 ¥60/月</span>
            </div>
          </div>
          <button class="plan-btn primary" @click="openAlipay({ name: '标准会员', price: 50, points: 500 })">订阅计划</button>
          <div class="plan-features">
            <div class="feature-item highlight-text">
              <svg class="sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              每月500积分
            </div>
            <div class="feature-desc">约生成50个视频片段或500张图片</div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              每日登录赠送积分
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              成片支持生成最多50个分镜
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              高清视频生成
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              专项快速生成通道
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              下载去水印
            </div>
          </div>
        </div>

        <!-- 高级会员 -->
        <div class="plan-card highlight">
          <div class="tag-badge">最划算</div>
          <div class="plan-header">
            <div class="plan-icon">💎</div>
            <div class="plan-name">高级会员</div>
          </div>
          <div class="plan-price">
            <span class="currency">¥</span>
            <span class="amount">280</span>
            <div class="price-info">
              <span class="original">首购特惠</span>
              <span class="period">原价 ¥300/月</span>
            </div>
          </div>
          <button class="plan-btn primary" @click="openAlipay({ name: '高级会员', price: 280, points: 3000 })">订阅计划</button>
          <div class="plan-features">
            <div class="feature-item highlight-text">
              <svg class="sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              每月3000积分
            </div>
            <div class="feature-desc">约生成300个视频片段或3000张图片</div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              每日登录赠送积分
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              成片支持生成最多80个分镜
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              高清视频生成
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              专项快速生成通道
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              下载去水印
            </div>
          </div>
        </div>

        <!-- 企业会员 -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-icon">💼</div>
            <div class="plan-name">企业会员</div>
          </div>
          <div class="plan-price custom">
            <span class="custom-text">定制报价</span>
            <div class="price-info">
              <span class="contact">联系我们</span>
              <span class="get-now">立即获取</span>
            </div>
          </div>
          <button class="plan-btn primary">联系我们</button>
          <div class="plan-features">
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              团队空间
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              多账号协同
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              每日登录赠送积分
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              成片支持生成最多120个分镜
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              高清视频生成
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              专项快速生成通道
            </div>
            <div class="feature-item">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              下载去水印
            </div>
          </div>
        </div>
      </div>
      <div v-if="alipayVisible" class="alipay-overlay" @click.self="closeAlipay">
        <div class="alipay-modal">
          <button class="alipay-close" @click="closeAlipay">×</button>
          <div class="pay-summary" v-if="currentPlan">
            <div class="summary-line"><span class="label">购买项目：</span><span class="value">{{ currentPlan.name }}</span>
            </div>
            <div class="summary-line"><span class="label">价格：</span><span class="value">¥{{ currentPlan.price
                }}/月</span></div>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'MembershipModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      alipayVisible: false,
      paymentChecked: false,
      currentPlan: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    openAlipay(plan) {
      this.currentPlan = plan || null
      this.paymentChecked = false
      this.alipayVisible = true
    },
    closeAlipay() {
      this.alipayVisible = false
    },
    confirmPayment() {
      // 这里仅保留交互，实际支付逻辑由后端或第三方处理
      this.alipayVisible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.membership-modal-overlay {
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

.membership-modal {
  background: linear-gradient(to bottom, #e6f7ff 0%, #f0f9ff 20%, #ffffff 40%);
  width: 1100px;
  max-width: 95vw;
  border-radius: 24px;
  padding: 40px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: modalSlideUp 0.3s ease-out;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .membership-modal {
    background: linear-gradient(to bottom, #001529 0%, #001f3d 20%, #141414 40%);
    color: #e0e0e0;
  }
}

[data-theme="dark"] .membership-modal {
  background: linear-gradient(to bottom, #001529 0%, #001f3d 20%, #141414 40%);
  color: #e0e0e0;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

@media (prefers-color-scheme: dark) {
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ccc;
  }
}

[data-theme="dark"] .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #1a1a1a;
}

[data-theme="dark"] .title {
  color: #ccc;
}

@media (prefers-color-scheme: dark) {
  .title {
    color: #fff;
  }
}

.subtitle {
  color: #666;
  font-size: 14px;
}

@media (prefers-color-scheme: dark) {
  .subtitle {
    color: #aaa;
  }
}

.link {
  color: #1890ff;
  cursor: pointer;
}

.plan-tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 30px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 24px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

@media (prefers-color-scheme: dark) {
  .plan-tabs {
    background: #1f1f1f;
  }
}

[data-theme="dark"] .plan-tabs {
  background: #1f1f1f;
}

.tab {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

@media (prefers-color-scheme: dark) {
  .tab {
    color: #aaa;
  }
}

[data-theme="dark"] .tab {
  color: #aaa;
}

.tab.active {
  background: #fff;
  color: #1890ff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .tab.active {
    background: #333;
    color: #1890ff;
  }
}

[data-theme="dark"] .tab.active {
  background: #333;
  color: #1890ff;
}

.plans-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.plan-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid transparent;
  transition: all 0.2s;
}

@media (prefers-color-scheme: dark) {
  .plan-card {
    background: #1f1f1f;
    border-color: #333;
  }
}

[data-theme="dark"] .plan-card {
  background: #1f1f1f;
  border-color: #333;
}

.plan-card.highlight {
  border-color: #e6f7ff;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.08);
}

@media (prefers-color-scheme: dark) {
  .plan-card.highlight {
    border-color: #163a5e;
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.15);
  }
}

[data-theme="dark"] .plan-card.highlight {
  border-color: #163a5e;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.15);
}

.tag-badge {
  position: absolute;
  top: -10px;
  right: 10px;
  background: linear-gradient(90deg, #ffc107, #ff9800);
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 10px 0 10px 0;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.2);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.plan-icon {
  font-size: 20px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .plan-name {
    color: #fff;
  }
}

[data-theme="dark"] .plan-name {
  color: #fff;
}

.plan-price {
  margin-bottom: 20px;
  height: 48px;
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .currency {
    color: #fff;
  }
}

[data-theme="dark"] .currency {
  color: #fff;
}

.amount {
  font-size: 36px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin: 0 4px;
}

@media (prefers-color-scheme: dark) {
  .amount {
    color: #fff;
  }
}

[data-theme="dark"] .amount {
  color: #fff;
}

.period {
  font-size: 12px;
  color: #999;
}

.price-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.original {
  font-size: 12px;
  color: #999;
}

.plan-price.custom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.custom-text {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.contact,
.get-now {
  font-size: 12px;
  color: #999;
}

.plan-btn {
  width: 100%;
  padding: 10px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.plan-btn.disabled {
  background: #f5f5f5;
  color: #999;
  cursor: default;
}

@media (prefers-color-scheme: dark) {
  .plan-btn.disabled {
    background: #333;
    color: #666;
  }
}

[data-theme="dark"] .plan-btn.disabled {
  background: #333;
  color: #666;
}

.plan-btn.primary {
  background: #1890ff;
  color: #fff;
}

.plan-btn.primary:hover {
  background: #096dd9;
}

.plan-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

@media (prefers-color-scheme: dark) {
  .feature-item {
    color: #aaa;
  }
}

[data-theme="dark"] .feature-item {
  color: #aaa;
}

.feature-item.highlight-text {
  color: #1890ff;
  font-weight: 500;
}

.feature-desc {
  font-size: 12px;
  color: #999;
  margin-top: -8px;
  margin-bottom: 4px;
  padding-left: 24px;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #1890ff;
  flex-shrink: 0;
}

.sparkle-icon {
  width: 16px;
  height: 16px;
  color: #1890ff;
  flex-shrink: 0;
}

.alipay-overlay {
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
}

.alipay-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 30px;
  box-shadow: var(--shadow-lg);
  position: relative;
  min-width: 360px;
}

.alipay-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 20px;
  cursor: pointer;
}

.alipay-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alipay-image {
  max-width: 420px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.alipay-recommend {
  position: absolute;
  top: 10px;
  right: 16px;
  width: 56px;
  height: auto;
}

@media (prefers-color-scheme: dark) {
  .alipay-modal {
    background: #1f1f1f;
    color: #e0e0e0;
  }
}

.pay-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.pay-option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

[data-theme="dark"] .pay-option-card {
  background: #1f1f1f;
}

.pay-option-card.selected {
  border-color: #e5f3ff;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-check {
  flex-shrink: 0;
}

.alipay-logo {
  height: 24px;
  width: auto;
}

.brand-text {
  display: flex;
  align-items: baseline;
  /* gap: 8px; */
  flex-direction: column;
}

.brand-text .cn {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
}

.brand-text .en {
  font-size: 12px;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.recommend-badge {
  height: 20px;
  width: auto;
}

@media (prefers-color-scheme: dark) {
  .pay-option-card {
    background: #1f1f1f;
    border-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .brand-text .cn {
    color: #fff;
  }

  .brand-text .en {
    color: #aaa;
  }
}

.pay-summary {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.summary-line {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
}

.summary-line:last-child {
  margin-bottom: 0;
}

.summary-line .label {
  color: var(--text-tertiary);
}

.summary-line .value {
  color: var(--text-secondary);
  font-weight: 500;
}

.go-pay {
  display: block;
  margin-top: 18px;
  margin-left: auto;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3);
}

.go-pay:hover {
  background: #096dd9;
}

.go-pay:disabled {
  background: #d9d9d9;
  color: #888;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .pay-summary {
    background: #1f1f1f;
    border-color: #333;
  }

  .summary-line .label {
    color: #888;
  }

  .summary-line .value {
    color: #e0e0e0;
  }
}

[data-theme="dark"] .alipay-modal {
  background: #1f1f1f;
  color: #e0e0e0;
}

[data-theme="dark"] .pay-summary {
  background: #1f1f1f;
  border-color: #333;
}
</style>
