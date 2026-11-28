/**
 * 微信小程序：恢复组件 JSON 里的 virtualHost 声明。
 *
 * 背景：uni CLI 升级到 3.0.0-alpha-50306 后，不再把 defineOptions({ virtualHost: true })
 * 写进组件 JSON（见 @dcloudio/uni-mp-vite plugins/entry.js —— 组件 JSON 只有
 * component / styleIsolation 两个字段）。微信里宿主节点因此变成真实节点：
 * flex / grid 容器的直接子项是宿主而非组件内部根 view，lingyun-row / lingyun-col
 * 的列宽百分比全部塌陷（宿主按内容宽收缩），grid 也同类。
 *
 * 本插件不改 node_modules，在产物生成阶段：凡源码里声明 virtualHost: true 的组件，
 * 给其编译出的 JSON 补 "virtualHost": true，恢复旧 CLI 行为。
 *
 * 配套：src/manifest.json 的 mp-weixin 需打开 mergeVirtualHostAttributes —— 外部
 * class/style/id/hidden 经 ahc/ahs/ahid/ahh 转发到组件内部根节点（旧 CLI 的透传）。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/** 源码 SFC 里 defineOptions 声明 virtualHost: true */
const VIRTUAL_HOST_DECL = /\bvirtualHost\s*:\s*true\b/

export function mpVirtualHostPlugin(): Plugin {
	return {
		name: 'lingyun:mp-virtual-host-json',
		apply: 'build',
		enforce: 'post',
		generateBundle(_options, bundle) {
			if (process.env.UNI_PLATFORM !== 'mp-weixin') return
			const inputDir = process.env.UNI_INPUT_DIR || 'src'
			for (const [fileName, output] of Object.entries(bundle)) {
				if (!fileName.endsWith('.json') || output.type !== 'asset') continue
				const text =
					typeof output.source === 'string'
						? output.source
						: Buffer.from(output.source).toString('utf8')
				if (!text.includes('"component": true')) continue
				const sourcePath = resolve(
					inputDir,
					fileName.slice(0, -'.json'.length) + '.vue',
				)
				let declared = false
				try {
					declared = VIRTUAL_HOST_DECL.test(readFileSync(sourcePath, 'utf8'))
				} catch {
					/* 无源码（如原生组件），跳过 */
				}
				if (!declared) continue
				let parsed: Record<string, unknown>
				try {
					parsed = JSON.parse(text)
				} catch {
					continue
				}
				parsed.virtualHost = true
				output.source = `${JSON.stringify(parsed, null, 2)}\n`
			}
		},
	}
}
