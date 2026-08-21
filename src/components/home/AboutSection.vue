<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import AppIcon from '@/components/ui/AppIcon.vue'

const catalog = useCatalogStore()
const barberName = ref('El Maestro Barbero')

onMounted(async () => {
  if (!catalog.loaded) await catalog.load()
  barberName.value = catalog.settings?.barberName ?? barberName.value
})

const specialties = ['Fades y degradados', 'Barba y afilado', 'Texturas y cortes modernos', 'Acabados clásicos']
</script>

<template>
  <section id="nosotros" class="relative overflow-hidden bg-ink-2 py-20 md:py-28">
    <div class="container-x">
      <div class="reveal mx-auto max-w-3xl text-center">
        <p class="eyebrow">El barbero</p>
        <h2 class="mt-4 text-display text-5xl text-pure sm:text-6xl">
          {{ barberName }}<span class="text-brand-hover">.</span>
        </h2>
        <p class="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-brand-hover">Master barber · Fundador</p>
        <p class="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
          Detrás de cada corte hay un método. Años de práctica, obsesión por la simetría y una regla
          inquebrantable: nadie sale de esta silla sin sentirse mejor de lo que entró.
        </p>
        <blockquote class="mx-auto mt-6 max-w-md border-l-2 border-brand pl-5 text-left font-display text-2xl uppercase leading-tight text-white/90">
          "Un buen corte no se ve. Se nota."
        </blockquote>
        <ul class="mx-auto mt-8 grid max-w-2xl gap-px bg-line text-left sm:grid-cols-2">
          <li v-for="s in specialties" :key="s" class="flex items-center gap-3 bg-ink-2 px-4 py-3.5 text-sm text-muted">
            <span class="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" aria-hidden="true" />
            {{ s }}
          </li>
        </ul>
        <RouterLink
          to="/reservar"
          class="group mt-9 inline-flex items-center gap-3 bg-brand px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover"
        >
          Reservar con él
          <AppIcon name="arrowRight" :size="16" class="transition-transform group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>