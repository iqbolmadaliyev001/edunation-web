/** Formatlash yordamchilari — butun ilova bo'ylab bir xil ko'rinish. */

/** 1500000 → "1,5 mln so'm" ; 500000 → "500 000 so'm" */
export function money(value, { short = false } = {}) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  if (short && n >= 1_000_000) {
    const mln = n / 1_000_000
    return `${mln.toFixed(mln % 1 === 0 ? 0 : 1).replace('.', ',')} mln so'm`
  }
  return `${n.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`
}

/** Narx oralig'i kartochka uchun. */
export function priceRange(from, to) {
  if (from == null && to == null) return null
  if (from != null && to != null && Number(from) !== Number(to)) {
    return `${money(from, { short: true })} – ${money(to, { short: true })}`
  }
  return money(from ?? to, { short: true })
}

/** 1234 → "1,2K" ; 12000 → "12K" ; 999 → "999" */
export function compact(value) {
  const n = Number(value || 0)
  if (n >= 1000) {
    const k = n / 1000
    return `${k.toFixed(k >= 10 || k % 1 === 0 ? 0 : 1).replace('.', ',')}K`
  }
  return String(n)
}

export function ratingText(value) {
  const n = Number(value || 0)
  return n > 0 ? n.toFixed(1).replace('.', ',') : 'Yangi'
}

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]

export function dateShort(value) {
  if (!value) return '—'
  const d = new Date(value)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function dateFull(value) {
  if (!value) return '—'
  const d = new Date(value)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "3 daqiqa oldin", "2 kun oldin" ko'rinishi. */
export function timeAgo(value) {
  if (!value) return ''
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return 'hozirgina'
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} kun oldin`
  return dateShort(value)
}

/** Ismdan bosh harflar — avatar zaxira ko'rinishi. */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

/** Telefonni +998 90 123 45 67 ko'rinishida. */
export function phoneFormat(phone = '') {
  const m = phone.replace(/\D/g, '').match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/)
  if (!m) return phone
  return `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`
}

/** Rasm URL — media proxy orqali. */
export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path
}
