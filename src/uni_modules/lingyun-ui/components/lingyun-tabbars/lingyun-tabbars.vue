<template>
  <view class="lingyun-tabbars" :class="rootClass" :style="wrapStyle">
    <view class="lingyun-tabbars__bar" :id="barId" :class="barClass">
      <view
        class="lingyun-tabbars__indicator"
        :class="indicatorClass"
        :style="indicatorStyle"
      />
      <view
        v-for="item in mainItems"
        :key="item.key"
        :id="itemId(item)"
        class="lingyun-tabbars__item"
        :class="itemClass(item)"
        hover-class="lingyun-tabbars__item--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onSelect(item)"
      >
        <view
          class="lingyun-tabbars__icon-wrap"
          :class="{ 'lingyun-tabbars__icon-wrap--pop': isPopping(item) }"
        >
          <slot :name="`icon-${item.key}`" :item="item" :active="isActive(item)">
            <image
              v-if="item.iconSrc"
              class="lingyun-tabbars__icon-image"
              :src="isActive(item) && item.activeIconSrc ? item.activeIconSrc : item.iconSrc"
              mode="aspectFit"
              :style="iconImageStyle"
            />
            <lingyun-icon
              v-else-if="iconMode === 'icon' && item.icon"
              :type="item.icon"
              :size="iconSize"
              :color="isActive(item) ? 'var(--lingyun-system-blue, #0088ff)' : 'var(--lingyun-label-glass, #1a1a1a)'"
            />
            <text v-else class="lingyun-tabbars__icon">{{ item.icon || '●' }}</text>
          </slot>
          <view v-if="hasBadge(item)" class="lingyun-tabbars__badge">
            <lingyun-badge
              :text="badgeText(item)"
              :color="badgeColor(item)"
              :dot="badgeDot(item)"
              :max="badgeMax(item)"
            />
          </view>
        </view>
        <text v-if="item.text" class="lingyun-tabbars__label">{{ item.text }}</text>
      </view>
    </view>

    <view
      v-if="searchItem"
      class="lingyun-tabbars__search"
      :class="{ 'lingyun-tabbars__search--active': isActive(searchItem) }"
      hover-class="lingyun-tabbars__search--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onSelect(searchItem)"
    >
      <slot name="search-icon" :item="searchItem" :active="isActive(searchItem)">
        <image
          v-if="searchItem.iconSrc"
          class="lingyun-tabbars__search-image"
          :src="isActive(searchItem) && searchItem.activeIconSrc ? searchItem.activeIconSrc : searchItem.iconSrc"
          mode="aspectFit"
          :style="iconImageStyle"
        />
        <text v-else-if="searchItem.icon" class="lingyun-tabbars__search-icon">{{ searchItem.icon }}</text>
        <lingyun-icon
          v-else
          class="lingyun-tabbars__search-icon"
          type="search"
          :size="iconSize"
          :color="isActive(searchItem) ? 'var(--lingyun-system-blue, #0088ff)' : 'var(--lingyun-label-glass, #1a1a1a)'"
        />
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inject, type PropType, type Ref } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

type TabBadgeObject = {
  text?: string | number | boolean | null
  color?: string
  type?: string
  dot?: boolean
  max?: number | string | null
}

type TabBadge = number | string | boolean | TabBadgeObject

type TabItem = {
  key?: string | number
  text?: string
  icon?: string
  /** 图片图标地址；设置后优先于 icon / iconMode */
  iconSrc?: string
  /** 选中态图片图标地址；不传时继续用 iconSrc */
  activeIconSrc?: string
  badge?: TabBadge | null
  role?: string
}

type BadgeView = {
  dot: boolean
  text: string | number | boolean
  color: string
  max: number
}

type SpringState = { pos: number; vel: number }

type LensRect = {
  left: number
  top: number
  width: number
  height: number
}

/**
 * lingyun-tabbars
 * @description 对齐 Apple iOS 27 UI Kit Tab Bars（Sketch）+ HIG + Liquid Glass
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars
 * @see https://developer.apple.com/design/human-interface-guidelines/tab-bars
 * @see design/TABBARS.md
 *
 * @property {Array} items [{ key, text?, icon?, badge?, role?: 'search' }]
 *   badge: number | string | true | { text?, color?, dot?, max? }
 *   角标渲染为 lingyun-badge（Sketch App Icons / Badge）
 * @property {String|Number} modelValue / value 当前选中 key
 * @property {String} variant = [default|prominent] Sketch：Default / Prominent Tab
 * @property {String} iconMode = [text|icon] text 直接显示字形；icon 用 lingyun-icon 渲染
 * @property {Boolean} fallbackFirst 无匹配项时高亮第一项（默认 true）
 * @property {String|Number} fromKey 进场时从哪个 key 滑入（页面壳跨页切换用）
 * @property {Boolean} safeArea 预留底部 Home Indicator（默认 true）
 * @property {Boolean} fixed 固定底部悬浮（默认 true）
 * @event {Function} change / update:modelValue
 */
defineOptions({
  name: 'LingyunTabbars',
})

const props = defineProps({
  items: {
    type: Array as PropType<Array<TabItem | null | undefined>>,
    default: () => [] as Array<TabItem | null | undefined>,
  },
  modelValue: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  value: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  variant: {
    type: String,
    default: 'default',
  },
  iconMode: {
    type: String,
    default: 'text',
  },
  /** default = iPhone 99 高；duo = iPhone Duo 内屏 95 高、77×54 Tab */
  size: {
    type: String,
    default: 'default',
  },
  /** 没有匹配项时是否把第一项当作选中；页面壳自动导航传 false */
  fallbackFirst: {
    type: Boolean,
    default: true,
  },
  /** 页面壳跨页切换时，指示器从这一项滑到当前项 */
  fromKey: {
    type: [String, Number],
    default: '',
  },
  safeArea: {
    type: Boolean,
    default: true,
  },
  fixed: {
    type: Boolean,
    default: true,
  },
  /** 切换时触发轻震动，接近系统 Tab Bar 反馈 */
  haptic: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['change', 'update:modelValue', 'update:value'])

const instance = getCurrentInstance()

const pageNavInset = inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0))
const tabbarRemeasure = inject<Ref<number>>('lingyun-tabbar-remeasure', ref(0))

const instanceId = ref(`lytb-${Math.random().toString(36).slice(2, 8)}`)
const indicator = ref({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  visible: false,
  ready: false,
})
const poppingKey = ref('')
const _popTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _onResize = ref<(() => void) | null>(null)
const _lensRaf = ref<number | null>(null)
const _settleTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _lensLast = ref(0)
const _center = ref<SpringState | null>(null)
const _lensWidth = ref<SpringState | null>(null)
const _targetCenter = ref(0)
const _targetWidth = ref(0)
const _restWidth = ref(0)
const _targetTop = ref(0)
const _targetH = ref(0)

const current = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) return props.modelValue
  return props.value
})

const searchItem = computed(() => {
  return (props.items || []).find((i) => i && i.role === 'search') || null
})

const mainItems = computed(() => {
  const list = (props.items || []).filter((i): i is TabItem => !!(i && i.role !== 'search'))
  /* 带搜索圆钮时最多 4+1；无搜索时 Sketch 最多 5 */
  return searchItem.value ? list.slice(0, 4) : list.slice(0, 5)
})

const resolvedVariant = computed(() => {
  return props.variant === 'prominent' ? 'prominent' : 'default'
})

const iconSize = computed((): number => {
  return props.size === 'duo' ? 22 : 25
})

const iconImageStyle = computed((): { width: string; height: string } => {
  return {
    width: `${iconSize.value}px`,
    height: `${iconSize.value}px`,
  }
})

const rootClass = computed(() => {
  return [
    `lingyun-tabbars--${resolvedVariant.value}`,
    props.fixed ? 'lingyun-tabbars--fixed' : '',
    props.safeArea ? 'lingyun-tabbars--safe' : '',
    props.size === 'duo' ? 'lingyun-tabbars--duo' : '',
    searchItem.value ? 'lingyun-tabbars--with-search' : '',
    /* 无搜索 4/5 项，或有搜索的 3+1 / 4+1：iPhone 左侧胶囊占满剩余宽度 */
    (!searchItem.value && mainItems.value.length >= 4) ||
    (searchItem.value && mainItems.value.length >= 3)
      ? 'lingyun-tabbars--fill'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const barClass = computed(() => {
  return resolvedVariant.value === 'prominent' ? 'lingyun-tabbars__bar--prominent' : ''
})

const wrapStyle = computed(() => {
  const inset = Math.max(0, Number(pageNavInset.value) || 0)
  /* inset=0 交给 CSS：窄屏 --fill 需要 left:0，内联 left 会覆盖它 */
  return props.fixed && inset > 0
    ? { left: `calc(${inset}px + (100% - ${inset}px) / 2)` }
    : {}
})

const barId = computed(() => {
  return `${instanceId.value}-bar`
})

const indicatorClass = computed(() => {
  return [
    indicator.value.ready ? 'lingyun-tabbars__indicator--ready' : '',
    indicator.value.visible ? '' : 'lingyun-tabbars__indicator--hidden',
  ]
    .filter(Boolean)
    .join(' ')
})

const indicatorStyle = computed(() => {
  const { left, top, width, height } = indicator.value
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

function prefersReducedMotion() {
  /* #ifdef H5 */
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  /* #endif */
  return false
}

function itemId(item: TabItem | null | undefined) {
  return `${instanceId.value}-item-${item && item.key}`
}

function isPopping(item: TabItem | null | undefined): boolean {
  return !!item && !!poppingKey.value && String(item.key) === poppingKey.value
}

function triggerPop(key: unknown): void {
  if (key === undefined || key === null || key === '' || prefersReducedMotion()) return
  poppingKey.value = String(key)
  if (_popTimer.value) clearTimeout(_popTimer.value)
  _popTimer.value = setTimeout(() => {
    poppingKey.value = ''
    _popTimer.value = null
  }, 430)
}

function fireHaptic(): void {
  if (!props.haptic) return
  try {
    const api = uni as typeof uni & {
      vibrateShort?: (options?: { type?: 'heavy' | 'medium' | 'light' }) => void
    }
    api.vibrateShort?.({ type: 'light' })
  } catch {
    /* 端不支持 */
  }
}

function scheduleFrame(fn: (time: number) => void): number {
  /* #ifdef H5 */
  return window.requestAnimationFrame(fn)
  /* #endif */
  /* #ifndef H5 */
  return setTimeout(() => fn(Date.now()), 16)
  /* #endif */
}

function cancelFrame(id?: number | null) {
  if (typeof id !== 'number') return
  const frameId = id
  /* #ifdef H5 */
  window.cancelAnimationFrame(frameId)
  /* #endif */
  /* #ifndef H5 */
  clearTimeout(frameId)
  /* #endif */
}

function stopLens() {
  cancelFrame(_lensRaf.value)
  _lensRaf.value = null
}

function clearSettleTimer() {
  if (_settleTimer.value) {
    clearTimeout(_settleTimer.value)
    _settleTimer.value = null
  }
}

function stepSpring(state: SpringState, target: number, stiffness: number, damping: number, dt: number) {
  const force = (target - state.pos) * stiffness
  const damp = -state.vel * damping
  state.vel += (force + damp) * dt
  state.pos += state.vel * dt
}

function lensSettled() {
  const near = (state: SpringState, target: number) =>
    Math.abs(state.pos - target) < 0.35 && Math.abs(state.vel) < 12
  return (
    near(_center.value!, _targetCenter.value) &&
    near(_lensWidth.value!, _restWidth.value)
  )
}

function paintLens() {
  const center = _center.value!
  const width = Math.max(_lensWidth.value!.pos, 8)
  indicator.value.left = center.pos - width / 2
  indicator.value.width = width
  indicator.value.top = _targetTop.value
  indicator.value.height = _targetH.value
}

/** 动画兜底：rAF 暂停、查询竞态或弹簧未收敛时，强制落到最新目标 */
function armSettleTimer() {
  clearSettleTimer()
  _settleTimer.value = setTimeout(() => {
    _settleTimer.value = null
    if (!_center.value || !_lensWidth.value) return
    stopLens()
    _center.value = { pos: _targetCenter.value, vel: 0 }
    _lensWidth.value = { pos: _restWidth.value, vel: 0 }
    _targetWidth.value = _restWidth.value
    paintLens()
  }, 480)
}

function tickLens(now: number) {
  const center = _center.value!
  const width = _lensWidth.value!
  const last = _lensLast.value || now
  const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000))
  _lensLast.value = now
  /* 位置快速收敛；宽度慢半拍，形成液态拉伸但不压扁高度 */
  stepSpring(center, _targetCenter.value, 520, 30, dt)
  stepSpring(width, _targetWidth.value, 300, 26, dt)
  /* 位移基本到位后，宽度再收回到静止尺寸 */
  if (
    Math.abs(center.pos - _targetCenter.value) < 1.2 &&
    _targetWidth.value !== _restWidth.value
  ) {
    _targetWidth.value = _restWidth.value
  }
  paintLens()
  if (lensSettled()) {
    _center.value = { pos: _targetCenter.value, vel: 0 }
    _lensWidth.value = { pos: _restWidth.value, vel: 0 }
    _targetWidth.value = _restWidth.value
    paintLens()
    _lensRaf.value = null
    clearSettleTimer()
    return
  }
  _lensRaf.value = scheduleFrame((t) => tickLens(t))
}

function snapLens(rect: LensRect) {
  stopLens()
  clearSettleTimer()
  _targetCenter.value = rect.left + rect.width / 2
  _targetWidth.value = rect.width
  _restWidth.value = rect.width
  _targetTop.value = rect.top
  _targetH.value = rect.height
  _center.value = { pos: _targetCenter.value, vel: 0 }
  _lensWidth.value = { pos: rect.width, vel: 0 }
  paintLens()
}

function flowLens(rect: LensRect) {
  if (!_center.value || !_lensWidth.value) {
    snapLens(rect)
    return
  }
  _targetCenter.value = rect.left + rect.width / 2
  _restWidth.value = rect.width
  /* 行进中先轻微拉宽 6%，中心到位后再收回来 */
  _targetWidth.value = rect.width * 1.06
  _targetTop.value = rect.top
  _targetH.value = rect.height
  indicator.value.visible = true
  armSettleTimer()
  if (!_lensRaf.value) {
    _lensLast.value = 0
    _lensRaf.value = scheduleFrame((t) => tickLens(t))
  }
}

/** 选中透镜比 Tab 项外扩 4×2，边缘贴合胶囊内边距 */
function selectionRect(item: { left: number; top: number; width: number; height: number }, bar: { left: number; top: number; width: number; height: number }): LensRect {
  const padX = 4
  const padY = 2
  const left = Math.max(0, item.left - bar.left - padX)
  const right = Math.min(bar.width, item.left - bar.left + item.width + padX)
  const top = Math.max(0, item.top - bar.top - padY)
  const bottom = Math.min(bar.height, item.top - bar.top + item.height + padY)
  return {
    left,
    top,
    width: Math.max(right - left, 8),
    height: Math.max(bottom - top, 8),
  }
}

function isActive(item: TabItem | null | undefined) {
  if (!item) return false
  if (current.value === undefined || current.value === null || current.value === '') {
    return props.fallbackFirst && mainItems.value[0] && mainItems.value[0].key === item.key
  }
  return String(current.value) === String(item.key)
}

function itemClass(item: TabItem) {
  return [
    isActive(item) ? 'lingyun-tabbars__item--active' : '',
    item.text ? '' : 'lingyun-tabbars__item--icon-only',
  ]
    .filter(Boolean)
    .join(' ')
}

function badgeConfig(item: TabItem | null | undefined): BadgeView | null {
  const b = item && item.badge
  if (b == null || b === false || b === '') return null
  if (b === true || b === 'dot') return { dot: true, text: '', color: 'red', max: 99 }
  if (typeof b === 'object') {
    return {
      text: b.text != null ? b.text : '',
      color: b.color || b.type || 'red',
      dot: !!(b.dot || b.text === 'dot'),
      max: b.max != null ? Number(b.max) : 99,
    }
  }
  return { text: b, color: 'red', dot: false, max: 99 }
}

function hasBadge(item: TabItem | null | undefined) {
  const c = badgeConfig(item)
  if (!c) return false
  return c.dot || c.text === 0 || !!c.text
}

function badgeText(item: TabItem | null | undefined) {
  const c = badgeConfig(item)
  return c ? c.text : ''
}

function badgeColor(item: TabItem | null | undefined) {
  const c = badgeConfig(item)
  return c ? c.color : 'red'
}

function badgeDot(item: TabItem | null | undefined) {
  const c = badgeConfig(item)
  return !!(c && c.dot)
}

function badgeMax(item: TabItem | null | undefined) {
  const c = badgeConfig(item)
  return c && c.max != null ? c.max : 99
}

function onSelect(item: TabItem | null | undefined) {
  if (!item) return
  if (String(item.key) !== String(current.value)) fireHaptic()
  emit('update:modelValue', item.key)
  emit('update:value', item.key)
  emit('change', item)
}

function syncIndicator(options?: { liquid?: boolean }, retry = 0) {
  const liquid = !!(options && options.liquid)
  const active = (mainItems.value || []).find((item) => isActive(item))
  if (!active) {
    stopLens()
    clearSettleTimer()
    indicator.value.visible = false
    return
  }
  const expectedKey = String(active.key)
  const stillCurrent = () => {
    if (current.value === undefined || current.value === null || current.value === '') {
      return true
    }
    return String(current.value) === expectedKey
  }
  nextTick(() => {
    uni
      .createSelectorQuery()
      .in(instance?.proxy as any)
      .select(`#${barId.value}`)
      .boundingClientRect()
      .select(`#${itemId(active)}`)
      .boundingClientRect()
      .exec((res) => {
        const bar = res && res[0]
        const item = res && res[1]
        if (!bar || !item || !item.width) {
          /* 小程序嵌在页面壳里时，前几帧经常量到空宽度；多等一会儿再放弃 */
          if (retry < 8 && stillCurrent()) {
            setTimeout(() => syncIndicator(options, retry + 1), 60 * (retry + 1))
          }
          return
        }
        if (!stillCurrent()) return
        const toRect = selectionRect(item, bar)
        const canFlow =
          liquid &&
          indicator.value.ready &&
          indicator.value.visible &&
          indicator.value.width > 0 &&
          !prefersReducedMotion()
        indicator.value.visible = true
        if (canFlow) {
          flowLens(toRect)
          return
        }
        snapLens(toRect)
        /* 不要再套 nextTick：小程序上这次回调里的 nextTick 可能一直不回来，胶囊就停在透明 */
        indicator.value.ready = true
      })
  })
}

/** 挂载时从上一页的 key 滑到当前 key；没有 fromKey 时直接落位 */
function syncInitialIndicator(retry = 0) {
  const active = (mainItems.value || []).find((item) => isActive(item))
  const fromKey = props.fromKey
  const fromItem = fromKey
    ? (mainItems.value || []).find((item) => String(item.key) === String(fromKey))
    : null
  if (!active) {
    /* 小程序新页面的路由可能晚一拍，等 active key 就绪再滑入 */
    if (fromKey && retry < 6) {
      setTimeout(() => syncInitialIndicator(retry + 1), 30)
      return
    }
    syncIndicator({ liquid: false })
    return
  }
  if (
    !fromItem ||
    String(fromItem.key) === String(active.key) ||
    prefersReducedMotion()
  ) {
    syncIndicator({ liquid: false })
    return
  }
  nextTick(() => {
    uni
      .createSelectorQuery()
      .in(instance?.proxy as any)
      .select(`#${barId.value}`)
      .boundingClientRect()
      .select(`#${itemId(fromItem)}`)
      .boundingClientRect()
      .select(`#${itemId(active)}`)
      .boundingClientRect()
      .exec((res) => {
        const bar = res && res[0]
        const fromRect = res && res[1]
        const toRaw = res && res[2]
        if (!bar || !fromRect || !fromRect.width || !toRaw || !toRaw.width) {
          syncIndicator({ liquid: false })
          return
        }
        const toRect = selectionRect(toRaw, bar)
        indicator.value.visible = true
        snapLens(selectionRect(fromRect, bar))
        indicator.value.ready = true
        nextTick(() => {
          flowLens(toRect)
        })
      })
  })
}

watch(current, (next) => {
  triggerPop(next)
  syncIndicator({ liquid: true })
})

watch(mainItems, () => {
  syncIndicator({ liquid: false })
})

watch(tabbarRemeasure, () => {
  syncIndicator({ liquid: false })
})

onMounted(() => {
  nextTick(() => {
    setTimeout(() => syncInitialIndicator(), 20)
  })
  /* #ifdef H5 */
  const onResize = () => syncIndicator({ liquid: false })
  _onResize.value = onResize
  window.addEventListener('resize', onResize)
  /* #endif */
})

onBeforeUnmount(() => {
  stopLens()
  if (_popTimer.value) {
    clearTimeout(_popTimer.value)
    _popTimer.value = null
  }
  if (_settleTimer.value) {
    clearTimeout(_settleTimer.value)
    _settleTimer.value = null
  }
  /* #ifdef H5 */
  const onResize = _onResize.value
  if (onResize) window.removeEventListener('resize', onResize)
  /* #endif */
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Default：402×99，内边距上 16 / 左右下 21，胶囊 360×62 */
/* 选中胶囊 Fills/2 Secondary；未选中文字 Labels - Liquid Glass 1 Primary */
$ly-tabbar-pad-x: 21px;
$ly-tabbar-pad-top: 16px;
$ly-tabbar-pad-bottom: 21px;
$ly-tabbar-gap: 8px;
$ly-tabbar-content-h: 62px;
$ly-tab-item-h: 54px;
$ly-search-size: $ly-tabbar-content-h;
$ly-tab-icon: 25px;
$ly-search-icon: $ly-tab-icon;
$ly-bar-pad: 4px;
/* 单项不拉宽：5 项无搜索约 346；n+1 胶囊随数量变宽，搜索圆钮固定 62 */
$ly-tab-item-w: 68px;

.lingyun-tabbars {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: $ly-tabbar-pad-top $ly-tabbar-pad-x 0;
  gap: $ly-tabbar-gap;
  pointer-events: none;

  &--fixed {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: 0;
    z-index: 900;
    width: fit-content;
    margin-left: 0;
    margin-right: 0;
    transform: translateX(-50%);
  }

  /* iPhone：无搜索 4/5 项占满整行；有搜索的 3+1 / 4+1 左侧胶囊占满圆钮左侧 */
  &--fill {
    @media (max-width: 689px) {
      width: 100%;
    }
  }

  &--fixed#{&}--fill {
    @media (max-width: 689px) {
      left: 0;
      right: 0;
      width: 100%;
      transform: none;
    }
  }
  &--with-search {
    @media (max-width: 689px) {
      width: 100%;
      justify-content: space-between;
    }
  }

  &--fixed#{&}--with-search {
    @media (max-width: 689px) {
      left: 0;
      right: 0;
      width: 100%;
      transform: none;
    }
  }

  &--safe {
    padding-bottom: $ly-tabbar-pad-bottom;
  }

  &__bar {
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    flex: 0 0 auto;
    width: auto;
    height: $ly-tabbar-content-h;
    min-height: $ly-tabbar-content-h;
    padding: $ly-bar-pad;
    box-sizing: border-box;
    isolation: isolate;
    @include lingyun-glass-control;
  }

  &__indicator {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: $lingyun-glass-radius-pill;
    background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
    opacity: 0;
    will-change: left, width;
    transition: opacity 0.2s ease;
    box-sizing: border-box;
  }

  &__indicator--ready {
    opacity: 1;
  }

  &__indicator--hidden {
    opacity: 0;
  }

  &__item {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: $ly-tab-item-w;
    min-width: $ly-tab-item-w;
    box-sizing: border-box;
    height: auto;
    min-height: 0;
    padding: 0;
    border-radius: $lingyun-glass-radius-pill;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    transition: color 0.32s ease, transform 0.16s ease;
  }

  &__item--active &__icon-wrap,
  &__item--active &__icon {
    color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__item--hover {
    transform: scale(0.96);
  }

  &--fill &__bar {
    @media (max-width: 689px) {
      flex: 1;
      width: auto;
    }
  }

  &--fill &__item {
    @media (max-width: 689px) {
      flex: 1 1 0;
      width: auto;
      min-width: 0;
    }
  }

  /* iPhone Duo 内屏竖屏：95 高、玻璃条 62、Tab 54×77、搜索 62 */
  &--duo {
    padding-top: 12px;
    padding-left: 25px;
    padding-right: 25px;
  }

  &--duo &__bar {
    flex: 0 0 auto;
    width: auto;
    height: 62px;
    min-height: 62px;
    gap: 0;
  }

  &--duo &__item {
    flex: 0 0 77px;
    width: 77px;
    min-width: 77px;
  }

  &--duo &__item + &__item {
    margin-left: -8px;
  }

  &--duo#{&}--fill &__bar {
    @media (max-width: 689px) {
      flex: 0 0 auto;
      width: auto;
    }
  }

  &--duo#{&}--with-search {
    @media (max-width: 689px) {
      justify-content: center;
      gap: 16px;
    }
  }

  &__icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: $ly-tab-icon;
    height: $ly-tab-icon;
  }

  &__icon-wrap--pop {
    animation: ly-tab-icon-pop 0.42s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  @keyframes ly-tab-icon-pop {
    0% {
      transform: scale(1);
    }
    34% {
      transform: scale(1.16);
    }
    66% {
      transform: scale(0.96);
    }
    100% {
      transform: scale(1);
    }
  }

  &__icon {
    font-size: $ly-tab-icon;
    line-height: 1;
    color: inherit;
  }

  &__icon-image {
    display: block;
    flex-shrink: 0;
    object-fit: contain;
  }

  &__label {
    margin-top: 2px;
    max-width: 100%;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    letter-spacing: -0.1px;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__badge {
    position: absolute;
    top: -8px;
    right: -14px;
    z-index: 2;
    pointer-events: none;
  }

  &__search {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: $ly-search-size;
    height: $ly-search-size;
    flex-shrink: 0;
    @include lingyun-glass-control;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    transition: color 0.32s ease, transform 0.16s ease;
  }

  &__search--active {
    color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__search--hover {
    transform: scale(0.96);
  }

  &__search-icon {
    line-height: 1;
  }

  &__search-image {
    display: block;
    flex-shrink: 0;
  }
}


@media (prefers-reduced-motion: reduce) {
  .lingyun-tabbars__indicator--ready,
  .lingyun-tabbars__item,
  .lingyun-tabbars__search {
    transition: none;
  }

  .lingyun-tabbars__icon-wrap--pop {
    animation: none;
  }
}
</style>
