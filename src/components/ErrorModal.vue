<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlay">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">提示</h2>
        <button class="close-btn" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="icon">⚠️</div>
        <div class="message">{{ '小梦出了点问题，请稍后再试' }}</div>
      </div>
      <div class="modal-footer">
        <button class="primary-btn" @click="close">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: '小梦出了点问题，请稍后再试'
    }
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close')
    },
    onOverlay() {
      this.close()
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-container {
  width: 420px;
  max-width: 92%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px 20px;
  text-align: center;
}

.icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.message {
  font-size: 16px;
  color: #374151;
}

.modal-footer {
  padding: 14px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

.primary-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>