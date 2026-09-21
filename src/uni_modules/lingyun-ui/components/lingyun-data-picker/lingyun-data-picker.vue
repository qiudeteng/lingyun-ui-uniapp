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
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

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

function normalizeNode(raw, map) {
  if (raw == null) return null
  if (typeof raw !== 'object') {
    return { text: String(raw), value: raw, children: [] }
  }
  const textKey = (map && map.text) || 'text'
  const valueKey = (map && map.value) || 'value'
  const childrenKey = (map && map.children) || 'children'
  const kids = raw[childrenKey]
  return {
    text: raw[textKey] != null ? String(raw[textKey]) : '',
    value: raw[valueKey],
    children: Array.isArray(kids) ? kids : [],
  }
}

function toColumn(nodes, map) {
  const list = Array.isArray(nodes) ? nodes : []
  return list
    .map((n) => normalizeNode(n, map))
    .filter(Boolean)
    .map((n) => ({
      text: n.text,
      value: n.value,
      children: n.children,
    }))
}

/**
 * 由选中值路径构建列与下标；缺省时每级取第 0 项并继续展开 children
 */
function buildCascade(tree, selectedValues, map) {
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

export default {
  name: 'LingyunDataPicker',
  emits: ['update:modelValue', 'update:value', 'change', 'cancel'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null,
    },
    lingyunFormItem: { default: null },
  },
  props: {
    modelValue: { type: Array, default: undefined },
    value: { type: Array, default: undefined },
    localdata: { type: Array, default: () => [] },
    map: {
      type: Object,
      default: () => ({ text: 'text', value: 'value', children: 'children' }),
    },
    title: { type: String, default: '' },
    placeholder: { type: String, default: '请选择' },
    separator: { type: String, default: ' / ' },
    disabled: { type: Boolean, default: false },
    cancelText: { type: String, default: '取消' },
    confirmText: { type: String, default: '完成' },
    zIndex: { type: [Number, String], default: 1200 },
    /**
     * field = 独立触发条；cell = form-item 行内嵌；auto = form-item 内默认 cell
     */
    variant: { type: String, default: 'auto' },
  },
  data() {
    return {
      sheetMounted: false,
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      draftIndexes: [0],
      draftColumns: [],
      colEpoch: 0,
      safeBottom: 0,
      dragStartY: 0,
      dragDy: 0,
      dragging: false,
      _appScrollLocked: false,
      _scrollLocked: false,
      _prevBodyOverflow: '',
      _prevBodyOverscroll: '',
      _prevHtmlOverscroll: '',
    }
  },
  computed: {
    current() {
      const raw = this.modelValue !== undefined ? this.modelValue : this.value
      return Array.isArray(raw) ? raw.slice() : []
    },
    resolvedVariant() {
      const v = this.variant
      if (v === 'field' || v === 'cell') return v
      return this.lingyunFormItem ? 'cell' : 'field'
    },
    isCell() {
      return this.resolvedVariant === 'cell'
    },
    showTriggerTitle() {
      if (this.isCell) return false
      return !!this.title
    },
    rootClass() {
      return [
        this.isCell ? 'lingyun-data-picker--cell' : 'lingyun-data-picker--field',
        this.disabled ? 'lingyun-data-picker--disabled' : '',
      ].filter(Boolean)
    },
    rowClass() {
      return {
        'lingyun-data-picker__row--disabled': this.disabled,
        'lingyun-data-picker__row--cell': this.isCell,
      }
    },
    isDark() {
      try {
        return (useThemeStore().resolved || 'light') === 'dark'
      } catch {
        return false
      }
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    reduceMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      } catch {
        /* ignore */
      }
      return false
    },
    sheetClass() {
      return [
        this.themeClass,
        this.phase ? `lingyun-data-picker-sheet--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-data-picker-sheet--reduce-motion' : '',
        this.dragging ? 'lingyun-data-picker-sheet--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    sheetRootStyle() {
      return { zIndex: Number(this.zIndex) || 1200 }
    },
    panelStyle() {
      const style = {
        left: `${INSET_MEDIUM}px`,
        right: `${INSET_MEDIUM}px`,
        borderTopLeftRadius: `${RADIUS}px`,
        borderTopRightRadius: `${RADIUS}px`,
        paddingBottom: `${Number(this.safeBottom) || 0}px`,
      }
      if (this.dragging) {
        style.transform = `translate3d(0, ${this.dragDy}px, 0)`
        style.transition = 'none'
      }
      return style
    },
    indicatorStyle() {
      return `height: ${ITEM_H}px; background: transparent; border: 0 solid transparent; border-top: none; border-bottom: none;`
    },
    indicatorClass() {
      return 'lingyun-data-picker-sheet__indicator'
    },
    indicatorPillStyle() {
      const bg = this.isDark ? 'rgba(120, 120, 128, 0.24)' : 'rgba(120, 120, 128, 0.12)'
      const r = ITEM_H / 2
      return {
        height: `${ITEM_H}px`,
        marginTop: `${-r}px`,
        borderRadius: `${r}px`,
        background: bg,
      }
    },
    maskClass() {
      return this.isDark
        ? 'lingyun-data-picker-sheet__mask--dark'
        : 'lingyun-data-picker-sheet__mask--light'
    },
    displayText() {
      if (!this.current.length) return ''
      const built = buildCascade(this.localdata, this.current, this.map)
      if (!built.path.length) return ''
      return built.path.map((p) => p.text).join(this.separator)
    },
  },
  beforeUnmount() {
    this.clearTimers()
    this.unlockPageScroll()
  },
  methods: {
    colKey(colIndex) {
      return `c-${this.colEpoch}-${colIndex}`
    },
    clearTimers() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
    },
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch {
        this.safeBottom = 0
      }
    },
    valuesFromDraft() {
      const values = []
      const texts = []
      const path = []
      for (let i = 0; i < this.draftColumns.length; i += 1) {
        const col = this.draftColumns[i]
        const idx = Math.min(
          Math.max(0, Number(this.draftIndexes[i]) || 0),
          Math.max(0, col.length - 1),
        )
        const item = col[idx]
        if (!item) break
        values.push(item.value)
        texts.push(item.text)
        path.push({ text: item.text, value: item.value })
      }
      return { values, texts, path }
    },
    applyDraftFromValues(selectedValues) {
      const built = buildCascade(this.localdata, selectedValues, this.map)
      this.draftColumns = built.columns
      this.draftIndexes = built.indexes.length ? built.indexes : [0]
      this.colEpoch += 1
    },
    open() {
      if (this.disabled) return
      this.applyDraftFromValues(this.current)
      this.syncSafe()
      this.lockPageScroll()
      this.openAnim()
    },
    openAnim() {
      this.clearTimers()
      this.sheetMounted = true
      this.dragDy = 0
      this.dragging = false
      this.phase = 'enter'
      this.$nextTick(() => {
        const kick = () => {
          this.enterTimer = setTimeout(
            () => {
              this.phase = 'open'
              this.enterTimer = null
            },
            this.reduceMotion ? 16 : ENTER_KICK_MS,
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
    },
    closeSheet(after) {
      this.clearTimers()
      if (!this.sheetMounted) {
        this.unlockPageScroll()
        if (typeof after === 'function') after()
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(
        () => {
          this.sheetMounted = false
          this.phase = ''
          this.dragDy = 0
          this.dragging = false
          this.unlockPageScroll()
          this.leaveTimer = null
          if (typeof after === 'function') after()
        },
        this.reduceMotion ? 16 : LEAVE_MS,
      )
    },
    onPanelTouchMove() {},
    onChromeTouchStart(e) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.dragStartY = t.clientY
      this.dragDy = 0
      this.dragging = true
    },
    onChromeTouchMove(e) {
      if (!this.dragging) return
      const t = e.touches && e.touches[0]
      if (!t) return
      const dy = t.clientY - this.dragStartY
      this.dragDy = dy > 0 ? dy : 0
    },
    onChromeTouchEnd() {
      if (!this.dragging) return
      const dy = this.dragDy
      this.dragging = false
      this.dragDy = 0
      if (dy >= DISMISS_DY) this.onCancel()
    },
    onPickChange(e) {
      const raw = (e && e.detail && e.detail.value) || []
      const nextIndexes = raw.map((n) => Number(n) || 0)
      // 找出变化的最左列，其后列按新节点重算
      let changed = 0
      const len = Math.max(nextIndexes.length, this.draftIndexes.length)
      for (let i = 0; i < len; i += 1) {
        if ((nextIndexes[i] || 0) !== (this.draftIndexes[i] || 0)) {
          changed = i
          break
        }
      }

      const selectedValues = []
      for (let i = 0; i <= changed; i += 1) {
        const col = this.draftColumns[i]
        if (!col || !col.length) break
        const idx = Math.min(Math.max(0, nextIndexes[i] || 0), col.length - 1)
        selectedValues.push(col[idx].value)
      }
      this.applyDraftFromValues(selectedValues)
    },
    onCancel() {
      this.$emit('cancel')
      this.closeSheet()
    },
    onConfirm() {
      const { values, texts, path } = this.valuesFromDraft()
      this.$emit('update:modelValue', values)
      this.$emit('update:value', values)
      this.$emit('change', {
        value: values,
        text: texts,
        path,
        detail: { value: values, text: texts },
      })
      this.closeSheet()
    },
    lockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (lockApi && typeof lockApi.lock === 'function' && !this._appScrollLocked) {
          lockApi.lock()
          this._appScrollLocked = true
        }
      } catch {
        /* ignore */
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      this._prevBodyOverflow = body.style.overflow
      this._prevBodyOverscroll = body.style.overscrollBehavior
      this._prevHtmlOverscroll = html.style.overscrollBehavior
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'none'
      html.style.overscrollBehavior = 'none'
      this._scrollLocked = true
      // #endif
    },
    unlockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (this._appScrollLocked && lockApi && typeof lockApi.unlock === 'function') {
          lockApi.unlock()
        }
        this._appScrollLocked = false
      } catch {
        this._appScrollLocked = false
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (!this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      body.style.overflow = this._prevBodyOverflow || ''
      body.style.overscrollBehavior = this._prevBodyOverscroll || ''
      html.style.overscrollBehavior = this._prevHtmlOverscroll || ''
      this._scrollLocked = false
      // #endif
    },
  },
}
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
