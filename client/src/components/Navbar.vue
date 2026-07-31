<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">VueBlog</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <template v-if="authStore.isLoggedIn">
          <router-link to="/editor" class="nav-link">写文章</router-link>
          <router-link to="/my-articles" class="nav-link">我的文章</router-link>
          <span class="nav-user">{{ authStore.user?.nickname }}</span>
          <button class="btn btn-sm" @click="handleLogout">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.nav-brand {
  font-size: 22px;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}
.nav-link:hover, .nav-link.router-link-active {
  color: #3b82f6;
}
.nav-user {
  color: #6b7280;
  font-size: 14px;
}
</style>
