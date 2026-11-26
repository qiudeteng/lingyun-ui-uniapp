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

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
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
defineOptions({
  name: 'LingyunLoadMore',
})

const props = defineProps({
  status: { type: String, default: 'more' },
  moreText: { type: String, default: '加载更多' },
  loadingText: { type: String, default: '加载中…' },
  noMoreText: { type: String, default: '没有更多了' },
  errorText: { type: String, default: '加载失败，点击重试' },
  showEndLine: { type: Boolean, default: true },
  auto: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  minHeight: { type: Number, default: 48 },
})

const emit = defineEmits(['load'])

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('loadMore'))
const observerRef = ref<IntersectionObserverLike | null>(null)
const autoTriggered = ref(false)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})

const rootId = computed((): string => {
  return `lingyun-load-more-${uid.value}`
})

const statusKey = computed((): LingyunLoadMoreStatus => {
  return isStatus(props.status) ? props.status : 'more'
})

const resolvedMinHeight = computed((): number => {
  const value = Number(props.minHeight)
  return Number.isFinite(value) && value > 0 ? value : 48
})

const hoverClass = computed((): string => {
  if (props.disabled) return 'none'
  return statusKey.value === 'more' || statusKey.value === 'error'
    ? 'lingyun-load-more--hover'
    : 'none'
})

function disconnectObserver(): void {
  if (observerRef.value) {
    try {
      observerRef.value.disconnect()
    } catch {
      /* ignore */
    }
    observerRef.value = null
  }
}

function emitLoad(source: 'click' | 'auto'): void {
  if (props.disabled) return
  const payload: LingyunLoadMorePayload = { source }
  emit('load', payload)
}

function onClick(): void {
  if (props.disabled) return
  if (statusKey.value !== 'more' && statusKey.value !== 'error') return
  emitLoad('click')
}

function setupObserver(): void {
  disconnectObserver()
  if (!props.auto || props.disabled || statusKey.value !== 'more') return
  try {
    const observer = uni.createIntersectionObserver(instance?.proxy as never, {
      thresholds: [0],
    }) as unknown as IntersectionObserverLike
    observer.relativeToViewport({ bottom: 80 }).observe(
      `#${rootId.value}`,
      (result) => {
        if (
          autoTriggered.value ||
          props.disabled ||
          statusKey.value !== 'more'
        ) {
          return
        }
        if ((result.intersectionRatio || 0) > 0) {
          autoTriggered.value = true
          emitLoad('auto')
        }
      },
    )
    observerRef.value = observer
  } catch {
    /* 环境不支持 IntersectionObserver 时保持手动点击 */
  }
}

/** 供宿主手动触发（例如 scroll-view 触底事件） */
function trigger(): void {
  if (props.disabled) return
  if (statusKey.value !== 'more' && statusKey.value !== 'error') return
  emitLoad('click')
}

watch(
  () => props.status,
  () => {
    autoTriggered.value = false
    nextTick(() => setupObserver())
  },
)

watch(
  () => props.auto,
  () => {
    autoTriggered.value = false
    nextTick(() => setupObserver())
  },
)

watch(
  () => props.disabled,
  () => {
    nextTick(() => setupObserver())
  },
)

onMounted(() => {
  nextTick(() => setupObserver())
})

onBeforeUnmount(() => {
  disconnectObserver()
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
