<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BookingWizard from '@/components/booking/BookingWizard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { BUSINESS_WHATSAPP_NUMBER, toWhatsAppNumber } from '@/utils/whatsapp'

const catalog = useCatalogStore()
const whatsappNumber = ref(toWhatsAppNumber(BUSINESS_WHATSAPP_NUMBER))
const whatsappMessage = encodeURIComponent('Hola The Boss Barber, quiero información sobre sus servicios.')

onMounted(() => {
  window.scrollTo({ top: 0 })
  catalog.load().then(() => {
    whatsappNumber.value = toWhatsAppNumber(BUSINESS_WHATSAPP_NUMBER)
  })
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
      :href="`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95"
      aria-label="Escríbenos por WhatsApp"
    >
      <AppIcon name="whatsapp" :size="26" />
    </a>

    <AppFooter />
  </div>
</template>