# EduNation — Web

> Landing sayt, markaz paneli va admin panel — bitta Vue 3 ilovada.

**Bog'liq repolar:** [edunation-backend](https://github.com/iqbolmadaliyev001/edunation-backend) · [edunation-mobile](https://github.com/iqbolmadaliyev001/edunation-mobile) · [edunation-docs](https://github.com/iqbolmadaliyev001/edunation-docs)

---

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:5173` da ochiladi.

> Backend (`edunation-backend`) `:8000` portda ishlab turishi kerak. `/api` so'rovlari Vite orqali avtomatik proxy qilinadi — CORS sozlash shart emas.

```bash
npm run build      # dist/ ga statik build
npm run preview    # build natijasini ko'rish
```

---

## Uch zona

| Zona | Yo'l | Kim uchun |
|------|------|-----------|
| **Landing** | `/` | Hamma. Bosh sahifa, markazlar katalogi, markaz sahifasi, yo'nalishlar. Auth shart emas. |
| **Markaz paneli** | `/panel` | `center_owner`, `center_staff`. Dashboard, CRM, kurslar, guruhlar, o'qituvchilar, sharhlar, obuna. |
| **Admin panel** | `/admin` | `platform_admin`. Platforma statistikasi, markazlar va sharhlar moderatsiyasi, foydalanuvchilar, katalog. |

Kirish — yuqori o'ng burchakdagi **Kirish** tugmasi (OTP modal). Demo akkaunt bilan kirilganda mos panelga yo'naltiriladi.

---

## Tuzilma

```
src/
├── api/index.js          Barcha endpointlar bitta joyda
├── lib/http.js           Axios instansi: JWT, avtomatik refresh, xato normalizatsiyasi
├── lib/format.js         Pul, sana, telefon formatlash
├── stores/               Pinia: auth, center, ui (toast, tema, modal)
├── router/index.js       Uch zona + rol bo'yicha himoya
├── layouts/              PublicLayout, CenterLayout, AdminLayout
├── components/
│   ├── ui/               Base* komponentlar + Icon (tashqi kutubxonasiz SVG to'plami)
│   ├── layout/           Header, Footer, PanelShell
│   ├── centers/          CenterCard, ReviewList, TrialRequestCard
│   └── charts/           MiniChart (Canvas, kutubxonasiz)
└── views/
    ├── public/           Landing sahifalari
    ├── center/           Markaz paneli
    └── admin/            Admin panel
```

---

## Muhim texnik qarorlar

**Tailwind emas, CSS tokenlari.** Butun dizayn `src/assets/styles/tokens.css` dagi CSS o'zgaruvchilaridan quriladi. Qiymatlar [`BRAND.md`](https://github.com/iqbolmadaliyev001/edunation-docs) bilan bir xil. Qorong'i rejim bitta `data-theme` atributi bilan almashadi — komponentlarga tegilmaydi.

**Ikonkalar — o'z to'plamimiz.** `components/ui/Icon.vue` ichida SVG path'lar. Tashqi kutubxona yo'q: bundle kichik va ikonkalar brendga aniq mos (24×24 grid, `stroke: currentColor`, 1.9 qalinlik).

**Grafiklar kutubxonasiz.** `MiniChart.vue` — sof Canvas. Chart.js panel uchun ortiqcha og'irlik edi.

**Avtomatik token yangilash.** `lib/http.js` da 401 kelganda refresh token bilan yangilanadi va so'rov qayta yuboriladi. Bir vaqtda kelgan bir nechta 401 uchun faqat bitta refresh so'rovi ketadi.

**Lazy routing.** Har bir view alohida chunk — landing ochilganda panel kodi yuklanmaydi.

---

## Texnologiyalar

Vue 3 (Composition API, `<script setup>`) · Vite 6 · Pinia · Vue Router 4 · Axios
