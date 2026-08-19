import createApp from './app'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const app = createApp()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await app(req, res)
}