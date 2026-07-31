<template>
  <div class="detail-page" v-if="article">
    <div class="detail-container">
      <!-- Back link -->
      <router-link to="/" class="back-link">← 返回首页</router-link>

      <!-- Header -->
      <header class="detail-header">
        <span v-if="article.category_name" class="detail-category">{{ article.category_name }}</span>
        <h1>{{ article.title }}</h1>
        <div class="detail-meta">
          <div class="meta-author">
            <span class="avatar">{{ (article.author_nickname || article.author_name || '?')[0] }}</span>
            <span>{{ article.author_nickname || article.author_name }}</span>
          </div>
          <span class="meta-date">{{ formatDate(article.created_at) }}</span>
          <span class="meta-views">{{ article.view_count }} 阅读</span>
        </div>
      </header>

      <!-- Content -->
      <article class="detail-content" v-html="renderedContent"></article>

      <!-- Actions (for author) -->
      <div v-if="authStore.user?.id === article.author_id" class="detail-actions">
        <button class="btn btn-primary" @click="$router.push(`/editor/${article.id}`)">编辑</button>
        <button class="btn btn-danger" @click="handleDelete">删除</button>
      </div>
    </div>
  </div>

  <div v-else-if="articleStore.loading" class="loading">加载中...</div>
  <div v-else class="empty">文章不存在</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()

const article = computed(() => articleStore.currentArticle)

const renderedContent = computed(() => {
  if (!article.value) return ''
  // Simple markdown-like rendering: newlines to <br> and paragraphs
  return article.value.content
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
})

onMounted(() => {
  articleStore.fetchArticle(route.params.id)
})

async function handleDelete() {
  if (!confirm('确认删除这篇文章？')) return
  try {
    await articleStore.deleteArticle(route.params.id)
    router.push('/')
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}
.back-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 24px;
}
.detail-header { margin-bottom: 32px; }
.detail-category {
  background: #eff6ff; color: #3b82f6;
  padding: 2px 12px; border-radius: 12px; font-size: 12px;
  display: inline-block; margin-bottom: 12px;
}
.detail-header h1 {
  font-size: 28px; color: #1f2937; line-height: 1.4; margin-bottom: 16px;
}
.detail-meta {
  display: flex; align-items: center; gap: 16px; font-size: 14px; color: #6b7280;
}
.meta-author { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #3b82f6; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
}
.meta-date::before, .meta-views::before {
  content: '·'; margin-right: 16px;
}
.detail-content {
  font-size: 16px; line-height: 1.8; color: #374151;
}
.detail-content :deep(p) { margin-bottom: 16px; }
.detail-actions {
  margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;
  display: flex; gap: 12px;
}
.btn-danger {
  background: #dc2626; color: #fff; border: none;
  padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;
}
.btn-danger:hover { background: #b91c1c; }
.loading, .empty { text-align: center; padding: 80px 0; color: #9ca3af; font-size: 15px; }
</style>
