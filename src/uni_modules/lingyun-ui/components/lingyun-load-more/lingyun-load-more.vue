<template>
  <view
    :id="rootId"
    class="lingyun-load-more"
    :class="[rootClass, `lingyun-load-more--${statusKey}`]"
    :style="{ minHeight: `${resolvedMinHeight}px` }"
    :hover-class="hoverClass"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    @click="onClick"
  >
    <template v-if="statusKey === 'loading'">
      <lingyun-activity-indicator size="small" color="secondary" />
      <text class="lingyun-load-more__text">{{ loadingText }}</text>
    </template>

    <template v-else-if="statusKey === 'nomore'">
      <view v-if="showEndLine" class="lingyun-load-more__line" />
      <text class="lingyun-load-more__text lingyun-load-more__text--muted">
        {{ noMoreText }}
      </text>
      <view v-if="showEndLine" class="lingyun-load-more__line" />
    </template>

    <template v-else-if="statusKey === 'error'">
      <lingyun-icon type="refresh" :size="16" color="error" />
      <text class="lingyun-load-more__text lingyun-load-more__text--error">
        {{ errorText }}
      </text>
    </template>

    <template v-else>
      <text class="lingyun-load-more__text">{{ moreText }}</text>
      <lingyun-icon type="bottom" :size="14" color="tertiary" />
    </template>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunLoadMorePayload,
  LingyunLoadMoreStatus,
} from './types'

interface IntersectionObserverLike {
  relativeToViewport: (options?: Record<string, unknown>) => IntersectionObserverLike
  observe: (
    selector: string,
    callback: (result: { intersectionRatio?: number }) => void,
  ) => void
  disconnect: () => void
}

let loadMoreSequence = 0

const STATUS_VALUES: LingyunLoadMoreStatus[] = [
  'more',
  'loading',
  'nomore',
  'error',
]

function isStatus(value: unknown): value is LingyunLoadMoreStatus {
  return STATUS_VALUES.includes(value as LingyunLoadMoreStatus)
}

/**
 * lingyun-load-more
 * @description 长列表底部加载更多：更多 / 加载中 / 没有更多 / 失败重试；可自动触底加载
 * @see design/LOAD_MORE.md
 */
export default defineComponent({
  name: 'LingyunLoadMore',
  emits: ['load'],
  props: {
    status: { type: String, default: 'more' },
    moreText: { type: String, default: '加载更多' },
    loadingText: { type: String, default: '加载中…' },
    noMoreText: { type: String, default: '没有更多了' },
    errorText: { type: String, default: '加载失败，点击重试' },
    showEndLine: { type: Boolean, default: true },
    auto: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minHeight: { type: Number, default: 48 },
  },
  data(): {
    uid: number
    observer: IntersectionObserverLike | null
    autoTriggered: boolean
  } {
    return {
      uid: (loadMoreSequence += 1),
      observer: null,
      autoTriggered: false,
    }
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    rootId(): string {
      return `lingyun-load-more-${this.uid}`
    },
    statusKey(): LingyunLoadMoreStatus {
      return isStatus(this.status) ? this.status : 'more'
    },
    resolvedMinHeight(): number {
      const value = Number(this.minHeight)
      return Number.isFinite(value) && value > 0 ? value : 48
    },
    hoverClass(): string {
      if (this.disabled) return 'none'
      return this.statusKey === 'more' || this.statusKey === 'error'
        ? 'lingyun-load-more--hover'
        : 'none'
    },
  },
  watch: {
    status() {
      this.autoTriggered = false
      this.$nextTick(() => this.setupObserver())
    },
    auto() {
      this.autoTriggered = false
      this.$nextTick(() => this.setupObserver())
    },
    disabled() {
      this.$nextTick(() => this.setupObserver())
    },
  },
  mounted() {
    this.$nextTick(() => this.setupObserver())
  },
  beforeUnmount() {
    this.disconnectObserver()
  },
  methods: {
    onClick(): void {
      if (this.disabled) return
      if (this.statusKey !== 'more' && this.statusKey !== 'error') return
      this.emitLoad('click')
    },
    emitLoad(source: 'click' | 'auto'): void {
      if (this.disabled) return
      const payload: LingyunLoadMorePayload = { source }
      this.$emit('load', payload)
    },
    setupObserver(): void {
      this.disconnectObserver()
      if (!this.auto || this.disabled || this.statusKey !== 'more') return
      try {
        const observer = uni.createIntersectionObserver(this, {
          thresholds: [0],
        }) as unknown as IntersectionObserverLike
        observer.relativeToViewport({ bottom: 80 }).observe(
          `#${this.rootId}`,
          (result) => {
            if (
              this.autoTriggered ||
              this.disabled ||
              this.statusKey !== 'more'
            ) {
              return
            }
            if ((result.intersectionRatio || 0) > 0) {
              this.autoTriggered = true
              this.emitLoad('auto')
            }
          },
        )
        this.observer = observer
      } catch {
        /* 环境不支持 IntersectionObserver 时保持手动点击 */
      }
    },
    disconnectObserver(): void {
      if (this.observer) {
        try {
          this.observer.disconnect()
        } catch {
          /* ignore */
        }
        this.observer = null
      }
    },
    /** 供宿主手动触发（例如 scroll-view 触底事件） */
    trigger(): void {
      if (this.disabled) return
      if (this.statusKey !== 'more' && this.statusKey !== 'error') return
      this.emitLoad('click')
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-load-more {
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: transparent;
}

.lingyun-load-more--hover {
  opacity: 0.6;
}

.lingyun-load-more__text {
  font-size: 13px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  text-align: center;
}

.lingyun-load-more__text--muted {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-load-more__text--error {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-load-more__line {
  flex: 1;
  height: 0.5px;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}
</style>
