<template>
  <div class="article-card" @click="$router.push(`/article/${article.id}`)">
    <div class="card-meta">
      <span v-if="article.category_name" class="card-category">{{ article.category_name }}</span>
      <span class="card-date">{{ formatDate(article.created_at) }}</span>
    </div>
    <h3 class="card-title">{{ article.title }}</h3>
    <p class="card-summary">{{ article.summary || '暂无摘要' }}</p>
    <div class="card-footer">
      <div class="card-author">
        <span class="author-avatar">{{ (article.author_nickname || article.author_name || '?')[0] }}</span>
        <span class="author-name">{{ article.author_nickname || article.author_name }}</span>
      </div>
      <span class="card-views">{{ article.view_count || 0 }} 阅读</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ article: { type: Object, required: true } })

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
</script>

<style scoped>
.article-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}
.article-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.card-category {
  background: #eff6ff;
  color: #3b82f6;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}
.card-date {
  color: #9ca3af;
  font-size: 13px;
}
.card-title {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}
.card-summary {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-author {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.author-name {
  font-size: 13px;
  color: #4b5563;
}
.card-views {
  font-size: 12px;
  color: #9ca3af;
}
</style>
