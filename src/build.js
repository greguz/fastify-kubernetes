const kubernetes = require('@kubernetes/client-node')
const fs = require('fs')

const encoding = 'utf8'

let api = ''
for (const key of Object.keys(kubernetes)) {
  const obj = kubernetes[key]
  if (obj && obj.prototype && obj.prototype.setDefaultAuthentication) {
    api += `      ${key}: kubernetes.${key};\n`
  }
}

const content = fs.readFileSync('src/template.d.ts', { encoding })
fs.writeFileSync(
  'fastify-kubernetes.d.ts',
  content.replace(/\/\*\* AUTOMATION REQUIRED \*\*\//, api),
  { encoding }
)
