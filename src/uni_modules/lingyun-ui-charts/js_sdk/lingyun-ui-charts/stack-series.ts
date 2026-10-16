/**
 * 堆积图算法（类目轴）
 *
 * 业务侧传与折线 / 曲线相同的原始分层数据即可，不必自行累加。
 * 开启堆积（extra.line.stack / extra.area.stack / column|bar type=stack）后由引擎调用本模块。
 */

export type StackSeriesLike = {
	name?: string
	data: unknown[]
	show?: boolean
}

/** 从 series 数据点取出数值；null / 无效返回 null */
export function seriesPointValue(item: unknown): number | null {
	if (item === null || item === undefined) return null
	if (typeof item === 'object') {
		const raw = (item as { value?: unknown }).value
		if (raw === null || raw === undefined) return null
		const n = Number(raw)
		return Number.isFinite(n) ? n : null
	}
	const n = Number(item)
	return Number.isFinite(n) ? n : null
}

/**
 * 某类目上第 seriesIndex 层的累计顶 / 底（value0 为下层累计顶，value 为本层累计顶）
 */
export function stackLayerBounds(
	series: StackSeriesLike[],
	seriesIndex: number,
	categoryIndex: number,
): { value: number; value0: number } | null {
	const layer = seriesPointValue(series[seriesIndex]?.data?.[categoryIndex])
	if (layer === null) return null
	let value = 0
	for (let i = 0; i <= seriesIndex; i++) {
		const v = seriesPointValue(series[i]?.data?.[categoryIndex])
		if (v !== null) value += v
	}
	return { value, value0: value - layer }
}

/** 各类目上所有层之和，供 Y 轴按总量缩放 */
export function stackCategorySums(series: StackSeriesLike[], categoryCount: number): number[] {
	const sums = new Array(categoryCount).fill(0) as number[]
	for (let i = 0; i < series.length; i++) {
		for (let j = 0; j < categoryCount; j++) {
			const v = seriesPointValue(series[i]?.data?.[j])
			if (v !== null) sums[j] += v
		}
	}
	return sums
}

/**
 * 与历史 dataCombineStack 同形：各层原始值拼平 + 各类目总和，供 getYAxisTextList 取 min/max
 */
export function dataCombineStackValues(series: StackSeriesLike[], categoryCount: number): number[] {
	const flat: number[] = []
	for (let i = 0; i < series.length; i++) {
		const row = series[i]?.data || []
		for (let j = 0; j < categoryCount; j++) {
			const v = seriesPointValue(row[j])
			if (v !== null) flat.push(v)
		}
	}
	return flat.concat(stackCategorySums(series, categoryCount))
}

/**
 * 折线 / 曲线开启 stack 时改走区域堆积绘制（层间填色）。
 * 数据仍是原始分层，不在此修改 series。
 */
export function applyLineStackAsArea(opts: {
	type?: string
	extra?: {
		line?: { stack?: boolean; type?: string; width?: number; activeType?: string }
		area?: Record<string, unknown>
	}
}): typeof opts {
	if (!opts || opts.type !== 'line') return opts
	const lineExtra = (opts.extra && opts.extra.line) || {}
	if (lineExtra.stack !== true) return opts

	const edgeType =
		lineExtra.type === 'curve' ? 'curve' : lineExtra.type === 'step' ? 'step' : 'straight'
	const prevArea = (opts.extra && opts.extra.area) || {}

	opts.type = 'area'
	opts.extra = opts.extra || {}
	opts.extra.area = {
		opacity: 0.65,
		addLine: true,
		width: lineExtra.width != null ? lineExtra.width : 2,
		gradient: false,
		activeType: lineExtra.activeType || 'hollow',
		...prevArea,
		type: (prevArea.type as string) || edgeType,
		stack: true,
	}
	return opts
}
