<template>
  <view class="lingyun-markdown" :style="rootStyle">
    <template v-if="rows.length">
      <markdown-body
        :rows="rows"
        :selectable="selectable"
        :highlight="highlight"
      />
    </template>
    <slot v-else name="empty">
      <text class="lingyun-markdown__empty">{{ emptyText }}</text>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provide, type PropType } from 'vue'
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
defineOptions({
  name: 'LingyunMarkdown',
})

const props = defineProps({
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
  /** 代码块是否启用内置语法高亮 */
  highlight: { type: Boolean, default: true },
})

const emit = defineEmits(['link-click', 'image-click'])

const context: LingyunMarkdownContext = {
  openLink: (payload: LingyunMarkdownLinkPayload) => {
    emit('link-click', payload)
  },
  openImage: (payload: LingyunMarkdownImagePayload) => {
    emit('image-click', payload)
  },
}
provide(LINGYUN_MARKDOWN_CONTEXT, context)

function cssSize(value: number | string, fallback: number): string {
  const size = Number.parseFloat(String(value))
  return Number.isFinite(size) && size > 0 ? `${size}px` : `${fallback}px`
}

const rows = computed((): LingyunMarkdownRow[] => {
  try {
    const blocks = parseLingyunMarkdown(props.content, {
      breaks: props.breaks,
    })
    return flattenLingyunMarkdown(blocks)
  } catch {
    const text = (props.content || '').trim()
    if (!text) return []
    const fallback: LingyunMarkdownBlock[] = [
      {
        type: 'paragraph',
        segments: [{ type: 'spans', spans: [{ text }] }],
      },
    ]
    return flattenLingyunMarkdown(fallback)
  }
})

const rootStyle = computed((): Record<string, string> => {
  return {
    '--ly-md-font-size': cssSize(props.fontSize, 15),
    '--ly-md-line-height': cssSize(props.lineHeight, 24),
  }
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
