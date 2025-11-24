<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ isLogin ? '登录' : '注册' }}</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <!-- <button class="tab-btn" :class="{ active: loginType === 'phone' }" @click="loginType = 'phone'">
            {{ isLogin ? '手机号登录' : '手机号注册' }}
          </button> -->
          <button class="tab-btn" :class="{ active: loginType === 'email' }" @click="loginType = 'email'">
            {{ isLogin ? '邮箱登录' : '邮箱注册' }}
          </button>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- 手机号登录 -->
          <!-- <div v-if="loginType === 'phone'" class="form-group">
            <label class="form-label">手机号</label>
            <input v-model="formData.phone" type="tel" class="form-input" placeholder="请输入手机号"
              :class="{ error: errors.phone }" />
            <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
          </div> -->

          <!-- 邮箱登录 -->
          <div v-if="loginType === 'email'" class="form-group">
            <label class="form-label">邮箱</label>
            <input v-model="formData.email" type="email" class="form-input" placeholder="请输入邮箱地址"
              :class="{ error: errors.email }" />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div v-if="loginType === 'email' && !isLogin" class="form-group">
            <label class="form-label">邮箱验证码</label>
            <div class="verification-group">
              <input v-model="formData.emailCode" type="text" class="form-input verification-input"
                placeholder="请输入邮箱验证码" :class="{ error: errors.emailCode }" maxlength="6" />
              <button type="button" class="send-code-btn" @click="sendEmailCode"
                :disabled="!canSendEmailCode || emailCodeSending">
                <span v-if="emailCodeSending">发送中...</span>
                <span v-else-if="emailCodeCountdown > 0">{{ emailCodeCountdown }}s后重发</span>
                <span v-else>发送验证码</span>
              </button>
            </div>
            <span v-if="errors.emailCode" class="error-text">{{ errors.emailCode }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="password-input">
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="form-input"
                placeholder="密码须包含字母、数字和特殊字符，不少于6位" :class="{ error: errors.password }" />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    stroke="currentColor" stroke-width="2" />
                  <path d="M1 1l22 22" stroke="currentColor" stroke-width="2" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            <div class="hint-text">密码须包含字母、数字和特殊字符，不少于6位</div>
          </div>

          <div v-if="!isLogin" class="form-group">
            <label class="form-label">确认密码</label>
            <input v-model="formData.confirmPassword" type="password" class="form-input" placeholder="请再次输入密码"
              :class="{ error: errors.confirmPassword }" />
            <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 图形验证码 -->
          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="captcha-group">
              <input v-model="formData.captcha" type="text" class="form-input captcha-input" placeholder="请输入验证码"
                :class="{ error: errors.captcha }" />
              <div class="captcha-image" @click="refreshCaptcha">
                <canvas ref="captchaCanvas" width="120" height="40"></canvas>
                <span class="refresh-hint">点击刷新</span>
              </div>
            </div>
            <span v-if="errors.captcha" class="error-text">{{ errors.captcha }}</span>
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </button>
        </form>

        <div class="divider">
          <span>或</span>
        </div>

        <div class="social-login">
          <button class="social-btn wechat-btn" @click="handleWechatLogin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.900 7.852.194-.242-2.751-3.086-4.380-8.595-4.380z" />
              <path
                d="M23.759 11.336c0-3.676-3.28-6.65-7.32-6.65-4.041 0-7.32 2.974-7.32 6.65 0 3.675 3.279 6.65 7.32 6.65.784 0 1.551-.115 2.268-.334a.715.715 0 0 1 .593.081l1.579.922a.264.264 0 0 0 .138.044c.134 0 .24-.111.24-.248 0-.06-.024-.115-.04-.176l-.324-1.227a.487.487 0 0 1 .177-.551c1.516-1.109 2.489-2.764 2.489-4.611z" />
            </svg>
          </button>

          <button class="social-btn google-btn" @click="handleGoogleLogin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4" />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853" />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05" />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335" />
            </svg>
          </button>
        </div>

        <!-- 切换登录/注册 -->
        <div class="switch-mode">
          <span v-if="isLogin">
            还没有账号？
            <button class="link-btn" @click="isLogin = false">立即注册</button>
          </span>
          <span v-else>
            已有账号？
            <button class="link-btn" @click="isLogin = true">立即登录</button>
          </span>
        </div>
      </div>
    </div>
  </div>
  <div v-if="promptVisible" class="center-prompt-overlay" @click="closePrompt">
    <div class="center-prompt" @click.stop>
      <div class="prompt-text">{{ promptText }}</div>
      <button class="prompt-close-btn" @click="closePrompt">确定</button>
    </div>
  </div>
</template>

<script>
import { emailLogin, emailRegister, sendCheckCodeByEmail } from '@/api'
import { useUserStore } from '@/stores/user'
export default {
  name: 'LoginModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLogin: true,
      // loginType: 'phone', // 'phone' | 'email'
      loginType: 'email',
      showPassword: false,
      loading: false,
      captchaText: '',
      // 邮箱验证码相关
      emailCodeSending: false,
      emailCodeCountdown: 0,
      emailCodeTimer: null,
      formData: {
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        emailCode: ''
      },
      errors: {},
      promptVisible: false,
      promptText: ''
    }
  },
  computed: {
    canSendEmailCode() {
      return this.formData.email &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email) &&
        this.emailCodeCountdown === 0
    }
  },
  mounted() {
    this.generateCaptcha()
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.generateCaptcha()
        this.resetForm()
      }
    }
  },
  beforeUnmount() {
    // 清理邮箱验证码定时器
    if (this.emailCodeTimer) {
      clearInterval(this.emailCodeTimer)
      this.emailCodeTimer = null
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
      this.formData = {
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        emailCode: ''
      }
      this.errors = {}
      this.loading = false
      // 重置邮箱验证码相关状态
      this.emailCodeSending = false
      this.emailCodeCountdown = 0
      if (this.emailCodeTimer) {
        clearInterval(this.emailCodeTimer)
        this.emailCodeTimer = null
      }
    },
    showPrompt(text) {
      this.promptText = String(text || '').trim() || '提示'
      this.promptVisible = true
    },
    closePrompt() {
      this.promptVisible = false
    },
    validateForm() {
      this.errors = {}

      // 验证手机号或邮箱
      // if (this.loginType === 'phone') {
      //   if (!this.formData.phone) {
      //     this.errors.phone = '请输入手机号'
      //   } else if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
      //     this.errors.phone = '请输入正确的手机号'
      //   }
      // } else {
      if (!this.formData.email) {
        this.errors.email = '请输入邮箱'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        this.errors.email = '请输入正确的邮箱格式'
      }
      // }

      // 验证密码
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码至少6位'
      }

      // 验证确认密码（注册时）
      if (!this.isLogin) {
        if (!this.formData.confirmPassword) {
          this.errors.confirmPassword = '请确认密码'
        } else if (this.formData.password !== this.formData.confirmPassword) {
          this.errors.confirmPassword = '两次密码输入不一致'
        }

        // 验证邮箱验证码（邮箱注册时）
        if (this.loginType === 'email') {
          if (!this.formData.emailCode) {
            this.errors.emailCode = '请输入邮箱验证码'
          } else if (!/^[A-Za-z0-9]{6}$/.test(this.formData.emailCode)) {
            this.errors.emailCode = '验证码必须是6位数字和字母组合'
          }
        }
      }

      // 验证验证码
      if (!this.formData.captcha) {
        this.errors.captcha = '请输入验证码'
      } else if (this.formData.captcha.toLowerCase() !== this.captchaText.toLowerCase()) {
        this.errors.captcha = '验证码错误'
      }

      return Object.keys(this.errors).length === 0
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        if (this.isLogin && this.loginType === 'email') {
          const result = await emailLogin({
            email: this.formData.email,
            password: this.formData.password
          })
          const data = JSON.parse(result)

          console.log('邮箱登录响应:', data)

          if (data.code === 200) {
            console.log('登录成功:', data.message)
            const userStore = useUserStore()
            if (data.token) {
              userStore.setToken(data.token)
            }
            userStore.setUser({
              id: data.userId || Date.now(),
              email: this.formData.email,
              loginTime: new Date(),
              avatar: '/logo.png'
            })
            this.$emit('success', {
              type: 'login',
              user: {
                id: data.userId || Date.now(),
                email: this.formData.email,
                loginTime: new Date(),
                token: data.token
              }
            })

            this.closeModal()
          } else {
            console.error('登录失败:', data.message)
            const msg = String(data.message || '').trim()
            if (/密码|password/i.test(msg)) {
              this.showPrompt('账号或密码错误,请重试')
            } else {
              this.showPrompt(msg || '登录失败，请重试')
            }
          }
        }
        else if (!this.isLogin && this.loginType === 'email') {
          const result = await emailRegister({
            email: this.formData.email,
            password: this.formData.password,
            checkCode: this.formData.emailCode
          })
          const data = JSON.parse(result)

          console.log('邮箱注册响应:', data)

          if (data.code === 200) {
            // 注册成功
            console.log('注册成功:', data.message)

            // 成功后关闭弹窗并触发事件
            this.$emit('success', {
              type: 'register',
              user: {
                id: Date.now(),
                email: this.formData.email,
                loginTime: new Date()
              }
            })

            this.closeModal()
          } else {
            // 注册失败，显示错误信息
            console.error('注册失败:', data.message)
            const msg = String(data.message || '').trim()
            if (/密码|password/i.test(msg)) {
              this.showPrompt('账号或密码错误,请重试')
            } else {
              this.showPrompt(msg || '注册失败，请重试')
            }
          }
        }

      } catch (error) {
        console.error('操作失败:', error)
        this.showPrompt('网络错误，请检查网络连接后重试')
      } finally {
        this.loading = false
      }
    },
    generateCaptcha() {
      const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      this.captchaText = ''
      for (let i = 0; i < 4; i++) {
        this.captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      this.$nextTick(() => {
        this.drawCaptcha()
      })
    },
    drawCaptcha() {
      const canvas = this.$refs.captchaCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 背景
      ctx.fillStyle = '#f8f9fa'
      ctx.fillRect(0, 0, width, height)

      // 干扰线
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 70%)`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(Math.random() * width, Math.random() * height)
        ctx.lineTo(Math.random() * width, Math.random() * height)
        ctx.stroke()
      }

      // 绘制验证码文字
      ctx.font = '20px Arial'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < this.captchaText.length; i++) {
        const char = this.captchaText[i]
        const x = 15 + i * 22
        const y = height / 2

        // 随机颜色
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 40%)`

        // 随机旋转
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((Math.random() - 0.5) * 0.5)
        ctx.fillText(char, 0, 0)
        ctx.restore()
      }

      // 干扰点
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 60%)`
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
      }
    },
    refreshCaptcha() {
      this.generateCaptcha()
      this.formData.captcha = ''
      if (this.errors.captcha) {
        delete this.errors.captcha
      }
    },
    handleWechatLogin() {
      console.log('微信登录')
      // 这里应该调用微信登录SDK
      this.$emit('social-login', { type: 'wechat' })
    },
    handleGoogleLogin() {
      console.log('Google登录')
      // 这里应该调用Google登录SDK
      this.$emit('social-login', { type: 'google' })
    },
    // 发送邮箱验证码
    async sendEmailCode() {
      if (!this.canSendEmailCode) return

      this.emailCodeSending = true

      try {
        // 调用实际的发送邮箱验证码API
        const result = await sendCheckCodeByEmail({ email: this.formData.email })
        const data = JSON.parse(result)

        console.log('发送邮箱验证码响应:', data)

        if (data.code === 0) {
          // 发送成功，开始倒计时
          this.startEmailCodeCountdown()
          // 可以在这里显示成功提示
          console.log('验证码发送成功')
        } else {
          // 发送失败，显示错误信息
          console.error('验证码发送失败:', data.message)
          this.showPrompt(data.message || '验证码发送失败，请重试')
        }

      } catch (error) {
        console.error('发送邮箱验证码失败:', error)
        this.showPrompt('网络错误，请检查网络连接后重试')
      } finally {
        this.emailCodeSending = false
      }
    },
    // 开始邮箱验证码倒计时
    startEmailCodeCountdown() {
      this.emailCodeCountdown = 60
      this.emailCodeTimer = setInterval(() => {
        this.emailCodeCountdown--
        if (this.emailCodeCountdown <= 0) {
          clearInterval(this.emailCodeTimer)
          this.emailCodeTimer = null
        }
      }, 1000)
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
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

/* 隐藏 Webkit 浏览器的滚动条 */
.modal-container::-webkit-scrollbar {
  display: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px 24px;
}

.login-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
}

.captcha-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  position: relative;
  cursor: pointer;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.center-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.center-prompt {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  min-width: 280px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.prompt-text {
  font-size: 14px;
  color: #111827;
  margin-bottom: 12px;
}

.prompt-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  cursor: pointer;
}

.captcha-image canvas {
  display: block;
}

.refresh-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.captcha-image:hover .refresh-hint {
  opacity: 1;
}

.verification-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.verification-input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 100px;
}

.send-code-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-code-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.hint-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 15px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wechat-btn {
  color: #07c160;
  border-color: #07c160;
}

.wechat-btn:hover {
  background: #f0f9ff;
}

.google-btn {
  color: #4285f4;
  border-color: #4285f4;
}

.google-btn:hover {
  background: #f0f9ff;
}

.switch-mode {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.link-btn:hover {
  color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-width: none;
  }

  .modal-header,
  .modal-body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .captcha-group {
    flex-direction: column;
  }

  .captcha-image {
    align-self: flex-start;
  }

  .verification-group {
    flex-direction: column;
  }

  .send-code-btn {
    align-self: flex-start;
    min-width: 120px;
  }
}
</style>