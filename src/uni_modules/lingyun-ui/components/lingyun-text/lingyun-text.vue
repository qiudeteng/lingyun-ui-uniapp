<template>
  <text
    class="lingyun-text"
    :class="rootClass"
    :style="rootStyle"
    :user-select="selectable"
    :selectable="selectable"
    @click="onClick"
  >
    <slot>{{ text }}</slot>
  </text>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

/**
 * lingyun-text
 * Apple Text Styles + Labels / 自定义色
 * @see design/TEXTS.md
 */

const TYPE_ALIAS: Record<string, string> = {
  title: 'title3',
  subtitle: 'subheadline',
  caption: 'caption1',
  hint: 'footnote',
}

const TYPE_DEFAULT_COLOR: Record<string, string> = {
  subtitle: 'secondary',
  subheadline: 'secondary',
  caption: 'secondary',
  caption1: 'secondary',
  caption2: 'secondary',
  hint: 'tertiary',
  footnote: 'secondary',
}

const SEMANTIC_COLORS: Record<string, string> = {
  label: 'var(--lingyun-label, #1c1c1e)',
  secondary: 'var(--lingyun-label-secondary, #3c3c43)',
  tertiary: 'var(--lingyun-label-tertiary, #3c3c43)',
  quaternary: 'var(--lingyun-label-quaternary, #3c3c43)',
  primary: 'var(--lingyun-primary, #0088ff)',
  link: 'var(--lingyun-link, #0088ff)',
  success: 'var(--lingyun-success, #34c759)',
  warning: 'var(--lingyun-warning, #ff8d28)',
  error: 'var(--lingyun-error, #ff383c)',
  white: '#ffffff',
  inherit: 'inherit',
}

const VALID_TYPES: string[] = [
  'largeTitle',
  'title1',
  'title2',
  'title3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption1',
  'caption2',
]

export default defineComponent({
  name: 'LingyunText',
  emits: ['click'],
  props: {
    text: { type: String, default: '' },
    /** 字阶或别名 title / subtitle / caption / hint */
    type: { type: String, default: 'body' },
    /** 语义色或任意 CSS 色 */
    color: { type: String, default: '' },
    align: { type: String, default: 'left' },
    /** 0 = 不限制；>0 省略 */
    lines: { type: [Number, String] as PropType<number | string>, default: 0 },
    emphasized: { type: Boolean, default: false },
    bold: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
  },
  computed: {
    resolvedType(): string {
      const raw = (this.type || 'body').trim()
      const mapped = TYPE_ALIAS[raw] || raw
      return VALID_TYPES.indexOf(mapped) >= 0 ? mapped : 'body'
    },
    isEmphasized(): boolean {
      return !!(this.emphasized || this.bold)
    },
    lineClamp(): number {
      const n = Number(this.lines)
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
    },
    resolvedAlign(): string {
      const a = (this.align || 'left').trim()
      if (a === 'center' || a === 'right') return a
      return 'left'
    },
    colorValue(): string {
      const raw = (this.color || '').trim()
      if (raw) {
        const key = raw.toLowerCase()
        if (SEMANTIC_COLORS[key]) return SEMANTIC_COLORS[key]
        return raw
      }
      const def = TYPE_DEFAULT_COLOR[this.type] || TYPE_DEFAULT_COLOR[this.resolvedType]
      if (def && SEMANTIC_COLORS[def]) return SEMANTIC_COLORS[def]
      return SEMANTIC_COLORS.label
    },
    rootClass(): string[] {
      const list = [
        `lingyun-text--${this.resolvedType}`,
        `lingyun-text--align-${this.resolvedAlign}`,
      ]
      if (this.isEmphasized) list.push('lingyun-text--emphasized')
      if (this.block) list.push('lingyun-text--block')
      if (this.lineClamp === 1) list.push('lingyun-text--ellipsis')
      if (this.lineClamp > 1) list.push('lingyun-text--clamp')
      return list
    },
    rootStyle(): { color: string; WebkitLineClamp?: string; lineClamp?: string } {
      const style: { color: string; WebkitLineClamp?: string; lineClamp?: string } = {
        color: this.colorValue,
      }
      if (this.lineClamp > 1) {
        style.WebkitLineClamp = String(this.lineClamp)
        style.lineClamp = String(this.lineClamp)
      }
      return style
    },
  },
  methods: {
    onClick(event: Event) {
      this.$emit('click', event)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-text {
  box-sizing: border-box;
  max-width: 100%;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-text--block {
  display: block;
  width: 100%;
}

.lingyun-text--align-left {
  text-align: left;
}

.lingyun-text--align-center {
  text-align: center;
}

.lingyun-text--align-right {
  text-align: right;
}

.lingyun-text--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  width: 100%;
}

.lingyun-text--clamp {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: normal;
  width: 100%;
}

/* —— Text Styles（iOS Large）—— */

.lingyun-text--largeTitle {
  font-size: 34px;
  line-height: 41px;
  font-weight: 400;
}

.lingyun-text--largeTitle.lingyun-text--emphasized {
  font-weight: 700;
}

.lingyun-text--title1 {
  font-size: 28px;
  line-height: 34px;
  font-weight: 400;
}

.lingyun-text--title1.lingyun-text--emphasized {
  font-weight: 700;
}

.lingyun-text--title2 {
  font-size: 22px;
  line-height: 28px;
  font-weight: 400;
}

.lingyun-text--title2.lingyun-text--emphasized {
  font-weight: 700;
}

.lingyun-text--title3 {
  font-size: 20px;
  line-height: 25px;
  font-weight: 400;
}

.lingyun-text--title3.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--headline {
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
}

.lingyun-text--headline.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--body {
  font-size: 17px;
  line-height: 22px;
  font-weight: 400;
}

.lingyun-text--body.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--callout {
  font-size: 16px;
  line-height: 21px;
  font-weight: 400;
}

.lingyun-text--callout.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--subheadline {
  font-size: 15px;
  line-height: 20px;
  font-weight: 400;
}

.lingyun-text--subheadline.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--footnote {
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
}

.lingyun-text--footnote.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--caption1 {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
}

.lingyun-text--caption1.lingyun-text--emphasized {
  font-weight: 600;
}

.lingyun-text--caption2 {
  font-size: 11px;
  line-height: 13px;
  font-weight: 400;
}

.lingyun-text--caption2.lingyun-text--emphasized {
  font-weight: 600;
}
</style>
