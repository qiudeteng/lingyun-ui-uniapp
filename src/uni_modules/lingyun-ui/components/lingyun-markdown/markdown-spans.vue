<template>
  <text
    class="md-inline"
    :class="rootClass"
    :user-select="selectable"
    :selectable="selectable"
  >
    <template v-for="(span, index) in spans" :key="index">
      <text
        v-if="span.break"
        class="md-break"
        :user-select="selectable"
        :selectable="selectable"
      >{{ span.text }}</text>
      <text
        v-else-if="span.href"
        class="md-link"
        :class="spanClass(span)"
        :user-select="selectable"
        :selectable="selectable"
        @click.stop="onLink(span)"
      >{{ span.text }}</text>
      <text
        v-else
        class="md-text"
        :class="spanClass(span)"
        :user-select="selectable"
        :selectable="selectable"
      >{{ span.text }}</text>
    </template>
  </text>
</template>

<script lang="ts">
import { defineComponent, inject, type PropType } from 'vue'
import { LINGYUN_MARKDOWN_CONTEXT } from './context'
import type { LingyunMarkdownContext } from './context'
import type { LingyunMarkdownSpan } from './types'

const VARIANTS = ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'cell']
const TONES = ['primary', 'secondary', 'tertiary']
const ALIGNS = ['left', 'center', 'right']

/**
 * lingyun-markdown 的行内 span 渲染器（内部组件）。
 * 行内样式在解析阶段拍平成 span，避免小程序嵌套自定义组件丢失继承样式。
 */
export default defineComponent({
  name: 'LingyunMarkdownSpans',
  props: {
    spans: {
      type: Array as PropType<LingyunMarkdownSpan[]>,
      default: () => [],
    },
    variant: { type: String, default: 'body' },
    tone: { type: String, default: 'primary' },
    align: { type: String, default: 'left' },
    emphasis: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
  },
  setup() {
    const markdownContext = inject<LingyunMarkdownContext | null>(
      LINGYUN_MARKDOWN_CONTEXT,
      null,
    )
    return { markdownContext }
  },
  computed: {
    rootClass(): string[] {
      const variant = VARIANTS.indexOf(this.variant) >= 0 ? this.variant : 'body'
      const tone = TONES.indexOf(this.tone) >= 0 ? this.tone : 'primary'
      const align = ALIGNS.indexOf(this.align) >= 0 ? this.align : 'left'
      return [
        `md-inline--${variant}`,
        `md-inline--tone-${tone}`,
        `md-inline--align-${align}`,
        this.emphasis ? 'md-inline--emphasis' : '',
      ]
    },
  },
  methods: {
    spanClass(span: LingyunMarkdownSpan): Record<string, boolean> {
      return {
        'md-bold': !!span.bold,
        'md-italic': !!span.italic,
        'md-strike': !!span.strike,
        'md-code': !!span.code,
      }
    },
    onLink(span: LingyunMarkdownSpan): void {
      if (!span.href) return
      this.markdownContext?.openLink({
        href: span.href,
        title: span.title,
        text: span.text,
      })
    },
  },
})
</script>

<style lang="scss" scoped>
.md-inline {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: var(--ly-md-font-size, 15px);
  line-height: var(--ly-md-line-height, 24px);
  color: var(--lingyun-label, #1c1c1e);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

.md-inline--h1 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
}

.md-inline--h2 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
}

.md-inline--h3 {
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
}

.md-inline--h4 {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}

.md-inline--h5 {
  font-size: 15px;
  line-height: 24px;
  font-weight: 600;
}

.md-inline--h6 {
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
}

.md-inline--cell {
  font-size: 13px;
  line-height: 20px;
}

.md-inline--emphasis {
  font-weight: 600;
}

/* tone 放在字阶之后，引用内的标题也优先使用次级色 */
.md-inline--tone-secondary {
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.md-inline--tone-tertiary {
  color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
}

.md-inline--align-center {
  text-align: center;
}

.md-inline--align-right {
  text-align: right;
}

.md-text {
  color: inherit;
}

.md-bold {
  font-weight: 600;
}

.md-italic {
  font-style: italic;
}

.md-strike {
  text-decoration: line-through;
}

.md-link {
  color: var(--lingyun-system-blue, #0088ff);
  text-decoration: none;
}

.md-code {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: inherit;
  color: var(--lingyun-label, #1c1c1e);
  background-color: var(--lingyun-fill-secondary, rgba(120, 120, 128, 0.12));
}

.md-break {
  white-space: pre;
}
</style>
