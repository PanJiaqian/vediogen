// 用户资料编辑弹窗：修改昵称与头像并回传给父组件
<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerAvatarUpload">
          <img :src="avatarPreview || userInfo.avatar || '/logo.png'" class="avatar" />
          <div class="avatar-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <input type="file" ref="avatarInput" accept="image/*" style="display:none" @change="handleAvatarChange" />
        </div>
      </div>

      <div class="form-group">
        <label>用户名</label>
        <input v-model="nickname" class="form-input" placeholder="请输入用户名" />
      </div>

      <div class="modal-actions">
        <button class="btn cancel-btn" @click="close">取消</button>
        <button class="btn confirm-btn" @click="save">应用</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'UserProfileEditModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'save', 'update-avatar'],
  data() {
    return {
      nickname: '',
      avatarPreview: '',
      avatarFile: null
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.nickname = this.userInfo.nickname || this.userInfo.name || ''
        this.avatarPreview = ''
        this.avatarFile = null
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },
    handleAvatarChange(e) {
      const file = e.target.files[0]
      if (!file) return

      this.avatarFile = file
      this.avatarPreview = URL.createObjectURL(file)
    },
    save() {
      this.$emit('save', {
        nickname: this.nickname,
        avatarFile: this.avatarFile
      })
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
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  width: 400px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1a1a1a;
    color: #fff;
    box-shadow: none;
  }
}

[data-theme="dark"] .modal-content {
  background: #1a1a1a;
  color: #fff;
  box-shadow: none;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

[data-theme="dark"] .avatar-wrapper {
  border-color: #333;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.form-group {
  width: 100%;
  margin-bottom: 32px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

[data-theme="dark"] .form-group label {
  color: #999;
}

.form-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  color: #333;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #1890ff;
}

@media (prefers-color-scheme: dark) {
  .form-input {
    background: #2a2a2a;
    border-color: #333;
    color: #fff;
  }
  .form-input:focus {
    border-color: #666;
  }
}

[data-theme="dark"] .form-input {
  background: #2a2a2a;
  border-color: #333;
  color: #fff;
}

[data-theme="dark"] .form-input:focus {
  border-color: #666;
}

.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

[data-theme="dark"] .cancel-btn {
  background: #333;
  color: #fff;
}

.confirm-btn {
  background: #1890ff;
  color: #fff;
}

[data-theme="dark"] .confirm-btn {
  background: #888; /* Keeping user's original dark mode style or close to it */
  color: #fff;
}
</style>
