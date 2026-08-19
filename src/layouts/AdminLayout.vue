<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()
const menuOpen = ref(false)

const nav = [
  { name: 'admin-dashboard', label: 'Panel', icon: 'chart' },
  { name: 'admin-bookings', label: 'Reservas', icon: 'calendar' },
  { name: 'admin-schedule', label: 'Horarios', icon: 'clock' },
  { name: 'admin-services', label: 'Servicios', icon: 'scissors' },
  { name: 'admin-customers', label: 'Clientes', icon: 'users' },
  { name: 'admin-settings', label: 'Configuración', icon: 'spark' },
]

onMounted(async () => {
  if (!(await auth.fetchMe())) {
    router.replace('/admin/login')
  }
})

function logout() {
  auth.logout()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="flex min-h-dvh bg-ink">
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-line bg-ink-2 transition-transform lg:translate-x-0"
      :class="menuOpen ? 'translate-x-0' : ''"
      aria-label="Menú de administración"
    >
      <div class="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span class="h-7 w-1.5 bg-brand" aria-hidden="true" />
        <span class="font-display text-xl tracking-wide text-white">BOSS</span>
        <span class="text-[8px] font-bold uppercase tracking-[0.3em] text-muted">Admin</span>
      </div>

      <nav class="flex-1 overflow-y-auto py-4" aria-label="Secciones del panel">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 border-l-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
          :class="
            $route.name === item.name
              ? 'border-brand bg-card text-white'
              : 'border-transparent text-muted hover:bg-card/40 hover:text-white'
          "
          @click="menuOpen = false"
        >
          <AppIcon :name="item.icon" :size="17" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-line p-4">
        <p class="truncate text-xs font-semibold text-white">{{ auth.user?.name ?? 'Admin' }}</p>
        <p class="truncate text-[11px] text-muted-2">{{ auth.user?.email }}</p>
        <button
          type="button"
          class="mt-3 flex w-full items-center justify-center gap-2 border border-line-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:border-brand hover:text-brand-hover"
          @click="logout"
        >
          <AppIcon name="logout" :size="15" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <div v-if="menuOpen" class="fixed inset-0 z-30 bg-ink/60 backdrop-blur-sm lg:hidden" @click="menuOpen = false" />

    <div class="flex min-h-dvh flex-1 flex-col lg:pl-64">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-md lg:px-8">
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center text-white lg:hidden"
          aria-label="Abrir menú"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon name="menu" :size="24" />
        </button>
        <h1 class="font-display text-xl uppercase tracking-wide text-white">Panel de control</h1>
        <RouterLink
          to="/"
          class="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-white"
          aria-label="Ver sitio público"
        >
          <AppIcon name="eye" :size="20" />
        </RouterLink>
      </header>

      <main class="flex-1 p-4 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>