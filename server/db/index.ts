import type { Store } from './store'
import { MemoryStore } from './memory'
import { PrismaStore } from './prisma'

let store: Store | null = null

export function getStore(): Store {
  if (store) return store
  const hasDb = Boolean(process.env.DATABASE_URL)
  store = hasDb ? new PrismaStore() : new MemoryStore()
  return store
}

export async function initStore(): Promise<Store> {
  const s = getStore()
  await s.init()
  return s
}

export function storeMode(): string {
  return getStore().mode
}