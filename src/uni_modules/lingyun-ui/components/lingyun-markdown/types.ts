/** Markdown 预览的渲染树。解析后模板直接消费，不再保留中间 token。 */

export type LingyunMarkdownAlign = 'left' | 'center' | 'right' | null

export interface LingyunMarkdownSpan {
  text: string
  bold?: boolean
  italic?: boolean
  strike?: boolean
  code?: boolean
  /** 软换行 / <br>，text 为 \n */
  break?: boolean
  href?: string
  title?: string
}

export interface LingyunMarkdownImageSegment {
  type: 'image'
  src: string
  alt: string
  title?: string
  /** 图片被链接包裹时的地址 */
  href?: string
}

export interface LingyunMarkdownSpansSegment {
  type: 'spans'
  spans: LingyunMarkdownSpan[]
}

export type LingyunMarkdownSegment =
  | LingyunMarkdownSpansSegment
  | LingyunMarkdownImageSegment

export interface LingyunMarkdownListItem {
  blocks: LingyunMarkdownBlock[]
  task: boolean
  checked: boolean
}

export type LingyunMarkdownBlock =
  | { type: 'paragraph'; segments: LingyunMarkdownSegment[] }
  | { type: 'heading'; depth: number; spans: LingyunMarkdownSpan[] }
  | { type: 'code'; text: string; lang: string }
  | { type: 'blockquote'; blocks: LingyunMarkdownBlock[] }
  | {
      type: 'list'
      ordered: boolean
      start: number
      items: LingyunMarkdownListItem[]
    }
  | {
      type: 'table'
      align: LingyunMarkdownAlign[]
      header: LingyunMarkdownSpan[][]
      rows: LingyunMarkdownSpan[][][]
    }
  | { type: 'hr' }

/** 拍平后真正渲染的块；列表 / 引用在解析阶段转成缩进行。 */
export type LingyunMarkdownLeafBlock = Extract<
  LingyunMarkdownBlock,
  { type: 'paragraph' | 'heading' | 'code' | 'table' | 'hr' }
>

export interface LingyunMarkdownRow {
  block: LingyunMarkdownLeafBlock
  /** 整行左内边距：列表层级 × 24 + 引用层级 × 14 */
  indent: number
  quoteDepth: number
  tone: 'primary' | 'secondary'
  compact: boolean
  /** 列表项首行标记；普通块为空 */
  marker: string
  markerTask: boolean
  markerChecked: boolean
  /** 空列表项：只画标记 */
  empty: boolean
}

export interface LingyunMarkdownLinkPayload {
  href: string
  title?: string
  text: string
}

export interface LingyunMarkdownImagePayload {
  src: string
  alt: string
  title?: string
  href?: string
}
