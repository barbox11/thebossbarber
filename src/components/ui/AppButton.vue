<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    block?: boolean
    as?: 'button' | 'router-link' | 'a'
    to?: string
    href?: string
    external?: boolean
    type?: 'button' | 'submit'
    ariaLabel?: string
  }>(),
  { variant: 'primary', size: 'md', loading: false, disabled: false, block: false, as: 'button', type: 'button' },
)

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

const classes = computed(() => [
  'group inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[0.18em]',
  'transition-all duration-200 select-none',
  props.block ? 'w-full' : '',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.size === 'sm' ? 'text-[11px] px-4 py-2.5' : props.size === 'lg' ? 'text-xs px-8 py-4' : 'text-[11px] px-6 py-3.5',
  props.variant === 'primary'
    ? 'bg-brand text-white hover:bg-brand-hover active:scale-[0.98]'
    : props.variant === 'outline'
      ? 'border border-line-2 text-white hover:border-brand hover:text-brand-hover bg-transparent'
      : 'text-muted hover:text-white',
])

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <component
    :is="as === 'router-link' ? 'RouterLink' : as === 'a' ? 'a' : 'button'"
    :to="as === 'router-link' ? to : undefined"
    :href="as === 'a' ? href : undefined"
    :target="as === 'a' && external ? '_blank' : undefined"
    :rel="as === 'a' && external ? 'noopener noreferrer' : undefined"
    :type="as === 'button' ? type : undefined"
    :disabled="as === 'button' ? disabled || loading : undefined"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    :class="classes"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot v-else />
  </component>
</template>