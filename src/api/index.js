import http from '@/lib/http'

/** Barcha endpointlar bitta joydan. Har modul o'z bo'limini eksport qiladi. */

export const authApi = {
  requestOtp: (payload) => http.post('/auth/otp/request/', payload).then((r) => r.data),
  verifyOtp: (payload) => http.post('/auth/otp/verify/', payload).then((r) => r.data),
  login: (payload) => http.post('/auth/login/', payload).then((r) => r.data),
  logout: (refresh) => http.post('/auth/logout/', { refresh }),
  me: () => http.get('/auth/me/').then((r) => r.data),
  updateMe: (payload) => http.patch('/auth/me/', payload).then((r) => r.data),
  setPassword: (payload) => http.post('/auth/set-password/', payload).then((r) => r.data),
  users: (params) => http.get('/auth/users/', { params }).then((r) => r.data),
  toggleUser: (id) => http.post(`/auth/users/${id}/toggle_active/`).then((r) => r.data),
}

export const catalogApi = {
  regions: (params) => http.get('/catalog/regions/', { params }).then((r) => r.data),
  regionTree: () => http.get('/catalog/regions/tree/').then((r) => r.data),
  createRegion: (payload) => http.post('/catalog/regions/', payload).then((r) => r.data),
  updateRegion: (id, payload) => http.patch(`/catalog/regions/${id}/`, payload).then((r) => r.data),
  deleteRegion: (id) => http.delete(`/catalog/regions/${id}/`),

  directions: (params) => http.get('/catalog/directions/', { params }).then((r) => r.data),
  directionTree: () => http.get('/catalog/directions/tree/').then((r) => r.data),
  popularDirections: () => http.get('/catalog/directions/popular/').then((r) => r.data),
  createDirection: (payload) => http.post('/catalog/directions/', payload).then((r) => r.data),
  updateDirection: (id, payload) =>
    http.patch(`/catalog/directions/${id}/`, payload).then((r) => r.data),
  deleteDirection: (id) => http.delete(`/catalog/directions/${id}/`),

  amenities: () => http.get('/catalog/amenities/').then((r) => r.data),
}

export const centersApi = {
  list: (params) => http.get('/centers/', { params }).then((r) => r.data),
  detail: (slug) => http.get(`/centers/${slug}/`).then((r) => r.data),
  featured: () => http.get('/centers/featured/').then((r) => r.data),
  similar: (slug) => http.get(`/centers/${slug}/similar/`).then((r) => r.data),
  map: (params) => http.get('/centers/map/', { params }).then((r) => r.data),
  mine: () => http.get('/centers/mine/').then((r) => r.data),
  pending: (params) => http.get('/centers/pending/', { params }).then((r) => r.data),
  create: (payload) => http.post('/centers/', payload).then((r) => r.data),
  update: (slug, payload) => http.patch(`/centers/${slug}/`, payload).then((r) => r.data),
  moderate: (slug, payload) => http.post(`/centers/${slug}/moderate/`, payload).then((r) => r.data),
  teachers: (params) => http.get('/centers/teachers/', { params }).then((r) => r.data),
  branches: (params) => http.get('/centers/branches/', { params }).then((r) => r.data),
  createBranch: (payload) => http.post('/centers/branches/', payload).then((r) => r.data),
  updateBranch: (id, payload) => http.patch(`/centers/branches/${id}/`, payload).then((r) => r.data),
}

export const reviewsApi = {
  list: (params) => http.get('/reviews/', { params }).then((r) => r.data),
  create: (payload) => http.post('/reviews/', payload).then((r) => r.data),
  reply: (id, text) => http.post(`/reviews/${id}/reply/`, { text }).then((r) => r.data),
  vote: (id, is_helpful) => http.post(`/reviews/${id}/vote/`, { is_helpful }).then((r) => r.data),
  mine: () => http.get('/reviews/mine/').then((r) => r.data),
  pending: (params) => http.get('/reviews/pending/', { params }).then((r) => r.data),
  moderate: (id, payload) => http.post(`/reviews/${id}/moderate/`, payload).then((r) => r.data),
  remove: (id) => http.delete(`/reviews/${id}/`),
}

export const crmApi = {
  leads: (params) => http.get('/crm/leads/', { params }).then((r) => r.data),
  createLead: (payload) => http.post('/crm/leads/', payload).then((r) => r.data),
  updateLead: (id, payload) => http.patch(`/crm/leads/${id}/`, payload).then((r) => r.data),
  trialRequest: (payload) => http.post('/crm/trial-requests/', payload).then((r) => r.data),
}

export const learningApi = {
  courses: (params) => http.get('/learning/courses/', { params }).then((r) => r.data),
  createCourse: (payload) => http.post('/learning/courses/', payload).then((r) => r.data),
  groups: (params) => http.get('/learning/groups/', { params }).then((r) => r.data),
  enrollments: (params) => http.get('/learning/enrollments/', { params }).then((r) => r.data),
}

export const billingApi = {
  plans: () => http.get('/billing/plans/').then((r) => r.data),
  subscriptions: (params) => http.get('/billing/subscriptions/', { params }).then((r) => r.data),
  invoices: (params) => http.get('/billing/invoices/', { params }).then((r) => r.data),
}

export const analyticsApi = {
  centerDashboard: (params) =>
    http.get('/analytics/center-dashboard/', { params }).then((r) => r.data),
  platformDashboard: (params) =>
    http.get('/analytics/platform-dashboard/', { params }).then((r) => r.data),
  studentReport: (params) =>
    http.get('/analytics/student-report/', { params }).then((r) => r.data),
}

export const notificationsApi = {
  list: (params) => http.get('/notifications/', { params }).then((r) => r.data),
  markRead: (id) => http.post(`/notifications/${id}/read/`).then((r) => r.data),
}
