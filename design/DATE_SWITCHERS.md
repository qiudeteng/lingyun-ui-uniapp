# Date Switchers 规范（强制 · lingyun-date-switcher）

> 底部固定日期切换条。视觉与交互对齐 [`TABBARS.md`](./TABBARS.md)：同一套玻璃胶囊、底部安全区和 62 内容高。  
> 中间日期 / 区间在左右按钮之间**严格居中**，不使用参考稿的左对齐。

## 1. 形态（1pt = 1px）

| 项 | 约定 |
|----|------|
| 位置 | 固定底部；容器最大宽 **560**，左右内边距 **16**，水平居中 |
| 安全区 | `safeArea` 时底部再留 **21**（Home Indicator）；总高 16 + 62 + 21 = **99** |
| 材质 | `lingyun-glass-control` + 胶囊圆角，和 `lingyun-tabbars` 一致 |
| 内高 | **62**；`padding: 4`；左右按钮 **44×44** |
| 右侧模式钮 | **62×62** 独立玻璃圆钮，与切换条 gap **8**；按钮直接显示当前模式字 **天 / 周 / 月 / 年 / 自**，点击向上弹 `lingyun-menu` 切换模式；`showModeSwitch=false` 或 `modes` 为空时整个按钮不渲染 |
| 中间 | 日历图标 **17** 紧跟日期左侧，图标 + 文案整体居中；日期 **15 / 20** semibold |
| 左右按钮 | 54 圆钮，chevron **22**；hover `fill-secondary`；到边界时透明度 **0.35** 且不可点 |
| 层级 | 默认 `z-index: 900`；页面内容底部自行留 ≥ 140 的空白，避免被固定条挡住 |
| 主题 | 浅色 / 暗黑跟随 glass token 与 `--lingyun-label` |

## 2. 模式

| `mode` | 值 | 中间显示 | 上一段 / 下一段 |
|--------|----|----------|----------------|
| `date` | `YYYY-MM-DD` | 同值 | ±1 天 |
| `week` | 任意一天 | 周一至周日；同年 `YYYY-MM-DD 至 MM-DD`，跨年写全 | ±7 天 |
| `month` | 任意一天 | `YYYY年M月` | ±1 个自然月 |
| `year` | 任意一天 | `YYYY年` | ±1 个自然年 |
| `range` | `[start, end]` | 同年 `YYYY-MM-DD 至 MM-DD`，跨年写全 | 按当前区间长度整体平移（相邻不重叠） |

- 周起始：`weekStartsOn = 1` 周一（默认）/ `0` 周日。
- `min` / `max`：`YYYY-MM-DD`，越界的上一段 / 下一段直接禁用。
- `date` / `week` / `month` / `year` 的 v-model 是**区间起始日**；`range` 的 v-model 是 `[start, end]`。
- 点击中间区域**默认弹出内置 `lingyun-picker`**：天 / 周 / 日期段分别对应 `date` / `week` / `daterange`，月对应 `date` + `fields="month"`，年对应 `date` + `fields="year"`。选择后按模式归一化并触发 `change`。
- 传 `picker=false` 可关闭内置选择器，只发 `center`，由页面自己接选择器。
- 右侧模式按钮：点击弹出菜单，菜单只显示 `modes` 允许的模式；选中后发 `update:mode` / `mode-change`，并针对新模式发一次 `change`。`modes` 默认全部五种（`date / week / month / year / range`），可任意增减，顺序即菜单顺序。

### 2.1 范围限制

| 值 | 含义 |
|----|------|
| `past` / `future` / `today` | 含当天的今天之前 / 之后 / 仅今天 |
| `beforeToday` / `afterToday` | 不含当天的今天之前 / 之后 |
| `thisWeek` / `beforeThisWeek` / `afterThisWeek` | 本周内 / 本周之前 / 本周之后 |
| `thisMonth` / `beforeThisMonth` / `afterThisMonth` | 本月内 / 本月之前 / 本月之后 |

- 上一段 / 下一段按整段判断：周、月、年、日期段的起止都在限制内才允许，否则按钮置灰禁用。
- `min` / `max` 可同时传，最终取更严格的一边。

## 3. API

```vue
<lingyun-date-switcher
  v-model="week"
  mode="week"
  :week-starts-on="1"
  :min="'2026-01-01'"
  :max="'2026-12-31'"
  @change="onChange"
  @center="openPicker"
/>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `mode` | `date` | `date` / `week` / `month` / `year` / `range` |
| `modelValue` / `value` | — | 日期字符串或 `[start, end]` |
| `weekStartsOn` | `1` | `1` 周一，`0` 周日 |
| `showModeSwitch` | `true` | 显示右侧模式按钮；`false` 时整个按钮不渲染 |
| `modes` | 全部五种 | 允许切换的模式数组；为空时模式按钮隐藏 |
| `limit` | `''` | 快捷范围限制，见 §2.1 |
| `min` / `max` | `''` | 可选范围，越界禁用 |
| `fixed` | `true` | 固定底部；内联使用传 `false` |
| `safeArea` | `true` | 固定底部时预留 Home Indicator |
| `zIndex` | `900` | 固定条层级 |
| `icon` / `showIcon` | `calendar` / `true` | 中间日历图标 |
| `picker` | `true` | 点击中间打开内置日期选择器 |
| `pickerTitle` | `''` | 选择器标题；不传按模式取「选择日期 / 选择一周 / 选择月份 / 选择年份 / 选择日期段」 |
| `formatter` | — | 自定义中间文案，入参 `{ mode, start, end, value }` |

事件：`update:modelValue`、`update:value`、`update:mode`、`mode-change`、`change`、`center`。`change` / `center` 返回 JSON：

| 模式 | 返回 |
|------|------|
| 天 | `{ type: 'day', value: 'YYYY-MM-DD', date: 'YYYY-MM-DD', range: 'YYYY-MM-DD - YYYY-MM-DD' }` |
| 周 | `{ type: 'week', value: 'YYYY-WW', week: 'YYYY-WW', range: 'YYYY-MM-DD - YYYY-MM-DD' }` |
| 月 | `{ type: 'month', value: 'YYYY-MM', month: 'YYYY-MM', range: 'YYYY-MM-DD - YYYY-MM-DD' }` |
| 年 | `{ type: 'year', value: 'YYYY', year: 'YYYY', range: 'YYYY-01-01 - YYYY-12-31' }` |
| 日期段 | `{ type: 'range', value: 'YYYY-MM-DD - YYYY-MM-DD', range: 'YYYY-MM-DD - YYYY-MM-DD' }` |

- 切换 `mode` 时也发一次 `change`，返回新模式当前周期，保证父页面无需自己补算。
- `value` 为统一选择值：day=date、week=week、month=month、range=range。
- `week` 为 ISO 8601 周（周一开始，两位周数）。
- `formatter` 入参仍是内部的 `{ mode, start, end, value }`。

## 4. 自检

- [ ] 底部固定、安全区留白与 tabbar 一致；与底部 Tab 同时存在时页面必须隐藏其中一个
- [ ] 中间日期在左右按钮之间严格居中；长区间不溢出并省略
- [ ] 周 / 月 / 年 / 日期段的跨月、跨年边界正确
- [ ] 右侧模式菜单只显示 `modes` 允许的模式，切换会发 change；`showModeSwitch=false` 或 `modes` 为空时按钮不显示
- [ ] `limit` 预设到边界时上一段 / 下一段禁用，且与 min/max 取更严格一边
- [ ] 浅色 / 暗黑；微信小程序可编译
