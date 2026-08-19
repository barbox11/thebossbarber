import { onMounted, onUnmounted } from 'vue'
import { shallowRef } from 'vue'

export function useReducedMotion(): boolean {
  const reduced = shallowRef(false)
  const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  const update = () => {
    reduced.value = mq?.matches ?? false
  }
  onMounted(() => {
    update()
    mq?.addEventListener('change', update)
  })
  onUnmounted(() => mq?.removeEventListener('change', update))
  return reduced.value
}
