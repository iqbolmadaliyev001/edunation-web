<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ratingText, priceRange, compact } from '@/lib/format'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import RatingStars from '@/components/ui/RatingStars.vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  center: { type: Object, required: true },
})

const price = computed(() => priceRange(props.center.price_from, props.center.price_to))
const dirs = computed(() => (props.center.directions_detail || []).slice(0, 3))
</script>

<template>
  <RouterLink :to="{ name: 'center-detail', params: { slug: center.slug } }" class="cc">
    <div class="cc__cover">
      <img v-if="center.cover" :src="center.cover" :alt="center.name" loading="lazy" />
      <div v-else class="cc__cover-fallback"></div>

      <BaseBadge v-if="center.is_featured" tone="gold" icon="sparkles" size="sm" class="cc__feat">
        Tavsiya
      </BaseBadge>

      <div class="cc__logo">
        <img v-if="center.logo" :src="center.logo" :alt="center.name" />
        <Icon v-else name="building" :size="22" />
      </div>
    </div>

    <div class="cc__body">
      <div class="cc__top">
        <h3 class="cc__name">{{ center.name }}</h3>
        <div class="cc__rating">
          <Icon name="star" :size="14" class="cc__star" />
          <span class="tabular">{{ ratingText(center.rating) }}</span>
        </div>
      </div>

      <p v-if="center.tagline" class="cc__tagline">{{ center.tagline }}</p>

      <div class="cc__dirs">
        <span v-for="d in dirs" :key="d.id" class="chip">{{ d.name_uz }}</span>
      </div>

      <div class="cc__meta">
        <span v-if="center.region_name" class="cc__loc">
          <Icon name="map-pin" :size="14" /> {{ center.region_name }}
        </span>
        <span class="cc__students">
          <Icon name="users" :size="14" /> {{ compact(center.students_count) }} o'quvchi
        </span>
      </div>

      <div class="cc__foot">
        <div class="cc__price">
          <template v-if="price"><span class="cc__price-val">{{ price }}</span><span class="cc__price-suf">/oy</span></template>
          <span v-else class="cc__price-empty">Narx kelishiladi</span>
        </div>
        <span class="cc__reviews">{{ center.reviews_count }} sharh</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.cc {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow .2s, border-color .2s, transform .2s;
}
.cc:hover { box-shadow: var(--shadow-md); border-color: var(--sky-200); transform: translateY(-3px); }

.cc__cover { position: relative; aspect-ratio: 16 / 8.5; background: var(--grad-brand-soft); }
.cc__cover img { width: 100%; height: 100%; object-fit: cover; }
.cc__cover-fallback {
  position: absolute; inset: 0;
  background:
    radial-gradient(60% 90% at 20% 10%, rgba(76,172,244,.25), transparent 60%),
    radial-gradient(60% 90% at 90% 20%, rgba(134,200,250,.28), transparent 60%),
    var(--grad-brand-soft);
}
.cc__feat { position: absolute; top: 10px; left: 10px; box-shadow: var(--shadow-sm); }
.cc__logo {
  position: absolute;
  bottom: -20px; left: 16px;
  width: 52px; height: 52px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 2px solid var(--surface);
  box-shadow: var(--shadow-sm);
  display: grid; place-items: center;
  overflow: hidden;
  color: var(--sky-500);
}
.cc__logo img { width: 100%; height: 100%; object-fit: cover; }

.cc__body { padding: var(--sp-5); padding-top: 30px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.cc__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cc__name {
  font-size: 17px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cc__rating {
  display: inline-flex; align-items: center; gap: 4px;
  font-weight: 700; font-size: 14px;
  color: var(--ink-800);
  flex-shrink: 0;
}
.cc__star { color: var(--gold-500); fill: var(--gold-500); }
.cc__tagline {
  font-size: 13.5px; color: var(--text-muted);
  display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
  margin-top: -2px;
}
.cc__dirs { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 11.5px; font-weight: 600;
  padding: 4px 9px; border-radius: var(--r-full);
  background: var(--sky-50); color: var(--sky-700);
}
.cc__meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
.cc__loc, .cc__students { display: inline-flex; align-items: center; gap: 5px; }
.cc__loc { max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.cc__foot {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.cc__price-val { font-weight: 700; color: var(--ink-800); font-size: 14.5px; }
.cc__price-suf { color: var(--text-muted); font-size: 12.5px; }
.cc__price-empty { color: var(--text-muted); font-size: 13px; }
.cc__reviews { font-size: 12.5px; color: var(--text-muted); }
</style>
