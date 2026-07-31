<template>
  <div class="home-page">
    <div class="content-wrapper">
      <!-- Sidebar: Categories -->
      <aside class="sidebar">
        <h3 class="sidebar-title">文章分类</h3>
        <ul class="category-list">
          <li
            :class="{ active: !currentCategoryId }"
            @click="selectCategory(null)"
          >全部文章</li>
          <li
            v-for="cat in categoryStore.categories"
            :key="cat.id"
            :class="{ active: currentCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
            <span class="count">{{ cat.article_count }}</span>
          </li>
        </ul>
      </aside>

      <!-- Main Content: Article List -->
      <main class="main-content">
        <!-- Search Bar -->
        <div class="search-bar">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索文章..."
            @keyup.enter="search"
          />
          <button class="btn btn-primary" @click="search">搜索</button>
        </div>

        <!-- Loading -->
        <div v-if="articleStore.loading" class="loading">加载中...</div>

        <!-- Empty -->
        <div v-else-if="!articleStore.list.length" class="empty">
          暂无文章
        </div>

        <!-- Article List -->
        <div v-else class="article-list">
          <ArticleCard
            v-for="article in articleStore.list"
            :key="article.id"
            :article="article"
          />
        </div>

        <!-- Pagination -->
        <Pagination
          :current="currentPage"
          :total="articleStore.total"
          :pageSize="10"
          @change="handlePageChange"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import { useCategoryStore } from '@/stores/category'
import ArticleCard from '@/components/ArticleCard.vue'
import Pagination from '@/components/Pagination.vue'

const articleStore = useArticleStore()
const categoryStore = useCategoryStore()

const currentPage = ref(1)
const currentCategoryId = ref(null)
const keyword = ref('')

onMounted(() => {
  categoryStore.fetchCategories()
  loadArticles()
})

function loadArticles() {
  articleStore.fetchArticles({
    page: currentPage.value,
    pageSize: 10,
    categoryId: currentCategoryId.value || undefined,
    keyword: keyword.value || undefined
  })
}

function selectCategory(categoryId) {
  currentCategoryId.value = categoryId
  currentPage.value = 1
  loadArticles()
}

function search() {
  currentPage.value = 1
  loadArticles()
}

function handlePageChange(page) {
  currentPage.value = page
  loadArticles()
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.content-wrapper {
  display: flex;
  gap: 32px;
}
.sidebar {
  width: 220px;
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}
.category-list {
  list-style: none;
  padding: 0;
}
.category-list li {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  transition: all 0.2s;
}
.category-list li:hover {
  background: #f3f4f6;
}
.category-list li.active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}
.count {
  font-size: 12px;
  color: #9ca3af;
}
.main-content {
  flex: 1;
  min-width: 0;
}
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.search-bar input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.search-bar input:focus {
  border-color: #3b82f6;
}
.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
  font-size: 15px;
}
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
