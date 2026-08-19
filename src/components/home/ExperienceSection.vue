<script setup lang="ts">
const features = [
  { title: 'Un cliente a la vez', text: 'Tu turno es tuyo, sin prisas ni interrupciones.' },
  { title: 'Fade de precisión', text: 'Líneas milimétricas, acabado de master barber.' },
  { title: 'Productos premium', text: 'Cuidado de alta gama en cada servicio.' },
]
</script>

<template>
  <section id="experiencia" class="relative overflow-hidden bg-ink py-16 md:py-20">
    <span
      class="pointer-events-none absolute -left-4 bottom-6 select-none font-display text-[18vw] leading-none text-white/[0.03] lg:text-[12vw]"
      aria-hidden="true"
    >
      EXPERIENCIA
    </span>

    <div class="container-x relative">
      <div class="reveal mx-auto max-w-3xl text-center">
        <p class="eyebrow">La experiencia</p>
        <h2 class="mt-4 text-display text-5xl text-pure sm:text-6xl">
          Aquí tampoco<br />improvisamos<span class="text-brand-hover">.</span>
        </h2>
        <p class="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
          Cada corte es una sesión única: técnica de precisión, atención personalizada y cero atajos.
        </p>

        <div class="mx-auto mt-8 flex max-w-2xl flex-col gap-3 text-left sm:flex-row">
          <div v-for="f in features" :key="f.title" class="flex-1 border border-line bg-card p-5">
            <span class="block h-0.5 w-8 bg-brand" aria-hidden="true" />
            <h3 class="mt-3 font-display text-base uppercase tracking-wide text-white">{{ f.title }}</h3>
            <p class="mt-2 text-[13px] leading-relaxed text-muted">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>