<template>
  <view class="lingyun-timeline" :class="rootClass" :style="accentStyle">
    <view
      v-for="(item, index) in normalizedItems"
      :key="item.key"
      class="lingyun-timeline__item"
      :class="itemClass(item)"
      :style="itemStyle(item)"
      :hover-class="hoverClass()"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onItemClick(item, index)"
    >
      <view class="lingyun-timeline__rail">
        <view
          v-if="index < normalizedItems.length - 1"
          class="lingyun-timeline__line"
        />
        <view class="lingyun-timeline__dot">
          <slot
            name="icon"
            :item="item.raw"
            :index="index"
            :status="statusOf(item)"
          >
            <lingyun-icon
              v-if="item.icon"
              :type="item.icon"
              :size="14"
              color="white"
            />
            <view v-else class="lingyun-timeline__dot-core" />
          </slot>
        </view>
      </view>

      <view class="lingyun-timeline__content">
        <text v-if="item.time" class="lingyun-timeline__time">{{ item.time }}</text>
        <text class="lingyun-timeline__title">{{ item.title }}</text>
        <text v-if="item.description" class="lingyun-timeline__desc">
          {{ item.description }}
        </text>
        <slot name="extra" :item="item.raw" :index="index" />
      </view>
    </view>

    <view v-if="!normalizedItems.length" class="lingyun-timeline__empty">
      <slot name="empty">{{ emptyText }}</slot>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunTimelineItem,
  LingyunTimelineStatus,
} from './types'

interface NormalizedTimelineItem {
  key: string
  title: string
  description: string
  time: string
  icon: string
  color: string
  status: LingyunTimelineStatus
  raw: LingyunTimelineItem
}

const TIMELINE_STATUS: LingyunTimelineStatus[] = [
  'default',
  'active',
  'success',
  'warning',
  'error',
]

function isStatus(value: unknown): value is LingyunTimelineStatus {
  return TIMELINE_STATUS.includes(value as LingyunTimelineStatus)
}

/**
 * lingyun-timeline
 * @description 纵向时间线 / 操作轨迹：时间、标题、说明、状态与图标
 * @see design/TIMELINE.md
 */
export default defineComponent({
  name: 'LingyunTimeline',
  emits: ['item-click'],
  props: {
    items: {
      type: Array as PropType<LingyunTimelineItem[]>,
      default: () => [],
    },
    clickable: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无记录' },
    accentColor: { type: String, default: '' },
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
    normalizedItems(): NormalizedTimelineItem[] {
      const list = Array.isArray(this.items) ? this.items : []
      return list.map((item, index) => {
        const raw = item as LingyunTimelineItem
        return {
          key: String(raw?.key ?? index),
          title: String(raw?.title ?? raw?.key ?? ''),
          description: String(raw?.description || ''),
          time: String(raw?.time || ''),
          icon: String(raw?.icon || ''),
          color: String(raw?.color || ''),
          status: isStatus(raw?.status) ? raw.status : 'default',
          raw,
        }
      })
    },
    accentStyle(): Record<string, string> {
      return {
        '--ly-timeline-accent': this.accentColor || 'var(--lingyun-system-blue, #0088ff)',
      }
    },
  },
  methods: {
    statusOf(item: NormalizedTimelineItem): LingyunTimelineStatus {
      return item.status
    },
    itemClass(item: NormalizedTimelineItem): string {
      return [
        `lingyun-timeline__item--${item.status}`,
        item.icon ? 'lingyun-timeline__item--with-icon' : '',
        this.clickable ? 'lingyun-timeline__item--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass(): string {
      return this.clickable ? 'lingyun-timeline__item--hover' : 'none'
    },
    itemStyle(item: NormalizedTimelineItem): Record<string, string> {
      return item.color ? { '--ly-timeline-color': item.color } : {}
    },
    onItemClick(item: NormalizedTimelineItem, index: number): void {
      if (!this.clickable) return
      this.$emit('item-click', {
        key: item.key,
        index,
        item: item.raw,
      })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-timeline {
  box-sizing: border-box;
  width: 100%;
}

.lingyun-timeline__item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 20px;
}

.lingyun-timeline__item:last-child {
  padding-bottom: 0;
}

.lingyun-timeline__item--clickable {
  cursor: pointer;
}

.lingyun-timeline__item--hover {
  opacity: 0.72;
}

.lingyun-timeline__rail {
  position: relative;
  flex: 0 0 24px;
  width: 24px;
  align-self: stretch;
  display: flex;
  justify-content: center;
}

.lingyun-timeline__line {
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-timeline__dot {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-timeline__dot-core {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--ly-timeline-color, var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary}));
}

.lingyun-timeline__item--active .lingyun-timeline__dot-core {
  background-color: var(--ly-timeline-color, var(--ly-timeline-accent, #{$lingyun-system-blue}));
}

.lingyun-timeline__item--success .lingyun-timeline__dot-core {
  background-color: var(--ly-timeline-color, var(--lingyun-success, #{$lingyun-system-green}));
}

.lingyun-timeline__item--warning .lingyun-timeline__dot-core {
  background-color: var(--ly-timeline-color, var(--lingyun-warning, #{$lingyun-system-orange}));
}

.lingyun-timeline__item--error .lingyun-timeline__dot-core {
  background-color: var(--ly-timeline-color, var(--lingyun-error, #{$lingyun-error}));
}

.lingyun-timeline__item--with-icon .lingyun-timeline__dot {
  background-color: var(--ly-timeline-color, var(--lingyun-fill-secondary, #{$lingyun-fill-secondary}));
}

.lingyun-timeline__item--with-icon.lingyun-timeline__item--active .lingyun-timeline__dot {
  background-color: var(--ly-timeline-color, var(--ly-timeline-accent, #{$lingyun-system-blue}));
}

.lingyun-timeline__item--with-icon.lingyun-timeline__item--success .lingyun-timeline__dot {
  background-color: var(--ly-timeline-color, var(--lingyun-success, #{$lingyun-system-green}));
}

.lingyun-timeline__item--with-icon.lingyun-timeline__item--warning .lingyun-timeline__dot {
  background-color: var(--ly-timeline-color, var(--lingyun-warning, #{$lingyun-system-orange}));
}

.lingyun-timeline__item--with-icon.lingyun-timeline__item--error .lingyun-timeline__dot {
  background-color: var(--ly-timeline-color, var(--lingyun-error, #{$lingyun-error}));
}

.lingyun-timeline__content {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.lingyun-timeline__time {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-timeline__title {
  display: block;
  font-size: 15px;
  line-height: 20px;
  font-weight: 500;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-timeline__item--active .lingyun-timeline__title {
  font-weight: 600;
}

.lingyun-timeline__item--error .lingyun-timeline__title {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-timeline__desc {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  word-break: break-word;
}

.lingyun-timeline__empty {
  padding: 24px 0;
  text-align: center;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}
</style>
