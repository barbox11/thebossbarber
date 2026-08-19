<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import AppIcon from '@/components/ui/AppIcon.vue'
import NumberRoller from '@/components/ui/NumberRoller.vue'

const router = useRouter()
const catalog = useCatalogStore()
const stats = ref<{ customers: string; years: string; rating: string }>({
  customers: '+2.000',
  years: '5',
  rating: '4.9/5',
})

onMounted(() => {
  catalog.load().then(() => {
    const s = catalog.settings
    if (s) {
      stats.value = {
        customers: s.statsCustomers || '+2.000',
        years: s.statsYears || '5',
        rating: s.statsRating || '4.9/5',
      }
    }
  })
})

function goToBooking() {
  router.push('/reservar')
}
function goToExperience() {
  document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' })
}

const statItems = computed(() => [
  { value: stats.value.customers, label: 'Clientes' },
  { value: stats.value.years, label: 'Años de experiencia' },
  { value: stats.value.rating, label: 'Satisfacción' },
])
</script>

<template>
  <section id="inicio" class="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
    <picture class="absolute inset-0" aria-hidden="true">
      <source media="(min-width: 1024px)" :srcset="`/images/hero-desktop-1600.avif 1600w, /images/hero-desktop-1080.avif 1080w`" type="image/avif" />
      <source media="(min-width: 1024px)" :srcset="`/images/hero-desktop-1600.webp 1600w, /images/hero-desktop-1080.webp 1080w`" type="image/webp" />
      <source :srcset="`/images/hero-mobile-1080.avif 1080w, /images/hero-mobile-720.avif 720w, /images/hero-mobile-480.avif 480w`" type="image/avif" />
      <img
        src="/images/hero-mobile-720.webp"
        :srcset="`/images/hero-mobile-1080.webp 1080w, /images/hero-mobile-720.webp 720w, /images/hero-mobile-480.webp 480w`"
        sizes="100vw"
        alt=""
        class="h-full w-full object-cover"
        fetchpriority="high"
        decoding="async"
      />
    </picture>

    <div
      class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"
      aria-hidden="true"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/30" aria-hidden="true" />

    <div class="container-x relative z-10 flex flex-1 flex-col justify-end pb-24 pt-32 md:pb-28">
      <div class="max-w-3xl">
        <p class="hero-anim eyebrow !text-white/80" style="animation-delay: 150ms">Barbería premium · Est. 2021</p>

        <h1 class="mt-5 text-display text-6xl text-pure sm:text-7xl lg:text-8xl">
          <span class="hero-anim block" style="animation-delay: 300ms">Aquí no andamos</span>
          <span class="hero-anim block text-brand-hover" style="animation-delay: 450ms">improvisando nada.</span>
        </h1>

        <div class="hero-anim razor-line mt-7 w-24" style="animation-delay: 550ms" />

        <p class="hero-anim mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg" style="animation-delay: 650ms">
          Cortes precisos. Experiencias premium. Reservas en segundos.
        </p>

        <div class="hero-anim mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style="animation-delay: 780ms">
          <button
            type="button"
            class="group inline-flex items-center justify-center gap-3 bg-brand px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-hover active:scale-[0.98]"
            @click="goToBooking"
          >
            Reservar mi cita
            <AppIcon name="arrowRight" :size="16" class="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 border border-line-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-brand hover:text-brand-hover"
            @click="goToExperience"
          >
            Descubrir la experiencia
          </button>
        </div>
      </div>

      <div class="hero-anim mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-7" style="animation-delay: 920ms">
        <div v-for="(s, i) in statItems" :key="s.label" class="flex flex-col gap-1.5">
          <span class="font-display text-3xl text-white sm:text-4xl">
            <NumberRoller :value="s.value" :start-delay="950 + i * 220" />
          </span>
          <span class="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <div class="absolute bottom-6 right-6 z-10 hidden flex-col items-center gap-2 md:flex" aria-hidden="true">
      <span class="text-[10px] font-bold uppercase tracking-[0.4em] text-muted [writing-mode:vertical-rl]">Desliza</span>
      <span class="h-16 w-px animate-glow bg-brand" />
    </div>
  </section>
</template>

<style scoped>
.hero-anim {
  opacity: 0;
  animation: hero-enter 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>