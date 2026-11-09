import type {
  LingyunMarkdownAlign,
  LingyunMarkdownBlock,
  LingyunMarkdownImageSegment,
  LingyunMarkdownLeafBlock,
  LingyunMarkdownListItem,
  LingyunMarkdownRow,
  LingyunMarkdownSegment,
  LingyunMarkdownSpan,
} from './types'

export interface LingyunMarkdownParseOptions {
  breaks?: boolean
}

const SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i
const BR_RE = /^<br\s*\/?>$/i
const ESCAPABLE = /[\\`*_{}\[\]()#+\-.!>~|]/

interface SpanState {
  bold?: boolean
  italic?: boolean
  strike?: boolean
  code?: boolean
  href?: string
  title?: string
}

interface InlineHandlers {
  span: (span: LingyunMarkdownSpan) => void
  image: (image: LingyunMarkdownImageSegment) => void
}

interface ParsedLink {
  label: string
  dest: string
  title?: string
  end: number
}

interface DelimiterMatch {
  inner: string
  next: number
}

interface ListMarker {
  indent: number
  marker: string
  ordered: boolean
  number: number
  content: string
  contentIndent: number
}

interface FenceStart {
  char: string
  length: number
  info: string
}

/* -------------------------------------------------------------------------- */
/* 基础工具                                                                   */
/* -------------------------------------------------------------------------- */

function sanitizeLink(href: string): string {
  const value = (href || '').trim()
  if (!value) return ''
  const match = SCHEME_RE.exec(value)
  if (!match) return value
  const scheme = match[1].toLowerCase()
  if (
    scheme === 'http' ||
    scheme === 'https' ||
    scheme === 'mailto' ||
    scheme === 'tel'
  ) {
    return value
  }
  return ''
}

function sanitizeImage(src: string): string {
  const value = (src || '').trim()
  if (!value) return ''
  if (/^data:image\//i.test(value)) return value
  const match = SCHEME_RE.exec(value)
  if (!match) return value
  const scheme = match[1].toLowerCase()
  if (scheme === 'http' || scheme === 'https') return value
  return ''
}

function normalizeText(text: string, breaks: boolean): string {
  const value = (text || '').replace(/\r\n?/g, '\n')
  return breaks ? value : value.replace(/\n/g, ' ')
}

function unescapeText(value: string): string {
  return value.replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, '$1')
}

function countIndent(line: string): number {
  let count = 0
  while (count < line.length && line[count] === ' ') count += 1
  return count
}

function stripIndent(line: string, count: number): string {
  let index = 0
  while (index < count && index < line.length && line[index] === ' ') {
    index += 1
  }
  return line.slice(index)
}

function isBlank(line: string): boolean {
  return /^\s*$/.test(line)
}

function countRun(text: string, start: number, char: string): number {
  let index = start
  while (index < text.length && text[index] === char) index += 1
  return index - start
}

function findRun(
  text: string,
  start: number,
  char: string,
  length: number,
): number {
  let index = start
  while (index < text.length) {
    if (text[index] === '\\') {
      index += 2
      continue
    }
    if (text[index] === char) {
      const run = countRun(text, index, char)
      if (run === length) return index
      index += run
      continue
    }
    index += 1
  }
  return -1
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/* -------------------------------------------------------------------------- */
/* 行内解析                                                                   */
/* -------------------------------------------------------------------------- */

function plainInlineText(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim()
}

/** 跳过代码 / 图片 / 链接 / 转义等原子片段，返回下一个位置；不是原子返回 -1。 */
function skipAtomic(text: string, index: number): number {
  if (index >= text.length) return -1
  if (text[index] === '\\') return Math.min(text.length, index + 2)
  if (text[index] === '`') {
    const run = countRun(text, index, '`')
    const close = findRun(text, index + run, '`', run)
    return close >= 0 ? close + run : index + run
  }
  if (text[index] === '[' || (text[index] === '!' && text[index + 1] === '[')) {
    const link = parseLinkOrImage(
      text,
      text[index] === '!' ? index + 1 : index,
    )
    if (link) return link.end
  }
  return -1
}

function parseLinkOrImage(text: string, start: number): ParsedLink | null {
  if (text[start] !== '[') return null
  let index = start + 1
  let depth = 0
  let labelEnd = -1
  while (index < text.length) {
    const char = text[index]
    if (char === '\\') {
      index += 2
      continue
    }
    if (char === '`') {
      const run = countRun(text, index, '`')
      const close = findRun(text, index + run, '`', run)
      if (close >= 0) {
        index = close + run
        continue
      }
      index += run
      continue
    }
    if (char === '[') {
      depth += 1
      index += 1
      continue
    }
    if (char === ']') {
      if (depth === 0) {
        labelEnd = index
        break
      }
      depth -= 1
    }
    index += 1
  }
  if (labelEnd < 0) return null

  index = labelEnd + 1
  while (index < text.length && /\s/.test(text[index])) index += 1
  if (text[index] !== '(') return null
  index += 1
  while (index < text.length && /\s/.test(text[index])) index += 1

  let dest = ''
  if (text[index] === '<') {
    index += 1
    const destStart = index
    while (index < text.length && text[index] !== '>') {
      if (text[index] === '\\') index += 2
      else index += 1
    }
    if (text[index] !== '>') return null
    dest = text.slice(destStart, index)
    index += 1
  } else {
    const destStart = index
    let parens = 0
    while (index < text.length) {
      const char = text[index]
      if (char === '\\') {
        index += 2
        continue
      }
      if (char === '(') {
        parens += 1
        index += 1
        continue
      }
      if (char === ')') {
        if (parens === 0) break
        parens -= 1
        index += 1
        continue
      }
      if (/\s/.test(char)) break
      index += 1
    }
    dest = text.slice(destStart, index)
  }

  while (index < text.length && /\s/.test(text[index])) index += 1

  let title: string | undefined
  const quote = text[index]
  if (quote === '"' || quote === "'" || quote === '(') {
    const closeChar = quote === '(' ? ')' : quote
    index += 1
    const titleStart = index
    while (index < text.length && text[index] !== closeChar) {
      if (text[index] === '\\') index += 2
      else index += 1
    }
    if (text[index] !== closeChar) return null
    title = text.slice(titleStart, index)
    index += 1
    while (index < text.length && /\s/.test(text[index])) index += 1
  }

  if (text[index] !== ')') return null
  return {
    label: text.slice(start + 1, labelEnd),
    dest: unescapeText(dest.trim()),
    title: title !== undefined ? unescapeText(title.trim()) : undefined,
    end: index + 1,
  }
}

function hasEvenOddRuns(text: string, char: string): boolean {
  let odd = 0
  let index = 0
  while (index < text.length) {
    const atomic = skipAtomic(text, index)
    if (atomic > index) {
      index = atomic
      continue
    }
    if (text[index] === char) {
      const run = countRun(text, index, char)
      if (run % 2 === 1) odd += 1
      index += run
      continue
    }
    index += 1
  }
  return odd % 2 === 0
}

function matchStrong(
  text: string,
  index: number,
  char: string,
  underscore: boolean,
): DelimiterMatch | null {
  if (!text.startsWith(char + char, index)) return null
  const contentStart = index + 2
  if (contentStart >= text.length) return null
  if (/\s/.test(text[contentStart])) return null
  if (underscore) {
    const prev = text[index - 1]
    if (prev && /[A-Za-z0-9]/.test(prev)) return null
  }

  let cursor = contentStart
  while (cursor < text.length) {
    const atomic = skipAtomic(text, cursor)
    if (atomic > cursor) {
      cursor = atomic
      continue
    }
    if (text[cursor] !== char) {
      cursor += 1
      continue
    }
    const run = countRun(text, cursor, char)
    if (run < 2) {
      cursor += run
      continue
    }
    const candidates = [cursor, cursor + run - 2]
    for (let c = 0; c < candidates.length; c += 1) {
      const candidate = candidates[c]
      if (candidate <= contentStart) continue
      if (c > 0 && candidate === candidates[c - 1]) continue
      const before = text[candidate - 1]
      if (!before || /\s/.test(before)) continue
      if (
        underscore &&
        /[A-Za-z0-9]/.test(text[candidate + 2] || '')
      ) {
        continue
      }
      const inner = text.slice(contentStart, candidate)
      if (!inner.trim()) continue
      if (!hasEvenOddRuns(inner, char)) continue
      return { inner, next: candidate + 2 }
    }
    cursor += run
  }
  return null
}

function matchEm(
  text: string,
  index: number,
  char: string,
  underscore: boolean,
): DelimiterMatch | null {
  const contentStart = index + 1
  if (contentStart >= text.length) return null
  if (/\s/.test(text[contentStart])) return null
  if (underscore) {
    const prev = text[index - 1]
    if (prev && /[A-Za-z0-9]/.test(prev)) return null
  }

  let cursor = contentStart
  while (cursor < text.length) {
    const atomic = skipAtomic(text, cursor)
    if (atomic > cursor) {
      cursor = atomic
      continue
    }
    if (text[cursor] !== char) {
      cursor += 1
      continue
    }
    const run = countRun(text, cursor, char)
    if (run % 2 === 0) {
      cursor += run
      continue
    }
    const candidate = cursor + run - 1
    const beforeRun = text[cursor - 1]
    if (!beforeRun || /\s/.test(beforeRun)) {
      cursor += run
      continue
    }
    if (
      underscore &&
      /[A-Za-z0-9]/.test(text[candidate + 1] || '')
    ) {
      cursor += run
      continue
    }
    const inner = text.slice(contentStart, candidate)
    if (!inner.trim() || !hasEvenOddRuns(inner, char)) {
      cursor += run
      continue
    }
    return { inner, next: candidate + 1 }
  }
  return null
}

function matchStrike(text: string, index: number): DelimiterMatch | null {
  if (!text.startsWith('~~', index)) return null
  const contentStart = index + 2
  if (contentStart >= text.length) return null
  if (/\s/.test(text[contentStart])) return null

  let cursor = contentStart
  while (cursor < text.length) {
    const atomic = skipAtomic(text, cursor)
    if (atomic > cursor) {
      cursor = atomic
      continue
    }
    if (text.startsWith('~~', cursor)) {
      const before = text[cursor - 1]
      if (before && !/\s/.test(before)) {
        return {
          inner: text.slice(contentStart, cursor),
          next: cursor + 2,
        }
      }
    }
    cursor += 1
  }
  return null
}

function walkInline(
  text: string,
  state: SpanState,
  handlers: InlineHandlers,
  breaks: boolean,
): void {
  let index = 0
  let buffer = ''
  const flush = (): void => {
    if (!buffer) return
    handlers.span({ ...state, text: normalizeText(buffer, breaks) })
    buffer = ''
  }

  while (index < text.length) {
    const char = text[index]

    if (char === '\\' && index + 1 < text.length && ESCAPABLE.test(text[index + 1])) {
      buffer += text[index + 1]
      index += 2
      continue
    }

    if (char === '`') {
      const run = countRun(text, index, '`')
      const close = findRun(text, index + run, '`', run)
      if (close >= 0) {
        flush()
        let content = text.slice(index + run, close).replace(/\n/g, ' ')
        if (
          content.length > 1 &&
          content.startsWith(' ') &&
          content.endsWith(' ') &&
          content.trim()
        ) {
          content = content.slice(1, -1)
        }
        handlers.span({ ...state, text: content, code: true })
        index = close + run
        continue
      }
      buffer += text.slice(index, index + run)
      index += run
      continue
    }

    if (char === '!' && text[index + 1] === '[') {
      const parsed = parseLinkOrImage(text, index + 1)
      if (parsed) {
        const src = sanitizeImage(parsed.dest)
        if (src) {
          flush()
          handlers.image({
            type: 'image',
            src,
            alt: plainInlineText(parsed.label),
            title: parsed.title,
            href: state.href,
          })
        } else {
          buffer += plainInlineText(parsed.label)
        }
        index = parsed.end
        continue
      }
    }

    if (char === '[') {
      const parsed = parseLinkOrImage(text, index)
      if (parsed) {
        const href = sanitizeLink(parsed.dest)
        flush()
        walkInline(
          parsed.label,
          href ? { ...state, href, title: parsed.title } : state,
          handlers,
          breaks,
        )
        index = parsed.end
        continue
      }
    }

    if (char === '<') {
      const rest = text.slice(index)
      const br = /^<br\s*\/?>/i.exec(rest)
      if (br) {
        flush()
        handlers.span({ ...state, text: '\n', break: true })
        index += br[0].length
        continue
      }
      const auto = /^<((?:https?:\/\/|mailto:|tel:)[^>\s]+)>/i.exec(rest)
      if (auto) {
        flush()
        const href = sanitizeLink(auto[1])
        if (href) {
          walkInline(auto[1], { ...state, href }, handlers, breaks)
        } else {
          buffer += auto[1]
        }
        index += auto[0].length
        continue
      }
      const tag = /^<\/?[a-z][^>]*>/i.exec(rest)
      if (tag) {
        index += tag[0].length
        continue
      }
    }

    if (char === '*' || char === '_') {
      const run = countRun(text, index, char)
      if (run >= 2) {
        const strong = matchStrong(text, index, char, char === '_')
        if (strong) {
          flush()
          walkInline(strong.inner, { ...state, bold: true }, handlers, breaks)
          index = strong.next
          continue
        }
      } else {
        const em = matchEm(text, index, char, char === '_')
        if (em) {
          flush()
          walkInline(em.inner, { ...state, italic: true }, handlers, breaks)
          index = em.next
          continue
        }
      }
      buffer += text.slice(index, index + run)
      index += run
      continue
    }

    if (char === '~' && text.startsWith('~~', index)) {
      const strike = matchStrike(text, index)
      if (strike) {
        flush()
        walkInline(strike.inner, { ...state, strike: true }, handlers, breaks)
        index = strike.next
        continue
      }
    }

    buffer += char
    index += 1
  }
  flush()
}

function spanStyleKey(span: LingyunMarkdownSpan): string {
  return [
    span.bold ? 'b' : '',
    span.italic ? 'i' : '',
    span.strike ? 's' : '',
    span.code ? 'c' : '',
    span.href || '',
    span.title || '',
    span.break ? 'br' : '',
  ].join('|')
}

function mergeSpans(spans: LingyunMarkdownSpan[]): LingyunMarkdownSpan[] {
  const merged: LingyunMarkdownSpan[] = []
  spans.forEach((span) => {
    if (!span.text && !span.break) return
    const last = merged[merged.length - 1]
    if (
      last &&
      !last.break &&
      !span.break &&
      spanStyleKey(last) === spanStyleKey(span)
    ) {
      last.text += span.text
      return
    }
    merged.push({ ...span })
  })
  return merged
}

function inlineSpans(text: string, breaks: boolean): LingyunMarkdownSpan[] {
  const spans: LingyunMarkdownSpan[] = []
  walkInline(
    text,
    {},
    {
      span: (span) => spans.push(span),
      image: (image) =>
        spans.push({
          text: image.alt || '图片',
          href: image.href,
          title: image.title,
        }),
    },
    breaks,
  )
  return mergeSpans(spans)
}

function inlineSegments(text: string, breaks: boolean): LingyunMarkdownSegment[] {
  const segments: LingyunMarkdownSegment[] = []
  let spans: LingyunMarkdownSpan[] = []
  const flush = (): void => {
    const merged = mergeSpans(spans)
    if (merged.length) segments.push({ type: 'spans', spans: merged })
    spans = []
  }
  walkInline(
    text,
    {},
    {
      span: (span) => spans.push(span),
      image: (image) => {
        flush()
        segments.push(image)
      },
    },
    breaks,
  )
  flush()
  return segments
}

/* -------------------------------------------------------------------------- */
/* 块级解析                                                                   */
/* -------------------------------------------------------------------------- */

function matchFenceStart(line: string): FenceStart | null {
  const match = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line)
  if (!match) return null
  const marker = match[1]
  const info = match[2].trim()
  if (marker[0] === '`' && info.includes('`')) return null
  return { char: marker[0], length: marker.length, info }
}

function isFenceClose(line: string, fence: FenceStart): boolean {
  const pattern = new RegExp(
    `^\\s{0,3}${escapeRegExp(fence.char)}{${fence.length},}\\s*$`,
  )
  return pattern.test(line)
}

function matchHeading(line: string): { depth: number; text: string } | null {
  const match = /^\s{0,3}(#{1,6})\s+(.*)$/.exec(line)
  if (!match) return null
  const text = match[2].replace(/\s+#+\s*$/, '').replace(/\s+$/, '')
  return { depth: match[1].length, text }
}

function isHr(line: string): boolean {
  return /^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(
    line,
  )
}

function isBlockquote(line: string): boolean {
  return /^\s{0,3}>/.test(line)
}

function matchListMarker(line: string): ListMarker | null {
  const match = /^(\s*)([-+*]|\d{1,9}[.)])(?:(\s+)(.*))?$/.exec(line)
  if (!match) return null
  const indent = match[1].length
  const marker = match[2]
  const ordered = /^\d/.test(marker)
  const spaces = match[3] ? match[3].length : 0
  return {
    indent,
    marker,
    ordered,
    number: ordered ? Number.parseInt(marker, 10) : 1,
    content: match[4] || '',
    contentIndent: indent + marker.length + Math.max(spaces, 1),
  }
}

function splitTableCells(line: string): string[] {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|') && !value.endsWith('\\|')) {
    value = value.slice(0, -1)
  }
  const cells: string[] = []
  let current = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char === '\\' && value[index + 1] === '|') {
      current += '|'
      index += 1
      continue
    }
    if (char === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

function isTableStart(lines: string[], index: number): boolean {
  const header = lines[index]
  const delimiter = lines[index + 1]
  if (!header || !delimiter || !header.includes('|')) return false
  const headerCells = splitTableCells(header)
  const delimiterCells = splitTableCells(delimiter)
  if (
    !headerCells.length ||
    headerCells.length !== delimiterCells.length
  ) {
    return false
  }
  return delimiterCells.every((cell) =>
    /^:?-{3,}:?$/.test(cell.trim()),
  )
}

function isBlockStarter(lines: string[], index: number): boolean {
  const line = lines[index]
  if (isBlank(line)) return true
  if (countIndent(line) >= 4) return true
  return (
    !!matchFenceStart(line) ||
    !!matchHeading(line) ||
    isHr(line) ||
    isBlockquote(line) ||
    !!matchListMarker(line) ||
    isTableStart(lines, index)
  )
}

function parseFence(
  lines: string[],
  start: number,
  fence: FenceStart,
  breaks: boolean,
): { block: LingyunMarkdownLeafBlock; next: number } {
  const content: string[] = []
  let index = start + 1
  while (index < lines.length) {
    if (isFenceClose(lines[index], fence)) {
      index += 1
      break
    }
    content.push(lines[index])
    index += 1
  }
  const lang = (fence.info || '').split(/\s+/)[0] || ''
  return {
    block: { type: 'code', text: content.join('\n'), lang },
    next: index,
  }
}

function parseIndentedCode(
  lines: string[],
  start: number,
): { block: LingyunMarkdownLeafBlock; next: number } {
  const content: string[] = []
  let index = start
  while (index < lines.length) {
    const line = lines[index]
    if (isBlank(line)) {
      content.push('')
      index += 1
      continue
    }
    if (countIndent(line) < 4) break
    content.push(stripIndent(line, 4))
    index += 1
  }
  while (content.length && content[content.length - 1] === '') {
    content.pop()
  }
  return {
    block: { type: 'code', text: content.join('\n'), lang: '' },
    next: index,
  }
}

function parseBlockquote(
  lines: string[],
  start: number,
  breaks: boolean,
): { block: LingyunMarkdownBlock; next: number } {
  const content: string[] = []
  let index = start
  while (index < lines.length) {
    const match = /^\s{0,3}>\s?(.*)$/.exec(lines[index])
    if (!match) break
    content.push(match[1])
    index += 1
  }
  return {
    block: {
      type: 'blockquote',
      blocks: parseBlocks(content, breaks),
    },
    next: index,
  }
}

function parseTable(
  lines: string[],
  start: number,
  breaks: boolean,
): { block: LingyunMarkdownLeafBlock; next: number } {
  const headerCells = splitTableCells(lines[start])
  const delimiterCells = splitTableCells(lines[start + 1])
  const align: LingyunMarkdownAlign[] = delimiterCells.map((cell) => {
    const value = cell.trim()
    const left = value.startsWith(':')
    const right = value.endsWith(':')
    if (left && right) return 'center'
    if (right) return 'right'
    if (left) return 'left'
    return null
  })

  const normalize = (cells: string[]): string[] => {
    const next = cells.slice(0, headerCells.length)
    while (next.length < headerCells.length) next.push('')
    return next
  }

  const header = normalize(headerCells).map((cell) =>
    inlineSpans(cell, breaks),
  )
  const rows: LingyunMarkdownSpan[][][] = []
  let index = start + 2
  while (index < lines.length) {
    const line = lines[index]
    if (isBlank(line) || !line.includes('|')) break
    if (isHr(line) || isBlockquote(line) || matchHeading(line)) break
    if (matchFenceStart(line)) break
    const cells = normalize(splitTableCells(line))
    rows.push(cells.map((cell) => inlineSpans(cell, breaks)))
    index += 1
  }
  return {
    block: { type: 'table', align, header, rows },
    next: index,
  }
}

function parseList(
  lines: string[],
  start: number,
  breaks: boolean,
): { block: LingyunMarkdownBlock; next: number } {
  const first = matchListMarker(lines[start])
  if (!first) {
    return {
      block: { type: 'paragraph', segments: [] },
      next: start + 1,
    }
  }
  const baseIndent = first.indent
  const ordered = first.ordered
  const startNumber = first.number
  const items: LingyunMarkdownListItem[] = []
  let index = start

  while (index < lines.length) {
    const marker = matchListMarker(lines[index])
    if (
      !marker ||
      marker.indent !== baseIndent ||
      marker.ordered !== ordered
    ) {
      break
    }

    let content = marker.content
    let task = false
    let checked = false
    const taskMatch = /^\[([ xX])\](?:\s+(.*))?$/.exec(content)
    if (taskMatch) {
      task = true
      checked = taskMatch[1].toLowerCase() === 'x'
      content = taskMatch[2] || ''
    }

    const contentIndent = marker.contentIndent
    const itemLines: string[] = [content]
    index += 1

    while (index < lines.length) {
      const line = lines[index]
      if (isBlank(line)) {
        let lookahead = index + 1
        while (lookahead < lines.length && isBlank(lines[lookahead])) {
          lookahead += 1
        }
        if (lookahead >= lines.length) {
          index = lookahead
          break
        }
        const nextMarker = matchListMarker(lines[lookahead])
        const nextIndent = countIndent(lines[lookahead])
        const belongs =
          nextIndent >= contentIndent ||
          (!!nextMarker && nextMarker.indent > baseIndent)
        if (!belongs) break
        itemLines.push('')
        index += 1
        continue
      }

      const nextMarker = matchListMarker(line)
      if (nextMarker && nextMarker.indent === baseIndent) break

      const indent = countIndent(line)
      if (indent >= contentIndent) {
        itemLines.push(stripIndent(line, contentIndent))
        index += 1
        continue
      }
      if (indent > baseIndent) {
        itemLines.push(stripIndent(line, baseIndent + 2))
        index += 1
        continue
      }
      if (!isBlockStarter(lines, index)) {
        itemLines.push(line)
        index += 1
        continue
      }
      break
    }

    while (itemLines.length && itemLines[itemLines.length - 1] === '') {
      itemLines.pop()
    }
    items.push({
      blocks: parseBlocks(itemLines, breaks),
      task,
      checked,
    })

    while (index < lines.length && isBlank(lines[index])) {
      let lookahead = index + 1
      while (lookahead < lines.length && isBlank(lines[lookahead])) {
        lookahead += 1
      }
      const nextMarker =
        lookahead < lines.length ? matchListMarker(lines[lookahead]) : null
      if (
        nextMarker &&
        nextMarker.indent === baseIndent &&
        nextMarker.ordered === ordered
      ) {
        index = lookahead
      }
      break
    }
  }

  return {
    block: { type: 'list', ordered, start: startNumber, items },
    next: index,
  }
}

function parseParagraph(
  lines: string[],
  start: number,
  breaks: boolean,
): { block: LingyunMarkdownLeafBlock; next: number } {
  const content: string[] = []
  let index = start
  while (index < lines.length) {
    const line = lines[index]
    if (isBlank(line)) break
    if (index > start && isBlockStarter(lines, index)) break
    content.push(line)
    index += 1
  }
  return {
    block: {
      type: 'paragraph',
      segments: inlineSegments(content.join('\n'), breaks),
    },
    next: index,
  }
}

function parseBlocks(
  lines: string[],
  breaks: boolean,
): LingyunMarkdownBlock[] {
  const blocks: LingyunMarkdownBlock[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (isBlank(line)) {
      index += 1
      continue
    }

    const fence = matchFenceStart(line)
    if (fence) {
      const result = parseFence(lines, index, fence, breaks)
      blocks.push(result.block)
      index = result.next
      continue
    }

    if (countIndent(line) >= 4) {
      const result = parseIndentedCode(lines, index)
      blocks.push(result.block)
      index = result.next
      continue
    }

    const heading = matchHeading(line)
    if (heading) {
      blocks.push({
        type: 'heading',
        depth: heading.depth,
        spans: inlineSpans(heading.text, breaks),
      })
      index += 1
      continue
    }

    if (isHr(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (isBlockquote(line)) {
      const result = parseBlockquote(lines, index, breaks)
      blocks.push(result.block)
      index = result.next
      continue
    }

    if (matchListMarker(line)) {
      const result = parseList(lines, index, breaks)
      blocks.push(result.block)
      index = result.next
      continue
    }

    if (isTableStart(lines, index)) {
      const result = parseTable(lines, index, breaks)
      blocks.push(result.block)
      index = result.next
      continue
    }

    const result = parseParagraph(lines, index, breaks)
    blocks.push(result.block)
    index = result.next
  }
  return blocks
}

/* -------------------------------------------------------------------------- */
/* 对外 API                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Markdown → 原生渲染树。自研解析器，不依赖 marked 等 npm 扩展；
 * 不生成 HTML，不执行原始 HTML。
 * @see design/MARKDOWN.md
 */
export function parseLingyunMarkdown(
  source: string,
  options: LingyunMarkdownParseOptions = {},
): LingyunMarkdownBlock[] {
  const input = (source || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
  if (!input.trim()) return []
  return parseBlocks(input.split('\n'), !!options.breaks)
}

interface FlattenContext {
  listDepth: number
  quoteDepth: number
  tone: 'primary' | 'secondary'
  compact: boolean
}

type MarkdownListBlock = Extract<LingyunMarkdownBlock, { type: 'list' }>

function listMarker(
  list: MarkdownListBlock,
  item: LingyunMarkdownListItem,
  index: number,
  depth: number,
): string {
  if (item.task) return item.checked ? '☑' : '☐'
  if (list.ordered) return `${list.start + index}.`
  const bullets = ['•', '◦', '▪']
  return bullets[depth % bullets.length] || '•'
}

/**
 * 把列表 / 引用拍平成带缩进的行，避免微信小程序递归自定义组件。
 * 列表项首行带 marker；同项后续行缩进到 marker 右侧。
 */
function flattenBlocks(
  blocks: LingyunMarkdownBlock[],
  context: FlattenContext,
  rows: LingyunMarkdownRow[],
): void {
  blocks.forEach((block) => {
    if (block.type === 'list') {
      block.items.forEach((item, index) => {
        const itemRows: LingyunMarkdownRow[] = []
        flattenBlocks(
          item.blocks,
          {
            ...context,
            listDepth: context.listDepth + 1,
            compact: true,
          },
          itemRows,
        )
        const marker = listMarker(block, item, index, context.listDepth)
        const markerIndent =
          context.listDepth * 24 + context.quoteDepth * 14
        if (!itemRows.length || itemRows[0].marker) {
          rows.push({
            block: { type: 'paragraph', segments: [] },
            indent: markerIndent,
            quoteDepth: context.quoteDepth,
            tone: context.tone,
            compact: true,
            marker,
            markerTask: item.task,
            markerChecked: item.checked,
            empty: true,
          })
          rows.push(...itemRows)
        } else {
          itemRows[0].marker = marker
          itemRows[0].markerTask = item.task
          itemRows[0].markerChecked = item.checked
          itemRows[0].indent = markerIndent
          rows.push(...itemRows)
        }
      })
      return
    }
    if (block.type === 'blockquote') {
      flattenBlocks(
        block.blocks,
        {
          ...context,
          quoteDepth: context.quoteDepth + 1,
          tone: 'secondary',
          compact: true,
        },
        rows,
      )
      return
    }
    rows.push({
      block,
      indent: context.listDepth * 24 + context.quoteDepth * 14,
      quoteDepth: context.quoteDepth,
      tone: context.tone,
      compact: context.compact,
      marker: '',
      markerTask: false,
      markerChecked: false,
      empty: false,
    })
  })
}

export function flattenLingyunMarkdown(
  blocks: LingyunMarkdownBlock[],
): LingyunMarkdownRow[] {
  const rows: LingyunMarkdownRow[] = []
  flattenBlocks(
    blocks,
    { listDepth: 0, quoteDepth: 0, tone: 'primary', compact: false },
    rows,
  )
  return rows
}
