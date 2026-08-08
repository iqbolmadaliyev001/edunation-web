<script setup>
/**
 * Xaritadan nuqta tanlash / ko'rsatish.
 *
 * Plitkalar OpenStreetMap'dan olinadi — kalit talab qilmaydi, shuning uchun
 * hech qanday ro'yxatdan o'tishsiz darhol ishlaydi. Manba `VITE_MAP_TILE_URL`
 * bilan almashtiriladi (masalan Yandex'ga o'tilganda) — kodga tegish shart emas.
 *
 * `readonly` bo'lsa faqat ko'rsatadi: bosish va surish nuqtani o'zgartirmaydi.
 */
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  modelValue: { type: Object, default: null }, // { lat, lng } yoki null
  readonly: { type: Boolean, default: false },
  height: { type: String, default: '340px' },
  zoom: { type: Number, default: 15 },
})
const emit = defineEmits(['update:modelValue'])

// Qo'qon — hujjatdagi 1-bosqich piloti. Koordinata hali yo'q bo'lsa shu ko'rinadi.
const FALLBACK = { lat: 40.5286, lng: 70.9425 }
const FALLBACK_ZOOM = 13

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL
  || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIB = import.meta.env.VITE_MAP_TILE_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const el = ref(null)
const map = shallowRef(null)
const marker = shallowRef(null)

/** Brend rangidagi belgi. Rasm fayli kerak emas — bundler bilan muammo chiqmaydi. */
const pin = L.divIcon({
  className: 'mp-pin',
  html: '<span class="mp-pin__dot"></span><span class="mp-pin__pulse"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function place(latlng) {
  if (!map.value) return
  if (marker.value) {
    marker.value.setLatLng(latlng)
  } else {
    marker.value = L.marker(latlng, {
      icon: pin,
      draggable: !props.readonly,
    }).addTo(map.value)
    if (!props.readonly) {
      marker.value.on('dragend', () => {
        const p = marker.value.getLatLng()
        emit('update:modelValue', { lat: round(p.lat), lng: round(p.lng) })
      })
    }
  }
}

const round = (n) => Number(Number(n).toFixed(6))

onMounted(() => {
  const start = props.modelValue?.lat != null ? props.modelValue : FALLBACK
  const startZoom = props.modelValue?.lat != null ? props.zoom : FALLBACK_ZOOM

  map.value = L.map(el.value, {
    zoomControl: !props.readonly,
    scrollWheelZoom: !props.readonly,
    dragging: true,
    attributionControl: true,
  }).setView([start.lat, start.lng], startZoom)

  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIB, maxZoom: 19 }).addTo(map.value)

  if (props.modelValue?.lat != null) place([props.modelValue.lat, props.modelValue.lng])

  if (!props.readonly) {
    map.value.on('click', (e) => {
      place(e.latlng)
      emit('update:modelValue', { lat: round(e.latlng.lat), lng: round(e.latlng.lng) })
    })
  }

  // Konteyner kech o'lchamga ega bo'lsa (tab, akkordeon) xarita kulrang qoladi
  setTimeout(() => map.value?.invalidateSize(), 120)
})

watch(() => props.modelValue, (v) => {
  if (!map.value || v?.lat == null) return
  place([v.lat, v.lng])
  map.value.setView([v.lat, v.lng], Math.max(map.value.getZoom(), props.zoom))
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
  marker.value = null
})

defineExpose({
  /** Tashqaridan xaritani qayta o'lchash (modal ochilganda kerak bo'ladi). */
  refresh: () => map.value?.invalidateSize(),
})
</script>

<template>
  <div class="mp">
    <div ref="el" class="mp__canvas" :style="{ height }"></div>
    <p v-if="!readonly" class="mp__hint">
      Xaritani bosing yoki belgini surib joylashuvni aniq belgilang.
    </p>
  </div>
</template>

<style scoped>
.mp__canvas {
  width: 100%;
  border-radius: var(--r-md);
  border: 1px solid var(--border-strong);
  overflow: hidden;
  z-index: 0; /* Leaflet paneli modal ustiga chiqib ketmasin */
}
.mp__hint { font-size: 13px; color: var(--text-muted); margin-top: 8px; }
</style>

<style>
/* Belgi Leaflet tomonidan body'ga ko'chiriladi — scoped ishlamaydi */
.mp-pin { position: relative; }
.mp-pin__dot {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: var(--sky-500, #2490e6);
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgb(16 90 158 / 45%);
}
.mp-pin__pulse {
  position: absolute; inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--sky-500, #2490e6);
  opacity: .35;
}
</style>
