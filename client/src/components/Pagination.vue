<template>
  <div class="pagination" v-if="totalPages > 1">
    <button :disabled="current === 1" @click="$emit('change', current - 1)">上一页</button>
    <template v-for="p in pages" :key="p">
      <button v-if="p === '...'" disabled class="ellipsis">...</button>
      <button v-else :class="{ active: p === current }" @click="$emit('change', p)">{{ p }}</button>
    </template>
    <button :disabled="current === totalPages" @click="$emit('change', current + 1)">下一页</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 10 }
})

defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1)

const pages = computed(() => {
  const p = []
  const tp = totalPages.value
  const c = props.current

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) p.push(i)
  } else {
    p.push(1)
    if (c > 3) p.push('...')
    for (let i = Math.max(2, c - 1); i <= Math.min(tp - 1, c + 1); i++) p.push(i)
    if (c < tp - 2) p.push('...')
    p.push(tp)
  }
  return p
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 32px;
}
.pagination button {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.pagination button:hover:not(:disabled):not(.active) {
  border-color: #3b82f6;
  color: #3b82f6;
}
.pagination button.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination .ellipsis {
  border: none;
  background: none;
  cursor: default;
}
</style>
