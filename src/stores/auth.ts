import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { adminApi } from '@/services/api'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = shallowRef<string | null>(localStorage.getItem('tbb_token'))
  const user = shallowRef<AdminUser | null>(null)
  const checking = shallowRef(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(email: string, password: string) {
    const res = await adminApi.login(email, password)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('tbb_token', res.token)
  }

  async function fetchMe() {
    if (!token.value) return false
    checking.value = true
    try {
      const res = await adminApi.me()
      user.value = res.user
      return true
    } catch {
      logout()
      return false
    } finally {
      checking.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('tbb_token')
  }

  return { token, user, checking, isAuthenticated, login, fetchMe, logout }
})