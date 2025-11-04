<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="create-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">添加新主体</h2>
        <button class="modal-close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-content">
        <!-- 左侧图片上传区域 -->
        <div class="image-upload-section">
          <div class="image-upload-area" @click="triggerImageUpload">
            <div v-if="!newSubject.image" class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <p class="upload-text">点击/拖拽从本地上传<br/>用图描述生成</p>
            </div>
            <img v-else :src="newSubject.image" alt="预览图" class="preview-image" />
          </div>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            style="display: none;"
          />
        </div>

        <!-- 右侧表单区域 -->
        <div class="form-section">
          <!-- 形象名称 -->
          <div class="form-group">
            <label class="form-label">形象名称</label>
            <input
              v-model="newSubject.name"
              type="text"
              placeholder="请输入形象名称"
              class="form-input"
            />
          </div>

          <!-- 类别和性别 -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">类别</label>
              <div class="button-group">
                <button
                  v-for="category in ['人类', '动物', '其他']"
                  :key="category"
                  :class="['option-btn', { 'active': newSubject.category === category }]"
                  @click="newSubject.category = category"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <div class="form-group half">
              <label class="form-label">性别</label>
              <div class="button-group">
                <button
                  v-for="gender in ['男性', '女性']"
                  :key="gender"
                  :class="['option-btn', { 'active': newSubject.gender === gender }]"
                  @click="newSubject.gender = gender"
                >
                  {{ gender }}
                </button>
              </div>
            </div>
          </div>

          <!-- 年龄 -->
          <div class="form-group">
            <label class="form-label">年龄</label>
            <div class="button-group">
              <button
                v-for="age in ['儿童', '少年', '青年', '中年', '老年']"
                :key="age"
                :class="['option-btn', { 'active': newSubject.age === age }]"
                @click="newSubject.age = age"
              >
                {{ age }}
              </button>
            </div>
          </div>

          <!-- 主体描述 -->
          <div class="form-group">
            <label class="form-label">主体描述</label>
            <textarea
              v-model="newSubject.description"
              placeholder="请输入主体描述"
              class="form-textarea"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <div class="footer-left">
          <span class="example-text">主体范例 ℹ</span>
        </div>
        <div class="footer-right">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="submit-btn" @click="submitNewSubject">应用形象</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateSubjectModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      newSubject: {
        name: '',
        category: '人类',
        gender: '男性',
        age: '青年',
        description: '',
        image: null
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // 当弹窗显示时，重置表单数据
        this.resetForm()
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    handleOverlayClick() {
      this.closeModal()
    },
    resetForm() {
      this.newSubject = {
        name: '',
        category: '人类',
        gender: '男性',
        age: '青年',
        description: '',
        image: null
      }
    },
    triggerImageUpload() {
      this.$refs.imageInput.click()
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.newSubject.image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    submitNewSubject() {
      // 验证必填字段
      if (!this.newSubject.name.trim()) {
        alert('请输入形象名称')
        return
      }

      // 发送提交事件
      this.$emit('submit', { ...this.newSubject })
      
      // 关闭弹窗
      this.closeModal()
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
  z-index: 1000;
}

.create-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  display: flex;
  gap: 32px;
  padding: 24px 32px;
}

.image-upload-section {
  flex: 0 0 280px;
}

.image-upload-area {
  width: 280px;
  height: 380px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.image-upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.form-section {
  flex: 1;
  min-width: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.option-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.option-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px 24px;
  border-top: 1px solid #f3f4f6;
}

.footer-left {
  display: flex;
  align-items: center;
}

.example-text {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.example-text:hover {
  color: #3b82f6;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.submit-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-modal {
    width: 95%;
    margin: 20px;
  }

  .modal-content {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .image-upload-section {
    flex: none;
    align-self: center;
  }

  .form-row {
    flex-direction: column;
    gap: 12px;
  }

  .modal-header,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>