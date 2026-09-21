<template>
  <view class="lingyun-context-menu">
    <view class="lingyun-context-menu__host" @longpress="onLongPress">
      <slot />
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="mounted"
        class="lingyun-context-menu__root"
        :class="rootClass"
        :style="{ zIndex: Number(zIndex) || 1100 }"
        @touchmove.stop.prevent
      >
        <view class="lingyun-context-menu__mask" @click="onMask" />
        <view class="lingyun-context-menu__lift" :style="liftStyle">
          <view class="lingyun-context-menu__panel">
            <view class="lingyun-menu">
              <view
                v-for="(action, index) in normalizedActions"
                :key="action.key || index"
                :class="rowClass(action)"
                :hover-class="hoverClass(action)"
                :hover-start-time="20"
                :hover-stay-time="70"
                @click="onRow(action)"
              >
                <view v-if="action.kind === 'separator'" class="lingyun-menu__sep-line" />
                <text v-else-if="action.kind === 'title'" class="lingyun-menu__heading-text">{{ action.label }}</text>
                <template v-else-if="action.kind === 'controls'">
                  <view
                    v-for="item in action.items"
                    :key="item.key"
                    class="lingyun-menu__control"
                    :class="controlClass(item)"
                    :hover-class="item.disabled ? '' : 'lingyun-menu__control--hover'"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    @click.stop="onControl(item)"
                  >
                    <lingyun-icon
                      v-if="item.icon"
                      :type="item.icon"
                      :size="22"
                      :color="iconColor(item)"
                    />
                    <text class="lingyun-menu__control-label">{{ item.label }}</text>
                  </view>
                </template>
                <template v-else>
                  <view v-if="action.icon" class="lingyun-menu__symbol">
                    <lingyun-icon :type="action.icon" :size="20" :color="iconColor(action)" />
                  </view>
                  <view class="lingyun-menu__text">
                    <text class="lingyun-menu__label">{{ action.label }}</text>
                    <text v-if="action.subtitle" class="lingyun-menu__subtitle">{{ action.subtitle }}</text>
                  </view>
                  <lingyun-icon
                    v-if="action.selected"
                    class="lingyun-menu__trail"
                    type="checkmarkempty"
                    :size="17"
                    :color="iconColor(action)"
                  />
                  <lingyun-icon
                    v-if="action.submenu"
                    class="lingyun-menu__trail"
                    type="right"
                    :size="12"
                    color="secondary"
                  />
                </template>
              </view>
            </view>
          </view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="mounted"
        class="lingyun-context-menu__root"
        :class="rootClass"
        :style="{ zIndex: Number(zIndex) || 1100 }"
        @touchmove.stop.prevent
      >
        <view class="lingyun-context-menu__mask" @click="onMask" />
        <view class="lingyun-context-menu__lift" :style="liftStyle">
          <view class="lingyun-context-menu__panel">
            <view class="lingyun-menu">
              <view
                v-for="(action, index) in normalizedActions"
                :key="action.key || index"
                :class="rowClass(action)"
                :hover-class="hoverClass(action)"
                :hover-start-time="20"
                :hover-stay-time="70"
                @click="onRow(action)"
              >
                <view v-if="action.kind === 'separator'" class="lingyun-menu__sep-line" />
                <text v-else-if="action.kind === 'title'" class="lingyun-menu__heading-text">{{ action.label }}</text>
                <template v-else-if="action.kind === 'controls'">
                  <view
                    v-for="item in action.items"
                    :key="item.key"
                    class="lingyun-menu__control"
                    :class="controlClass(item)"
                    :hover-class="item.disabled ? '' : 'lingyun-menu__control--hover'"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    @click.stop="onControl(item)"
                  >
                    <lingyun-icon
                      v-if="item.icon"
                      :type="item.icon"
                      :size="22"
                      :color="iconColor(item)"
                    />
                    <text class="lingyun-menu__control-label">{{ item.label }}</text>
                  </view>
                </template>
                <template v-else>
                  <view v-if="action.icon" class="lingyun-menu__symbol">
                    <lingyun-icon :type="action.icon" :size="20" :color="iconColor(action)" />
                  </view>
                  <view class="lingyun-menu__text">
                    <text class="lingyun-menu__label">{{ action.label }}</text>
                    <text v-if="action.subtitle" class="lingyun-menu__subtitle">{{ action.subtitle }}</text>
                  </view>
                  <lingyun-icon
                    v-if="action.selected"
                    class="lingyun-menu__trail"
                    type="checkmarkempty"
                    :size="17"
                    :color="iconColor(action)"
                  />
                  <lingyun-icon
                    v-if="action.submenu"
                    class="lingyun-menu__trail"
                    type="right"
                    :size="12"
                    color="secondary"
                  />
                </template>
              </view>
            </view>
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'
import { normalizeMenuActions } from '../lingyun-menu/normalizeMenuActions'

/**
 * lingyun-context-menu
 * 长按打开动作列表（与 Menu 同构；无 Peek）
 * @see design/MENUS.md
 */
const LEAVE_MS = 200
const QUERY_TIMEOUT_MS = 180

export default {
  name: 'LingyunContextMenu',
  emits: ['select', 'open', 'close'],
  props: {
    actions: { type: Array, default: () => [] },
    maskClosable: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 1100 },
  },
  data() {
    return {
      mounted: false,
      phase: '',
      leaveTimer: null,
      panelTop: 160,
      panelLeft: 16,
      panelWidth: 200,
    }
  },
  computed: {
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useThemeStore().rootClass || 'theme-light'
      } catch {
        /* ignore */
      }
      return [themeClass, this.phase ? `lingyun-context-menu--${this.phase}` : ''].filter(Boolean).join(' ')
    },
    liftStyle() {
      return {
        top: `${this.panelTop}px`,
        left: `${this.panelLeft}px`,
        width: `${this.panelWidth}px`,
      }
    },
    normalizedActions() {
      return normalizeMenuActions(this.actions)
    },
  },
  beforeUnmount() {
    if (this.leaveTimer) clearTimeout(this.leaveTimer)
  },
  methods: {
    iconColor(action) {
      if (action.disabled) return 'tertiary'
      if (action.role === 'destructive') return 'red'
      return 'label'
    },
    rowClass(action) {
      if (action.kind === 'separator') return 'lingyun-menu__sep'
      if (action.kind === 'title') return 'lingyun-menu__heading'
      if (action.kind === 'controls') return 'lingyun-menu__controls'
      return [
        'lingyun-menu__item',
        action.subtitle ? 'lingyun-menu__item--sub' : '',
        action.disabled ? 'lingyun-menu__item--disabled' : '',
        action.role === 'destructive' ? 'lingyun-menu__item--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    controlClass(item) {
      return [
        item.disabled ? 'lingyun-menu__control--disabled' : '',
        item.role === 'destructive' ? 'lingyun-menu__control--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass(action) {
      if (action.kind !== 'item' || action.disabled) return ''
      return 'lingyun-menu__item--hover'
    },
    emitSelect(action) {
      this.$emit('select', { action: action.raw || action, key: action.key })
      this.close()
    },
    onRow(action) {
      if (!action || action.kind !== 'item' || action.disabled) return
      this.emitSelect(action)
    },
    onControl(item) {
      if (!item || item.disabled) return
      this.emitSelect(item)
    },
    measure(includePanel) {
      return new Promise((resolve) => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        const timer = setTimeout(finish, QUERY_TIMEOUT_MS)
        try {
          const q = uni.createSelectorQuery().in(this)
          q.select('.lingyun-context-menu__host').boundingClientRect()
          if (includePanel) q.select('.lingyun-context-menu__panel').boundingClientRect()
          q.selectViewport().boundingClientRect()
          q.exec((res) => {
            clearTimeout(timer)
            const list = Array.isArray(res) ? res : []
            const viewport = list.length ? list[list.length - 1] : null
            const host = list[0]
            const panel = includePanel ? list[1] : null
            const vw = (viewport && viewport.width) || 375
            const vh = (viewport && viewport.height) || 667
            const width = 250
            const gap = 8
            if (!host || !(host.width > 0)) {
              this.panelTop = Math.round(vh * 0.35)
              this.panelLeft = 16
              this.panelWidth = width
              finish()
              return
            }
            let left = host.left + host.width / 2 - width / 2
            left = Math.max(12, Math.min(left, vw - width - 12))
            const panelH = panel && panel.height > 0 ? panel.height : 120
            let top = host.top + host.height + gap
            if (top + panelH > vh - 12) {
              top = Math.max(12, host.top - gap - panelH)
            }
            this.panelTop = Math.round(top)
            this.panelLeft = Math.round(left)
            this.panelWidth = width
            finish()
          })
        } catch {
          clearTimeout(timer)
          finish()
        }
      })
    },
    open() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      this.mounted = true
      this.phase = 'enter'
      this.$emit('open')
      this.$nextTick(() => {
        this.measure(false).then(() => {
          setTimeout(() => {
            this.measure(true).then(() => {
              this.phase = 'open'
            })
          }, 48)
        })
      })
    },
    onLongPress() {
      this.open()
    },
    close() {
      if (!this.mounted) return
      this.phase = 'leave'
      this.leaveTimer = setTimeout(() => {
        this.mounted = false
        this.phase = ''
        this.leaveTimer = null
        this.$emit('close')
      }, LEAVE_MS)
    },
    onMask() {
      if (!this.maskClosable) return
      this.close()
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-context-menu {
  position: relative;
  display: block;
}

.lingyun-context-menu__root {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.lingyun-context-menu__mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.18);
}

.lingyun-context-menu__root.theme-dark .lingyun-context-menu__mask {
  background-color: rgba(0, 0, 0, 0.42);
}

.lingyun-context-menu__lift {
  position: absolute;
  transform: translate3d(0, 6px, 0);
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-context-menu--open .lingyun-context-menu__lift {
  transform: translate3d(0, 0, 0);
}

.lingyun-context-menu__panel {
  border-radius: 32px;
  padding: 10px;
  box-sizing: border-box;
  @include lingyun-glass-surface;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

.lingyun-context-menu__root.theme-dark .lingyun-context-menu__panel {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, #{$lingyun-glass-shadow-dark};
}
</style>

<style lang="scss">
@import '../lingyun-menu/menu.scss';
</style>
