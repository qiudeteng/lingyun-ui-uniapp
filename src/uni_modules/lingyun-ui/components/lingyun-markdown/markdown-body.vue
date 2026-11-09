<template>
  <view
    v-for="(row, index) in rows"
    :key="index"
    class="md-row"
    :class="{ 'md-row--quote': row.quoteDepth > 0 }"
    :style="{ paddingLeft: row.indent + 'px' }"
  >
    <text
      v-if="row.marker"
      class="md-row__marker"
      :class="{
        'md-row__marker--task': row.markerTask,
        'md-row__marker--checked': row.markerChecked,
      }"
    >{{ row.marker }}</text>
    <view class="md-row__body">
      <template v-if="!row.empty">
        <view
          v-if="row.block.type === 'paragraph'"
          class="md-p"
          :class="{ 'md-p--compact': row.compact }"
        >
          <template v-for="(segment, segIndex) in row.block.segments" :key="segIndex">
            <markdown-spans
              v-if="segment.type === 'spans'"
              :spans="segment.spans"
              variant="body"
              :tone="row.tone"
              :selectable="selectable"
            />
            <image
              v-else
              class="md-image"
              :src="segment.src"
              mode="widthFix"
              :alt="segment.alt"
              @click="onImage(segment)"
            />
          </template>
        </view>

        <view
          v-else-if="row.block.type === 'heading'"
          class="md-heading"
          :class="[
            `md-heading--${row.block.depth}`,
            { 'md-heading--compact': row.compact },
          ]"
        >
          <markdown-spans
            :spans="row.block.spans"
            :variant="`h${row.block.depth}`"
            :tone="row.tone"
            :selectable="selectable"
          />
        </view>

        <view
          v-else-if="row.block.type === 'code'"
          class="md-code"
          :class="{ 'md-code--compact': row.compact }"
        >
          <view v-if="row.block.lang" class="md-code__header">
            <text class="md-code__lang">{{ row.block.lang }}</text>
          </view>
          <scroll-view scroll-x class="md-code__scroll">
            <view class="md-code__body">
              <text
                v-for="(line, lineIndex) in codeTokenLines(row.block)"
                :key="lineIndex"
                class="md-code__line"
                space="nbsp"
                :user-select="selectable"
                :selectable="selectable"
              >
                <template v-if="line.length">
                  <text
                    v-for="(token, tokenIndex) in line"
                    :key="tokenIndex"
                    class="md-code__token"
                    :class="`md-code__token--${token.type}`"
                    space="nbsp"
                    :user-select="selectable"
                    :selectable="selectable"
                  >{{ displayText(token.text) }}</text>
                </template>
                <text v-else space="nbsp"> </text>
              </text>
            </view>
          </scroll-view>
        </view>

        <scroll-view
          v-else-if="row.block.type === 'table'"
          scroll-x
          class="md-table-scroll"
          :class="{ 'md-table-scroll--compact': row.compact }"
        >
          <view
            class="md-table"
            :class="{ 'md-table--wide': tableWide(row.block) }"
            :style="{ minWidth: tableMinWidth(row.block) }"
          >
            <view class="md-table__row md-table__row--head">
              <view
                v-for="(cell, cellIndex) in row.block.header"
                :key="cellIndex"
                class="md-table__cell"
              >
                <markdown-spans
                  :spans="cell"
                  variant="cell"
                  :tone="row.tone"
                  :align="alignAt(row.block, cellIndex)"
                  emphasis
                  :selectable="selectable"
                />
              </view>
            </view>
            <view
              v-for="(tableRow, rowIndex) in row.block.rows"
              :key="rowIndex"
              class="md-table__row"
            >
              <view
                v-for="(cell, cellIndex) in tableRow"
                :key="cellIndex"
                class="md-table__cell"
              >
                <markdown-spans
                  :spans="cell"
                  variant="cell"
                  :tone="row.tone"
                  :align="alignAt(row.block, cellIndex)"
                  :selectable="selectable"
                />
              </view>
            </view>
          </view>
        </scroll-view>

        <view v-else-if="row.block.type === 'hr'" class="md-hr" />
      </template>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, inject, type PropType } from 'vue'
import MarkdownSpans from './markdown-spans.vue'
import { LINGYUN_MARKDOWN_CONTEXT } from './context'
import type { LingyunMarkdownContext } from './context'
import { highlightCode } from './highlight'
import type { LingyunMarkdownCodeLine } from './highlight'
import type {
  LingyunMarkdownImageSegment,
  LingyunMarkdownLeafBlock,
  LingyunMarkdownRow,
} from './types'

/**
 * lingyun-markdown 的块级渲染器（内部组件）。
 * 列表 / 引用已在解析阶段拍平成带缩进的行，这里不做组件递归，
 * 避免微信小程序不生成递归组件 usingComponents 的问题。
 */
export default defineComponent({
  name: 'LingyunMarkdownBody',
  components: { MarkdownSpans },
  props: {
    rows: {
      type: Array as PropType<LingyunMarkdownRow[]>,
      default: () => [],
    },
    selectable: { type: Boolean, default: false },
    highlight: { type: Boolean, default: true },
  },
  setup() {
    const markdownContext = inject<LingyunMarkdownContext | null>(
      LINGYUN_MARKDOWN_CONTEXT,
      null,
    )
    return { markdownContext }
  },
  methods: {
    /**
     * uni-app H5 的 text 会把 `\n`（反斜杠 + n）当换行转义，
     * 代码块需要按源码显示反斜杠；H5 下加倍，小程序保持原样。
     */
    displayText(value: string): string {
      // #ifdef H5
      return value.replace(/\\/g, '\\\\')
      // #endif
      // #ifndef H5
      return value
      // #endif
    },
    codeTokenLines(block: LingyunMarkdownLeafBlock): LingyunMarkdownCodeLine[] {
      if (block.type !== 'code') return []
      return highlightCode(block.text, block.lang, this.highlight)
    },
    tableColumns(block: LingyunMarkdownLeafBlock): number {
      if (block.type !== 'table') return 0
      return Math.max(
        block.header.length,
        ...block.rows.map((row) => row.length),
      )
    },
    tableWide(block: LingyunMarkdownLeafBlock): boolean {
      return this.tableColumns(block) >= 3
    },
    tableMinWidth(block: LingyunMarkdownLeafBlock): string {
      const columns = this.tableColumns(block)
      return columns >= 3 ? `${columns * 110}px` : '100%'
    },
    alignAt(block: LingyunMarkdownLeafBlock, index: number): string {
      if (block.type !== 'table') return 'left'
      return block.align[index] || 'left'
    },
    onImage(segment: LingyunMarkdownImageSegment): void {
      this.markdownContext?.openImage({
        src: segment.src,
        alt: segment.alt,
        title: segment.title,
        href: segment.href,
      })
    },
  },
})
</script>

<style lang="scss" scoped>
.md-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  box-sizing: border-box;
}

.md-row--quote {
  border-left: 3px solid var(--lingyun-separator-opaque, rgba(60, 60, 67, 0.36));
}

.md-row__marker {
  flex: 0 0 24px;
  width: 24px;
  box-sizing: border-box;
  padding-right: 6px;
  text-align: right;
  font-size: 15px;
  line-height: 24px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.md-row__marker--task {
  font-size: 16px;
}

.md-row__marker--checked {
  color: var(--lingyun-system-blue, #0088ff);
}

.md-row__body {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.md-p {
  margin: 0 0 12px;
}

.md-p--compact {
  margin-bottom: 4px;
}

.md-heading {
  margin: 20px 0 10px;
}

.md-heading--1 {
  margin-top: 24px;
}

.md-heading--compact {
  margin: 8px 0 4px;
}

.md-code {
  margin: 0 0 12px;
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--lingyun-fill-secondary, rgba(120, 120, 128, 0.12));
}

.md-code--compact {
  margin-bottom: 4px;
}

.md-code__header {
  padding: 6px 12px;
  border-bottom: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
}

.md-code__lang {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.md-code__scroll {
  width: 100%;
}

.md-code__body {
  display: inline-block;
  min-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
}

.md-code__line {
  display: block;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 20px;
  white-space: pre;
  color: var(--lingyun-label, #1c1c1e);
}

.md-code__token {
  display: inline;
  white-space: pre;
}

.md-code__token--plain {
  color: var(--lingyun-label, #1c1c1e);
}

.md-code__token--keyword {
  color: var(--ly-md-code-keyword, var(--lingyun-system-purple, #af52de));
}

.md-code__token--string {
  color: var(--ly-md-code-string, var(--lingyun-system-green, #34c759));
}

.md-code__token--number {
  color: var(--ly-md-code-number, var(--lingyun-system-orange, #ff9500));
}

.md-code__token--comment {
  color: var(--ly-md-code-comment, var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6)));
}

.md-code__token--function {
  color: var(--ly-md-code-function, var(--lingyun-system-blue, #0088ff));
}

.md-code__token--tag {
  color: var(--ly-md-code-tag, var(--lingyun-system-pink, #ff2d55));
}

.md-code__token--attr {
  color: var(--ly-md-code-attr, var(--lingyun-system-indigo, #5856d6));
}

.md-code__token--property {
  color: var(--ly-md-code-property, var(--lingyun-system-teal, #30b0c7));
}

.md-code__token--operator {
  color: var(--ly-md-code-operator, var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6)));
}

.md-code__token--punctuation {
  color: var(--ly-md-code-punctuation, var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6)));
}

.md-code__token--boolean {
  color: var(--ly-md-code-boolean, var(--lingyun-system-purple, #af52de));
}

.md-code__token--variable {
  color: var(--ly-md-code-variable, var(--lingyun-system-brown, #a2845e));
}

.md-code__token--meta {
  color: var(--ly-md-code-meta, var(--lingyun-system-pink, #ff2d55));
}

.md-table-scroll {
  width: 100%;
  margin: 0 0 12px;
}

.md-table-scroll--compact {
  margin-bottom: 4px;
}

.md-table {
  display: inline-block;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
  border-radius: 8px;
  background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
}

.md-table__row {
  display: flex;
  flex-direction: row;
}

.md-table__row--head {
  background-color: var(--lingyun-fill-secondary, rgba(120, 120, 128, 0.12));
}

.md-table__cell {
  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
  padding: 8px 10px;
  border-right: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
  border-bottom: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
}

.md-table--wide .md-table__cell {
  min-width: 110px;
}

.md-table__cell:last-child {
  border-right: 0;
}

.md-table__row:last-child .md-table__cell {
  border-bottom: 0;
}

.md-image {
  display: block;
  width: 100%;
  margin: 8px 0 12px;
  border-radius: 10px;
  background-color: var(--lingyun-fill-secondary, rgba(120, 120, 128, 0.12));
}

.md-hr {
  height: 0;
  margin: 16px 0;
  border-top: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
}
</style>
