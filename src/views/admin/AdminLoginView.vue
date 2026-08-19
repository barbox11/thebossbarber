<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateLogin } from '@/utils/validation'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  const validation = validateLogin(form.email, form.password)
  if (validation.length) {
    error.value = validation[0].message
    return
  }
  loading.value = true
  error.value = null
  try {
    await auth.login(form.email, form.password)
    const redirect = (route.query.redirect as string | undefined) || '/admin'
    router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No pudimos iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-ink px-4">
    <div class="w-full max-w-sm">
      <div class="mb-10 flex flex-col items-center">
        <div class="stripes h-1 w-16" aria-hidden="true" />
        <p class="mt-5 font-display text-3xl tracking-wide text-white">BOSS</p>
        <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.4em] text-muted">Acceso administrador</p>
      </div>

      <form class="space-y-5" novalidate @submit.prevent="submit">
        <div>
          <label for="login-email" class="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            Correo
          </label>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="w-full border border-line bg-ink px-4 py-3.5 text-sm text-white placeholder:text-muted-2 focus:border-brand"
            placeholder="admin@thebossbarber.com"
          />
        </div>
        <div>
          <label for="login-password" class="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            Contraseña
          </label>
          <input
            id="login-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="w-full border border-line bg-ink px-4 py-3.5 text-sm text-white placeholder:text-muted-2 focus:border-brand"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="border border-brand bg-brand-soft p-3 text-sm text-white" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="inline-flex w-full items-center justify-center gap-2 bg-brand px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          <span v-if="loading" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          Iniciar sesión
        </button>
      </form>

      <p class="mt-8 text-center text-xs text-muted-2">
        Solo personal autorizado. El acceso es validado también en el servidor.
      </p>
    </div>
  </div>
</template>