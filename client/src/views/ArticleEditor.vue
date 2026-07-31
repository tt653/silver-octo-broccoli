<template>
  <div class="editor-page">
    <div class="editor-container">
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>

      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            v-model="form.title"
            type="text"
            class="title-input"
            placeholder="输入文章标题..."
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>分类</label>
            <select v-model="form.category_id">
              <option :value="null">请选择分类</option>
              <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="published">发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>摘要（可选）</label>
          <input v-model="form.summary" type="text" placeholder="简要描述文章内容..." />
        </div>

        <div class="form-group">
          <label>正文内容</label>
          <textarea
            v-model="form.content"
            class="content-input"
            placeholder="开始写作..."
            rows="16"
            required
          ></textarea>
        </div>

        <div class="editor-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? '保存中...' : (isEdit ? '更新文章' : '发布文章') }}
          </button>
          <button type="button" class="btn" @click="$router.back()">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { useCategoryStore } from '@/stores/category'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const categoryStore = useCategoryStore()

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  content: '',
  summary: '',
  category_id: null,
  status: 'published'
})
const saving = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await categoryStore.fetchCategories()
  if (isEdit.value) {
    try {
      const article = await articleStore.fetchArticle(route.params.id)
      form.title = article.title
      form.content = article.content
      form.summary = article.summary || ''
      form.category_id = article.category_id
      form.status = article.status
    } catch (err) {
      router.push('/')
    }
  }
})

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.title.trim() || !form.content.trim()) {
    errorMsg.value = '标题和内容不能为空'
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await articleStore.updateArticle(route.params.id, form)
    } else {
      await articleStore.createArticle(form)
    }
    router.push('/')
  } catch (err) {
    errorMsg.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}
.editor-container h2 {
  font-size: 22px; color: #1f2937; margin-bottom: 24px;
}
.alert-error { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; font-weight: 500; }
.form-row { display: flex; gap: 20px; }
.form-row .form-group { flex: 1; }
.title-input {
  width: 100%; padding: 12px 0; font-size: 24px; font-weight: 600;
  border: none; border-bottom: 2px solid #e5e7eb; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.title-input:focus { border-bottom-color: #3b82f6; }
.title-input::placeholder { color: #d1d5db; }
select {
  width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; background: #fff;
}
select:focus { border-color: #3b82f6; }
.form-group input[type="text"] {
  width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-group input[type="text"]:focus { border-color: #3b82f6; }
.content-input {
  width: 100%; padding: 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 15px; line-height: 1.8;
  outline: none; resize: vertical; box-sizing: border-box; font-family: inherit;
}
.content-input:focus { border-color: #3b82f6; }
.editor-actions { display: flex; gap: 12px; margin-top: 24px; }
</style>
