import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'The Boss Barber — Tu estilo. Sin compromisos.' },
    },
    {
      path: '/reservar',
      name: 'booking',
      component: () => import('@/views/BookingView.vue'),
      meta: { title: 'Reservar cita — The Boss Barber' },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLoginView.vue'),
      meta: { title: 'Acceso administrador — The Boss Barber', layout: 'blank' },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
          meta: { title: 'Panel de control — The Boss Barber' },
        },
        {
          path: 'reservas',
          name: 'admin-bookings',
          component: () => import('@/views/admin/AdminBookingsView.vue'),
          meta: { title: 'Reservas — The Boss Barber' },
        },
        {
          path: 'horarios',
          name: 'admin-schedule',
          component: () => import('@/views/admin/AdminScheduleView.vue'),
          meta: { title: 'Horarios — The Boss Barber' },
        },
        {
          path: 'servicios',
          name: 'admin-services',
          component: () => import('@/views/admin/AdminServicesView.vue'),
          meta: { title: 'Servicios — The Boss Barber' },
        },
        {
          path: 'clientes',
          name: 'admin-customers',
          component: () => import('@/views/admin/AdminCustomersView.vue'),
          meta: { title: 'Clientes — The Boss Barber' },
        },
        {
          path: 'configuracion',
          name: 'admin-settings',
          component: () => import('@/views/admin/AdminSettingsView.vue'),
          meta: { title: 'Configuración — The Boss Barber' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Página no encontrada' },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) document.title = title
})

router.beforeEach((to) => {
  const token = localStorage.getItem('tbb_token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router