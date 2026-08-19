<script setup lang="ts">
import { onMounted } from 'vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BookingWizard from '@/components/booking/BookingWizard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

onMounted(() => {
  window.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="min-h-dvh bg-ink">
    <AppNavbar />
    <main class="min-h-[80svh] pb-24 pt-28">
      <div class="container-x">
        <BookingWizard />
      </div>
    </main>

    <a
      :href="`https://wa.me/5732176550814?text=${encodeURIComponent('Hola The Boss Barber, quiero información sobre sus servicios.')}`"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105"
      aria-label="Escríbenos por WhatsApp"
    >
      <AppIcon name="whatsapp" :size="26" />
    </a>

    <AppFooter />
  </div>
</template>