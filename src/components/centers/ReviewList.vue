<script setup>
import { ref, computed } from 'vue'
import { ratingText, timeAgo, initials } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  breakdown: { type: Object, default: () => ({}) },
  rating: { type: [Number, String], default: 0 },
  count: { type: Number, default: 0 },
})
const emit = defineEmits(['submit'])

const auth = useAuthStore()
const ui = useUiStore()

const showForm = ref(false)
const draft = ref({ rating: 5, text: '' })

const maxBar = computed(() => {
  const vals = Object.values(props.breakdown || {}).map(Number)
  return Math.max(1, ...vals)
})

function openForm() {
  if (!auth.isAuthenticated) return ui.openAuth('login')
  showForm.value = true
}

function submit() {
  if (draft.value.text.trim().length < 10) {
    ui.error('Sharh kamida 10 belgidan iborat bo\'lsin.')
    return
  }
  emit('submit', { rating: draft.value.rating, text: draft.value.text.trim() })
  draft.value = { rating: 5, text: '' }
  showForm.value = false
}
</script>

<template>
  <div class="rv">
    <!-- Umumiy reyting -->
    <div class="rv__summary">
      <div class="rv__score">
        <div class="rv__score-num tabular">{{ ratingText(rating) }}</div>
        <RatingStars :value="Number(rating)" :size="18" />
        <div class="rv__score-count">{{ count }} sharh</div>
      </div>
      <div class="rv__bars">
        <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="rv__bar-row">
          <span class="rv__bar-star">{{ n }} <Icon name="star" :size="12" class="gold" /></span>
          <span class="rv__bar-track">
            <span
              class="rv__bar-fill"
              :style="{ width: ((Number(breakdown?.[n] || 0) / maxBar) * 100) + '%' }"
            />
          </span>
          <span class="rv__bar-count tabular">{{ breakdown?.[n] || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="rv__cta">
      <BaseButton v-if="!showForm" variant="soft" icon="edit" @click="openForm">
        Sharh qoldirish
      </BaseButton>
    </div>

    <!-- Sharh formasi -->
    <div v-if="showForm" class="rv__form">
      <div class="rv__form-rating">
        <span>Bahoyingiz:</span>
        <RatingStars v-model:value="draft.rating" :size="26" interactive />
      </div>
      <textarea
        v-model="draft.text"
        rows="4"
        placeholder="Tajribangizni yozing — nima yoqdi, natija qanday bo'ldi?"
      />
      <div class="rv__form-actions">
        <BaseButton variant="ghost" @click="showForm = false">Bekor qilish</BaseButton>
        <BaseButton icon="send" @click="submit">Yuborish</BaseButton>
      </div>
    </div>

    <!-- Ro'yxat -->
    <div v-if="reviews.length" class="rv__list">
      <article v-for="r in reviews" :key="r.id" class="review">
        <div class="review__head">
          <BaseAvatar :name="r.display_author || 'Foydalanuvchi'" :src="r.author_avatar" :size="42" />
          <div class="review__meta">
            <div class="review__name">
              {{ r.display_author || 'Foydalanuvchi' }}
              <Icon v-if="r.is_verified" name="check-circle" :size="14" class="review__verified" />
            </div>
            <div class="review__date">{{ timeAgo(r.created_at) }}</div>
          </div>
          <div class="review__stars">
            <RatingStars :value="r.rating" :size="15" />
          </div>
        </div>
        <p class="review__body">{{ r.text }}</p>

        <div v-if="r.pros || r.cons" class="review__pc">
          <span v-if="r.pros" class="review__pro"><Icon name="plus" :size="13" /> {{ r.pros }}</span>
          <span v-if="r.cons" class="review__con"><Icon name="minus" :size="13" /> {{ r.cons }}</span>
        </div>

        <div v-if="r.reply" class="review__reply">
          <div class="review__reply-head">
            <Icon name="building" :size="14" /> Markaz javobi
          </div>
          <p>{{ r.reply.text }}</p>
        </div>
      </article>
    </div>
    <p v-else class="rv__empty muted">Hali sharhlar yo'q. Birinchi bo'lib fikr bildiring!</p>
  </div>
</template>

<style scoped>
.rv__summary {
  display: grid; grid-template-columns: auto 1fr; gap: var(--sp-8);
  padding: var(--sp-6);
  background: var(--grad-brand-soft);
  border-radius: var(--r-lg);
  align-items: center;
}
.rv__score { text-align: center; }
.rv__score-num { font-family: var(--font-display); font-weight: 800; font-size: 48px; line-height: 1; color: var(--ink-800); }
.rv__score .stars { margin: 8px 0 6px; }
.rv__score-count { font-size: 13px; color: var(--sky-700); }
.rv__bars { display: flex; flex-direction: column; gap: 7px; }
.rv__bar-row { display: flex; align-items: center; gap: 10px; }
.rv__bar-star { display: inline-flex; align-items: center; gap: 3px; width: 34px; font-size: 13px; font-weight: 600; color: var(--ink-600); }
.gold { color: var(--gold-500); fill: var(--gold-500); }
.rv__bar-track { flex: 1; height: 8px; background: rgba(255,255,255,.7); border-radius: 999px; overflow: hidden; }
.rv__bar-fill { display: block; height: 100%; background: var(--grad-brand); border-radius: 999px; }
.rv__bar-count { width: 28px; text-align: right; font-size: 13px; color: var(--ink-500); }

.rv__cta { margin: var(--sp-5) 0; }

.rv__form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--sp-5); margin-bottom: var(--sp-6); }
.rv__form-rating { display: flex; align-items: center; gap: 12px; margin-bottom: var(--sp-4); font-weight: 600; color: var(--text-soft); }
.rv__form textarea {
  width: 100%; padding: 12px 14px;
  border: 1px solid var(--border-strong); border-radius: 12px;
  resize: vertical; color: var(--text);
}
.rv__form textarea:focus { outline: none; border-color: var(--sky-400); box-shadow: var(--focus-ring); }
.rv__form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: var(--sp-4); }

.rv__list { display: flex; flex-direction: column; gap: var(--sp-4); }
.review { padding: var(--sp-5); border: 1px solid var(--border); border-radius: var(--r-lg); }
.review__head { display: flex; align-items: center; gap: 12px; }
.review__meta { flex: 1; }
.review__name { font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
.review__verified { color: var(--success-500); }
.review__date { font-size: 12.5px; color: var(--text-muted); }
.review__body { margin-top: 12px; color: var(--text-soft); line-height: 1.65; }
.review__pc { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.review__pro, .review__con { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 500; padding: 5px 10px; border-radius: var(--r-full); }
.review__pro { background: var(--success-50); color: var(--success-500); }
.review__con { background: var(--warning-50); color: #9a6f0a; }
.review__reply { margin-top: 14px; padding: 12px 14px; background: var(--sky-50); border-radius: var(--r-md); border-left: 3px solid var(--sky-400); }
.review__reply-head { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--sky-700); margin-bottom: 5px; }
.review__reply p { font-size: 14px; color: var(--ink-600); }
.rv__empty { padding: var(--sp-8) 0; text-align: center; }

@media (max-width: 560px) {
  .rv__summary { grid-template-columns: 1fr; gap: var(--sp-5); }
}
</style>
