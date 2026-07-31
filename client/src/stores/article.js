import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useArticleStore = defineStore('article', () => {
  const list = ref([])
  const total = ref(0)
  const currentArticle = ref(null)
  const loading = ref(false)

  async function fetchArticles(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/articles', { params })
      list.value = res.data.list
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchArticle(id) {
    loading.value = true
    try {
      const res = await api.get(`/articles/${id}`)
      currentArticle.value = res.data
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function createArticle(data) {
    const res = await api.post('/articles', data)
    return res
  }

  async function updateArticle(id, data) {
    const res = await api.put(`/articles/${id}`, data)
    return res
  }

  async function deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`)
    return res
  }

  async function fetchMyArticles(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/articles/my/list', { params })
      return res.data
    } finally {
      loading.value = false
    }
  }

  return {
    list, total, currentArticle, loading,
    fetchArticles, fetchArticle, createArticle, updateArticle, deleteArticle, fetchMyArticles
  }
})
