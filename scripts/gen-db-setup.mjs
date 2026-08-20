import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sql = readFileSync(resolve(root, 'prisma', 'migrations', '0001_init', 'migration.sql'), 'utf8')
const backup = JSON.parse(readFileSync(resolve(root, 'db-backup.json'), 'utf8'))

const ts = `// GENERADO por scripts/gen-db-setup.mjs -- no editar a mano
export const MIGRATION_SQL = ${JSON.stringify(sql)}
export const BACKUP = ${JSON.stringify(backup)}
`

writeFileSync(resolve(root, 'server', 'db-setup-data.ts'), ts)
console.log('Generado server/db-setup-data.ts (' + (sql.length + JSON.stringify(backup).length) + ' bytes)')