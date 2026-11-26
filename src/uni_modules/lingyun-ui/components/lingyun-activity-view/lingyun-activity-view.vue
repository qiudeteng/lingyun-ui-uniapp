<template>
  <view class="lingyun-activity-view-host">
    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="mounted"
        class="lingyun-activity-view"
        :class="rootClass"
        :style="rootStyle"
      >
        <view
          class="lingyun-activity-view__overlay"
          @click="onOverlayClick"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-activity-view__panel"
          :class="panelClass"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop
        >
          <view class="lingyun-activity-view__header">
            <view class="lingyun-activity-view__title-row">
              <image
                v-if="thumbnail"
                class="lingyun-activity-view__thumb"
                :style="thumbStyle"
                :src="thumbnail"
                mode="aspectFill"
              />
              <view class="lingyun-activity-view__titles">
                <text v-if="title" class="lingyun-activity-view__title">{{ title }}</text>
                <text v-if="subtitle" class="lingyun-activity-view__subtitle">{{ subtitle }}</text>
              </view>
              <view
                v-if="showClose"
                class="lingyun-activity-view__close"
                hover-class="lingyun-activity-view__close--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                aria-label="Close"
                @click="close"
              >
                <lingyun-icon type="closeempty" :size="16" color="var(--lingyun-label)" />
              </view>
            </view>
          </view>
          <scroll-view
            class="lingyun-activity-view__scroll"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-activity-view__body" :style="bodyStyle">
              <view
                v-if="menuText"
                class="lingyun-activity-view__menu"
                hover-class="lingyun-activity-view__menu--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                @click="onMenu"
              >
                <lingyun-icon v-if="menuIcon" :type="menuIcon" :size="16" />
                <text class="lingyun-activity-view__menu-label">{{ menuText }}</text>
                <lingyun-icon type="down" :size="12" color="var(--lingyun-label-secondary)" />
              </view>

              <view
                v-if="permissionText"
                class="lingyun-activity-view__permission"
                hover-class="lingyun-activity-view__permission--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                @click="onPermission"
              >
                <text class="lingyun-activity-view__permission-label">{{ permissionText }}</text>
                <lingyun-icon type="right" :size="12" color="var(--lingyun-label-tertiary)" />
              </view>

              <scroll-view
                v-if="contactItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--person"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in contactItems"
                    :key="item.key"
                    class="lingyun-activity-view__person"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('contact', item, index)"
                  >
                    <view class="lingyun-activity-view__avatar-wrap">
                      <lingyun-avatar
                        :src="item.src"
                        :text="item.name"
                        size="lg"
                        :background-color="item.color"
                      />
                      <view
                        v-if="item.badge"
                        class="lingyun-activity-view__badge"
                        :style="badgeStyle(item)"
                      >
                        <lingyun-icon :type="item.badge" :size="11" color="#ffffff" />
                      </view>
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.name }}</text>
                  </view>
                </view>
              </scroll-view>

              <scroll-view
                v-if="appItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--app"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in appItems"
                    :key="item.key"
                    class="lingyun-activity-view__app"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('app', item, index)"
                  >
                    <view class="lingyun-activity-view__app-icon" :style="appIconStyle(item)">
                      <lingyun-icon :type="item.icon" :size="26" color="#ffffff" />
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.name }}</text>
                  </view>
                </view>
              </scroll-view>

              <scroll-view
                v-if="shortcutItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--shortcut"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in shortcutItems"
                    :key="item.key"
                    class="lingyun-activity-view__shortcut"
                    :class="{ 'lingyun-activity-view__shortcut--disabled': item.disabled }"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('shortcut', item, index)"
                  >
                    <view class="lingyun-activity-view__shortcut-icon">
                      <lingyun-icon :type="item.icon" :size="22" />
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.text }}</text>
                  </view>
                </view>
              </scroll-view>

              <view
                v-for="(group, groupIndex) in actionGroups"
                :key="group.key"
                class="lingyun-activity-view__group"
              >
                <view
                  v-for="(item, index) in group.actions"
                  :key="item.key"
                  class="lingyun-activity-view__row"
                  :class="{ 'lingyun-activity-view__row--disabled': item.disabled }"
                  hover-class="lingyun-activity-view__row--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  role="button"
                  @click="onSelect('action', item, index, groupIndex)"
                >
                  <view v-if="item.icon" class="lingyun-activity-view__row-icon">
                    <lingyun-icon :type="item.icon" :size="20" />
                  </view>
                  <text class="lingyun-activity-view__row-label">{{ item.text }}</text>
                  <view v-if="index < group.actions.length - 1" class="lingyun-activity-view__sep" />
                </view>
              </view>

              <slot />

              <view v-if="showEdit && editText" class="lingyun-activity-view__edit-wrap">
                <view
                  class="lingyun-activity-view__edit"
                  hover-class="lingyun-activity-view__edit--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  role="button"
                  @click="onSelect('edit', { text: editText }, 0)"
                >
                  <text class="lingyun-activity-view__edit-label">{{ editText }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="mounted"
        class="lingyun-activity-view"
        :class="rootClass"
        :style="rootStyle"
      >
        <view
          class="lingyun-activity-view__overlay"
          @click="onOverlayClick"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-activity-view__panel"
          :class="panelClass"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop
        >
          <view class="lingyun-activity-view__header">
            <view class="lingyun-activity-view__title-row">
              <image
                v-if="thumbnail"
                class="lingyun-activity-view__thumb"
                :style="thumbStyle"
                :src="thumbnail"
                mode="aspectFill"
              />
              <view class="lingyun-activity-view__titles">
                <text v-if="title" class="lingyun-activity-view__title">{{ title }}</text>
                <text v-if="subtitle" class="lingyun-activity-view__subtitle">{{ subtitle }}</text>
              </view>
              <view
                v-if="showClose"
                class="lingyun-activity-view__close"
                hover-class="lingyun-activity-view__close--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                aria-label="Close"
                @click="close"
              >
                <lingyun-icon type="closeempty" :size="16" color="var(--lingyun-label)" />
              </view>
            </view>
          </view>
          <scroll-view
            class="lingyun-activity-view__scroll"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-activity-view__body" :style="bodyStyle">
              <view
                v-if="menuText"
                class="lingyun-activity-view__menu"
                hover-class="lingyun-activity-view__menu--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                @click="onMenu"
              >
                <lingyun-icon v-if="menuIcon" :type="menuIcon" :size="16" />
                <text class="lingyun-activity-view__menu-label">{{ menuText }}</text>
                <lingyun-icon type="down" :size="12" color="var(--lingyun-label-secondary)" />
              </view>

              <view
                v-if="permissionText"
                class="lingyun-activity-view__permission"
                hover-class="lingyun-activity-view__permission--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                @click="onPermission"
              >
                <text class="lingyun-activity-view__permission-label">{{ permissionText }}</text>
                <lingyun-icon type="right" :size="12" color="var(--lingyun-label-tertiary)" />
              </view>

              <scroll-view
                v-if="contactItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--person"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in contactItems"
                    :key="item.key"
                    class="lingyun-activity-view__person"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('contact', item, index)"
                  >
                    <view class="lingyun-activity-view__avatar-wrap">
                      <lingyun-avatar
                        :src="item.src"
                        :text="item.name"
                        size="lg"
                        :background-color="item.color"
                      />
                      <view
                        v-if="item.badge"
                        class="lingyun-activity-view__badge"
                        :style="badgeStyle(item)"
                      >
                        <lingyun-icon :type="item.badge" :size="11" color="#ffffff" />
                      </view>
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.name }}</text>
                  </view>
                </view>
              </scroll-view>

              <scroll-view
                v-if="appItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--app"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in appItems"
                    :key="item.key"
                    class="lingyun-activity-view__app"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('app', item, index)"
                  >
                    <view class="lingyun-activity-view__app-icon" :style="appIconStyle(item)">
                      <lingyun-icon :type="item.icon" :size="26" color="#ffffff" />
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.name }}</text>
                  </view>
                </view>
              </scroll-view>

              <scroll-view
                v-if="shortcutItems.length"
                class="lingyun-activity-view__hscroll lingyun-activity-view__hscroll--shortcut"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="lingyun-activity-view__hrow">
                  <view
                    v-for="(item, index) in shortcutItems"
                    :key="item.key"
                    class="lingyun-activity-view__shortcut"
                    :class="{ 'lingyun-activity-view__shortcut--disabled': item.disabled }"
                    hover-class="lingyun-activity-view__tile--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onSelect('shortcut', item, index)"
                  >
                    <view class="lingyun-activity-view__shortcut-icon">
                      <lingyun-icon :type="item.icon" :size="22" />
                    </view>
                    <text class="lingyun-activity-view__tile-label">{{ item.text }}</text>
                  </view>
                </view>
              </scroll-view>

              <view
                v-for="(group, groupIndex) in actionGroups"
                :key="group.key"
                class="lingyun-activity-view__group"
              >
                <view
                  v-for="(item, index) in group.actions"
                  :key="item.key"
                  class="lingyun-activity-view__row"
                  :class="{ 'lingyun-activity-view__row--disabled': item.disabled }"
                  hover-class="lingyun-activity-view__row--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  role="button"
                  @click="onSelect('action', item, index, groupIndex)"
                >
                  <view v-if="item.icon" class="lingyun-activity-view__row-icon">
                    <lingyun-icon :type="item.icon" :size="20" />
                  </view>
                  <text class="lingyun-activity-view__row-label">{{ item.text }}</text>
                  <view v-if="index < group.actions.length - 1" class="lingyun-activity-view__sep" />
                </view>
              </view>

              <slot />

              <view v-if="showEdit && editText" class="lingyun-activity-view__edit-wrap">
                <view
                  class="lingyun-activity-view__edit"
                  hover-class="lingyun-activity-view__edit--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  role="button"
                  @click="onSelect('edit', { text: editText }, 0)"
                >
                  <text class="lingyun-activity-view__edit-label">{{ editText }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import { getLingyunToolbarStackPx, LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

/**
 * lingyun-activity-view
 * @description iOS Activity View（分享面板）。半高 / 全高两档。
 * @see design/ACTIVITY_VIEWS.md
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/F67968EA-A7A0-4A17-A510-D770D8F5C5FD/canvas
 *
 * 面板材质与 lingyun-sheets 相同：半高走 Medium 玻璃（#fff @ 0.72 + 全端 blur），
 * 全高 / 宽屏走不透明分组底。位移在面板 transform，不对玻璃节点写 opacity。
 * 挂载：H5 Teleport→body / mp root-portal。
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
const HALF_HEIGHT = 500
const CARD_WIDTH = 402
const REGULAR_MIN_WIDTH = LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
/** 与 lingyun-sheets Medium：左右 + 底各 8，四角 34 */
const INSET_MEDIUM = 8
const RADIUS_MEDIUM = 34
/** 与 lingyun-sheets Large：贴边，顶角 38、底角 0 */
const RADIUS_LARGE = 38
/** 与 lingyun-sheets iPad：四角 32，最小留白 32 */
const RADIUS_REGULAR = 32
const REGULAR_INSET = 32
const THUMB = 40

type ActivityRaw = Record<string, unknown>

type ActivityTile = {
  key: string
  name: string
  text: string
  src: string
  icon: string
  color: string
  badge: string
  badgeColor: string
  disabled: boolean
  raw: ActivityRaw
}

type ActivityGroupInput = {
  key?: string | number | null
  actions?: unknown
}

type ActivityGroup = {
  key: string | number
  actions: ActivityTile[]
}

type ActivitySelectItem = {
  disabled?: boolean
  /** 编辑入口等直接给文案的项；作为 select 载荷原样带出 */
  text?: string
  raw?: unknown
}

/** 与 `value || ''` / `!!value` 同结果，避免 unknown 直接参与逻辑运算 */
function isFilled(value: unknown): boolean {
  return !!(value as boolean)
}

function fieldText(value: unknown): string {
  return (isFilled(value) ? value : '') as string
}

defineOptions({
  name: 'LingyunActivityView',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  /** half | full。half 对齐 Sketch Card - Half Height（约 500 高） */
  detent: { type: String, default: 'half' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  thumbnailSize: { type: [Number, String] as PropType<number | string>, default: 40 },
  showClose: { type: Boolean, default: true },
  /** 顶栏弹出按钮文案，如 Collaborate */
  menuText: { type: String, default: '' },
  menuIcon: { type: String, default: '' },
  /** 权限 / drill-in 文案，如 Everyone can make changes */
  permissionText: { type: String, default: '' },
  /** { key, name, src, color, badge, badgeColor } */
  contacts: { type: Array as PropType<ActivityRaw[]>, default: () => [] },
  /** { key, name, icon, color } */
  apps: { type: Array as PropType<ActivityRaw[]>, default: () => [] },
  /** { key, text, icon, disabled } */
  shortcuts: { type: Array as PropType<ActivityRaw[]>, default: () => [] },
  /** [{ key, actions: [{ key, text, icon, disabled }] }] */
  groups: { type: Array as PropType<ActivityGroupInput[]>, default: () => [] },
  editText: { type: String, default: 'Edit Actions' },
  showEdit: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: true },
  closeOnSelect: { type: Boolean, default: true },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1120 },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close', 'select', 'menu', 'permission'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

const mounted = ref(false)
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const safeBottom = ref(0)
/** 全屏顶缘：页面顶栏（状态栏 + 栏身），避开微信胶囊 */
const fullTopGap = ref(104)
const windowWidth = ref(375)
const windowHeight = ref(667)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const _lingyunMpOverlayHold = ref(false)

function normalizeTiles(list: unknown, labelKey: string): ActivityTile[] {
  const items = (Array.isArray(list) ? list : []) as ActivityRaw[]
  return items
    .filter((item) => !!item && (isFilled(item[labelKey]) || isFilled(item.name) || isFilled(item.text)))
    .map((item, index) => ({
      key: item.key != null ? String(item.key) : `${labelKey}-${index}`,
      name: item.name != null ? String(item.name) : '',
      text: item.text != null ? String(item.text) : item.name != null ? String(item.name) : '',
      src: fieldText(item.src),
      icon: fieldText(item.icon),
      color: fieldText(item.color),
      badge: fieldText(item.badge),
      badgeColor: fieldText(item.badgeColor),
      disabled: item.disabled === true,
      raw: item,
    }))
}

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const isFull = computed((): boolean => props.detent === 'full')

const isRegular = computed((): boolean => (Number(windowWidth.value) || 375) >= REGULAR_MIN_WIDTH)

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

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [
    themeClass,
    phase.value ? `lingyun-activity-view--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-activity-view--reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return { zIndex: Number(props.zIndex) || 1120 }
})

const panelHeightPx = computed((): number => {
  const h = Math.max(320, Number(windowHeight.value) || 667)
  if (isFull.value) {
    const gap = isRegular.value ? REGULAR_INSET * 2 : fullTopGap.value
    return Math.max(HALF_HEIGHT, Math.round(h - gap))
  }
  return Math.min(HALF_HEIGHT, Math.round(h - 24))
})

const sideInsetPx = computed((): number => {
  if (isRegular.value) {
    const w = Math.max(320, Number(windowWidth.value) || 375)
    const panel = Math.min(CARD_WIDTH, w - REGULAR_INSET * 2)
    return Math.round((w - panel) / 2)
  }
  return isFull.value ? 0 : INSET_MEDIUM
})

const bottomInsetPx = computed((): number => {
  if (isRegular.value) return REGULAR_INSET
  return isFull.value ? 0 : INSET_MEDIUM
})

const panelClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-activity-view__panel--regular': isRegular.value,
    'lingyun-activity-view__panel--full': !isRegular.value && isFull.value,
    'lingyun-activity-view__panel--half': !isRegular.value && !isFull.value,
  }
})

const panelStyle = computed((): Record<string, string> => {
  const radius = isRegular.value ? RADIUS_REGULAR : isFull.value ? RADIUS_LARGE : RADIUS_MEDIUM
  const bottomRadius = !isRegular.value && isFull.value ? 0 : radius
  return {
    left: `${sideInsetPx.value}px`,
    right: `${sideInsetPx.value}px`,
    bottom: `${bottomInsetPx.value}px`,
    height: `${panelHeightPx.value}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
    borderBottomLeftRadius: `${bottomRadius}px`,
    borderBottomRightRadius: `${bottomRadius}px`,
  }
})

const bodyStyle = computed((): Record<string, string> => {
  const bottom = 16 + (Number(safeBottom.value) || 0)
  return { paddingBottom: `${bottom}px` }
})

const thumbStyle = computed((): Record<string, string> => {
  const size = Math.max(24, Number(props.thumbnailSize) || THUMB)
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${Math.round(size * 0.22)}px`,
  }
})

const contactItems = computed((): ActivityTile[] => normalizeTiles(props.contacts, 'name'))

const appItems = computed((): ActivityTile[] => normalizeTiles(props.apps, 'name'))

const shortcutItems = computed((): ActivityTile[] => normalizeTiles(props.shortcuts, 'text'))

const actionGroups = computed((): ActivityGroup[] => {
  const list = Array.isArray(props.groups) ? props.groups : []
  return list
    .map((group, index) => {
      const actions = normalizeTiles(group && group.actions, 'text')
      const rawKey = group ? group.key : ''
      return {
        key: rawKey ? rawKey : `g-${index}`,
        actions,
      }
    })
    .filter((group) => group.actions.length)
})

function badgeStyle(item: ActivityTile): Record<string, string> {
  if (!item.badgeColor) return {}
  return { backgroundColor: item.badgeColor }
}

function appIconStyle(item: ActivityTile): Record<string, string> {
  return { backgroundColor: item.color || 'var(--lingyun-primary, #0088ff)' }
}

function syncWindow(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
    windowWidth.value = info && info.windowWidth ? Number(info.windowWidth) || 375 : 375
    windowHeight.value = info && info.windowHeight ? Number(info.windowHeight) || 667 : 667
    fullTopGap.value = Math.max(44, getLingyunToolbarStackPx())
  } catch {
    safeBottom.value = 0
  }
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

function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* 不在 app-page 内 */
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

function openAnim(): void {
  clearTimers()
  mounted.value = true
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
      requestAnimationFrame(() => requestAnimationFrame(kick))
    } else {
      kick()
    }
  })
}

function closeAnim(): void {
  clearTimers()
  if (!mounted.value) {
    unlockPageScroll()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      mounted.value = false
      phase.value = ''
      leaveTimer.value = null
      unlockPageScroll()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
}

function setVisible(next: boolean): void {
  const val = !!next
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function close(): void {
  setVisible(false)
}

function onOverlayClick(): void {
  if (!props.maskClosable) return
  close()
}

function onMenu(): void {
  emit('menu')
}

function onPermission(): void {
  emit('permission')
}

function onSelect(kind: string, item: ActivitySelectItem | null | undefined, index: number, groupIndex?: number): void {
  if (!item || item.disabled) return
  const payload = {
    kind,
    item: isFilled(item.raw) ? item.raw : item,
    index,
    groupIndex: groupIndex == null ? -1 : groupIndex,
  }
  emit('select', payload)
  if (kind === 'edit' || kind === 'menu' || kind === 'permission') return
  if (props.closeOnSelect) close()
}

watch(
  visible,
  (val: boolean) => {
    if (val) {
      syncWindow()
      lockPageScroll()
      openAnim()
    } else {
      closeAnim()
    }
  },
  { immediate: true },
)

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

onMounted(() => {
  syncWindow()
})

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unlockPageScroll()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

$ly-av-tile: 76px;
$ly-av-icon: 60px;
$ly-av-row-h: 44px;
$ly-av-inset: 16px;
$ly-av-menu-pad: 14px;

.lingyun-activity-view-host {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
}

.lingyun-activity-view {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1120;
  pointer-events: auto;
  box-sizing: border-box;
}

.lingyun-activity-view__overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-overlay});
  opacity: 0;
  transition: opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  touch-action: none;
  will-change: opacity;
}

.lingyun-activity-view--enter .lingyun-activity-view__overlay {
  opacity: 0;
}

.lingyun-activity-view--open .lingyun-activity-view__overlay {
  opacity: 1;
}

.lingyun-activity-view--leave {
  pointer-events: none;
}

.lingyun-activity-view--leave .lingyun-activity-view__overlay {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}

.lingyun-activity-view__panel {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  transform: translate3d(0, calc(100% + 16px), 0);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
  /*
   * 与 lingyun-sheets 同一套活玻璃：surface + 全端 blur + #fff @ 0.72。
   * mixin 在小程序会丢掉 blur，且底停在 0.42，必须在后面写死。
   */
  @include lingyun-glass-surface;
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 18px 46px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-activity-view.theme-dark .lingyun-activity-view__panel {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 18px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

/* 全高 / 宽屏：与 Sheet Large、iPad 一样用不透明分组底，避免长内容透底 */
.lingyun-activity-view__panel--full,
.lingyun-activity-view.theme-dark .lingyun-activity-view__panel--full,
.lingyun-activity-view__panel--regular,
.lingyun-activity-view.theme-dark .lingyun-activity-view__panel--regular {
  border: 0;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18);
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.lingyun-activity-view__panel--regular,
.lingyun-activity-view.theme-dark .lingyun-activity-view__panel--regular {
  box-shadow: none;
}

.lingyun-activity-view__scroll {
  flex: 1;
  height: 0;
  min-height: 0;
}

.lingyun-activity-view__body {
  box-sizing: border-box;
}

.lingyun-activity-view__header {
  flex-shrink: 0;
  padding: 12px 16px 8px;
  box-sizing: border-box;
}

.lingyun-activity-view__title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-activity-view__thumb {
  margin-right: 12px;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  flex-shrink: 0;
}

.lingyun-activity-view__titles {
  flex: 1;
  min-width: 0;
}

.lingyun-activity-view__title {
  display: block;
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
}

.lingyun-activity-view__subtitle {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.lingyun-activity-view__close {
  width: 46px;
  height: 46px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include lingyun-glass-control;
}

.lingyun-activity-view__close--hover {
  background-color: var(--lingyun-glass-control-bg-pressed, rgba(255, 255, 255, 0.56));
}

.lingyun-activity-view__menu--hover,
.lingyun-activity-view__edit--hover {
  opacity: 0.72;
}

.lingyun-activity-view__menu {
  margin: 12px $ly-av-inset 0;
  height: 36px;
  padding: 0 $ly-av-menu-pad;
  border-radius: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-activity-view__menu-label {
  flex: 1;
  margin-left: 8px;
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
}

.lingyun-activity-view__permission {
  margin: 8px $ly-av-inset 0;
  padding: 0 $ly-av-menu-pad;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-activity-view__permission--hover {
  opacity: 0.7;
}

.lingyun-activity-view__permission-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.lingyun-activity-view__hscroll {
  width: 100%;
  white-space: nowrap;
}

.lingyun-activity-view__hscroll--person,
.lingyun-activity-view__hscroll--app,
.lingyun-activity-view__hscroll--shortcut {
  height: 104px;
}

.lingyun-activity-view__hrow {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px $ly-av-inset 0;
  box-sizing: border-box;
}

.lingyun-activity-view__person,
.lingyun-activity-view__app,
.lingyun-activity-view__shortcut {
  width: $ly-av-tile;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.lingyun-activity-view__tile--hover {
  opacity: 0.72;
}

.lingyun-activity-view__avatar-wrap {
  position: relative;
  width: 64px;
  height: 64px;
}

.lingyun-activity-view__badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-system-green, #34c759);
  border-width: 2px;
  border-style: solid;
  border-color: var(--lingyun-bg-grouped-secondary, #ffffff);
  box-sizing: border-box;
}

.lingyun-activity-view__app-icon,
.lingyun-activity-view__shortcut-icon {
  width: $ly-av-icon;
  height: $ly-av-icon;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-activity-view__app-icon {
  border-radius: 14px;
}

.lingyun-activity-view__shortcut-icon {
  border-radius: 30px;
  background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
  border-width: 0.5px;
  border-style: solid;
  border-color: var(--lingyun-separator, rgba(0, 0, 0, 0.12));
}

.lingyun-activity-view__tile-label {
  width: $ly-av-tile;
  margin-top: 4px;
  font-size: 11px;
  line-height: 13px;
  text-align: center;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
  white-space: normal;
}

.lingyun-activity-view__shortcut--disabled {
  opacity: 0.35;
}

.lingyun-activity-view__group {
  margin: 8px 16px 0;
  border-radius: 26px;
  overflow: hidden;
  background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
}

.lingyun-activity-view__row {
  position: relative;
  height: $ly-av-row-h;
  padding: 0 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
}

.lingyun-activity-view__row--hover {
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-activity-view__row--disabled {
  opacity: 0.35;
}

.lingyun-activity-view__row-icon {
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.lingyun-activity-view__row-label {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #000000);
}

.lingyun-activity-view__sep {
  position: absolute;
  left: 48px;
  right: 0;
  bottom: 0;
  height: 0.5px;
  background-color: var(--lingyun-separator, rgba(0, 0, 0, 0.12));
}

.lingyun-activity-view__edit-wrap {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 16px;
}

.lingyun-activity-view__edit {
  height: 44px;
  padding: 0 18px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-activity-view__edit-label {
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
}

.lingyun-activity-view--open .lingyun-activity-view__panel {
  transform: translate3d(0, 0, 0);
}

.lingyun-activity-view--leave .lingyun-activity-view__panel {
  transform: translate3d(0, calc(100% + 16px), 0);
  transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.lingyun-activity-view--reduce-motion .lingyun-activity-view__overlay,
.lingyun-activity-view--reduce-motion .lingyun-activity-view__panel {
  transition: none;
}
</style>
