import { createApp } from './app'

const port = Number(process.env.PORT || 8787)

createApp().listen(port, () => {
  console.log(`[api] servidor local en http://localhost:${port} (modo: ${process.env.DATABASE_URL ? 'postgres' : 'memoria'})`)
})