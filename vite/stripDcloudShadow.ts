/**
 * 编译期去掉 uni-app 注入的导航栏阴影图请求。
 * 不改 @dcloudio / uni_modules 源码，只在转换结果和最终产物里删除。
 *
 * H5 会给 shadow.css 追加 shadow-preload，并给六种颜色的顶栏阴影写 background-image。
 * 微信生产包会在 3 秒后 wx.preloadAssets 预加载同一张图。
 */
import type { Plugin } from 'vite'

const SHADOW_URL =
	/https?:\/\/(?:cdn\d*\.dcloud\.net\.cn|cdn\.dcimg\.net)\/[^"'()\s]*shadow-[a-z]+\.png/gi

const SHADOW_REQUEST =
	/shadow-[a-z]+\.png|__UNI_PRELOAD_SHADOW_IMAGE__|U_S_I_U|fromCharCode\(\s*99\s*,\s*100\s*,\s*110/

function findMatching(code: string, openIndex: number, open: string, close: string): number {
	let depth = 0
	for (let i = openIndex; i < code.length; i++) {
		const char = code[i]
		if (char === '"' || char === "'" || char === '`') {
			i++
			while (i < code.length) {
				if (code[i] === '\\') {
					i += 2
					continue
				}
				if (code[i] === char) break
				i++
			}
			continue
		}
		// https:// 里的 // 不是注释
		if (char === '/' && code[i + 1] === '/' && code[i - 1] !== ':') {
			const next = code.indexOf('\n', i)
			if (next < 0) return -1
			i = next
			continue
		}
		if (char === '/' && code[i + 1] === '*') {
			const next = code.indexOf('*/', i + 2)
			if (next < 0) return -1
			i = next + 1
			continue
		}
		if (char === open) depth++
		else if (char === close) {
			depth--
			if (depth === 0) return i
		}
	}
	return -1
}

/** startRe 必须以 { 或 ( 结尾。drop 返回 true 时删掉整段。 */
function dropBlocks(code: string, startRe: RegExp, drop: (block: string) => boolean): string {
	const flags = startRe.flags.includes('g') ? startRe.flags : `${startRe.flags}g`
	const re = new RegExp(startRe.source, flags)
	let out = ''
	let cursor = 0
	let match: RegExpExecArray | null
	while ((match = re.exec(code))) {
		const open = match.index + match[0].length - 1
		const openChar = code[open]
		if (openChar !== '{' && openChar !== '(') continue
		const end = findMatching(code, open, openChar, openChar === '{' ? '}' : ')')
		if (end < 0) break
		const block = code.slice(match.index, end + 1)
		re.lastIndex = end + 1
		if (!drop(block)) continue
		out += code.slice(cursor, match.index)
		cursor = end + 1
	}
	out += code.slice(cursor)
	return out
}

function dropCssRules(code: string, selector: RegExp, drop: (inner: string) => boolean): string {
	const flags = selector.flags.includes('g') ? selector.flags : `${selector.flags}g`
	const re = new RegExp(`(^|[}])\\s*(${selector.source})\\s*\\{`, flags)
	let out = ''
	let cursor = 0
	let match: RegExpExecArray | null
	while ((match = re.exec(code))) {
		const open = match.index + match[0].length - 1
		const end = findMatching(code, open, '{', '}')
		if (end < 0) break
		const inner = code.slice(open + 1, end)
		// 下一条规则的匹配要复用这个 }
		re.lastIndex = end
		if (!drop(inner)) continue
		let selectorStart = match.index + match[1].length
		while (selectorStart < open && /\s/.test(code[selectorStart])) selectorStart++
		out += code.slice(cursor, selectorStart)
		cursor = end + 1
	}
	out += code.slice(cursor)
	return out
}

/** 删掉「if (…preloadAssets…) { 预加载阴影图 }」整句，保留其它 if。 */
function dropPreloadIf(code: string): string {
	const re = /if\s*\(/g
	let out = ''
	let cursor = 0
	let match: RegExpExecArray | null
	while ((match = re.exec(code))) {
		const paren = match.index + match[0].length - 1
		const condEnd = findMatching(code, paren, '(', ')')
		if (condEnd < 0) break
		let brace = condEnd + 1
		while (brace < code.length && /\s/.test(code[brace])) brace++
		if (code[brace] !== '{') {
			re.lastIndex = condEnd + 1
			continue
		}
		const blockEnd = findMatching(code, brace, '{', '}')
		if (blockEnd < 0) break
		const statement = code.slice(match.index, blockEnd + 1)
		re.lastIndex = blockEnd + 1
		if (!/preloadAssets/.test(statement) || !SHADOW_REQUEST.test(statement)) continue
		out += code.slice(cursor, match.index)
		cursor = blockEnd + 1
	}
	out += code.slice(cursor)
	return out
}

function dropPreloadAsset(code: string): string {
	const withoutFn = dropBlocks(code, /function preloadAsset\(\)\s*\{/g, (block) => {
		return /preloadAssets|shadow-[a-z]+\.png|__UNI_PRELOAD_SHADOW_IMAGE__|fromCharCode\(/.test(block)
	})
	return withoutFn.replace(/(?<!function\s)preloadAsset\s*\(\s*\)\s*;?/g, '')
}

function mentionsShadow(code: string): boolean {
	return /shadow-preload|shadow-[a-z]+\.png|uni-page-head-shadow-|U_S_I_U|__UNI_PRELOAD_SHADOW_IMAGE__|preloadAsset\s*\(|wx\.preloadAssets\s*\(/.test(
		code,
	)
}

/** 从编译结果里删掉 DCloud 阴影图请求。可重复执行。 */
export function stripDcloudShadowCode(code: string): string {
	if (!mentionsShadow(code)) return code
	let next = dropBlocks(code, /@(?:-webkit-)?keyframes\s+shadow-preload\s*\{/g, () => true)
	next = dropCssRules(
		next,
		/\.uni-page-head-shadow-(?:grey|blue|green|orange|red|yellow)::?after/g,
		() => true,
	)
	next = dropCssRules(next, /body::?after/g, (inner) => {
		return /shadow-preload|-1000px|dcloud\.net\.cn|dcimg\.net|U_S_I_U/.test(inner)
	})
	next = dropPreloadAsset(next)
	next = dropPreloadIf(next)
	next = dropBlocks(next, /wx\.preloadAssets\s*\(/g, (block) => SHADOW_REQUEST.test(block))
	next = next.replace(
		/background-image\s*:\s*url\(\s*(['"]?)(?:https?:\/\/(?:cdn\d*\.dcloud\.net\.cn|cdn\.dcimg\.net)\/[^)'"]*shadow-[a-z]+\.png|U_S_I_U)\1\s*\)\s*;?/gi,
		'',
	)
	next = next.replace(SHADOW_URL, '')
	return next
}

export function stripDcloudShadowPlugin(): Plugin {
	return {
		name: 'strip-dcloud-shadow',
		enforce: 'post',
		transform(code) {
			const next = stripDcloudShadowCode(code)
			if (next === code) return null
			return { code: next, map: null }
		},
		generateBundle(_options, bundle) {
			for (const item of Object.values(bundle)) {
				if (item.type === 'chunk') {
					const next = stripDcloudShadowCode(item.code)
					if (next !== item.code) item.code = next
				} else if (typeof item.source === 'string') {
					const next = stripDcloudShadowCode(item.source)
					if (next !== item.source) item.source = next
				}
			}
		},
	}
}
