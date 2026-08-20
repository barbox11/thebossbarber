// @ts-nocheck
import createApp from './_server.mjs'

const app = createApp()

export default async function handler(req, res) {
  await app(req, res)
}