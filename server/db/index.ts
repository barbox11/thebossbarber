import type { Store } from './store'
import { MemoryStore } from './memory'
import { PrismaStore } from './prisma'

let store: Store | null = null

export function getStore(): Store {
  if (store) return store
  const useMemory = process.env.STORE_MODE === 'memory' || process.env.NODE_ENV === 'test'
  const hasDb = Boolean(process.env.DATABASE_URL) && !useMemory
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