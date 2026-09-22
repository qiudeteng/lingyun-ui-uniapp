export type ChartSample = {
  categories?: unknown
  series: Record<string, unknown>[]
}

const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function hourStamps(): number[] {
	const end = Math.floor(Date.now() / 1000)
	return [6, 5, 4, 3, 2, 1, 0].map(h => end - h * 3600)
}

const tlinePoints = hourStamps()

export const chartSamples: Record<string, ChartSample> = {
	column: {
		categories: week,
		series: [
			{ name: '门店 A', data: [35, 36, 31, 33, 13, 34, 32] },
			{ name: '门店 B', data: [18, 27, 21, 24, 6, 28, 22] }
		]
	},
	bar: {
		categories: ['华东', '华南', '华北', '西南', '东北'],
		series: [
			{ name: '本月', data: [42, 35, 28, 22, 18] },
			{ name: '上月', data: [38, 32, 30, 19, 16] }
		]
	},
	line: {
		categories: week,
		series: [
			{ name: '访客', data: [120, 132, 101, 134, 90, 230, 210] },
			{ name: '下单', data: [22, 18, 19, 23, 29, 33, 31] }
		]
	},
	area: {
		categories: week,
		series: [
			{ name: '浏览', data: [140, 160, 120, 180, 110, 240, 200] },
			{ name: '加购', data: [40, 50, 35, 60, 30, 80, 70] }
		]
	},
	pie: {
		series: [
			{
				data: [
					{ name: '零售', value: 50 },
					{ name: '餐饮', value: 30 },
					{ name: '批发', value: 20 },
					{ name: '其他', value: 12 }
				]
			}
		]
	},
	ring: {
		series: [
			{
				data: [
					{ name: '已完成', value: 70 },
					{ name: '进行中', value: 20 },
					{ name: '未开始', value: 10 }
				]
			}
		]
	},
	rose: {
		series: [
			{
				data: [
					{ name: '一店', value: 50 },
					{ name: '二店', value: 30 },
					{ name: '三店', value: 20 },
					{ name: '四店', value: 18 },
					{ name: '五店', value: 8 }
				]
			}
		]
	},
	funnel: {
		series: [
			{
				data: [
					{ name: '曝光', value: 80 },
					{ name: '点击', value: 50 },
					{ name: '加购', value: 30 },
					{ name: '下单', value: 15 },
					{ name: '支付', value: 8 }
				]
			}
		]
	},
	radar: {
		categories: ['销量', '好评', '复购', '库存', '人效'],
		series: [
			{ name: '本月', data: [90, 80, 70, 60, 85] },
			{ name: '上月', data: [70, 75, 65, 80, 70] }
		]
	},
	gauge: {
		categories: [{ value: 0.2 }, { value: 0.8 }],
		series: [{ name: '完成率', data: 0.8 }]
	},
	arcbar: {
		series: [{ name: '正确率', data: 0.8 }]
	},
	mount: {
		series: [
			{
				data: [
					{ name: '1月', value: 50 },
					{ name: '2月', value: 30 },
					{ name: '3月', value: 20 },
					{ name: '4月', value: 18 },
					{ name: '5月', value: 28 }
				]
			}
		]
	},
	mix: {
		categories: week,
		series: [
			{ name: '销量', type: 'column', data: [35, 36, 31, 33, 13, 34, 32] },
			{ name: '目标', type: 'line', data: [30, 30, 30, 30, 30, 30, 30] }
		]
	},
	scatter: {
		series: [
			{
				name: '门店 A',
				data: [
					[10, 20],
					[15, 32],
					[22, 18],
					[28, 40],
					[35, 26]
				]
			},
			{
				name: '门店 B',
				data: [
					[8, 12],
					[18, 22],
					[24, 30],
					[32, 16],
					[40, 28]
				]
			}
		]
	},
	bubble: {
		series: [
			{
				name: '客群',
				data: [
					[20, 30, 18],
					[35, 22, 28],
					[48, 40, 22],
					[60, 18, 35]
				]
			}
		]
	},
	candle: {
		categories: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00'],
		series: [
			{
				name: 'K线',
				data: [
					[2320, 2320.37, 2320.5, 2317],
					[2320.26, 2320.19, 2323, 2317],
					[2320.19, 2320.31, 2323.3, 2317],
					[2320.46, 2320.32, 2323.6, 2317],
					[2320.46, 2320.32, 2323.6, 2317],
					[2320.46, 2308, 2323.6, 2291],
					[2300, 2291.3, 2308, 2291]
				]
			}
		]
	},
	word: {
		series: [
			{ name: '凌云UI', textSize: 32 },
			{ name: 'Liquid Glass', textSize: 24 },
			{ name: '小程序', textSize: 22 },
			{ name: '图表', textSize: 20 },
			{ name: '门店', textSize: 18 },
			{ name: '订单', textSize: 16 },
			{ name: '库存', textSize: 16 },
			{ name: '会员', textSize: 14 },
			{ name: '报表', textSize: 14 },
			{ name: '登录', textSize: 12 }
		]
	},
	tline: {
		series: [
			{
				name: '温度',
				data: tlinePoints.map((t, i) => [t, 18 + i * 1.5])
			}
		]
	},
	tarea: {
		series: [
			{
				name: '流量',
				data: tlinePoints.map((t, i) => [t, 22 + i * 8])
			}
		]
	}
}

const timeAxisOpts = {
	padding: [15, 28, 0, 15],
	xAxis: {
		format: 'xAxisDemo2'
	}
}

export const chartDemoOpts: Partial<Record<keyof typeof chartSamples, Record<string, unknown>>> = {
	radar: {
		extra: {
			radar: { max: 100, gridCount: 4 }
		}
	},
	gauge: {
		title: { name: '80%' },
		subtitle: { name: '完成率' }
	},
	word: {
		legend: { show: false },
		extra: {
			word: { type: 'normal', autoColors: false }
		}
	},
	tline: timeAxisOpts,
	tarea: timeAxisOpts
}

export const chartDemoMeta: Array<{
	type: keyof typeof chartSamples
	title: string
	note: string
}> = [
	{ type: 'column', title: 'Column', note: '柱状图' },
	{ type: 'bar', title: 'Bar', note: '条状图' },
	{ type: 'line', title: 'Line', note: '折线图' },
	{ type: 'area', title: 'Area', note: '区域图' },
	{ type: 'pie', title: 'Pie', note: '饼图' },
	{ type: 'ring', title: 'Ring', note: '圆环图' },
	{ type: 'rose', title: 'Rose', note: '玫瑰图' },
	{ type: 'funnel', title: 'Funnel', note: '漏斗图' },
	{ type: 'radar', title: 'Radar', note: '雷达图' },
	{ type: 'gauge', title: 'Gauge', note: '仪表盘' },
	{ type: 'arcbar', title: 'Arcbar', note: '圆弧进度' },
	{ type: 'mount', title: 'Mount', note: '山峰图' },
	{ type: 'mix', title: 'Mix', note: '混合图' },
	{ type: 'scatter', title: 'Scatter', note: '散点图' },
	{ type: 'bubble', title: 'Bubble', note: '气泡图' },
	{ type: 'candle', title: 'Candle', note: 'K 线图' },
	{ type: 'word', title: 'Word', note: '词云图' },
	{ type: 'tline', title: 'Time Line', note: '时间轴折线' },
	{ type: 'tarea', title: 'Time Area', note: '时间轴区域' }
]
