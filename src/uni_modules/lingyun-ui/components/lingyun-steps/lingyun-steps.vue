<template>
  <scroll-view
    v-if="horizontal && scrollable"
    class="lingyun-steps__scroll"
    scroll-x
    :show-scrollbar="false"
  >
    <view class="lingyun-steps lingyun-steps--horizontal" :class="rootClass" :style="accentStyle">
      <view
        v-for="(item, index) in normalizedItems"
        :key="item.key"
        class="lingyun-steps__item"
        :class="itemClass(item, index)"
        :hover-class="hoverClass(item)"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onItemClick(item, index)"
      >
        <view
          v-if="index < normalizedItems.length - 1"
          class="lingyun-steps__line lingyun-steps__line--horizontal"
          :class="{ 'lingyun-steps__line--active': lineActive(item, index) }"
        />
        <view class="lingyun-steps__circle">
          <slot
            name="icon"
            :item="item.raw"
            :index="index"
            :status="statusOf(item, index)"
          >
            <lingyun-icon
              v-if="statusOf(item, index) === 'finish'"
              type="checkmarkempty"
              :size="16"
              color="white"
            />
            <lingyun-icon
              v-else-if="statusOf(item, index) === 'error'"
              type="closeempty"
              :size="16"
              color="white"
            />
            <text v-else class="lingyun-steps__number">{{ index + 1 }}</text>
          </slot>
        </view>
        <view class="lingyun-steps__text">
          <text class="lingyun-steps__title">{{ item.title }}</text>
          <text
            v-if="showDescription && item.description"
            class="lingyun-steps__desc"
          >
            {{ item.description }}
          </text>
        </view>
      </view>
    </view>
  </scroll-view>

  <view
    v-else
    class="lingyun-steps"
    :class="[rootClass, horizontal ? 'lingyun-steps--horizontal' : 'lingyun-steps--vertical']"
    :style="accentStyle"
  >
    <view
      v-for="(item, index) in normalizedItems"
      :key="item.key"
      class="lingyun-steps__item"
      :class="itemClass(item, index)"
      :hover-class="hoverClass(item)"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onItemClick(item, index)"
    >
      <view
        v-if="index < normalizedItems.length - 1"
        class="lingyun-steps__line"
        :class="[
          horizontal ? 'lingyun-steps__line--horizontal' : 'lingyun-steps__line--vertical',
          { 'lingyun-steps__line--active': lineActive(item, index) },
        ]"
      />
      <view class="lingyun-steps__circle">
        <slot
          name="icon"
          :item="item.raw"
          :index="index"
          :status="statusOf(item, index)"
        >
          <lingyun-icon
            v-if="statusOf(item, index) === 'finish'"
            type="checkmarkempty"
            :size="16"
            color="white"
          />
          <lingyun-icon
            v-else-if="statusOf(item, index) === 'error'"
            type="closeempty"
            :size="16"
            color="white"
          />
          <text v-else class="lingyun-steps__number">{{ index + 1 }}</text>
        </slot>
      </view>
      <view class="lingyun-steps__text">
        <text class="lingyun-steps__title">{{ item.title }}</text>
        <text
          v-if="showDescription && item.description"
          class="lingyun-steps__desc"
        >
          {{ item.description }}
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunStepItem,
  LingyunStepStatus,
  LingyunStepsDirection,
} from './types'

interface NormalizedStep {
  key: string
  title: string
  description: string
  status?: LingyunStepStatus
  disabled: boolean
  raw: LingyunStepItem
}

const STEP_STATUS: LingyunStepStatus[] = ['wait', 'process', 'finish', 'error']

function isStatus(value: unknown): value is LingyunStepStatus {
  return STEP_STATUS.includes(value as LingyunStepStatus)
}

/**
 * lingyun-steps
 * @description 流程步骤条：横向 / 纵向、完成 / 进行中 / 等待 / 错误、可点击切换
 * @see design/STEPS.md
 */
export default defineComponent({
  name: 'LingyunSteps',
  emits: ['update:modelValue', 'change'],
  props: {
    items: {
      type: Array as PropType<LingyunStepItem[]>,
      default: () => [],
    },
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: '',
    },
    direction: {
      type: String as PropType<LingyunStepsDirection>,
      default: 'horizontal',
    },
    clickable: { type: Boolean, default: false },
    showDescription: { type: Boolean, default: true },
    scrollable: { type: Boolean, default: true },
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
    horizontal(): boolean {
      return this.direction !== 'vertical'
    },
    normalizedItems(): NormalizedStep[] {
      const list = Array.isArray(this.items) ? this.items : []
      return list.map((item, index) => {
        const raw = item as LingyunStepItem
        return {
          key: String(raw?.key ?? index),
          title: String(raw?.title ?? raw?.key ?? ''),
          description: String(raw?.description || ''),
          status: isStatus(raw?.status) ? raw.status : undefined,
          disabled: raw?.disabled === true,
          raw,
        }
      })
    },
    currentIndex(): number {
      const items = this.normalizedItems
      if (!items.length) return -1
      const value = this.modelValue
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.min(items.length - 1, Math.max(0, Math.floor(value)))
      }
      const key = String(value == null ? '' : value)
      if (key) {
        const index = items.findIndex((item) => item.key === key)
        if (index >= 0) return index
      }
      return 0
    },
    accentStyle(): Record<string, string> {
      return {
        '--ly-steps-accent': this.accentColor || 'var(--lingyun-system-blue, #0088ff)',
      }
    },
  },
  methods: {
    statusOf(item: NormalizedStep, index: number): LingyunStepStatus {
      if (item.status) return item.status
      if (index < 0 || index > this.currentIndex) return 'wait'
      if (index === this.currentIndex) return 'process'
      return 'finish'
    },
    itemClass(item: NormalizedStep, index: number): string {
      return [
        `lingyun-steps__item--${this.statusOf(item, index)}`,
        item.disabled ? 'lingyun-steps__item--disabled' : '',
        this.clickable && !item.disabled ? 'lingyun-steps__item--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass(item: NormalizedStep): string {
      return this.clickable && !item.disabled
        ? 'lingyun-steps__item--hover'
        : 'none'
    },
    lineActive(item: NormalizedStep, index: number): boolean {
      return this.statusOf(item, index) === 'finish'
    },
    onItemClick(item: NormalizedStep, index: number): void {
      if (!this.clickable || item.disabled) return
      this.select(index)
    },
    select(value: string | number): void {
      const items = this.normalizedItems
      if (!items.length) return
      let index = -1
      if (typeof value === 'number') {
        index = Math.min(items.length - 1, Math.max(0, Math.floor(value)))
      } else {
        index = items.findIndex((item) => item.key === String(value))
      }
      if (index < 0 || items[index].disabled) return
      const item = items[index]
      if (String(this.modelValue) !== item.key) {
        this.$emit('update:modelValue', item.key)
        this.$emit('change', {
          key: item.key,
          index,
          item: item.raw,
        })
      }
    },
    next(): void {
      if (this.currentIndex < this.normalizedItems.length - 1) {
        this.select(this.currentIndex + 1)
      }
    },
    prev(): void {
      if (this.currentIndex > 0) this.select(this.currentIndex - 1)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-steps {
  box-sizing: border-box;
  width: 100%;
}

.lingyun-steps__scroll {
  width: 100%;
  white-space: nowrap;
}

.lingyun-steps--horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-width: 100%;
}

.lingyun-steps--vertical {
  display: flex;
  flex-direction: column;
}

.lingyun-steps--horizontal .lingyun-steps__item {
  position: relative;
  flex: 1 0 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0 6px 4px;
  box-sizing: border-box;
  text-align: center;
}

.lingyun-steps--vertical .lingyun-steps__item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
}

.lingyun-steps--vertical .lingyun-steps__item:last-child {
  padding-bottom: 0;
}

.lingyun-steps__item--clickable {
  cursor: pointer;
}

.lingyun-steps__item--hover {
  opacity: 0.72;
}

.lingyun-steps__item--disabled {
  opacity: 0.4;
}

.lingyun-steps__circle {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 50%;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-steps__number {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: inherit;
}

.lingyun-steps__item--process .lingyun-steps__circle,
.lingyun-steps__item--finish .lingyun-steps__circle {
  background-color: var(--ly-steps-accent, #{$lingyun-system-blue});
  color: #ffffff;
}

.lingyun-steps__item--error .lingyun-steps__circle {
  background-color: var(--lingyun-error, #{$lingyun-error});
  color: #ffffff;
}

.lingyun-steps__text {
  min-width: 0;
}

.lingyun-steps--horizontal .lingyun-steps__text {
  width: 100%;
  padding-top: 6px;
}

.lingyun-steps--vertical .lingyun-steps__text {
  flex: 1;
  padding-top: 3px;
}

.lingyun-steps__title {
  display: block;
  font-size: 15px;
  line-height: 20px;
  font-weight: 400;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-steps--horizontal .lingyun-steps__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-steps__item--finish .lingyun-steps__title {
  color: var(--lingyun-label, #{$lingyun-label});
  font-weight: 500;
}

.lingyun-steps__item--process .lingyun-steps__title {
  color: var(--lingyun-label, #{$lingyun-label});
  font-weight: 600;
}

.lingyun-steps__item--error .lingyun-steps__title {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-steps__desc {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-steps--horizontal .lingyun-steps__desc {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-steps__line {
  position: absolute;
  z-index: 0;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-steps__line--horizontal {
  left: 50%;
  right: -50%;
  top: 13px;
  height: 2px;
}

.lingyun-steps__line--vertical {
  left: 13px;
  top: 28px;
  bottom: 0;
  width: 2px;
}

.lingyun-steps__line--active {
  background-color: var(--ly-steps-accent, #{$lingyun-system-blue});
}
</style>
