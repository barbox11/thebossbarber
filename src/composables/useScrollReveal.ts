let observer: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null

function observe(root: ParentNode): void {
  const o = observer
  if (!o) return
  root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    if (el.dataset.revealBound === '1') return
    el.dataset.revealBound = '1'
    o.observe(el)
  })
}

function isReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Observa todos los elementos `.reveal` (existentes y añadidos dinámicamente). */
export function setupScrollReveal(): void {
  if (typeof IntersectionObserver === 'undefined' || observer) return
  if (isReduced()) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.classList.add('is-visible')
          observer?.unobserve(el)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )

  observe(document)

  mutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) observe(node as ParentNode)
      })
    }
  })
  mutationObserver.observe(document.documentElement, { childList: true, subtree: true })
}
