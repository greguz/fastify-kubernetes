import * as kubernetes from '@kubernetes/client-node'
import { readFileSync, writeFileSync } from 'node:fs'

const encoding = 'utf8'

let api = ''
for (const key of Object.keys(kubernetes)) {
  if (/.Api$/.test(key)) {
    api += `    ${key}: kubernetes.${key}\n`
  }
}

const content = readFileSync('src/template.d.ts', { encoding })

writeFileSync(
  'fastify-kubernetes.d.ts',
  content.replace(/\/\*\* AUTOMATION REQUIRED \*\*\//, api),
  { encoding }
)
