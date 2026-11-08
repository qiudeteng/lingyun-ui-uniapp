<template>
  <view class="lingyun-accordion" :class="rootClass">
    <view
      v-for="(item, index) in normalizedItems"
      :key="item.key"
      class="lingyun-accordion__item"
      :class="{
        'lingyun-accordion__item--open': isOpen(item),
        'lingyun-accordion__item--disabled': item.disabled,
      }"
    >
      <view
        class="lingyun-accordion__header"
        :class="{ 'lingyun-accordion__header--disabled': item.disabled }"
        :hover-class="item.disabled ? 'none' : 'lingyun-accordion__header--hover'"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        :aria-expanded="isOpen(item) ? 'true' : 'false'"
        @click="toggle(item)"
      >
        <view class="lingyun-accordion__titles">
          <text class="lingyun-accordion__title">{{ item.title }}</text>
          <text v-if="item.subtitle" class="lingyun-accordion__subtitle">
            {{ item.subtitle }}
          </text>
        </view>
        <lingyun-icon
          v-if="showArrow"
          class="lingyun-accordion__arrow"
          :class="{ 'lingyun-accordion__arrow--open': isOpen(item) }"
          type="bottom"
          :size="16"
          :color="isOpen(item) ? 'primary' : 'tertiary'"
        />
      </view>

      <view v-if="isOpen(item)" class="lingyun-accordion__content">
        <slot
          name="content"
          :item="item.raw"
          :index="index"
          :open="true"
        >
          <text class="lingyun-accordion__content-text">{{ item.content }}</text>
        </slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunAccordionChangePayload,
  LingyunAccordionItem,
} from './types'

interface NormalizedAccordionItem {
  key: string
  title: string
  subtitle: string
  content: string
  disabled: boolean
  raw: LingyunAccordionItem
}

/**
 * lingyun-accordion
 * @description 折叠分组：单开 / 多开、标题 / 副标题 / 自定义内容
 * @see design/ACCORDION.md
 */
export default defineComponent({
  name: 'LingyunAccordion',
  emits: ['update:modelValue', 'change'],
  props: {
    items: {
      type: Array as PropType<LingyunAccordionItem[]>,
      default: () => [],
    },
    modelValue: {
      type: [String, Array] as PropType<string | string[]>,
      default: '',
    },
    multiple: { type: Boolean, default: false },
    showArrow: { type: Boolean, default: true },
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
    normalizedItems(): NormalizedAccordionItem[] {
      const list = Array.isArray(this.items) ? this.items : []
      return list.map((item, index) => {
        const raw = item as LingyunAccordionItem
        return {
          key: String(raw?.key ?? index),
          title: String(raw?.title ?? raw?.key ?? ''),
          subtitle: String(raw?.subtitle || ''),
          content: String(raw?.content || ''),
          disabled: raw?.disabled === true,
          raw,
        }
      })
    },
    openKeys(): string[] {
      if (this.multiple) {
        if (Array.isArray(this.modelValue)) {
          return this.modelValue.map((key) => String(key))
        }
        return this.modelValue ? [String(this.modelValue)] : []
      }
      if (Array.isArray(this.modelValue)) {
        return this.modelValue.length ? [String(this.modelValue[0])] : []
      }
      return this.modelValue ? [String(this.modelValue)] : []
    },
  },
  methods: {
    isOpen(item: NormalizedAccordionItem): boolean {
      return this.openKeys.includes(item.key)
    },
    toggle(item: NormalizedAccordionItem): void {
      if (item.disabled) return
      const open = !this.isOpen(item)
      const next = this.nextOpenKeys(item.key, open)
      const value = this.multiple ? next : next[0] || ''
      this.$emit('update:modelValue', value)
      const payload: LingyunAccordionChangePayload = {
        key: item.key,
        open,
        openKeys: next,
      }
      this.$emit('change', payload)
    },
    nextOpenKeys(key: string, open: boolean): string[] {
      const current = this.openKeys
      if (this.multiple) {
        if (open) {
          return current.includes(key) ? current : current.concat(key)
        }
        return current.filter((item) => item !== key)
      }
      return open ? [key] : []
    },
    openAll(): void {
      if (!this.multiple) return
      const keys = this.normalizedItems
        .filter((item) => !item.disabled)
        .map((item) => item.key)
      this.$emit('update:modelValue', keys)
      this.$emit('change', { key: '', open: true, openKeys: keys })
    },
    closeAll(): void {
      if (!this.multiple) return
      this.$emit('update:modelValue', [])
      this.$emit('change', { key: '', open: false, openKeys: [] })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-accordion {
  width: 100%;
  box-sizing: border-box;
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-accordion__item {
  position: relative;
}

.lingyun-accordion__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 0;
  bottom: 0;
  height: 0.5px;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-accordion__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 12px 16px;
  box-sizing: border-box;
}

.lingyun-accordion__header--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-accordion__header--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.lingyun-accordion__titles {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lingyun-accordion__title {
  font-size: 17px;
  line-height: 22px;
  font-weight: 400;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-accordion__item--open .lingyun-accordion__title {
  font-weight: 600;
}

.lingyun-accordion__subtitle {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-accordion__arrow {
  flex: 0 0 auto;
  transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-accordion__arrow--open {
  transform: rotate(180deg);
}

.lingyun-accordion__content {
  padding: 0 16px 14px;
}

.lingyun-accordion__content-text {
  display: block;
  font-size: 15px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
