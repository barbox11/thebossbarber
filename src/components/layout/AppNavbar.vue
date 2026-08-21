<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const router = useRouter()

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Ubicación', href: '#ubicacion' },
]

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function scrollToSection(href: string) {
  menuOpen.value = false
  const id = href.slice(1)
  if (route.path !== '/') {
    router.push({ path: '/', hash: href })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="scrolled || menuOpen ? 'bg-ink/90 backdrop-blur-md border-b border-line/70' : 'bg-transparent'"
  >
    <nav class="container-x flex h-16 items-center justify-between md:h-20" aria-label="Principal">
      <RouterLink to="/" class="group flex items-center gap-2.5" aria-label="The Boss Barber — Inicio">
        <span class="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line-2 transition-colors group-hover:border-brand">
          <picture>
            <source srcset="/images/logo-160.avif 160w, /images/logo-96.avif 96w" type="image/avif" />
            <img
              src="/images/logo-160.webp"
              srcset="/images/logo-160.webp 160w, /images/logo-96.webp 96w"
              sizes="40px"
              alt="The Boss Barber"
              class="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </picture>
        </span>
        <span class="flex flex-col leading-none">
          <span class="font-display text-2xl tracking-wide text-pure">BOSS</span>
          <span class="mt-0.5 text-[9px] font-bold uppercase tracking-[0.42em] text-muted">Barber</span>
        </span>
      </RouterLink>

      <div class="hidden items-center gap-8 lg:flex">
        <a
          v-for="link in links"
          :key="link.href"
          href="#"
          class="text-xs font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-white"
          :aria-label="link.label"
          @click.prevent="scrollToSection(link.href)"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/reservar"
          class="group hidden items-center gap-2 bg-brand px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-hover sm:inline-flex"
        >
          Reservar cita
          <AppIcon name="arrowRight" :size="14" class="transition-transform group-hover:translate-x-0.5" />
        </RouterLink>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center text-white lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click="toggleMenu"
        >
          <AppIcon v-if="!menuOpen" name="menu" :size="26" />
          <AppIcon v-else name="close" :size="26" />
        </button>
      </div>
    </nav>
  </header>

  <Teleport to="body">
    <Transition name="menu">
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="fixed inset-0 z-40 flex flex-col bg-ink lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div class="flex flex-1 flex-col justify-center px-8">
          <nav class="flex flex-col gap-1" aria-label="Menú móvil">
            <a
              v-for="(link, i) in links"
              :key="link.href"
              href="#"
              class="menu-item group flex items-baseline gap-3 py-2"
              :style="{ transitionDelay: `${i * 40}ms` }"
              @click.prevent="scrollToSection(link.href)"
            >
              <span class="text-[10px] font-bold tracking-[0.3em] text-brand">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="font-display text-5xl text-pure transition-colors group-hover:text-brand-hover">
                {{ link.label }}
              </span>
            </a>
          </nav>
        </div>
        <div class="border-t border-line px-8 py-8">
          <RouterLink
            to="/reservar"
            class="flex w-full items-center justify-center gap-3 bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover"
            @click="menuOpen = false"
          >
            Reservar cita
            <AppIcon name="arrowRight" :size="16" />
          </RouterLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s ease;
}
.menu-enter-active .menu-item,
.menu-leave-active .menu-item {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-from .menu-item,
.menu-leave-to .menu-item {
  opacity: 0;
  transform: translateY(14px);
}
</style>