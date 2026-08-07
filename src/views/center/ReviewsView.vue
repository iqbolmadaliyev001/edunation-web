<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { reviewsApi } from '@/api'
import { useCenterStore } from '@/stores/center'
import { useUiStore } from '@/stores/ui'
import { timeAgo, ratingText } from '@/lib/format'
import PageHeader from '@/components/panel/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const centerStore = useCenterStore()
const ui = useUiStore()
const reviews = ref([])
const loading = ref(true)
const filter = ref('all') // all | unanswered

const replyDraft = reactive({})
const replyOpen = ref(null)

const shown = computed(() => {
  if (filter.value === 'unanswered') return reviews.value.filter((r) => !r.reply)
  return reviews.value
})
const unanswered = computed(() => reviews.value.filter((r) => !r.reply).length)

async function load() {
  if (!centerStore.active) return
  loading.value = true
  try {
    const res = await reviewsApi.list({ center: centerStore.active.id, status: 'published', page_size: 100 })
    reviews.value = res.results || res
  } finally {
    loading.value = false
  }
}

async function sendReply(review) {
  const text = (replyDraft[review.id] || '').trim()
  if (text.length < 3) return ui.error('Javob juda qisqa.')
  try {
    const reply = await reviewsApi.reply(review.id, text)
    review.reply = reply
    replyOpen.value = null
    replyDraft[review.id] = ''
    ui.success('Javobingiz chop etildi.')
  } catch (e) {
    ui.error(e.message)
  }
}

watch(() => centerStore.active?.id, load)
onMounted(async () => {
  await centerStore.load()
  load()
})
</script>

<template>
  <div>
    <PageHeader title="Sharhlar" subtitle="O'quvchilar fikriga javob bering — bu reytingga ta'sir qiladi">
      <template #actions>
        <div class="segmented">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">Barchasi</button>
          <button :class="{ active: filter === 'unanswered' }" @click="filter = 'unanswered'">
            Javobsiz <span v-if="unanswered" class="segmented__badge">{{ unanswered }}</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <BaseSpinner v-if="loading" center />
    <EmptyState v-else-if="!shown.length" icon="star"
                :title="filter === 'unanswered' ? 'Javobsiz sharh yo\'q' : 'Hali sharhlar yo\'q'"
                text="O'quvchilaringiz sharh qoldirganda shu yerda ko'rinadi." />

    <div v-else class="list">
      <article v-for="r in shown" :key="r.id" class="rev">
        <div class="rev__head">
          <BaseAvatar :name="r.display_author || 'Foydalanuvchi'" :src="r.author_avatar" :size="44" />
          <div class="rev__meta">
            <div class="rev__name">
              {{ r.display_author || 'Foydalanuvchi' }}
              <BaseBadge v-if="r.is_verified" tone="success" size="sm" icon="check-circle">Tasdiqlangan</BaseBadge>
            </div>
            <div class="rev__date">{{ timeAgo(r.created_at) }}</div>
          </div>
          <RatingStars :value="r.rating" :size="16" />
        </div>

        <p class="rev__text">{{ r.text }}</p>
        <div v-if="r.pros || r.cons" class="rev__pc">
          <span v-if="r.pros" class="pro"><Icon name="plus" :size="13" /> {{ r.pros }}</span>
          <span v-if="r.cons" class="con"><Icon name="minus" :size="13" /> {{ r.cons }}</span>
        </div>

        <!-- Javob -->
        <div v-if="r.reply" class="rev__reply">
          <div class="rev__reply-head"><Icon name="building" :size="14" /> Sizning javobingiz</div>
          <p>{{ r.reply.text }}</p>
        </div>
        <template v-else>
          <div v-if="replyOpen === r.id" class="rev__form">
            <textarea v-model="replyDraft[r.id]" rows="3" placeholder="Javobingizni yozing..." />
            <div class="rev__form-actions">
              <BaseButton variant="ghost" size="sm" @click="replyOpen = null">Bekor</BaseButton>
              <BaseButton size="sm" icon="send" @click="sendReply(r)">Javob berish</BaseButton>
            </div>
          </div>
          <button v-else class="rev__reply-btn" @click="replyOpen = r.id; replyDraft[r.id] = replyDraft[r.id] || ''">
            <Icon name="send" :size="15" /> Javob berish
          </button>
        </template>
      </article>
    </div>
  </div>
</template>

<style scoped>
.segmented { display: inline-flex; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 3px; }
.segmented button { padding: 7px 14px; border-radius: var(--r-sm); font-size: 13.5px; font-weight: 600; color: var(--text-soft); display: inline-flex; align-items: center; gap: 6px; }
.segmented button.active { background: var(--surface); color: var(--sky-700); box-shadow: var(--shadow-xs); }
.segmented__badge { background: var(--danger-500); color: #fff; font-size: 11px; min-width: 18px; height: 18px; display: grid; place-items: center; border-radius: 999px; padding: 0 5px; }

.list { display: flex; flex-direction: column; gap: var(--sp-4); }
.rev { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--shadow-sm); }
.rev__head { display: flex; align-items: center; gap: 12px; }
.rev__meta { flex: 1; }
.rev__name { font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
.rev__date { font-size: 12.5px; color: var(--text-muted); }
.rev__text { margin-top: 12px; color: var(--text-soft); line-height: 1.6; }
.rev__pc { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.pro, .con { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; padding: 5px 10px; border-radius: var(--r-full); }
.pro { background: var(--success-50); color: var(--success-500); }
.con { background: var(--warning-50); color: #9a6f0a; }
.rev__reply { margin-top: 14px; padding: 12px 14px; background: var(--sky-50); border-left: 3px solid var(--sky-400); border-radius: var(--r-md); }
.rev__reply-head { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--sky-700); margin-bottom: 5px; }
.rev__reply p { font-size: 14px; color: var(--ink-600); }
.rev__reply-btn { display: inline-flex; align-items: center; gap: 7px; margin-top: 12px; font-size: 13.5px; font-weight: 600; color: var(--sky-600); }
.rev__reply-btn:hover { color: var(--sky-700); }
.rev__form { margin-top: 12px; }
.rev__form textarea { width: 100%; padding: 11px 13px; border: 1px solid var(--border-strong); border-radius: 12px; resize: vertical; color: var(--text); }
.rev__form textarea:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }
.rev__form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
</style>
