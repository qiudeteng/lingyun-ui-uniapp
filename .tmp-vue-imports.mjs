import fs from 'fs'
import path from 'path'

const root = 'src/uni_modules'
const apis = [
  'ref', 'computed', 'watch', 'watchEffect', 'reactive', 'readonly',
  'shallowRef', 'shallowReactive', 'toRef', 'toRefs', 'toValue', 'unref',
  'isRef', 'customRef', 'triggerRef', 'onMounted', 'onUnmounted',
  'onBeforeMount', 'onBeforeUnmount', 'onBeforeUpdate', 'onUpdated',
  'onActivated', 'onDeactivated', 'onErrorCaptured', 'nextTick',
  'getCurrentInstance', 'inject', 'provide', 'h', 'useSlots', 'useAttrs',
  'effectScope', 'onScopeDispose', 'markRaw', 'toRaw', 'isProxy',
  'isReactive', 'isReadonly', 'watchPostEffect', 'watchSyncEffect',
  'defineComponent', 'defineAsyncComponent', 'mergeProps', 'cloneVNode',
  'withDirectives', 'withModifiers', 'resolveComponent', 'hasInjectionContext',
]

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (name === 'node_modules') continue
      walk(p, out)
    } else if (/\.(vue|ts)$/.test(name)) {
      out.push(p)
    }
  }
  return out
}

const hits = []
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8')
  let script = text
  if (file.endsWith('.vue')) {
    const match = text.match(/<script\s[^>]*lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/)
    if (!match) continue
    script = match[1]
  }
  const imported = new Set()
  for (const im of script.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]vue['"]/g)) {
    for (const part of im[1].split(',')) {
      const name = part.replace(/\btype\b/g, '').trim().split(/\s+as\s+/)[0].trim()
      if (name) imported.add(name)
    }
  }
  const missing = []
  for (const api of apis) {
    if (imported.has(api)) continue
    const re = new RegExp(`\\b${api}\\b`)
    if (re.test(script)) missing.push(api)
  }
  if (missing.length) hits.push({ file, missing, partial: imported.size > 0 })
}

console.log(`files ${hits.length}`)
for (const hit of hits) {
  console.log(`${hit.partial ? 'PARTIAL' : 'NONE'}\t${hit.missing.join(',')}\t${hit.file}`)
}
