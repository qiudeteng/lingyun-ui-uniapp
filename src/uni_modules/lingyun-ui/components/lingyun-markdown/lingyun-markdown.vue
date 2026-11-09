<template>
  <view class="lingyun-markdown" :style="rootStyle">
    <template v-if="rows.length">
      <markdown-body :rows="rows" :selectable="selectable" />
    </template>
    <slot v-else name="empty">
      <text class="lingyun-markdown__empty">{{ emptyText }}</text>
    </slot>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import MarkdownBody from './markdown-body.vue'
import { LINGYUN_MARKDOWN_CONTEXT } from './context'
import type { LingyunMarkdownContext } from './context'
import { flattenLingyunMarkdown, parseLingyunMarkdown } from './markdown'
import type {
  LingyunMarkdownBlock,
  LingyunMarkdownImagePayload,
  LingyunMarkdownLinkPayload,
  LingyunMarkdownRow,
} from './types'

/**
 * lingyun-markdown
 * Markdown 预览：组件内自研解析器解析为原生渲染树，不使用 v-html / rich-text。
 * @see design/MARKDOWN.md
 */
export default defineComponent({
  name: 'LingyunMarkdown',
  components: { MarkdownBody },
  emits: ['link-click', 'image-click'],
  props: {
    /** Markdown 源文本 */
    content: { type: String, default: '' },
    /** 空内容文案 */
    emptyText: { type: String, default: '暂无内容' },
    /** 正文字号，px */
    fontSize: {
      type: [Number, String] as PropType<number | string>,
      default: 15,
    },
    /** 正文行高，px */
    lineHeight: {
      type: [Number, String] as PropType<number | string>,
      default: 24,
    },
    /** 单个换行是否当 <br>；默认按 Markdown 规则折叠为空格 */
    breaks: { type: Boolean, default: false },
    /** 是否允许长按选择文本 */
    selectable: { type: Boolean, default: false },
  },
  provide() {
    const context: LingyunMarkdownContext = {
      openLink: (payload: LingyunMarkdownLinkPayload) => {
        this.$emit('link-click', payload)
      },
      openImage: (payload: LingyunMarkdownImagePayload) => {
        this.$emit('image-click', payload)
      },
    }
    return {
      [LINGYUN_MARKDOWN_CONTEXT]: context,
    }
  },
  computed: {
    rows(): LingyunMarkdownRow[] {
      try {
        const blocks = parseLingyunMarkdown(this.content, {
          breaks: this.breaks,
        })
        return flattenLingyunMarkdown(blocks)
      } catch {
        const text = (this.content || '').trim()
        if (!text) return []
        const fallback: LingyunMarkdownBlock[] = [
          {
            type: 'paragraph',
            segments: [{ type: 'spans', spans: [{ text }] }],
          },
        ]
        return flattenLingyunMarkdown(fallback)
      }
    },
    rootStyle(): Record<string, string> {
      return {
        '--ly-md-font-size': this.cssSize(this.fontSize, 15),
        '--ly-md-line-height': this.cssSize(this.lineHeight, 24),
      }
    },
  },
  methods: {
    cssSize(value: number | string, fallback: number): string {
      const size = Number.parseFloat(String(value))
      return Number.isFinite(size) && size > 0 ? `${size}px` : `${fallback}px`
    },
  },
})
</script>

<style lang="scss" scoped>
.lingyun-markdown {
  display: block;
  width: 100%;
  box-sizing: border-box;
  color: var(--lingyun-label, #1c1c1e);
  font-size: var(--ly-md-font-size, 15px);
  line-height: var(--ly-md-line-height, 24px);
}

.lingyun-markdown__empty {
  display: block;
  padding: 16px 0;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
}
</style>
