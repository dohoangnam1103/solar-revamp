import { existsSync, readFileSync } from 'node:fs'

function parseEnvValue(raw: string) {
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export function loadEnvFile(path = '.env') {
  if (!existsSync(path)) return

  const envFile = readFileSync(path, 'utf8')
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex === -1) continue

    const key = trimmed.slice(0, equalIndex).trim()
    const value = parseEnvValue(trimmed.slice(equalIndex + 1))
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}
