import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/**
 * Uch xil zona:
 *  - public  → landing, katalog, markaz sahifasi (auth shart emas)
 *  - center  → markaz paneli (owner/staff/teacher)
 *  - admin   → platforma paneli (platform_admin)
 * meta.requires: 'center' | 'admin' | undefined
 */
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/public/HomeView.vue') },
      { path: 'markazlar', name: 'centers', component: () => import('@/views/public/CentersView.vue') },
      {
        path: 'markazlar/:slug',
        name: 'center-detail',
        component: () => import('@/views/public/CenterDetailView.vue'),
      },
      {
        path: 'yonalishlar',
        name: 'directions',
        component: () => import('@/views/public/DirectionsView.vue'),
      },
      { path: 'biz-haqimizda', name: 'about', component: () => import('@/views/public/AboutView.vue') },
      {
        path: 'markaz-qoshish',
        name: 'center-onboard',
        component: () => import('@/views/public/CenterOnboardView.vue'),
      },
    ],
  },

  {
    path: '/panel',
    component: () => import('@/layouts/CenterLayout.vue'),
    meta: { requires: 'center' },
    children: [
      { path: '', name: 'center-dashboard', component: () => import('@/views/center/DashboardView.vue') },
      { path: 'lidlar', name: 'center-leads', component: () => import('@/views/center/LeadsView.vue') },
      { path: 'kurslar', name: 'center-courses', component: () => import('@/views/center/CoursesView.vue') },
      { path: 'guruhlar', name: 'center-groups', component: () => import('@/views/center/GroupsView.vue') },
      { path: 'oqituvchilar', name: 'center-teachers', component: () => import('@/views/center/TeachersView.vue') },
      { path: 'sharhlar', name: 'center-reviews', component: () => import('@/views/center/ReviewsView.vue') },
      { path: 'obuna', name: 'center-billing', component: () => import('@/views/center/BillingView.vue') },
      { path: 'sozlamalar', name: 'center-settings', component: () => import('@/views/center/SettingsView.vue') },
    ],
  },

  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requires: 'admin' },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'markazlar', name: 'admin-centers', component: () => import('@/views/admin/CentersView.vue') },
      { path: 'sharhlar', name: 'admin-reviews', component: () => import('@/views/admin/ReviewsView.vue') },
      { path: 'foydalanuvchilar', name: 'admin-users', component: () => import('@/views/admin/UsersView.vue') },
      { path: 'katalog', name: 'admin-catalog', component: () => import('@/views/admin/CatalogView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/public/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.bootstrap()

  const requires = to.meta.requires
  if (!requires) return true

  if (!auth.isAuthenticated) {
    const ui = useUiStore()
    ui.openAuth('login')
    ui.error('Bu bo\'lim uchun tizimga kiring.')
    return { name: 'home' }
  }

  if (requires === 'admin' && !auth.isAdmin) return { name: 'home' }
  if (requires === 'center' && !(auth.isCenterSide || auth.isAdmin)) return { name: 'home' }

  return true
})

export default router
