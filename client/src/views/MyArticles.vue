<template>
  <div class="my-page">
    <div class="my-container">
      <div class="my-header">
        <h2>我的文章</h2>
        <router-link to="/editor" class="btn btn-primary">写文章</router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">加载中...</div>

      <!-- Empty -->
      <div v-else-if="!articles.length" class="empty">
        <p>还没有写过文章</p>
        <router-link to="/editor" class="btn btn-primary">开始写第一篇文章</router-link>
      </div>

      <!-- Article Table -->
      <table v-else class="article-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>
              <router-link :to="`/article/${article.id}`" class="article-link">
                {{ article.title }}
              </router-link>
            </td>
            <td>{{ article.category_name || '-' }}</td>
            <td>
              <span :class="['status-tag', article.status]">
                {{ article.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ formatDate(article.created_at) }}</td>
            <td class="actions-col">
              <button class="btn-action" @click="$router.push(`/editor/${article.id}`)">编辑</button>
              <button class="btn-action btn-delete" @click="handleDelete(article)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <Pagination
        v-if="total > pageSize"
        :current="currentPage"
        :total="total"
        :pageSize="pageSize"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import Pagination from '@/components/Pagination.vue'

const articleStore = useArticleStore()

const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

onMounted(() => loadArticles())

async function loadArticles() {
  loading.value = true
  try {
    const data = await articleStore.fetchMyArticles({ page: currentPage.value, pageSize: pageSize.value })
    articles.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadArticles()
}

async function handleDelete(article) {
  if (!confirm(`确认删除文章「${article.title}」？`)) return
  try {
    await articleStore.deleteArticle(article.id)
    loadArticles()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
</script>

<style scoped>
.my-page { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
.my-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.my-header h2 { font-size: 22px; color: #1f2937; }
.loading, .empty { text-align: center; padding: 60px 0; color: #9ca3af; }
.empty p { margin-bottom: 16px; font-size: 15px; }
.article-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #f0f0f0; }
.article-table th {
  background: #f9fafb; padding: 12px 16px; text-align: left;
  font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.article-table td { padding: 14px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
.article-link { color: #1f2937; text-decoration: none; font-weight: 500; }
.article-link:hover { color: #3b82f6; }
.status-tag {
  padding: 2px 10px; border-radius: 12px; font-size: 12px;
}
.status-tag.published { background: #ecfdf5; color: #059669; }
.status-tag.draft { background: #fef3c7; color: #d97706; }
.actions-col { display: flex; gap: 8px; }
.btn-action {
  background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 13px; padding: 0;
}
.btn-action:hover { text-decoration: underline; }
.btn-delete { color: #dc2626; }
</style>
