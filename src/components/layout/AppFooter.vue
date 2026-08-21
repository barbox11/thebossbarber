<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import AppIcon from '@/components/ui/AppIcon.vue'

const catalog = useCatalogStore()
const settings = ref(catalog.settings)

onMounted(() => {
  catalog.refresh().then(() => {
    settings.value = catalog.settings
  })
})
</script>

<template>
  <footer class="border-t border-line bg-ink-2">
    <div class="container-x py-16">
      <div class="grid gap-12 md:grid-cols-12">
        <div class="md:col-span-5">
          <div class="flex items-center gap-3">
            <span class="block h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line-2">
              <picture>
                <source srcset="/images/logo-160.avif 160w, /images/logo-96.avif 96w" type="image/avif" />
                <img
                  src="/images/logo-160.webp"
                  srcset="/images/logo-160.webp 160w, /images/logo-96.webp 96w"
                  sizes="48px"
                  alt=""
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </span>
            <span class="flex flex-col leading-none">
              <span class="font-display text-3xl tracking-wide text-pure">BOSS</span>
              <span class="mt-1 text-[9px] font-bold uppercase tracking-[0.42em] text-muted">Barber</span>
            </span>
          </div>
          <p class="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Barbería premium para el hombre moderno. Precisión en cada corte, atención personalizada y una
            experiencia que se nota desde el primer minuto.
          </p>
          <div class="mt-6 flex gap-3">
            <a
              v-if="settings?.instagram"
              :href="settings.instagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="flex h-11 w-11 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
            >
              <AppIcon name="instagram" :size="18" />
            </a>
            <a
              v-if="settings?.whatsapp"
              :href="`https://wa.me/${settings.whatsapp.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              class="flex h-11 w-11 items-center justify-center border border-line-2 text-muted transition-colors hover:border-brand hover:text-brand-hover"
            >
              <AppIcon name="whatsapp" :size="18" />
            </a>
          </div>
        </div>

        <div class="md:col-span-3">
          <h3 class="eyebrow">Explorar</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="l in [
              { label: 'Servicios', href: '/#servicios' },
              { label: 'Nosotros', href: '/#nosotros' },
              { label: 'Ubicación', href: '/#ubicacion' },
            ]" :key="l.href">
              <RouterLink :to="l.href" class="text-sm text-muted transition-colors hover:text-white">
                {{ l.label }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/reservar" class="text-sm font-bold text-brand-hover transition-colors hover:text-white">
                Reservar cita
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="md:col-span-4">
          <h3 class="eyebrow">Contacto</h3>
          <ul class="mt-5 space-y-4 text-sm text-muted">
            <li v-if="settings?.address" class="flex items-start gap-3">
              <AppIcon name="pin" :size="16" class="mt-0.5 shrink-0 text-brand" />
              {{ settings.address }}
            </li>
            <li v-if="settings?.phone" class="flex items-center gap-3">
              <AppIcon name="phone" :size="16" class="shrink-0 text-brand" />
              <a :href="`tel:${settings.phone.replace(/\D/g, '')}`" class="transition-colors hover:text-white">
                {{ settings.phone }}
              </a>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="clock" :size="16" class="shrink-0 text-brand" />
              <span>Lun–Vie 9:00–19:00 · Sáb 9:00–17:00 · Dom cerrado</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-muted-2">© {{ new Date().getFullYear() }} {{ settings?.businessName ?? 'The Boss Barber' }}. Todos los derechos reservados.</p>
        <div class="flex flex-col items-start gap-1 text-right sm:items-end">
          <p class="text-[11px] uppercase tracking-[0.2em] text-muted-2">Hecho con precisión.</p>
          <a
            href="https://barbox11.is-a.dev/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:text-brand-hover"
          >
            Hecho por barbox11
          </a>
          <RouterLink
            to="/admin/login"
            class="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-2 transition-colors hover:text-brand-hover"
          >
            Acceso administrador
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>