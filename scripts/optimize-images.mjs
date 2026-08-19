// Optimiza las imágenes de ./imagenes y las emite a ./public/images
// en formato AVIF + WebP con múltiples tamaños responsivos.
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '..', 'imagenes')
const OUT = join(__dirname, '..', 'public', 'images')

mkdirSync(OUT, { recursive: true })

const jobs = [
  {
    input: 'img4.jpeg',
    name: 'hero-mobile',
    widths: [480, 720, 1080],
    // portrait como la original, ideal para móvil
    fit: 'inside',
  },
  {
    input: 'img1.jpeg',
    name: 'hero-desktop',
    widths: [1080, 1600],
    fit: 'cover',
    aspect: 16 / 10,
  },
  {
    input: 'img1.jpeg',
    name: 'barber',
    widths: [480, 900],
    fit: 'inside',
  },
  {
    input: 'img2.jpeg',
    name: 'experience',
    widths: [640, 900],
    fit: 'inside',
  },
  {
    input: 'img2.jpeg',
    name: 'gallery-1',
    widths: [720, 1080],
    fit: 'inside',
  },
  {
    input: 'img3.jpeg',
    name: 'gallery-2',
    widths: [720, 1080],
    fit: 'inside',
  },
  {
    input: 'img3.jpeg',
    name: 'logo',
    widths: [96, 160, 240],
    fit: 'cover',
    aspect: 1,
  },
  {
    input: 'img5.jpeg',
    name: 'gallery-3',
    widths: [720, 1080],
    fit: 'inside',
  },
  {
    input: 'img1.jpeg',
    name: 'gallery-4',
    widths: [720, 1080],
    fit: 'inside',
  },
  {
    input: 'img4.jpeg',
    name: 'gallery-5',
    widths: [720, 1080],
    fit: 'inside',
  },
]

async function run() {
  let count = 0
  for (const job of jobs) {
    const src = join(SRC, job.input)
    for (const width of job.widths) {
      for (const fmt of ['avif', 'webp']) {
        let pipeline = sharp(src).rotate().resize({
          width,
          withoutEnlargement: true,
          fit: job.fit,
        })
        if (job.fit === 'cover' && job.aspect) {
          pipeline = sharp(src).rotate().resize({ width, height: Math.round(width / job.aspect), fit: 'cover' })
        }
        const out = join(OUT, `${job.name}-${width}.${fmt}`)
        await pipeline[fmt]({ quality: fmt === 'avif' ? 62 : 78 }).toFile(out)
        count++
      }
    }
  }
  console.log(`Optimizadas ${count} variantes en ${OUT}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
