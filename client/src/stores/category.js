import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])

  async function fetchCategories() {
    const res = await api.get('/categories')
    categories.value = res.data
  }

  return { categories, fetchCategories }
})
