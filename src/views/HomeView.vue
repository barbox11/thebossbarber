<script setup lang="ts">
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import MarqueeStrip from '@/components/home/MarqueeStrip.vue'
import ExperienceSection from '@/components/home/ExperienceSection.vue'
import AboutSection from '@/components/home/AboutSection.vue'
import LocationSection from '@/components/home/LocationSection.vue'
import BookingBanner from '@/components/home/BookingBanner.vue'
</script>

<template>
  <div class="min-h-dvh bg-ink">
    <AppNavbar />
    <main>
      <HeroSection />
      <MarqueeStrip />
      <ServicesSection />
      <ExperienceSection />
      <AboutSection />
      <LocationSection />
      <BookingBanner />
    </main>
    <AppFooter />
  </div>
</template>