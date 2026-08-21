import { createApp } from './app'
import { storeMode } from './db'

const port = Number(process.env.PORT || 8787)

createApp().listen(port, () => {
  console.log(`[api] servidor local en http://localhost:${port} (modo: ${storeMode()})`)
})