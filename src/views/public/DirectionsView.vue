<script setup>
import { ref, onMounted } from 'vue'
import { catalogApi } from '@/api'
import DirectionCard from '@/components/centers/DirectionCard.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import Icon from '@/components/ui/Icon.vue'

const directions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await catalogApi.directions({ page_size: 100 })
    directions.value = res.results || res
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container page">
    <header class="page__head">
      <span class="eyebrow"><Icon name="book-open" :size="14" /> Katalog</span>
      <h1 class="page__title">Barcha yo'nalishlar</h1>
      <p class="page__lead">
        Til kurslaridan IT va milliy sertifikatlarga qadar — o'zingizga mos yo'nalishni tanlang.
      </p>
    </header>

    <div class="grid cols-3">
      <template v-if="loading">
        <BaseSkeleton v-for="i in 9" :key="i" h="84px" radius="var(--r-lg)" />
      </template>
      <DirectionCard v-for="d in directions" v-else :key="d.id" :direction="d" />
    </div>
  </div>
</template>

<style scoped>
.page { padding-block: var(--sp-12) var(--sp-16); }
.page__head { text-align: center; margin-bottom: var(--sp-10); display: flex; flex-direction: column; align-items: center; }
.page__title { font-size: clamp(28px, 4vw, 40px); margin-top: var(--sp-3); }
.page__lead { color: var(--text-soft); margin-top: var(--sp-3); max-width: 52ch; }
</style>
