<template>
  <view class="lingyun-data-picker" :class="rootClass">
    <view
      class="lingyun-data-picker__row"
      :class="rowClass"
      @click="open"
    >
      <text v-if="showTriggerTitle" class="lingyun-data-picker__title">{{ title }}</text>
      <view class="lingyun-data-picker__value-wrap">
        <text
          class="lingyun-data-picker__value"
          :class="{ 'lingyun-data-picker__value--placeholder': !displayText }"
        >
          {{ displayText || placeholder }}
        </text>
        <lingyun-icon
          class="lingyun-data-picker__chevron"
          type="right"
          :size="14"
          color="var(--lingyun-system-gray3, #c7c7cc)"
        />
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="sheetMounted"
        class="lingyun-data-picker-sheet"
        :class="sheetClass"
        :style="sheetRootStyle"
      >
        <view
          class="lingyun-data-picker-sheet__overlay"
          @click="onCancel"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-data-picker-sheet__panel"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <view
            class="lingyun-data-picker-sheet__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view class="lingyun-data-picker-sheet__grabber" aria-hidden="true" />
            <view class="lingyun-data-picker-sheet__toolbar">
              <text
                class="lingyun-data-picker-sheet__btn lingyun-data-picker-sheet__btn--cancel"
                @click="onCancel"
              >
                {{ cancelText }}
              </text>
              <text v-if="title" class="lingyun-data-picker-sheet__heading">{{ title }}</text>
              <view v-else class="lingyun-data-picker-sheet__heading-spacer" />
              <text
                class="lingyun-data-picker-sheet__btn lingyun-data-picker-sheet__btn--done"
                @click="onConfirm"
              >
                {{ confirmText }}
              </text>
            </view>
          </view>
          <view class="lingyun-data-picker-sheet__wheels-wrap">
            <view
              class="lingyun-data-picker-sheet__indicator-pill"
              :style="indicatorPillStyle"
              aria-hidden="true"
            />
            <picker-view
              class="lingyun-data-picker-sheet__view"
              :value="draftIndexes"
              :indicator-style="indicatorStyle"
              :indicator-class="indicatorClass"
              :mask-class="maskClass"
              immediate-change
              @change="onPickChange"
            >
              <picker-view-column v-for="(col, colIndex) in draftColumns" :key="colKey(colIndex)">
                <view
                  v-for="(item, rowIndex) in col"
                  :key="`${colIndex}-${String(item.value)}-${rowIndex}`"
                  class="lingyun-data-picker-sheet__item"
                >
                  <text class="lingyun-data-picker-sheet__item-text">{{ item.text }}</text>
                </view>
              </picker-view-column>
            </picker-view>
          </view>
          <view v-if="showSearch" class="lingyun-data-picker-sheet__search">
            <lingyun-search-bar
              :model-value="searchQuery"
              :fixed="false"
              :safe-area="false"
              padding="12px 12px 28px"
              :placeholder="searchPlaceholder"
              @update:model-value="onSearchQuery"
            />
          </view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="sheetMounted"
        class="lingyun-data-picker-sheet"
        :class="sheetClass"
        :style="sheetRootStyle"
      >
        <view
          class="lingyun-data-picker-sheet__overlay"
          @click="onCancel"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-data-picker-sheet__panel"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <view
            class="lingyun-data-picker-sheet__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view class="lingyun-data-picker-sheet__grabber" aria-hidden="true" />
            <view class="lingyun-data-picker-sheet__toolbar">
              <text
                class="lingyun-data-picker-sheet__btn lingyun-data-picker-sheet__btn--cancel"
                @click="onCancel"
              >
                {{ cancelText }}
              </text>
              <text v-if="title" class="lingyun-data-picker-sheet__heading">{{ title }}</text>
              <view v-else class="lingyun-data-picker-sheet__heading-spacer" />
              <text
                class="lingyun-data-picker-sheet__btn lingyun-data-picker-sheet__btn--done"
                @click="onConfirm"
              >
                {{ confirmText }}
              </text>
            </view>
          </view>
          <view class="lingyun-data-picker-sheet__wheels-wrap">
            <view
              class="lingyun-data-picker-sheet__indicator-pill"
              :style="indicatorPillStyle"
              aria-hidden="true"
            />
            <picker-view
              class="lingyun-data-picker-sheet__view"
              :value="draftIndexes"
              :indicator-style="indicatorStyle"
              :indicator-class="indicatorClass"
              :mask-class="maskClass"
              immediate-change
              @change="onPickChange"
            >
              <picker-view-column v-for="(col, colIndex) in draftColumns" :key="colKey(colIndex)">
                <view
                  v-for="(item, rowIndex) in col"
                  :key="`${colIndex}-${String(item.value)}-${rowIndex}`"
                  class="lingyun-data-picker-sheet__item"
                >
                  <text class="lingyun-data-picker-sheet__item-text">{{ item.text }}</text>
                </view>
              </picker-view-column>
            </picker-view>
          </view>
          <view v-if="showSearch" class="lingyun-data-picker-sheet__search">
            <lingyun-search-bar
              :model-value="searchQuery"
              :fixed="false"
              :safe-area="false"
              padding="12px 12px 28px"
              :placeholder="searchPlaceholder"
              @update:model-value="onSearchQuery"
            />
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

/**
 * lingyun-data-picker
 * 数据驱动级联选择：localdata 树 → 多列 picker-view；弹层对齐 sheets medium（无 sheets 依赖）
 * @see design/PICKERS.md
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
const INSET_MEDIUM = 10
const RADIUS = 34
const DISMISS_DY = 72
const ITEM_H = 36

type DataPickerMap = {
  text?: string
  value?: string
  children?: string
}

type DataColumnItem = {
  text: string
  value: unknown
  children: unknown[]
}

type DataPickerChangeEvent = {
  detail?: { value?: Array<number | string> }
}

function normalizeNode(raw: unknown, map?: DataPickerMap | null): DataColumnItem | null {
  if (raw == null) return null
  if (typeof raw !== 'object') {
    return { text: String(raw), value: raw, children: [] }
  }
  const record = raw as Record<string, unknown>
  const textKey = (map && map.text) || 'text'
  const valueKey = (map && map.value) || 'value'
  const childrenKey = (map && map.children) || 'children'
  const kids = record[childrenKey]
  return {
    text: record[textKey] != null ? String(record[textKey]) : '',
    value: record[valueKey],
    children: Array.isArray(kids) ? kids : [],
  }
}

function toColumn(nodes: unknown, map?: DataPickerMap | null): DataColumnItem[] {
  const list = Array.isArray(nodes) ? nodes : []
  return list
    .map((n) => normalizeNode(n, map))
    .filter((n): n is DataColumnItem => n != null)
    .map((n) => ({
      text: n.text,
      value: n.value,
      children: n.children,
    }))
}

/**
 * 由选中值路径构建列与下标；缺省时每级取第 0 项并继续展开 children
 */
function buildCascade(
  tree: unknown,
  selectedValues: unknown[] | undefined,
  map?: DataPickerMap | null,
): { columns: DataColumnItem[][]; indexes: number[]; path: DataColumnItem[] } {
  const columns = []
  const indexes = []
  const path = []
  let nodes = Array.isArray(tree) ? tree : []
  let depth = 0
  const maxDepth = 8

  while (nodes && nodes.length && depth < maxDepth) {
    const col = toColumn(nodes, map)
    if (!col.length) break
    columns.push(col)

    const want = selectedValues && selectedValues[depth]
    let idx = 0
    if (want !== undefined && want !== null && want !== '') {
      const found = col.findIndex((item) => String(item.value) === String(want))
      if (found >= 0) idx = found
    }
    indexes.push(idx)
    const picked = col[idx]
    path.push(picked)
    nodes = picked && Array.isArray(picked.children) ? picked.children : []
    depth += 1
    if (!nodes.length) break
  }

  return { columns, indexes, path }
}

/** 保留名称命中的节点；命中父级时保留其全部下级，只命中下级时收成命中分支。 */
function filterCascadeTree(tree: unknown, query: string, map?: DataPickerMap | null): unknown[] {
  const q = query.trim().toLowerCase()
  const list = Array.isArray(tree) ? tree : []
  if (!q) return list
  const textKey = (map && map.text) || 'text'
  const childrenKey = (map && map.children) || 'children'
  const walk = (nodes: unknown): unknown[] => {
    const rows = Array.isArray(nodes) ? nodes : []
    const out: unknown[] = []
    for (const raw of rows) {
      if (raw == null || typeof raw !== 'object') {
        const text = raw == null ? '' : String(raw)
        if (text.toLowerCase().includes(q)) out.push(raw)
        continue
      }
      const record = raw as Record<string, unknown>
      const text = record[textKey] != null ? String(record[textKey]) : ''
      const kids = walk(record[childrenKey])
      if (text.toLowerCase().includes(q)) {
        out.push(raw)
      } else if (kids.length) {
        out.push({ ...record, [childrenKey]: kids })
      }
    }
    return out
  }
  return walk(list)
}

defineOptions({
  name: 'LingyunDataPicker',
})

const props = defineProps({
  modelValue: { type: Array as PropType<unknown[] | undefined>, default: undefined },
  value: { type: Array as PropType<unknown[] | undefined>, default: undefined },
  localdata: { type: Array as PropType<unknown[]>, default: () => [] },
  map: {
    type: Object as PropType<DataPickerMap>,
    default: () => ({ text: 'text', value: 'value', children: 'children' }),
  },
  title: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  separator: { type: String, default: ' / ' },
  disabled: { type: Boolean, default: false },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '完成' },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1200 },
  /** 滚轮下方搜索框。默认关闭 */
  showSearch: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: '搜索' },
  /**
   * field = 独立触发条；cell = form-item 行内嵌；auto = form-item 内默认 cell
   */
  variant: { type: String, default: 'auto' },
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change', 'cancel'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null) as LingyunAppPageScrollLock | null
const lingyunFormItem = inject('lingyunFormItem', null) as object | null

const sheetMounted = ref(false)
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const draftIndexes = ref<number[]>([0])
const draftColumns = ref<DataColumnItem[][]>([])
const colEpoch = ref(0)
const safeBottom = ref(0)
const dragStartY = ref(0)
const dragDy = ref(0)
const dragging = ref(false)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const searchQuery = ref('')
const searchEmpty = ref(false)
const keyboardHeight = ref(0)
const _onKeyboardHeight = ref<((res: { height?: number }) => void) | null>(null)
const _onVisualViewport = ref<(() => void) | null>(null)
const _lingyunMpOverlayHold = ref(false)

const current = computed((): unknown[] => {
  const raw = props.modelValue !== undefined ? props.modelValue : props.value
  return Array.isArray(raw) ? raw.slice() : []
})

const resolvedVariant = computed((): string => {
  const v = props.variant
  if (v === 'field' || v === 'cell') return v
  const formItem = lingyunFormItem as object | null
  return formItem ? 'cell' : 'field'
})

const isCell = computed((): boolean => {
  return resolvedVariant.value === 'cell'
})

const showTriggerTitle = computed((): boolean => {
  if (isCell.value) return false
  return !!props.title
})

const rootClass = computed((): string[] => {
  return [
    isCell.value ? 'lingyun-data-picker--cell' : 'lingyun-data-picker--field',
    props.disabled ? 'lingyun-data-picker--disabled' : '',
  ].filter(Boolean)
})

const rowClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-data-picker__row--disabled': props.disabled,
    'lingyun-data-picker__row--cell': isCell.value,
  }
})

const isDark = computed((): boolean => {
  try {
    return (useLingyunTheme().resolved || 'light') === 'dark'
  } catch {
    return false
  }
})

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {
    /* ignore */
  }
  return false
})

const panelBottom = computed((): number => {
  if (props.showSearch && keyboardHeight.value > 0) return keyboardHeight.value
  return Number(safeBottom.value) || 0
})

const sheetClass = computed((): string => {
  return [
    themeClass.value,
    phase.value ? `lingyun-data-picker-sheet--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-data-picker-sheet--reduce-motion' : '',
    dragging.value ? 'lingyun-data-picker-sheet--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const sheetRootStyle = computed((): { zIndex: number } => {
  return { zIndex: Number(props.zIndex) || 1200 }
})

const panelStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {
    left: `${INSET_MEDIUM}px`,
    right: `${INSET_MEDIUM}px`,
    borderTopLeftRadius: `${RADIUS}px`,
    borderTopRightRadius: `${RADIUS}px`,
    paddingBottom: `${panelBottom.value}px`,
  }
  if (dragging.value) {
    style.transform = `translate3d(0, ${dragDy.value}px, 0)`
    style.transition = 'none'
  }
  return style
})

const indicatorStyle = computed((): string => {
  return `height: ${ITEM_H}px; background: transparent; border: 0 solid transparent; border-top: none; border-bottom: none;`
})

const indicatorClass = computed((): string => {
  return 'lingyun-data-picker-sheet__indicator'
})

const indicatorPillStyle = computed((): Record<string, string> => {
  const bg = isDark.value ? 'rgba(120, 120, 128, 0.24)' : 'rgba(120, 120, 128, 0.12)'
  const r = ITEM_H / 2
  return {
    height: `${ITEM_H}px`,
    marginTop: `${-r}px`,
    borderRadius: `${r}px`,
    background: bg,
  }
})

const maskClass = computed((): string => {
  return isDark.value
    ? 'lingyun-data-picker-sheet__mask--dark'
    : 'lingyun-data-picker-sheet__mask--light'
})

const searchTree = computed((): unknown[] => {
  if (!props.showSearch) return props.localdata
  return filterCascadeTree(props.localdata, searchQuery.value, props.map)
})

const displayText = computed((): string => {
  if (!current.value.length) return ''
  const built = buildCascade(props.localdata, current.value, props.map)
  if (!built.path.length) return ''
  return built.path.map((p) => p.text).join(props.separator)
})

function colKey(colIndex: number): string {
  return `c-${colEpoch.value}-${colIndex}`
}

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
}

function syncSafe(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
  } catch {
    safeBottom.value = 0
  }
}

function valuesFromDraft() {
  const values = []
  const texts = []
  const path = []
  for (let i = 0; i < draftColumns.value.length; i += 1) {
    const col = draftColumns.value[i]
    const idx = Math.min(
      Math.max(0, Number(draftIndexes.value[i]) || 0),
      Math.max(0, col.length - 1),
    )
    const item = col[idx]
    if (!item) break
    values.push(item.value)
    texts.push(item.text)
    path.push({ text: item.text, value: item.value })
  }
  return { values, texts, path }
}

function applyDraftFromValues(selectedValues: unknown[]): void {
  const built = buildCascade(searchTree.value, selectedValues, props.map)
  if (!built.columns.length) {
    searchEmpty.value = true
    draftColumns.value = [[{ text: '无匹配', value: '', children: [] }]]
    draftIndexes.value = [0]
  } else {
    searchEmpty.value = false
    draftColumns.value = built.columns
    draftIndexes.value = built.indexes.length ? built.indexes : [0]
  }
  colEpoch.value += 1
}

function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* ignore */
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  _prevBodyOverflow.value = body.style.overflow
  _prevBodyOverscroll.value = body.style.overscrollBehavior
  _prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  _scrollLocked.value = true
  // #endif
}

function unlockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (_appScrollLocked.value && lockApi && typeof lockApi.unlock === 'function') {
      lockApi.unlock()
    }
    _appScrollLocked.value = false
  } catch {
    _appScrollLocked.value = false
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (!_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = _prevBodyOverflow.value || ''
  body.style.overscrollBehavior = _prevBodyOverscroll.value || ''
  html.style.overscrollBehavior = _prevHtmlOverscroll.value || ''
  _scrollLocked.value = false
  // #endif
}

function bindSearchKeyboard(): void {
  if (!props.showSearch) return
  if (typeof uni !== 'undefined' && typeof uni.onKeyboardHeightChange === 'function') {
    const onKeyboardHeight = (res: { height?: number }) => {
      keyboardHeight.value = Math.max(0, Number(res && res.height) || 0)
    }
    _onKeyboardHeight.value = onKeyboardHeight
    uni.onKeyboardHeightChange(onKeyboardHeight)
  }
  // #ifdef H5
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (viewport) {
    const onVisualViewport = () => {
      const vv = window.visualViewport
      if (!vv) return
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      keyboardHeight.value = covered > 80 ? covered : 0
    }
    _onVisualViewport.value = onVisualViewport
    viewport.addEventListener('resize', onVisualViewport)
    viewport.addEventListener('scroll', onVisualViewport)
  }
  // #endif
}

function unbindSearchKeyboard(): void {
  const onKeyboardHeight = _onKeyboardHeight.value
  if (onKeyboardHeight && typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange(onKeyboardHeight)
  }
  _onKeyboardHeight.value = null
  // #ifdef H5
  const onVisualViewport = _onVisualViewport.value
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (onVisualViewport && viewport) {
    viewport.removeEventListener('resize', onVisualViewport)
    viewport.removeEventListener('scroll', onVisualViewport)
  }
  _onVisualViewport.value = null
  // #endif
  keyboardHeight.value = 0
}

function openAnim(): void {
  clearTimers()
  sheetMounted.value = true
  dragDy.value = 0
  dragging.value = false
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(
        () => {
          phase.value = 'open'
          enterTimer.value = null
        },
        reduceMotion.value ? 16 : ENTER_KICK_MS,
      )
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        requestAnimationFrame(kick)
      })
    } else {
      kick()
    }
  })
}

function closeSheet(after?: () => void): void {
  clearTimers()
  if (!sheetMounted.value) {
    unbindSearchKeyboard()
    unlockPageScroll()
    if (typeof after === 'function') after()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      sheetMounted.value = false
      phase.value = ''
      dragDy.value = 0
      dragging.value = false
      unbindSearchKeyboard()
      unlockPageScroll()
      leaveTimer.value = null
      if (typeof after === 'function') after()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
}

function onSearchQuery(value: unknown): void {
  searchQuery.value = value == null ? '' : String(value)
  const selected = valuesFromDraft().values.filter((item) => item !== '' && item != null)
  applyDraftFromValues(selected.length ? selected : current.value)
}

function onPanelTouchMove(): void {}

function onChromeTouchStart(e: TouchEvent): void {
  const t = e.touches && e.touches[0]
  if (!t) return
  dragStartY.value = t.clientY
  dragDy.value = 0
  dragging.value = true
}

function onChromeTouchMove(e: TouchEvent): void {
  if (!dragging.value) return
  const t = e.touches && e.touches[0]
  if (!t) return
  const dy = t.clientY - dragStartY.value
  dragDy.value = dy > 0 ? dy : 0
}

function onCancel(): void {
  emit('cancel')
  closeSheet()
}

function onConfirm(): void {
  if (searchEmpty.value) return
  const { values, texts, path } = valuesFromDraft()
  if (!values.length) return
  emit('update:modelValue', values)
  emit('update:value', values)
  emit('change', {
    value: values,
    text: texts,
    path,
    detail: { value: values, text: texts },
  })
  closeSheet()
}

function onChromeTouchEnd(): void {
  if (!dragging.value) return
  const dy = dragDy.value
  dragging.value = false
  dragDy.value = 0
  if (dy >= DISMISS_DY) onCancel()
}

function onPickChange(e: DataPickerChangeEvent): void {
  const raw = (e && e.detail && e.detail.value) || []
  const nextIndexes = raw.map((n) => Number(n) || 0)
  // 找出变化的最左列，其后列按新节点重算
  let changed = 0
  const len = Math.max(nextIndexes.length, draftIndexes.value.length)
  for (let i = 0; i < len; i += 1) {
    if ((nextIndexes[i] || 0) !== (draftIndexes.value[i] || 0)) {
      changed = i
      break
    }
  }

  const selectedValues = []
  for (let i = 0; i <= changed; i += 1) {
    const col = draftColumns.value[i]
    if (!col || !col.length) break
    const idx = Math.min(Math.max(0, nextIndexes[i] || 0), col.length - 1)
    selectedValues.push(col[idx].value)
  }
  applyDraftFromValues(selectedValues)
}

function open(): void {
  if (props.disabled) return
  searchQuery.value = ''
  searchEmpty.value = false
  applyDraftFromValues(current.value)
  syncSafe()
  bindSearchKeyboard()
  lockPageScroll()
  openAnim()
}

watch(
  phase,
  (value: string) => {
    _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
      !!_lingyunMpOverlayHold.value,
      !!value,
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unbindSearchKeyboard()
  unlockPageScroll()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-data-picker {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-data-picker--cell {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.lingyun-data-picker__row {
  min-height: 52px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  border-radius: 26px;
  border: 1px solid transparent;
}

.lingyun-data-picker__row--cell {
  min-height: 36px;
  width: 100%;
  padding: 0;
  gap: 8px;
  background-color: transparent;
  border-radius: 0;
  border-color: transparent;
  justify-content: flex-end;
}

.lingyun-data-picker__row--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.lingyun-data-picker__title {
  flex-shrink: 0;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-data-picker__value-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.lingyun-data-picker__value {
  font-size: 17px;
  line-height: 22px;
  text-align: right;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-data-picker__value--placeholder {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-data-picker__chevron {
  flex-shrink: 0;
}

.lingyun-data-picker-sheet {
  position: fixed;
  inset: 0;
  z-index: 1200;
  pointer-events: auto;
  box-sizing: border-box;
}

.lingyun-data-picker-sheet__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-overlay});
  opacity: 0;
  transition: opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  touch-action: none;
  will-change: opacity;
}

.lingyun-data-picker-sheet__panel {
  position: absolute;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  transform: translate3d(0, 100%, 0);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  @include lingyun-glass-surface;
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-data-picker-sheet.theme-dark .lingyun-data-picker-sheet__panel {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark},
    var(--lingyun-glass-shadow-raised-dark, #{$lingyun-glass-shadow-raised-dark});
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-data-picker-sheet__chrome {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  touch-action: none;
  /* #ifdef H5 */
  user-select: none;
  -webkit-user-select: none;
  /* #endif */
}

.lingyun-data-picker-sheet__grabber {
  width: 60px;
  height: 4px;
  margin: 5px auto 0;
  border-radius: 2px;
  background-color: #cfcfcf;
  flex-shrink: 0;
}

.lingyun-data-picker-sheet.theme-dark .lingyun-data-picker-sheet__grabber {
  background-color: #8e8e93;
}

.lingyun-data-picker-sheet__toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 2px 12px 0;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lingyun-data-picker-sheet__heading,
.lingyun-data-picker-sheet__heading-spacer {
  flex: 1;
  min-width: 0;
  padding: 0 8px;
}

.lingyun-data-picker-sheet__heading {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-data-picker-sheet__btn {
  flex-shrink: 0;
  min-width: 48px;
  padding: 10px 4px;
  font-size: 17px;
  line-height: 22px;
}

.lingyun-data-picker-sheet__btn--cancel {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-data-picker-sheet__btn--done {
  font-weight: 600;
  text-align: right;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-data-picker-sheet__view {
  width: 100%;
  height: 216px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: transparent;
}

.lingyun-data-picker-sheet__wheels-wrap {
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.lingyun-data-picker-sheet__search {
  flex-shrink: 0;
  width: 100%;
}

.lingyun-data-picker-sheet__indicator-pill {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  z-index: 0;
  pointer-events: none;
  box-sizing: border-box;
}

.lingyun-data-picker-sheet__item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 6px;
}

.lingyun-data-picker-sheet__item-text {
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-data-picker-sheet__mask--light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0)),
    linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0));
  background-position: top, bottom;
  background-size: 100% 50%;
  background-repeat: no-repeat;
}

.lingyun-data-picker-sheet__mask--dark {
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.92), rgba(28, 28, 30, 0)),
    linear-gradient(0deg, rgba(28, 28, 30, 0.92), rgba(28, 28, 30, 0));
  background-position: top, bottom;
  background-size: 100% 50%;
  background-repeat: no-repeat;
}

.lingyun-data-picker-sheet__indicator {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

.lingyun-data-picker-sheet__indicator::before,
.lingyun-data-picker-sheet__indicator::after {
  display: none !important;
  border: none !important;
}

.lingyun-data-picker-sheet--enter .lingyun-data-picker-sheet__overlay {
  opacity: 0;
}

.lingyun-data-picker-sheet--enter .lingyun-data-picker-sheet__panel {
  transform: translate3d(0, 100%, 0);
}

.lingyun-data-picker-sheet--open .lingyun-data-picker-sheet__overlay {
  opacity: 1;
}

.lingyun-data-picker-sheet--open .lingyun-data-picker-sheet__panel {
  transform: translate3d(0, 0, 0);
}

.lingyun-data-picker-sheet--leave {
  pointer-events: none;
}

.lingyun-data-picker-sheet--leave .lingyun-data-picker-sheet__overlay {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}

.lingyun-data-picker-sheet--leave .lingyun-data-picker-sheet__panel {
  transform: translate3d(0, 100%, 0);
  transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.lingyun-data-picker-sheet--reduce-motion .lingyun-data-picker-sheet__overlay,
.lingyun-data-picker-sheet--reduce-motion .lingyun-data-picker-sheet__panel {
  transition-duration: 0.01s !important;
}

.lingyun-data-picker-sheet--reduce-motion.lingyun-data-picker-sheet--enter
  .lingyun-data-picker-sheet__panel,
.lingyun-data-picker-sheet--reduce-motion.lingyun-data-picker-sheet--leave
  .lingyun-data-picker-sheet__panel,
.lingyun-data-picker-sheet--reduce-motion.lingyun-data-picker-sheet--open
  .lingyun-data-picker-sheet__panel {
  transform: translate3d(0, 0, 0) !important;
}

.lingyun-data-picker-sheet--dragging .lingyun-data-picker-sheet__panel {
  transition: none !important;
}
</style>
