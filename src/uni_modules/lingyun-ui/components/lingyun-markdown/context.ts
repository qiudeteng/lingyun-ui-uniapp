import type { InjectionKey } from 'vue'
import type {
  LingyunMarkdownImagePayload,
  LingyunMarkdownLinkPayload,
} from './types'

export interface LingyunMarkdownContext {
  openLink: (payload: LingyunMarkdownLinkPayload) => void
  openImage: (payload: LingyunMarkdownImagePayload) => void
}

/** 根组件 provide，递归节点 / 行内 span inject；避免逐层转发事件。 */
export const LINGYUN_MARKDOWN_CONTEXT: InjectionKey<LingyunMarkdownContext> =
  Symbol('LingyunMarkdownContext')
