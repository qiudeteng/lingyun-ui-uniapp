/**
 * lingyun-markdown 内置语法高亮。
 * 纯前端、按行 token 化、不依赖任何 npm 扩展；不生成 HTML。
 * 支持常用语言，未知语言由 highlightCode 退回单色。
 */

export type LingyunMarkdownCodeTokenType =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'tag'
  | 'attr'
  | 'property'
  | 'operator'
  | 'punctuation'
  | 'boolean'
  | 'variable'
  | 'meta'

export interface LingyunMarkdownCodeToken {
  text: string
  type: LingyunMarkdownCodeTokenType
}

export type LingyunMarkdownCodeLine = LingyunMarkdownCodeToken[]

interface GenericState {
  blockEnd?: string
  multilineQuote?: string
}

interface CssState {
  blockEnd?: string
  depth: number
}

interface SqlState {
  blockEnd?: string
}

interface MarkupState {
  commentOpen?: boolean
  embed?: 'generic' | 'css'
  embedLang?: string
  genericState?: GenericState
  cssState?: CssState
}

interface GenericConfig {
  keywords: Set<string>
  booleans: Set<string>
  lineComments: string[]
  blockComment?: [string, string]
  quotes: string[]
  multilineQuotes?: string[]
  tripleQuote?: boolean
  variableSigil?: string
  metaSigil?: string
  jsonKeys?: boolean
  rustLifetime?: boolean
  rustRaw?: boolean
  phpTags?: boolean
}

interface MarkupKind {
  kind: 'markup'
}

interface CssKind {
  kind: 'css'
  scss: boolean
}

interface GenericKind {
  kind: 'generic'
  config: GenericConfig
}

interface SqlKind {
  kind: 'sql'
}

interface ShellKind {
  kind: 'shell'
}

interface PlainKind {
  kind: 'plain'
}

type LanguageKind =
  | MarkupKind
  | CssKind
  | GenericKind
  | SqlKind
  | ShellKind
  | PlainKind

function makeSet(values: string[]): Set<string> {
  return new Set(values)
}

const TS_KEYWORDS = makeSet([
  'abstract', 'accessor', 'any', 'as', 'asserts', 'async', 'await', 'bigint',
  'boolean', 'break', 'case', 'catch', 'class', 'const', 'constructor',
  'continue', 'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum',
  'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'global',
  'if', 'implements', 'import', 'in', 'infer', 'instanceof', 'interface', 'is',
  'keyof', 'let', 'module', 'namespace', 'never', 'new', 'number', 'object',
  'of', 'override', 'package', 'private', 'protected', 'public', 'readonly',
  'require', 'return', 'satisfies', 'set', 'static', 'string', 'super', 'switch',
  'symbol', 'this', 'throw', 'try', 'type', 'typeof', 'unique', 'unknown',
  'using', 'var', 'void', 'while', 'with', 'yield',
])
const TS_BOOLEANS = makeSet(['true', 'false', 'null', 'undefined'])

const PHP_KEYWORDS = makeSet([
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch',
  'class', 'clone', 'const', 'continue', 'declare', 'default', 'do', 'echo',
  'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif',
  'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'finally', 'fn',
  'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include',
  'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list',
  'match', 'namespace', 'new', 'or', 'parent', 'print', 'private', 'protected',
  'public', 'readonly', 'require', 'require_once', 'return', 'self', 'static',
  'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor',
  'yield',
])
const PHP_BOOLEANS = makeSet(['true', 'false', 'null'])

const RUST_KEYWORDS = makeSet([
  'abstract', 'as', 'async', 'await', 'become', 'box', 'break', 'const',
  'continue', 'crate', 'do', 'dyn', 'else', 'enum', 'extern', 'final', 'fn',
  'for', 'if', 'impl', 'in', 'let', 'loop', 'macro', 'match', 'mod', 'move',
  'mut', 'override', 'priv', 'pub', 'ref', 'return', 'self', 'Self', 'static',
  'struct', 'super', 'trait', 'try', 'type', 'typeof', 'union', 'unsafe',
  'unsized', 'use', 'virtual', 'where', 'while', 'yield',
])
const RUST_BOOLEANS = makeSet([
  'true', 'false', 'None', 'Some', 'Ok', 'Err',
])

const SWIFT_KEYWORDS = makeSet([
  'actor', 'any', 'as', 'associatedtype', 'async', 'await', 'borrowing', 'break',
  'case', 'catch', 'class', 'consume', 'consuming', 'continue', 'convenience',
  'copy', 'defer', 'deinit', 'didSet', 'distributed', 'do', 'dynamic', 'else',
  'enum', 'extension', 'fallthrough', 'fileprivate', 'final', 'for', 'func',
  'get', 'guard', 'if', 'import', 'in', 'indirect', 'infix', 'init', 'inout',
  'internal', 'is', 'isolated', 'lazy', 'let', 'macro', 'mutating',
  'nonisolated', 'nonmutating', 'open', 'operator', 'optional', 'override',
  'package', 'postfix', 'precedencegroup', 'prefix', 'private', 'protocol',
  'public', 'repeat', 'required', 'rethrows', 'return', 'self', 'Self', 'set',
  'some', 'static', 'struct', 'subscript', 'super', 'switch', 'throw', 'throws',
  'try', 'typealias', 'unowned', 'var', 'weak', 'where', 'while', 'willSet',
])
const SWIFT_BOOLEANS = makeSet(['true', 'false', 'nil'])

const TS_CONFIG: GenericConfig = {
  keywords: TS_KEYWORDS,
  booleans: TS_BOOLEANS,
  lineComments: ['//'],
  blockComment: ['/*', '*/'],
  quotes: ["'", '"', '`'],
  multilineQuotes: ['`'],
  metaSigil: '@',
}

const JS_CONFIG: GenericConfig = {
  ...TS_CONFIG,
}

const JSON_CONFIG: GenericConfig = {
  keywords: makeSet([]),
  booleans: makeSet(['true', 'false', 'null']),
  lineComments: ['//'],
  blockComment: ['/*', '*/'],
  quotes: ['"'],
  jsonKeys: true,
}

const PHP_CONFIG: GenericConfig = {
  keywords: PHP_KEYWORDS,
  booleans: PHP_BOOLEANS,
  lineComments: ['//', '#'],
  blockComment: ['/*', '*/'],
  quotes: ["'", '"'],
  variableSigil: '$',
  phpTags: true,
}

const RUST_CONFIG: GenericConfig = {
  keywords: RUST_KEYWORDS,
  booleans: RUST_BOOLEANS,
  lineComments: ['//'],
  blockComment: ['/*', '*/'],
  quotes: ["'", '"'],
  rustLifetime: true,
  rustRaw: true,
}

const SWIFT_CONFIG: GenericConfig = {
  keywords: SWIFT_KEYWORDS,
  booleans: SWIFT_BOOLEANS,
  lineComments: ['//'],
  blockComment: ['/*', '*/'],
  quotes: ['"'],
  tripleQuote: true,
  metaSigil: '@',
}

const SQL_KEYWORDS = makeSet([
  'ADD', 'ALL', 'ALTER', 'AND', 'ANY', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE',
  'CHECK', 'COLUMN', 'CONSTRAINT', 'CREATE', 'CROSS', 'DATABASE', 'DEFAULT',
  'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE', 'END', 'EXISTS', 'FOREIGN',
  'FROM', 'FULL', 'GROUP', 'HAVING', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTO',
  'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'NOT', 'OFFSET', 'ON', 'OR',
  'ORDER', 'OUTER', 'PRIMARY', 'REFERENCES', 'RIGHT', 'SELECT', 'SET', 'TABLE',
  'THEN', 'UNION', 'UNIQUE', 'UPDATE', 'VALUES', 'VIEW', 'WHEN', 'WHERE', 'WITH',
])
const SQL_BOOLEANS = makeSet(['TRUE', 'FALSE', 'NULL'])

const SHELL_KEYWORDS = makeSet([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done',
  'case', 'esac', 'in', 'function', 'select', 'time', 'coproc',
])
const SHELL_BUILTINS = makeSet([
  'alias', 'bg', 'bind', 'break', 'builtin', 'cd', 'command', 'continue',
  'declare', 'dirs', 'disown', 'echo', 'enable', 'eval', 'exec', 'exit',
  'export', 'false', 'fc', 'fg', 'getopts', 'hash', 'help', 'history', 'jobs',
  'kill', 'let', 'local', 'logout', 'mapfile', 'popd', 'printf', 'pushd',
  'pwd', 'read', 'readonly', 'return', 'set', 'shift', 'source', 'suspend',
  'test', 'times', 'trap', 'true', 'type', 'typeset', 'ulimit', 'umask',
  'unalias', 'unset', 'wait',
])

const CSS_VALUES = makeSet([
  'auto', 'none', 'normal', 'inherit', 'initial', 'unset', 'revert', 'block',
  'inline', 'flex', 'grid', 'inline-block', 'inline-flex', 'absolute',
  'relative', 'fixed', 'sticky', 'static', 'center', 'left', 'right', 'top',
  'bottom', 'solid', 'dashed', 'dotted', 'transparent', 'currentColor',
  'pointer', 'hidden', 'visible', 'nowrap', 'wrap', 'row', 'column', 'cover',
  'contain', 'repeat', 'no-repeat', 'bold', 'italic', 'uppercase',
  'lowercase', 'important',
])

const CSS_AT_RULES = makeSet([
  'media', 'import', 'charset', 'font-face', 'keyframes', 'supports', 'page',
  'layer', 'container', 'property', 'namespace', 'use', 'forward', 'mixin',
  'include', 'extend', 'function', 'return', 'if', 'else', 'each', 'for',
  'while', 'at-root', 'debug', 'warn', 'error',
])

const NUMBER_RE =
  /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)(?:[A-Za-z]{1,4}\b)?/
const OPERATOR_RE =
  /^(?:->|=>|::|\.\.\.|\?\?|&&|\|\||\+\+|--|[+\-*/%=<>!&|^~?:]+)/
const PUNCTUATION_RE = /^[(){}\[\],.;]/

function normalizeLang(lang: string): string {
  return (lang || '')
    .trim()
    .toLowerCase()
    .replace(/^language-/, '')
    .replace(/[{}]/g, '')
}

function resolveLanguage(lang: string): LanguageKind {
  const key = normalizeLang(lang)
  if (!key || key === 'text' || key === 'plain' || key === 'txt' ||
      key === 'md' || key === 'markdown') {
    return { kind: 'plain' }
  }
  if (
    key === 'html' || key === 'htm' || key === 'xml' || key === 'svg' ||
    key === 'vue'
  ) {
    return { kind: 'markup' }
  }
  if (key === 'css') return { kind: 'css', scss: false }
  if (key === 'scss' || key === 'sass' || key === 'less') {
    return { kind: 'css', scss: true }
  }
  if (
    key === 'sh' || key === 'bash' || key === 'shell' || key === 'zsh'
  ) {
    return { kind: 'shell' }
  }
  if (
    key === 'sql' || key === 'mysql' || key === 'postgresql' ||
    key === 'pgsql'
  ) {
    return { kind: 'sql' }
  }
  if (key === 'ts' || key === 'typescript' || key === 'tsx') {
    return { kind: 'generic', config: TS_CONFIG }
  }
  if (key === 'js' || key === 'javascript' || key === 'jsx') {
    return { kind: 'generic', config: JS_CONFIG }
  }
  if (key === 'json' || key === 'jsonc') {
    return { kind: 'generic', config: JSON_CONFIG }
  }
  if (key === 'php' || key === 'phtml') {
    return { kind: 'generic', config: PHP_CONFIG }
  }
  if (key === 'rust' || key === 'rs') {
    return { kind: 'generic', config: RUST_CONFIG }
  }
  if (key === 'swift') {
    return { kind: 'generic', config: SWIFT_CONFIG }
  }
  return { kind: 'plain' }
}

function pushToken(
  line: LingyunMarkdownCodeLine,
  text: string,
  type: LingyunMarkdownCodeTokenType,
): void {
  if (!text) return
  const last = line[line.length - 1]
  if (last && last.type === type) {
    last.text += text
  } else {
    line.push({ text, type })
  }
}

function previousNonSpace(line: string, index: number): string {
  let cursor = index - 1
  while (cursor >= 0 && /\s/.test(line[cursor])) cursor -= 1
  return cursor >= 0 ? line[cursor] : ''
}

function nextNonSpace(line: string, index: number): number {
  let cursor = index
  while (cursor < line.length && /\s/.test(line[cursor])) cursor += 1
  return cursor
}

function findClosingQuote(
  line: string,
  start: number,
  quote: string,
): number {
  let cursor = start
  while (cursor < line.length) {
    if (line[cursor] === '\\') {
      cursor += 2
      continue
    }
    if (quote.length === 1) {
      if (line[cursor] === quote) return cursor
      cursor += 1
      continue
    }
    if (line.startsWith(quote, cursor)) return cursor
    cursor += 1
  }
  return -1
}

/* -------------------------------------------------------------------------- */
/* C-like / PHP / Rust / Swift / JSON                                         */
/* -------------------------------------------------------------------------- */

function tokenizeGenericLine(
  line: string,
  config: GenericConfig,
  state: GenericState,
): LingyunMarkdownCodeLine {
  const tokens: LingyunMarkdownCodeLine = []
  let index = 0

  while (index < line.length) {
    if (state.blockEnd) {
      const end = line.indexOf(state.blockEnd, index)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        index = line.length
      } else {
        pushToken(
          tokens,
          line.slice(index, end + state.blockEnd.length),
          'comment',
        )
        index = end + state.blockEnd.length
        state.blockEnd = undefined
      }
      continue
    }

    if (state.multilineQuote) {
      const close = findClosingQuote(line, index, state.multilineQuote)
      const end = close >= 0 ? close + state.multilineQuote.length : line.length
      pushToken(tokens, line.slice(index, end), 'string')
      index = end
      if (close >= 0) state.multilineQuote = undefined
      continue
    }

    const char = line[index]

    if (/\s/.test(char)) {
      let end = index + 1
      while (end < line.length && /\s/.test(line[end])) end += 1
      pushToken(tokens, line.slice(index, end), 'plain')
      index = end
      continue
    }

    if (config.blockComment && line.startsWith(config.blockComment[0], index)) {
      const opener = config.blockComment[0]
      const start = index + opener.length
      const end = line.indexOf(config.blockComment[1], start)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        state.blockEnd = config.blockComment[1]
        index = line.length
      } else {
        pushToken(
          tokens,
          line.slice(index, end + config.blockComment[1].length),
          'comment',
        )
        index = end + config.blockComment[1].length
      }
      continue
    }

    const lineComment = config.lineComments.find((marker) =>
      line.startsWith(marker, index),
    )
    if (lineComment) {
      pushToken(tokens, line.slice(index), 'comment')
      index = line.length
      continue
    }

    if (config.phpTags) {
      const phpTag = ['<?php', '<?=', '?>'].find((tag) =>
        line.startsWith(tag, index),
      )
      if (phpTag) {
        pushToken(tokens, phpTag, 'meta')
        index += phpTag.length
        continue
      }
    }

    if (config.tripleQuote && line.startsWith('"""', index)) {
      const close = line.indexOf('"""', index + 3)
      if (close < 0) {
        pushToken(tokens, line.slice(index), 'string')
        state.multilineQuote = '"""'
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, close + 3), 'string')
        index = close + 3
      }
      continue
    }

    if (config.rustRaw && char === 'r') {
      const raw = /^r(#+)?"/.exec(line.slice(index))
      if (raw) {
        const hashes = raw[1] || ''
        const closing = `"${hashes}`
        const close = line.indexOf(closing, index + raw[0].length)
        const end = close < 0 ? line.length : close + closing.length
        pushToken(tokens, line.slice(index, end), 'string')
        index = end
        continue
      }
    }

    if (config.quotes.includes(char)) {
      if (config.rustLifetime && char === "'") {
        const close = findClosingQuote(line, index + 1, "'")
        if (close >= 0 && close - index <= 12) {
          pushToken(tokens, line.slice(index, close + 1), 'string')
          index = close + 1
          continue
        }
        const lifetime = /^'[A-Za-z_]\w*/.exec(line.slice(index))
        if (lifetime) {
          pushToken(tokens, lifetime[0], 'variable')
          index += lifetime[0].length
          continue
        }
        pushToken(tokens, "'", 'plain')
        index += 1
        continue
      }

      const close = findClosingQuote(line, index + 1, char)
      const end = close >= 0 ? close + 1 : line.length
      let type: LingyunMarkdownCodeTokenType = 'string'
      if (config.jsonKeys && char === '"') {
        const after = nextNonSpace(line, end)
        if (line[after] === ':') type = 'property'
      }
      pushToken(tokens, line.slice(index, end), type)
      index = end
      if (
        close < 0 &&
        config.multilineQuotes &&
        config.multilineQuotes.includes(char)
      ) {
        state.multilineQuote = char
      }
      continue
    }

    if (config.variableSigil && char === config.variableSigil) {
      const variable = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(line.slice(index + 1))
      if (variable) {
        pushToken(tokens, char + variable[0], 'variable')
        index += 1 + variable[0].length
        continue
      }
      if (line[index + 1] === '{') {
        const end = line.indexOf('}', index + 2)
        const next = end < 0 ? line.length : end + 1
        pushToken(tokens, line.slice(index, next), 'variable')
        index = next
        continue
      }
    }

    if (config.metaSigil && char === config.metaSigil) {
      const meta = /^[A-Za-z_][\w-]*/.exec(line.slice(index + 1))
      if (meta) {
        pushToken(tokens, char + meta[0], 'meta')
        index += 1 + meta[0].length
        continue
      }
    }

    if (char === '#' && line[index + 1] === '[') {
      pushToken(tokens, '#[', 'meta')
      index += 2
      continue
    }

    const number = NUMBER_RE.exec(line.slice(index))
    if (number) {
      pushToken(tokens, number[0], 'number')
      index += number[0].length
      continue
    }

    if (/[A-Za-z_$]/.test(char)) {
      const word = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(line.slice(index))
      if (word) {
        const value = word[0]
        let type: LingyunMarkdownCodeTokenType = 'plain'
        if (config.keywords.has(value)) {
          type = 'keyword'
        } else if (config.booleans.has(value)) {
          type = 'boolean'
        } else {
          let next = nextNonSpace(line, index + value.length)
          if (line[next] === '!' && line[next + 1] === '(') {
            next += 1
          }
          if (line[next] === '(') {
            type = 'function'
          } else if (previousNonSpace(line, index) === '.') {
            type = 'property'
          }
        }
        pushToken(tokens, value, type)
        index += value.length
        continue
      }
    }

    const operator = OPERATOR_RE.exec(line.slice(index))
    if (operator) {
      pushToken(tokens, operator[0], 'operator')
      index += operator[0].length
      continue
    }

    const punctuation = PUNCTUATION_RE.exec(line.slice(index))
    if (punctuation) {
      pushToken(tokens, punctuation[0], 'punctuation')
      index += punctuation[0].length
      continue
    }

    pushToken(tokens, char, 'plain')
    index += 1
  }

  return tokens
}

/* -------------------------------------------------------------------------- */
/* SQL                                                                        */
/* -------------------------------------------------------------------------- */

function tokenizeSqlLine(
  line: string,
  state: SqlState,
): LingyunMarkdownCodeLine {
  const tokens: LingyunMarkdownCodeLine = []
  let index = 0

  while (index < line.length) {
    if (state.blockEnd) {
      const end = line.indexOf(state.blockEnd, index)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, end + 2), 'comment')
        index = end + 2
        state.blockEnd = undefined
      }
      continue
    }

    const char = line[index]
    if (/\s/.test(char)) {
      let end = index + 1
      while (end < line.length && /\s/.test(line[end])) end += 1
      pushToken(tokens, line.slice(index, end), 'plain')
      index = end
      continue
    }
    if (line.startsWith('--', index) || char === '#') {
      pushToken(tokens, line.slice(index), 'comment')
      index = line.length
      continue
    }
    if (line.startsWith('/*', index)) {
      const end = line.indexOf('*/', index + 2)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        state.blockEnd = '*/'
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, end + 2), 'comment')
        index = end + 2
      }
      continue
    }
    if (char === "'") {
      let cursor = index + 1
      let closed = false
      while (cursor < line.length) {
        if (line[cursor] === "'") {
          if (line[cursor + 1] === "'") {
            cursor += 2
            continue
          }
          cursor += 1
          closed = true
          break
        }
        cursor += 1
      }
      const end = closed ? cursor : line.length
      pushToken(tokens, line.slice(index, end), 'string')
      index = end
      continue
    }
    if (char === '"' || char === '`') {
      const close = line.indexOf(char, index + 1)
      const end = close < 0 ? line.length : close + 1
      pushToken(tokens, line.slice(index, end), 'string')
      index = end
      continue
    }
    if (char === '@') {
      const variable = /^[A-Za-z_][\w$]*/.exec(line.slice(index + 1))
      if (variable) {
        pushToken(tokens, char + variable[0], 'variable')
        index += 1 + variable[0].length
        continue
      }
    }

    const number = NUMBER_RE.exec(line.slice(index))
    if (number) {
      pushToken(tokens, number[0], 'number')
      index += number[0].length
      continue
    }

    if (/[A-Za-z_]/.test(char)) {
      const word = /^[A-Za-z_][\w$]*/.exec(line.slice(index))
      if (word) {
        const upper = word[0].toUpperCase()
        let type: LingyunMarkdownCodeTokenType = 'plain'
        if (SQL_KEYWORDS.has(upper)) {
          type = 'keyword'
        } else if (SQL_BOOLEANS.has(upper)) {
          type = 'boolean'
        } else {
          const next = nextNonSpace(line, index + word[0].length)
          if (line[next] === '(') type = 'function'
        }
        pushToken(tokens, word[0], type)
        index += word[0].length
        continue
      }
    }

    const operator = /^(?:<>|!=|<=|>=|\|\||[+\-*/%=<>])/.exec(line.slice(index))
    if (operator) {
      pushToken(tokens, operator[0], 'operator')
      index += operator[0].length
      continue
    }
    if (/[(),.;]/.test(char)) {
      pushToken(tokens, char, 'punctuation')
      index += 1
      continue
    }

    pushToken(tokens, char, 'plain')
    index += 1
  }

  return tokens
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                      */
/* -------------------------------------------------------------------------- */

function tokenizeShellLine(line: string): LingyunMarkdownCodeLine {
  const tokens: LingyunMarkdownCodeLine = []
  let index = 0

  while (index < line.length) {
    const char = line[index]
    if (/\s/.test(char)) {
      let end = index + 1
      while (end < line.length && /\s/.test(line[end])) end += 1
      pushToken(tokens, line.slice(index, end), 'plain')
      index = end
      continue
    }
    if (line.startsWith('#!', index) && index === 0) {
      pushToken(tokens, line, 'comment')
      index = line.length
      continue
    }
    if (char === '#') {
      const previous = index === 0 ? ' ' : line[index - 1]
      if (/\s/.test(previous)) {
        pushToken(tokens, line.slice(index), 'comment')
        index = line.length
        continue
      }
    }
    if (char === "'" || char === '"') {
      const close = findClosingQuote(line, index + 1, char)
      const end = close < 0 ? line.length : close + 1
      pushToken(tokens, line.slice(index, end), 'string')
      index = end
      continue
    }
    if (char === '$') {
      if (line[index + 1] === '{') {
        const end = line.indexOf('}', index + 2)
        const next = end < 0 ? line.length : end + 1
        pushToken(tokens, line.slice(index, next), 'variable')
        index = next
        continue
      }
      if (line[index + 1] === '(') {
        pushToken(tokens, '$(', 'variable')
        index += 2
        continue
      }
      const variable = /^[A-Za-z_][A-Za-z0-9_]*|^[0-9]+|^[?#@*$!-]/.exec(
        line.slice(index + 1),
      )
      if (variable) {
        pushToken(tokens, '$' + variable[0], 'variable')
        index += 1 + variable[0].length
        continue
      }
    }
    if (char === '-' && /[-A-Za-z]/.test(line[index + 1] || '')) {
      const flag = /^-{1,2}[A-Za-z][\w-]*/.exec(line.slice(index))
      if (flag) {
        pushToken(tokens, flag[0], 'attr')
        index += flag[0].length
        continue
      }
    }

    const number = /^\d+/.exec(line.slice(index))
    if (number) {
      pushToken(tokens, number[0], 'number')
      index += number[0].length
      continue
    }

    if (/[A-Za-z_]/.test(char)) {
      const word = /^[A-Za-z_][\w-]*/.exec(line.slice(index))
      if (word) {
        const value = word[0]
        let type: LingyunMarkdownCodeTokenType = 'plain'
        if (SHELL_KEYWORDS.has(value)) {
          type = 'keyword'
        } else if (SHELL_BUILTINS.has(value)) {
          type = value === 'true' || value === 'false' ? 'boolean' : 'function'
        } else {
          const next = nextNonSpace(line, index + value.length)
          if (line[next] === '=') type = 'variable'
          else if (line[next] === '(') type = 'function'
        }
        pushToken(tokens, value, type)
        index += value.length
        continue
      }
    }

    const operator = /^(?:&&|\|\||>>|<<|[|&;<>])/.exec(line.slice(index))
    if (operator) {
      pushToken(tokens, operator[0], 'operator')
      index += operator[0].length
      continue
    }
    if (/[(){}\[\]]/.test(char)) {
      pushToken(tokens, char, 'punctuation')
      index += 1
      continue
    }

    pushToken(tokens, char, 'plain')
    index += 1
  }

  return tokens
}

/* -------------------------------------------------------------------------- */
/* CSS                                                                        */
/* -------------------------------------------------------------------------- */

function tokenizeCssLine(
  line: string,
  scss: boolean,
  state: CssState,
): LingyunMarkdownCodeLine {
  const tokens: LingyunMarkdownCodeLine = []
  let index = 0

  while (index < line.length) {
    if (state.blockEnd) {
      const end = line.indexOf(state.blockEnd, index)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, end + 2), 'comment')
        index = end + 2
        state.blockEnd = undefined
      }
      continue
    }

    const char = line[index]
    if (/\s/.test(char)) {
      let end = index + 1
      while (end < line.length && /\s/.test(line[end])) end += 1
      pushToken(tokens, line.slice(index, end), 'plain')
      index = end
      continue
    }
    if (line.startsWith('/*', index)) {
      const end = line.indexOf('*/', index + 2)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        state.blockEnd = '*/'
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, end + 2), 'comment')
        index = end + 2
      }
      continue
    }
    if (scss && line.startsWith('//', index)) {
      pushToken(tokens, line.slice(index), 'comment')
      index = line.length
      continue
    }
    if (char === "'" || char === '"') {
      const close = findClosingQuote(line, index + 1, char)
      const end = close < 0 ? line.length : close + 1
      pushToken(tokens, line.slice(index, end), 'string')
      index = end
      continue
    }
    if (char === '$' || (scss && char === '@')) {
      const variable = /^[A-Za-z_-][\w-]*/.exec(line.slice(index + 1))
      if (variable) {
        if (char === '@' && CSS_AT_RULES.has(variable[0].toLowerCase())) {
          pushToken(tokens, '@' + variable[0], 'meta')
        } else {
          pushToken(tokens, char + variable[0], 'variable')
        }
        index += 1 + variable[0].length
        continue
      }
    }
    if (char === '@') {
      const atRule = /^[A-Za-z_-][\w-]*/.exec(line.slice(index + 1))
      if (atRule) {
        pushToken(tokens, '@' + atRule[0], 'meta')
        index += 1 + atRule[0].length
        continue
      }
    }
    if (char === '#') {
      const hex = /^#[0-9a-fA-F]{3,8}\b/.exec(line.slice(index))
      if (hex) {
        pushToken(tokens, hex[0], 'number')
        index += hex[0].length
        continue
      }
    }

    const number = /^(?:\d+(?:\.\d+)?)(?:%|px|em|rem|vh|vw|vmin|vmax|s|ms|deg|fr|ch|ex|cm|mm|in|pt|pc)?/.exec(
      line.slice(index),
    )
    if (number) {
      pushToken(tokens, number[0], 'number')
      index += number[0].length
      continue
    }

    if (/[A-Za-z_-]/.test(char)) {
      const word = /^-{0,2}[A-Za-z_][\w-]*/.exec(line.slice(index))
      if (word) {
        const value = word[0]
        const next = nextNonSpace(line, index + value.length)
        let type: LingyunMarkdownCodeTokenType = 'plain'
        if (line[next] === '(') {
          type = 'function'
        } else if (line[next] === ':' && state.depth > 0) {
          type = 'property'
        } else if (state.depth === 0) {
          type = previousNonSpace(line, index) === ':' ? 'attr' : 'tag'
        } else if (CSS_VALUES.has(value)) {
          type = 'keyword'
        }
        pushToken(tokens, value, type)
        index += value.length
        continue
      }
    }

    if (char === '{') {
      pushToken(tokens, char, 'punctuation')
      state.depth += 1
      index += 1
      continue
    }
    if (char === '}') {
      pushToken(tokens, char, 'punctuation')
      state.depth = Math.max(0, state.depth - 1)
      index += 1
      continue
    }
    const operator = /^(?:>=|<=|[>+~=])/.exec(line.slice(index))
    if (operator) {
      pushToken(tokens, operator[0], 'operator')
      index += operator[0].length
      continue
    }
    if (/[(),.;:]/.test(char)) {
      pushToken(tokens, char, 'punctuation')
      index += 1
      continue
    }

    pushToken(tokens, char, 'plain')
    index += 1
  }

  return tokens
}

/* -------------------------------------------------------------------------- */
/* Markup / Vue                                                               */
/* -------------------------------------------------------------------------- */

function markupEmbedConfig(embed: 'generic' | 'css', lang: string): GenericConfig | null {
  if (embed === 'generic') {
    return resolveLanguage(lang).kind === 'generic'
      ? (resolveLanguage(lang) as GenericKind).config
      : JS_CONFIG
  }
  return null
}

function tokenizeMarkupLine(
  line: string,
  state: MarkupState,
): LingyunMarkdownCodeLine {
  const tokens: LingyunMarkdownCodeLine = []
  let index = 0
  const lower = line.toLowerCase()

  if (state.commentOpen) {
    const end = line.indexOf('-->')
    if (end < 0) {
      pushToken(tokens, line, 'comment')
      return tokens
    }
    pushToken(tokens, line.slice(0, end + 3), 'comment')
    index = end + 3
    state.commentOpen = false
  }

  while (index < line.length) {
    if (state.embed) {
      const closing = state.embed === 'generic' ? '</script' : '</style'
      const closeIndex = lower.indexOf(closing, index)
      if (closeIndex < 0) {
        const segment = line.slice(index)
        if (segment) {
          if (state.embed === 'generic') {
            const config = markupEmbedConfig(
              'generic',
              state.embedLang || 'js',
            ) as GenericConfig
            const genericState = state.genericState || (state.genericState = {})
            const embedded = tokenizeGenericLine(segment, config, genericState)
            embedded.forEach((token) => pushToken(tokens, token.text, token.type))
          } else {
            const cssState = state.cssState || (state.cssState = { depth: 0 })
            const embedded = tokenizeCssLine(segment, true, cssState)
            embedded.forEach((token) => pushToken(tokens, token.text, token.type))
          }
        }
        index = line.length
        break
      }
      const segment = line.slice(index, closeIndex)
      if (segment) {
        if (state.embed === 'generic') {
          const config = markupEmbedConfig(
            'generic',
            state.embedLang || 'js',
          ) as GenericConfig
          const genericState = state.genericState || (state.genericState = {})
          const embedded = tokenizeGenericLine(segment, config, genericState)
          embedded.forEach((token) => pushToken(tokens, token.text, token.type))
        } else {
          const cssState = state.cssState || (state.cssState = { depth: 0 })
          const embedded = tokenizeCssLine(segment, true, cssState)
          embedded.forEach((token) => pushToken(tokens, token.text, token.type))
        }
      }
      state.embed = undefined
      index = closeIndex
      continue
    }

    const char = line[index]
    if (line.startsWith('<!--', index)) {
      const end = line.indexOf('-->', index + 4)
      if (end < 0) {
        pushToken(tokens, line.slice(index), 'comment')
        state.commentOpen = true
        index = line.length
      } else {
        pushToken(tokens, line.slice(index, end + 3), 'comment')
        index = end + 3
      }
      continue
    }
    if (line.startsWith('<!', index)) {
      const end = line.indexOf('>', index + 2)
      const next = end < 0 ? line.length : end + 1
      pushToken(tokens, line.slice(index, next), 'meta')
      index = next
      continue
    }
    if (line.startsWith('<?', index)) {
      const end = line.indexOf('?>', index + 2)
      const next = end < 0 ? line.length : end + 2
      pushToken(tokens, line.slice(index, next), 'meta')
      index = next
      continue
    }
    if (char === '<') {
      if (line[index + 1] === '/') {
        pushToken(tokens, '</', 'punctuation')
        const nameMatch = /^[A-Za-z][\w:.-]*/.exec(line.slice(index + 2))
        if (nameMatch) {
          pushToken(tokens, nameMatch[0], 'tag')
          index += 2 + nameMatch[0].length
        } else {
          index += 2
        }
        const next = nextNonSpace(line, index)
        if (line[next] === '>') {
          pushToken(tokens, '>', 'punctuation')
          index = next + 1
        }
        continue
      }

      pushToken(tokens, '<', 'punctuation')
      const nameMatch = /^[A-Za-z][\w:.-]*/.exec(line.slice(index + 1))
      if (!nameMatch) {
        index += 1
        continue
      }
      const tagName = nameMatch[0]
      const tagStart = index
      pushToken(tokens, tagName, 'tag')
      index += 1 + tagName.length
      let selfClosing = false

      while (index < line.length) {
        if (/\s/.test(line[index])) {
          let end = index + 1
          while (end < line.length && /\s/.test(line[end])) end += 1
          pushToken(tokens, line.slice(index, end), 'plain')
          index = end
          continue
        }
        if (line.startsWith('/>', index)) {
          pushToken(tokens, '/>', 'punctuation')
          index += 2
          selfClosing = true
          break
        }
        if (line[index] === '>') {
          pushToken(tokens, '>', 'punctuation')
          index += 1
          break
        }
        const attr = /^[^\s=/>]+/.exec(line.slice(index))
        if (attr) {
          pushToken(tokens, attr[0], 'attr')
          index += attr[0].length
          const next = nextNonSpace(line, index)
          if (line[next] === '=') {
            pushToken(tokens, '=', 'operator')
            index = next + 1
            const valueStart = nextNonSpace(line, index)
            const quote = line[valueStart]
            if (quote === '"' || quote === "'") {
              const close = findClosingQuote(line, valueStart + 1, quote)
              const end = close < 0 ? line.length : close + 1
              pushToken(tokens, line.slice(valueStart, end), 'string')
              index = end
            } else {
              const value = /^[^\s>]+/.exec(line.slice(valueStart))
              if (value) {
                pushToken(tokens, value[0], 'string')
                index = valueStart + value[0].length
              }
            }
          }
          continue
        }
        pushToken(tokens, line[index], 'plain')
        index += 1
      }

      const tagLower = tagName.toLowerCase()
      if (
        !selfClosing &&
        (tagLower === 'script' || tagLower === 'style')
      ) {
        const rawTag = line.slice(tagStart, index)
        const langMatch = /lang\s*=\s*["']?([^"'\s>]+)/i.exec(rawTag)
        const lang = langMatch ? langMatch[1] : tagLower === 'script' ? 'js' : 'css'
        const closing = tagLower === 'script' ? '</script' : '</style'
        const closeIndex = lower.indexOf(closing, index)
        if (closeIndex < 0) {
          state.embed = tagLower === 'script' ? 'generic' : 'css'
          state.embedLang = lang
          const segment = line.slice(index)
          if (segment) {
            if (state.embed === 'generic') {
              const config = markupEmbedConfig('generic', lang) as GenericConfig
              const genericState = state.genericState || (state.genericState = {})
              const embedded = tokenizeGenericLine(segment, config, genericState)
              embedded.forEach((token) => pushToken(tokens, token.text, token.type))
            } else {
              const cssState = state.cssState || (state.cssState = { depth: 0 })
              const embedded = tokenizeCssLine(segment, true, cssState)
              embedded.forEach((token) => pushToken(tokens, token.text, token.type))
            }
          }
          index = line.length
        } else {
          const segment = line.slice(index, closeIndex)
          if (segment) {
            if (tagLower === 'script') {
              const config = markupEmbedConfig('generic', lang) as GenericConfig
              const genericState = state.genericState || (state.genericState = {})
              const embedded = tokenizeGenericLine(segment, config, genericState)
              embedded.forEach((token) => pushToken(tokens, token.text, token.type))
            } else {
              const cssState = state.cssState || (state.cssState = { depth: 0 })
              const embedded = tokenizeCssLine(segment, true, cssState)
              embedded.forEach((token) => pushToken(tokens, token.text, token.type))
            }
          }
          index = closeIndex
        }
      }
      continue
    }

    const nextTag = line.indexOf('<', index + 1)
    const end = nextTag < 0 ? line.length : nextTag
    const text = line.slice(index, end)
    let cursor = 0
    while (cursor < text.length) {
      const open = text.indexOf('{{', cursor)
      if (open < 0) {
        pushToken(tokens, text.slice(cursor), 'plain')
        break
      }
      const close = text.indexOf('}}', open + 2)
      const next = close < 0 ? text.length : close + 2
      pushToken(tokens, text.slice(cursor, open), 'plain')
      pushToken(tokens, text.slice(open, next), 'meta')
      cursor = next
    }
    index = end
  }

  return tokens
}

/* -------------------------------------------------------------------------- */
/* 对外 API                                                                   */
/* -------------------------------------------------------------------------- */

function plainLine(line: string): LingyunMarkdownCodeLine {
  return line ? [{ text: line, type: 'plain' }] : []
}

/**
 * 把代码块文本按语言拆成逐行 token。
 * @param text 代码文本
 * @param lang 围栏语言（ts / php / rust / swift ...）
 * @param enabled false 时全部按纯文本输出
 */
export function highlightCode(
  text: string,
  lang: string,
  enabled = true,
): LingyunMarkdownCodeLine[] {
  const lines = (text || '').replace(/\r\n?/g, '\n').split('\n')
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
  const kind = resolveLanguage(lang)
  if (!enabled || kind.kind === 'plain') {
    return lines.map((line) => plainLine(line))
  }

  if (kind.kind === 'generic') {
    const state: GenericState = {}
    return lines.map((line) => {
      const tokens = tokenizeGenericLine(line, kind.config, state)
      if (tokens.map((token) => token.text).join('') !== line) {
        return plainLine(line)
      }
      return tokens
    })
  }
  if (kind.kind === 'sql') {
    const state: SqlState = {}
    return lines.map((line) => {
      const tokens = tokenizeSqlLine(line, state)
      if (tokens.map((token) => token.text).join('') !== line) {
        return plainLine(line)
      }
      return tokens
    })
  }
  if (kind.kind === 'shell') {
    return lines.map((line) => {
      const tokens = tokenizeShellLine(line)
      if (tokens.map((token) => token.text).join('') !== line) {
        return plainLine(line)
      }
      return tokens
    })
  }
  if (kind.kind === 'css') {
    const state: CssState = { depth: 0 }
    return lines.map((line) => {
      const tokens = tokenizeCssLine(line, kind.scss, state)
      if (tokens.map((token) => token.text).join('') !== line) {
        return plainLine(line)
      }
      return tokens
    })
  }
  const state: MarkupState = {}
  return lines.map((line) => {
    const tokens = tokenizeMarkupLine(line, state)
    if (tokens.map((token) => token.text).join('') !== line) {
      return plainLine(line)
    }
    return tokens
  })
}
