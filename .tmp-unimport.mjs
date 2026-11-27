import fs from 'fs'
import { createUnimport } from './node_modules/.pnpm/unimport@4.1.1/node_modules/unimport/dist/index.mjs'

const source = fs.readFileSync(
  'src/uni_modules/lingyun-ui/components/lingyun-page-nav/lingyun-page-nav.vue',
  'utf8',
)

const ctx = createUnimport({
  imports: [
    { name: 'ref', from: 'vue' },
    { name: 'inject', from: 'vue' },
    { name: 'computed', from: 'vue' },
    { name: 'getCurrentInstance', from: 'vue' },
    { name: 'h', from: 'vue' },
    { name: 'watch', from: 'vue' },
    { name: 'onMounted', from: 'vue' },
    { name: 'onBeforeUnmount', from: 'vue' },
    { name: 'nextTick', from: 'vue' },
  ],
})

const result = await ctx.injectImports(source, 'lingyun-page-nav.vue')
const code = result.code ?? result.s?.toString?.() ?? String(result)
console.log('HEAD', JSON.stringify(code.slice(0, 250)))
console.log('has ref import', code.includes("ref"))
const idx = code.indexOf('from \'vue\'')
console.log('vue import context', JSON.stringify(code.slice(Math.max(0, idx - 120), idx + 20)))
