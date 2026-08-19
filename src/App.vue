<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { setupScrollReveal } from '@/composables/useScrollReveal'

const route = useRoute()
const booting = ref(true)
const isAdminRoute = () => route.path.startsWith('/admin') && route.path !== '/admin/login'

onMounted(() => {
  setupScrollReveal()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      booting.value = false
    })
  })
})

watch(
  () => route.path,
  () => {
    if (isAdminRoute()) window.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="min-h-dvh">
    <RouterView />

    <Transition name="boot">
      <div
        v-if="booting"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-ink"
        aria-hidden="true"
      >
        <div class="stripes h-1 w-16" />
        <p class="font-display text-2xl tracking-[0.1em] text-pure">BOSS</p>
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-muted">Barber</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.boot-enter-active,
.boot-leave-active {
  transition: opacity 0.45s ease;
}
.boot-leave-to {
  opacity: 0;
}
</style>