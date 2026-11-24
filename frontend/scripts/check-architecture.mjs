import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve('src')
const files = walk(root).filter(file => ['.ts', '.tsx'].includes(extname(file)))
const violations = []

for (const file of files) {
  const path = normalize(relative(root, file))
  const source = readFileSync(file, 'utf8')
  const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g)]
    .map(match => match[1] ?? match[2])

  if (path.includes('/domain/')) forbid(path, imports, ['react', 'react-router', '/application/', '/infrastructure/', '/presentation/', '/app/'])
  if (path.includes('/application/')) forbid(path, imports, ['react', 'react-router', '/infrastructure/', '/presentation/', '/app/'])
  if (path.includes('/infrastructure/')) forbid(path, imports, ['/presentation/', '/app/'])
  if (path.includes('/presentation/')) forbid(path, imports, ['/infrastructure/'])
  if (path.startsWith('shared/domain/')) forbid(path, imports, ['react', 'react-router', '/features/', '/app/', '/http/'])

  if (source.includes('fetch(') && path !== 'shared/http/FetchHttpClient.ts') {
    violations.push(`${path}: somente FetchHttpClient pode usar fetch diretamente`)
  }
  if (source.includes("'/api/") && !path.includes('/infrastructure/')) {
    violations.push(`${path}: endpoints HTTP devem permanecer em infrastructure`)
  }
}

if (violations.length) {
  console.error('Architecture boundary violations:')
  violations.forEach(violation => console.error(`- ${violation}`))
  process.exit(1)
}

console.log(`Architecture boundaries validated in ${files.length} source files.`)

function forbid(path, imports, forbidden) {
  for (const dependency of imports) {
    const normalized = normalize(dependency)
    const match = forbidden.find(rule => normalized === rule || normalized.startsWith(`${rule}/`) || normalized.includes(rule))
    if (match) violations.push(`${path}: import proibido '${dependency}' pela regra '${match}'`)
  }
}

function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

function normalize(path) { return path.replaceAll('\\', '/') }
