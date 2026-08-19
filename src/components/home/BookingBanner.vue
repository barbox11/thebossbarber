<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
</script>

<template>
  <section class="relative overflow-hidden bg-ink py-20 md:py-28">
    <div class="container-x">
      <div class="reveal relative overflow-hidden border border-line bg-card px-7 py-14 md:px-16 md:py-20">
        <div class="stripes absolute left-0 top-0 h-full w-2.5" aria-hidden="true" />
        <div
          class="pointer-events-none absolute -right-10 -top-16 select-none font-display text-[11rem] leading-none text-white/[0.04] md:text-[16rem]"
          aria-hidden="true"
        >
          BOSS
        </div>

        <div class="relative max-w-2xl">
          <p class="eyebrow">Tu turno te espera</p>
          <h2 class="mt-4 text-display text-5xl text-pure sm:text-6xl lg:text-7xl">
            Listo para un<br />corte de otro nivel<span class="text-brand-hover">?</span>
          </h2>
          <p class="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Elige tu servicio, escoge fecha y hora, y confirma. Sin registros, sin filas, sin esperas.
          </p>
          <button
            type="button"
            class="group mt-9 inline-flex items-center gap-3 bg-brand px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-hover active:scale-[0.98]"
            @click="router.push('/reservar')"
          >
            Reservar mi cita
            <AppIcon name="arrowRight" :size="16" class="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>