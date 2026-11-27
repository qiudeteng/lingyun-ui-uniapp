import fs from 'fs'
import path from 'path'

const roots = ['src/uni_modules', 'src/pages', 'src/components', 'src/stores', 'src/utils', 'src/router', 'src/config']
const apis = [
  'computed', 'customRef', 'defineAsyncComponent', 'defineComponent', 'effectScope',
  'getCurrentInstance', 'h', 'inject', 'isProxy', 'isReactive', 'isReadonly', 'isRef',
  'markRaw', 'nextTick', 'onActivated', 'onBeforeMount', 'onBeforeUnmount', 'onBeforeUpdate',
  'onDeactivated', 'onMounted', 'onScopeDispose', 'onUnmounted', 'onUpdated', 'provide',
  'reactive', 'readonly', 'ref', 'shallowReactive', 'shallowRef', 'toRaw', 'toRef', 'toRefs',
  'triggerRef', 'unref', 'useAttrs', 'useSlots', 'watch', 'watchEffect',
]

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('uni-')) continue
      walk(full, out)
    } else if (/\.(vue|ts)$/.test(name) && !name.endsWith('.d.ts')) {
      out.push(full)
    }
  }
  return out
}

function strip(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p + ' '.repeat(m.length - p.length))
    .replace(/`(?:\\[\s\S]|[^\\`])*`/g, (m) => ' '.repeat(m.length))
    .replace(/'(?:\\.|[^'\\])*'/g, (m) => ' '.repeat(m.length))
    .replace(/"(?:\\.|[^"\\])*"/g, (m) => ' '.repeat(m.length))
}

function scriptOf(file, source) {
  if (!file.endsWith('.vue')) return { body: source, start: 0 }
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g
  let match
  let setup = null
  let first = null
  while ((match = re.exec(source))) {
    const start = match.index + match[0].length - match[2].length - '</script>'.length
    const item = { body: match[2], start }
    if (!first) first = item
    if (/\bsetup\b/.test(match[1])) setup = item
  }
  return setup || first
}

function rewriteImport(body, missing) {
  const re = /(^|\n)([ \t]*)import\s+\{([\s\S]*?)\}\s+from\s+(['"])vue\4/
  const match = body.match(re)
  const values = []
  const types = []
  if (match) {
    for (const part of match[3].split(',').map((part) => part.trim()).filter(Boolean)) {
      if (part.startsWith('type ')) types.push(part)
      else values.push(part)
    }
  }
  for (const name of missing) {
    if (!values.includes(name)) values.push(name)
  }
  values.sort((a, b) => a.localeCompare(b))
  const line = `import { ${[...values, ...types].join(', ')} } from 'vue'`
  if (!match) {
    if (body.startsWith('\r\n')) return `\r\n${line}\r\n${body.slice(2)}`
    if (body.startsWith('\n')) return `\n${line}\n${body.slice(1)}`
    return `${line}\n${body}`
  }
  return body.replace(re, `${match[1]}${match[2]}${line}`)
}

function vueImports(body) {
  const names = new Set()
  const re = /import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]vue['"]/g
  let m
  while ((m = re.exec(body))) {
    if (m[1]) continue
    for (const part of m[2].split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
      if (name && !part.trim().startsWith('type ')) names.add(name)
    }
  }
  const star = body.match(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]vue['"]/)
  return { names, star: star?.[1] || '' }
}

const files = roots.flatMap((dir) => (fs.existsSync(dir) ? walk(dir) : []))
const plan = []
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const script = scriptOf(file, source)
  if (!script) continue
  const bare = strip(script.body)
  const imported = vueImports(script.body)
  if (imported.star) continue
  const missing = apis.filter((api) => {
    if (imported.names.has(api)) return false
    const re = new RegExp('(^|[^\\w.$])' + api + '\\s*\\(')
    return re.test(bare)
  })
  if (missing.length) plan.push({ file, missing })
}

console.log('remaining', plan.length)
const apply = process.argv.includes('--apply')
let changed = 0
for (const item of plan) {
  if (!apply) continue
  const source = fs.readFileSync(item.file, 'utf8')
  const script = scriptOf(item.file, source)
  const nextBody = rewriteImport(script.body, item.missing)
  if (nextBody === script.body) continue
  const next = source.slice(0, script.start) + nextBody + source.slice(script.start + script.body.length)
  fs.writeFileSync(item.file, next)
  changed += 1
}
if (apply) console.log('changed', changed)
