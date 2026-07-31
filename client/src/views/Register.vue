<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>注册</h2>
      <p class="auth-subtitle">创建你的 VueBlog 账号</p>

      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="3-20个字符" required />
        </div>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="form.nickname" type="text" placeholder="怎么称呼你？" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="至少6位密码" required />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', nickname: '', password: '', confirmPassword: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''
  if (form.password !== form.confirmPassword) {
    errorMsg.value = '两次密码输入不一致'
    return
  }
  loading.value = true
  try {
    await authStore.register(form.username, form.password, form.nickname || form.username)
    router.push('/')
  } catch (err) {
    errorMsg.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 40px 24px;
}
.auth-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #f0f0f0;
}
.auth-card h2 { font-size: 24px; color: #1f2937; margin-bottom: 4px; }
.auth-subtitle { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; font-weight: 500; }
.form-group input {
  width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: #3b82f6; }
.alert-error { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.btn-block { width: 100%; padding: 12px; font-size: 15px; }
.auth-footer { margin-top: 20px; text-align: center; font-size: 14px; color: #6b7280; }
.auth-footer a { color: #3b82f6; }
</style>
