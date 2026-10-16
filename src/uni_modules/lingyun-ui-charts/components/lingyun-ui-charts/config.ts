/**
 * lingyun-ui-charts 图表配置
 * 系列色对齐 design/COLORS.md · Sketch System Accents（默认 Light）
 * 单图覆盖：`:opts="{ color: chartColorDark }"` 或 `series[].color`。
 */

/** Light：Blue / Green / Yellow / Red / Cyan / Mint / Orange / Purple / Pink */
export const chartColor = [
  '#0088ff',
  '#34c759',
  '#ffcc00',
  '#ff383c',
  '#00c0e8',
  '#00c8b3',
  '#ff8d28',
  '#cb30e0',
  '#ff2d55',
]

/**
 * 图例文字。对齐 design/COLORS.md Labels。
 * 浅色 Primary `#000` / Secondary `rgba(60, 60, 67, 0.6)`
 * 暗黑 Primary `#fff` / Secondary `rgba(235, 235, 245, 0.6)`
 */
export const chartLabelColor = '#000000'
export const chartLabelColorDark = '#ffffff'
export const chartLabelSecondaryColor = 'rgba(60, 60, 67, 0.6)'
export const chartLabelSecondaryColorDark = 'rgba(235, 235, 245, 0.6)'

/** Dark 对应色，暗黑页可 `:opts="{ color: chartColorDark }"` */
export const chartColorDark = [
  '#0091ff',
  '#30d158',
  '#ffd600',
  '#ff4245',
  '#3cd3fe',
  '#00dac3',
  '#ff9230',
  '#db34f2',
  '#ff375f',
]

const color = chartColor

//事件转换函数，主要用作格式化x轴为时间轴，根据需求自行修改
const formatDateTime = (timeStamp: number, returnType?: string) => {
  var date = new Date();
  date.setTime(timeStamp * 1000);
  var y = date.getFullYear();
  var m: string | number = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d: string | number = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h: string | number = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute: string | number = date.getMinutes();
  var second: string | number = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  if(returnType == 'full'){return y + '-' + m + '-' + d + ' '+ h +':' + minute + ':' + second;}
  if(returnType == 'y-m-d'){return y + '-' + m + '-' + d;}
  if(returnType == 'h:m'){return  h +':' + minute;}
  if(returnType == 'h:m:s'){return  h +':' + minute +':' + second;}
  return [y, m, d, h, minute, second];
}

const cfu: Record<string, any> = {
	"type":["pie","ring","rose","word","funnel","map","arcbar","line","curve","column","stack","mount","bar","area","radar","gauge","candle","mix","tline","tarea","scatter","bubble"],
	"range":["饼状图","圆环图","玫瑰图","词云图","漏斗图","地图","圆弧进度条","折线图","曲线图","柱状图","堆积柱状图","山峰图","条状图","区域图","雷达图","仪表盘","K线图","混合图","时间轴折线","时间轴区域","散点图","气泡图"],
	"categories":["line","curve","column","stack","mount","bar","area","radar","gauge","candle","mix"],
  //instance为实例变量承载属性，不要删除
  "instance":{},
  //option为opts承载属性，不要删除
  "option":{},
  //下面是自定义format配置，因除H5端外的其他端无法通过props传递函数，只能通过此属性对应下标的方式来替换
  "formatter":{
    "xAxisDemo2":function(val: any){return formatDateTime(val,'h:m')},
  },
  //下面是自定义配置，请添加项目所需的通用配置
	"pie":{
		"type": "pie",
    "color": color,
		"padding": [5,5,5,5],
		"extra": {
			"pie": {
				"activeOpacity": 0.5,
				"activeRadius": 10,
				"offsetAngle": 0,
				"labelWidth": 15,
				"border": true,
				"borderWidth": 3,
				"borderColor": "#FFFFFF"
			},
		}
	},
	"ring":{
		"type": "ring",
    "color": color,
		"padding": [5,5,5,5],
		"rotate": false,
		"dataLabel": true,
		"legend": {
			"show": true,
			"position": "right",
      "lineHeight": 25,
		},
		"title": {
			"name": "70%"
		},
		"subtitle": {
			"name": "收益率"
		},
		"extra": {
			"ring": {
				"ringWidth":30,
				"activeOpacity": 0.5,
				"activeRadius": 10,
				"offsetAngle": 0,
				"labelWidth": 15,
				"border": false,
				"borderWidth": 3,
				"borderColor": "#FFFFFF"
			},
		},
	},
	"rose":{
		"type": "rose",
    "color": color,
		"padding": [5,5,5,5],
		"legend": {
			"show": true,
			"position": "left",
      "lineHeight": 25,
		},
		"extra": {
			"rose": {
				"type": "area",
				"minRadius": 50,
				"activeOpacity": 0.5,
				"activeRadius": 10,
				"offsetAngle": 0,
				"labelWidth": 15,
				"border": false,
				"borderWidth": 2,
				"borderColor": "#FFFFFF"
			},
		}
	},
	"word":{
		"type": "word",
    "color": color,
		"extra": {
			"word": {
				"type": "normal",
				"autoColors": false
			}
		}
	},
	"funnel":{
		"type": "funnel",
    "color": color,
		"padding": [15,15,0,15],
		"extra": {
			"funnel": {
				"activeOpacity": 0.3,
				"activeWidth": 10,
				"border": true,
				"borderWidth": 2,
				"borderColor": "#FFFFFF",
				"fillOpacity": 1,
				"labelAlign": "right"
			},
		}
	},
	"map":{
		"type": "map",
    "color": color,
		"padding": [0,0,0,0],
    "dataLabel": true,
		"extra": {
			"map": {
				"border": true,
				"borderWidth": 1,
				"borderColor": "#666666",
				"fillOpacity": 0.6,
				"activeBorderColor": "#F04864",
				"activeFillColor": "#FACC14",
				"activeFillOpacity": 1
			},
		}
	},
	"arcbar":{
		"type": "arcbar",
    "color": color,
		"title": {
			"name": "百分比",
			"fontSize": 25,
			"color": "#00FF00"
		},
		"subtitle": {
			"name": "默认标题",
			"fontSize": 15,
			"color": "#666666"
		},
		"extra": {
			"arcbar": {
				"type": "default",
				"width": 12,
				"backgroundColor": "#E9E9E9",
				"startAngle": 0.75,
				"endAngle": 0.25,
				"gap": 2
			}
		}
	},
	"line":{
		"type": "line",
    "color": color,
		"padding": [15,10,0,15],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
      "gridType": "dash",
      "dashLength": 2,
		},
		"legend": {
		},
		"extra": {
			"line": {
				"type": "straight",
				"width": 2,
				"stack": false,
        "activeType": "hollow"
			},
		}
	},
	/** 曲线图：类目轴平滑曲线，引擎仍是 line；stack 同折线 */
	"curve":{
		"type": "line",
    "color": color,
		"padding": [15,10,0,15],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
      "gridType": "dash",
      "dashLength": 2,
		},
		"legend": {
		},
		"extra": {
			"line": {
				"type": "curve",
				"width": 2,
				"stack": false,
        "activeType": "hollow"
			},
		}
	},
  "tline":{
  	"type": "line",
    "color": color,
  	"padding": [15,10,0,15],
  	"xAxis": {
      "disableGrid": false,
      "boundaryGap":"justify",
  	},
  	"yAxis": {
      "gridType": "dash",
      "dashLength": 2,
      "data":[
        {
          "min":0,
          "max":80
        }
      ]
  	},
  	"legend": {
  	},
  	"extra": {
  		"line": {
  			"type": "curve",
  			"width": 2,
        "activeType": "hollow"
  		},
  	}
  },
  "tarea":{
  	"type": "area",
    "color": color,
  	"padding": [15,10,0,15],
  	"xAxis": {
      "disableGrid": true,
      "boundaryGap":"justify",
  	},
  	"yAxis": {
      "gridType": "dash",
      "dashLength": 2,
      "data":[
        {
          "min":0,
          "max":80
        }
      ]
  	},
  	"legend": {
  	},
  	"extra": {
  		"area": {
  			"type": "curve",
  			"opacity": 0.2,
  			"addLine": true,
  			"width": 2,
  			"gradient": true,
        "activeType": "hollow"
  		},
  	}
  },
	"column":{
		"type": "column",
    "color": color,
		"padding": [15,15,0,5],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
      "data":[{"min":0}]
		},
		"legend": {
		},
		"extra": {
			"column": {
				"type": "group",
				"width": 28,
				"seriesGap": 3,
				"categoryGap": 6,
				"barBorderRadius": [6, 6, 0, 0],
				"activeBgColor": "#000000",
				"activeBgOpacity": 0.08
			},
		}
	},
	/** 堆积柱状图：引擎 column + extra.column.type stack */
	"stack":{
		"type": "column",
    "color": color,
		"padding": [15,15,0,5],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
      "data":[{"min":0}]
		},
		"legend": {
		},
		"extra": {
			"column": {
				"type": "stack",
				"width": 28,
				"categoryGap": 6,
				"barBorderRadius": [6, 6, 0, 0],
				"activeBgColor": "#000000",
				"activeBgOpacity": 0.08
			},
		}
	},
  "mount":{
  	"type": "mount",
    "color": color,
  	"padding": [15,15,0,5],
  	"xAxis": {
      "disableGrid": true,
  	},
  	"yAxis": {
      "data":[{"min":0}]
  	},
  	"legend": {
  	},
  	"extra": {
  		"mount": {
  			"type": "mount",
  			"widthRatio": 1.5,
  		},
  	}
  },
  "bar":{
  	"type": "bar",
    "color": color,
  	"padding": [15,30,0,5],
  	"xAxis": {
      "boundaryGap":"justify",
      "disableGrid":false,
      "min":0,
      "axisLine":false
  	},
  	"yAxis": {
  	},
  	"legend": {
  	},
  	"extra": {
  		"bar": {
  			"type": "group",
  			"width": 28,
  			"seriesGap": 3,
  			"categoryGap": 6,
  			/** [右上, 右下, 左下, 左上]：默认右侧顶端圆角 */
  			"barBorderRadius": [6, 6, 0, 0],
  			"meterBorde": 1,
  			"meterFillColor": "#FFFFFF",
  			"activeBgColor": "#000000",
  			"activeBgOpacity": 0.08
  		},
  	}
  },
	"area":{
		"type": "area",
		"color": color,
		"padding": [15,15,0,15],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
      "gridType": "dash",
      "dashLength": 2,
		},
		"legend": {
		},
		"extra": {
			"area": {
				"type": "straight",
				"opacity": 0.2,
				"addLine": true,
				"width": 2,
				"gradient": false,
				"stack": false,
        "activeType": "hollow"
			},
		}
	},
	"radar":{
		"type": "radar",
		"color": color,
		"padding": [5,5,5,5],
    "dataLabel": false,
		"legend": {
			"show": true,
			"position": "right",
      "lineHeight": 25,
		},
		"extra": {
			"radar": {
				"gridType": "radar",
				"gridColor": "#CCCCCC",
				"gridCount": 3,
				"opacity": 0.2,
				"max": 200,
				"labelShow": true
			},
		}
	},
	"gauge":{
		"type": "gauge",
		"color": color,
		"title": {
			"name": "66Km/H",
			"fontSize": 25,
			"color": "#2fc25b",
			"offsetY": 50
		},
		"subtitle": {
			"name": "实时速度",
			"fontSize": 15,
			"color": "#1890ff",
			"offsetY": -50
		},
		"extra": {
			"gauge": {
				"type": "default",
				"width": 30,
				"labelColor": "#666666",
				"startAngle": 0.75,
				"endAngle": 0.25,
				"startNumber": 0,
				"endNumber": 100,
				"labelFormat": "",
				"splitLine": {
					"fixRadius": 0,
					"splitNumber": 10,
					"width": 30,
					"color": "#FFFFFF",
					"childNumber": 5,
					"childWidth": 12
				},
				"pointer": {
					"width": 24,
					"color": "auto"
				}
			}
		}
	},
	"candle":{
		"type": "candle",
		"color": color,
		"padding": [15,15,0,15],
		"enableScroll": true,
		"enableMarkLine": true,
		"dataLabel": false,
		"xAxis": {
			"labelCount": 4,
			"itemCount": 40,
			"disableGrid": true,
			"gridColor": "#CCCCCC",
			"gridType": "solid",
			"dashLength": 4,
			"scrollShow": true,
			"scrollAlign": "left",
			"scrollColor": "#A6A6A6",
			"scrollBackgroundColor": "#EFEBEF"
		},
		"yAxis": {
		},
		"legend": {
		},
		"extra": {
			"candle": {
				"color": {
					"upLine": "#f04864",
					"upFill": "#f04864",
					"downLine": "#2fc25b",
					"downFill": "#2fc25b"
				},
				"average": {
					"show": true,
					"name": ["MA5","MA10","MA30"],
					"day": [5,10,20],
					"color": ["#1890ff","#2fc25b","#facc14"]
				}
			},
			"markLine": {
				"type": "dash",
				"dashLength": 5,
				"data": [
					{
						"value": 2150,
						"lineColor": "#f04864",
						"showLabel": true
					},
					{
						"value": 2350,
						"lineColor": "#f04864",
						"showLabel": true
					}
				]
			}
		}
	},
	"mix":{
		"type": "mix",
		"color": color,
		"padding": [15,15,0,15],
		"xAxis": {
      "disableGrid": true,
		},
		"yAxis": {
			"disabled": false,
			"disableGrid": false,
			"splitNumber": 5,
			"gridType": "dash",
			"dashLength": 4,
			"gridColor": "#CCCCCC",
			"padding": 10,
			"showTitle": true,
			"data": []
		},
		"legend": {
		},
		"extra": {
			"mix": {
				"column": {
					"width": 20
				}
			},
		}
	},
	"scatter":{
		"type": "scatter",
		"color":color,
		"padding":[15,15,0,15],
    "dataLabel":false,
    "xAxis": {
      "disableGrid": false,
      "gridType":"dash",
      "splitNumber":5,
      "boundaryGap":"justify",
      "min":0
    },
    "yAxis": {
      "disableGrid": false,
      "gridType":"dash",
    },
    "legend": {
    },
    "extra": {
    	"scatter": {
    	},
    }
	},
	"bubble":{
		"type": "bubble",
		"color":color,
		"padding":[15,15,0,15],
    "xAxis": {
      "disableGrid": false,
      "gridType":"dash",
      "splitNumber":5,
      "boundaryGap":"justify",
      "min":0,
      "max":250
    },
    "yAxis": {
      "disableGrid": false,
      "gridType":"dash",
      "data":[{
        "min":0,
        "max":150
      }]
    },
    "legend": {
    },
    "extra": {
    	"bubble": {
        "border":2,
        "opacity": 0.5,
    	},
    }
	}
}

export { cfu }
