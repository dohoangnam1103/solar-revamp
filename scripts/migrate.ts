import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import * as dotenv from 'fs'

// Load .env manually
const envFile = dotenv.readFileSync('.env', 'utf8')
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
  }
}

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

console.log('Running migrations...')
await migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations complete!')
process.exit(0)
