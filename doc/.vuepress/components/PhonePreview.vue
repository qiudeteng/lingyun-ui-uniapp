<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vuepress/client'

/** 文档页文件名 → H5 演示路由（不含 #） */
const DEMO: Record<string, string> = {
  'app-page': '/pages/index/index',
  'page-nav': '/pages/index/index',
  toolbars: '/pages/demo/toolbars',
  tabbars: '/pages/demo/tabbars',
  'search-bar': '/pages/demo/search-bar',
  sidebar: '/pages/demo/sidebars',
  button: '/pages/demo/buttons',
  icon: '/pages/demo/icons',
  badge: '/pages/demo/badges',
  'segmented-control': '/pages/demo/segmented-controls',
  tag: '/pages/demo/tags',
  chip: '/pages/demo/tags',
  text: '/pages/demo/texts',
  image: '/pages/demo/images',
  avatar: '/pages/demo/avatars',
  'page-control': '/pages/demo/page-controls',
  'text-field': '/pages/demo/text-fields',
  form: '/pages/demo/forms',
  'form-group': '/pages/demo/forms',
  'form-item': '/pages/demo/forms',
  switch: '/pages/demo/switches',
  stepper: '/pages/demo/switches',
  checkbox: '/pages/demo/checks',
  radio: '/pages/demo/checks',
  'radio-group': '/pages/demo/checks',
  'data-checkbox': '/pages/demo/checks',
  'data-radio': '/pages/demo/checks',
  slider: '/pages/demo/sliders',
  picker: '/pages/demo/pickers',
  'data-picker': '/pages/demo/pickers',
  list: '/pages/demo/lists',
  'list-item': '/pages/demo/lists',
  section: '/pages/demo/sections',
  'swipe-action': '/pages/demo/swipe-actions',
  'swipe-action-item': '/pages/demo/swipe-actions',
  empty: '/pages/demo/empty',
  skeleton: '/pages/demo/skeletons',
  refresh: '/pages/demo/refresh',
  'activity-indicator': '/pages/demo/activity-indicator',
  progress: '/pages/demo/progress',
  toast: '/pages/demo/toasts',
  hud: '/pages/demo/toasts',
  'feedback-host': '/pages/demo/toasts',
  alert: '/pages/demo/alerts',
  sheets: '/pages/demo/sheets',
  'action-sheet': '/pages/demo/action-sheets',
  'activity-view': '/pages/demo/activity-views',
  popover: '/pages/demo/popovers',
  menu: '/pages/demo/menus',
  'context-menu': '/pages/demo/menus',
  fab: '/pages/demo/fab',
}

/** 这些文档默认用宽屏视口，才能看到左侧导航 */
const WIDE_DEFAULT = new Set(['page-nav', 'app-page'])

const SIZES = {
  phone: { w: 390, h: 844, label: '390 × 844', name: '手机' },
  wide: { w: 717, h: 781, label: '717 × 781', name: '宽屏' },
} as const

type PreviewSize = keyof typeof SIZES

const route = useRoute()
const ready = ref(false)
const online = ref(false)
const viewportH = ref(800)
/** 用户点过尺寸按钮后，换文档不再自动改尺寸 */
const sizePicked = ref(false)

const slug = computed(() => {
  const path = route.path.replace(/\.html$/, '').replace(/\/$/, '')
  const name = path.split('/').pop() || ''
  return name
})

const demoPath = computed(() => DEMO[slug.value] || '')

function defaultSize(name: string): PreviewSize {
  return WIDE_DEFAULT.has(name) ? 'wide' : 'phone'
}

const sizeMode = ref<PreviewSize>(defaultSize(slug.value))
const wide = computed(() => sizeMode.value === 'wide')
const logical = computed(() => SIZES[sizeMode.value])

const scale = computed(() => {
  const maxH = Math.max(360, viewportH.value - 196)
  const maxW = wide.value ? 520 : 390
  return Math.min(1, maxH / logical.value.h, maxW / logical.value.w)
})

const frameStyle = computed(() => ({
  width: `${Math.round(logical.value.w * scale.value)}px`,
  height: `${Math.round(logical.value.h * scale.value)}px`,
}))

/** 缩放放在 iframe 外层，避免未缩放的 iframe 盒子挡住文档点击 */
const scaleStyle = computed(() => ({
  width: `${logical.value.w}px`,
  height: `${logical.value.h}px`,
  transform: `scale(${scale.value})`,
}))

/**
 * 演示应用部署地址。
 * - 本地开发（手册在 localhost）：走 `http://localhost:5173`（`pnpm dev`）
 * - 线上（手册部署到任意域名）：走 `https://demo.xinyicanyin.com`
 * - H5 路由用 hash 模式，地址形如 `https://demo.xinyicanyin.com/#/pages/demo/buttons`
 */
const DEMO_ORIGIN = 'https://demo.xinyicanyin.com'

const isLocalDev = computed(() => {
  if (typeof window === 'undefined') return true
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

const origin = computed(() => {
  if (typeof window === 'undefined') return DEMO_ORIGIN
  return isLocalDev.value ? `${window.location.protocol}//${window.location.hostname}:5173` : DEMO_ORIGIN
})

const src = computed(() => (demoPath.value ? `${origin.value}/#${demoPath.value}` : ''))

function syncBodyClass(on: boolean): void {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('has-phone-preview', on)
  const pad = on ? `${Math.round(logical.value.w * scale.value) + 72}px` : ''
  document.documentElement.style.setProperty('--ly-phone-pad', pad)
}

async function probe(): Promise<void> {
  try {
    await fetch(origin.value, { mode: 'no-cors' })
    online.value = true
  } catch {
    online.value = false
  }
}

function onResize(): void {
  viewportH.value = window.innerHeight
}

function setSize(mode: string): void {
  if (mode !== 'phone' && mode !== 'wide') return
  sizePicked.value = true
  sizeMode.value = mode
}

watch(slug, (name) => {
  if (!sizePicked.value) sizeMode.value = defaultSize(name)
})

watch(demoPath, (path) => {
  syncBodyClass(!!path)
  if (path) probe()
})

watch(scale, () => {
  if (demoPath.value) syncBodyClass(true)
})

onMounted(() => {
  ready.value = true
  onResize()
  window.addEventListener('resize', onResize)
  syncBodyClass(!!demoPath.value)
  if (demoPath.value) probe()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  syncBodyClass(false)
})
</script>

<template>
  <aside v-if="ready && demoPath" class="phone-preview" aria-label="组件预览">
    <div class="phone-preview__caption">
      <span>实时预览</span>
      <span class="phone-preview__size">{{ logical.label }}</span>
    </div>
    <div class="phone-preview__device">
      <div class="phone-preview__screen" :style="frameStyle">
        <div v-if="online" class="phone-preview__scale" :style="scaleStyle">
          <!-- 用文档页做 key：只改 hash 时浏览器不会重载 iframe，演示会停在上一页 -->
          <iframe :key="slug" class="phone-preview__frame" :src="src" title="组件演示" />
        </div>
        <div v-else class="phone-preview__offline">
          <p>连不上演示应用</p>
          <p v-if="isLocalDev">在项目目录运行 <code>pnpm dev</code>，然后刷新本页。</p>
          <p v-else>请确认 <code>{{ DEMO_ORIGIN }}</code> 已部署。</p>
        </div>
      </div>
    </div>
    <div class="phone-preview__sizes" role="group" aria-label="预览尺寸">
      <button
        v-for="(item, key) in SIZES"
        :key="key"
        type="button"
        class="phone-preview__size-btn"
        :class="{ 'is-active': sizeMode === key }"
        @click="setSize(key)"
      >
        {{ item.name }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.phone-preview {
  display: none;
}

@media (min-width: 1180px) {
  .phone-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    z-index: 20;
    top: 76px;
    right: 20px;
    gap: 8px;
    pointer-events: none;
  }

  .phone-preview__device,
  .phone-preview__frame,
  .phone-preview__offline,
  .phone-preview__sizes {
    pointer-events: auto;
  }

  .phone-preview__caption {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
    line-height: 16px;
    color: var(--vp-c-text-2, #666);
  }

  .phone-preview__size {
    font-variant-numeric: tabular-nums;
  }

  .phone-preview__device {
    padding: 10px;
    border-radius: 36px;
    background: #1c1c1e;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  }

  .phone-preview__screen {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background: #f2f2f7;
  }

  .phone-preview__scale {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
  }

  .phone-preview__frame {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }

  .phone-preview__offline {
    box-sizing: border-box;
    height: 100%;
    padding: 28px 20px;
    font-size: 13px;
    line-height: 1.5;
    color: #3a3a3c;
  }

  .phone-preview__offline code {
    font-size: 12px;
  }

  .phone-preview__sizes {
    display: flex;
    gap: 4px;
    padding: 3px;
    border-radius: 999px;
    background: var(--vp-c-bg-soft, #f6f6f7);
  }

  .phone-preview__size-btn {
    margin: 0;
    padding: 4px 14px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--vp-c-text-2, #666);
    font: inherit;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .phone-preview__size-btn.is-active {
    background: var(--vp-c-bg, #fff);
    color: var(--vp-c-brand-1, #3a7afe);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
}
</style>
