# lingyun-date-switcher

底部固定的日期切换条。左右按钮切换上一段 / 下一段，中间显示日期或区间，日历图标紧跟日期左侧、整体居中。视觉与 `lingyun-tabbars` 同一套玻璃胶囊。完整示例见 demo `pages/demo/date-switcher`（天 / 周 / 月 / 年 / 自定义日期段、模式菜单与范围限制）。

## 示例

```vue
<!-- 周：v-model 为区间起始日；v-model:mode 接收右侧模式菜单 -->
<lingyun-date-switcher
  v-model="week"
  v-model:mode="mode"
  mode="week"
  :modes="['date', 'week', 'month']"
  limit="past"
  @change="onChange"
/>

<!-- 月 -->
<lingyun-date-switcher v-model="month" mode="month" />

<!-- 年 -->
<lingyun-date-switcher v-model="year" mode="year" />

<!-- 自定义日期段：v-model 为 [start, end] -->
<lingyun-date-switcher v-model="range" mode="range" :max="'2026-12-31'" />
```

点击中间会打开内置日期选择器（天 / 周 / 月 / 年 / 日期段自动映射到 `lingyun-picker` 的对应模式）。右侧的圆形模式按钮显示当前模式字（天 / 周 / 月 / 年 / 自），点击弹出菜单切换；用 `v-model:mode` 接收切换结果，`modes` 决定菜单里出现哪些模式，`showModeSwitch=false` 或 `modes` 为空时按钮整体不显示。固定条默认在页面底部；宽屏下和 `lingyun-tabbars`、`lingyun-search-bar` 一样让开左侧导航列（84 / 304），只在右侧内容区居中。页面内容底部留出约 140px。与底部 Tab 同时存在时，本页需要隐藏 Tab 栏（`<lingyun-app-page :show-tabbar="false">` 或页面覆盖 `hideTabbar`）。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `mode` | `date` / `week` / `month` / `year` / `range` | date |
| `modelValue / value` | 日期字符串，或 `range` 模式的 `[start, end]` | — |
| `weekStartsOn` | `1` 周一开始，`0` 周日开始 | 1 |
| `showModeSwitch` | 显示右侧模式按钮；`false` 时整个按钮不渲染 | true |
| `modes` | 允许切换的模式，如 `['date', 'week']`；为空时按钮隐藏 | 全部五种 |
| `limit` | 快捷范围限制；和 min/max 取更严格的一边 | '' |
| `min / max` | 可选范围，越界时对应按钮禁用 | '' |
| `fixed` | 固定在底部 | true |
| `safeArea` | 固定时预留底部安全区 | true |
| `zIndex` | 固定条层级 | 900 |
| `icon` / `showIcon` | 中间图标 | calendar / true |
| `picker` | 点击中间打开内置日期选择器 | true |
| `pickerTitle` | 选择器标题 | 按模式自动 |
| `formatter` | 自定义中间文案，入参 `{ mode, start, end, value }` | — |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` / `update:value` | 前后切换后的新值 |
| `update:mode` / `mode-change` | 右侧菜单切换模式 |
| `change` | JSON：`{ type, date?, week?, month?, year?, range, value }`，见下 |
| `center` | 点击中间区域，参数同 `change`（内置选择器同时打开） |

## change 返回

| 模式 | 返回 |
| --- | --- |
| 天 | `{ "type": "day", "value": "2026-11-06", "date": "2026-11-06", "range": "2026-11-06 - 2026-11-06" }` |
| 周 | `{ "type": "week", "value": "2026-46", "week": "2026-46", "range": "2026-11-09 - 2026-11-15" }` |
| 月 | `{ "type": "month", "value": "2026-11", "month": "2026-11", "range": "2026-11-01 - 2026-11-30" }` |
| 年 | `{ "type": "year", "value": "2026", "year": "2026", "range": "2026-01-01 - 2026-12-31" }` |
| 日期段 | `{ "type": "range", "value": "2026-10-26 - 2026-11-01", "range": "2026-10-26 - 2026-11-01" }` |

- `value` 是统一选择值：day 为日期、week 为周、month 为月、year 为年、range 为日期段。
- `range` 统一为 `YYYY-MM-DD - YYYY-MM-DD`（空格 + 短横线 + 空格）。
- `week` 使用 ISO 8601 周（周一开始），格式 `YYYY-WW`。
- 切换 `mode` 也会触发一次 `change`，返回新模式的当前周期。

## 范围限制 limit

| 值 | 含义 |
| --- | --- |
| `past` | 今天之前（含今天） |
| `future` | 今天之后（含今天） |
| `today` | 仅今天 |
| `beforeToday` | 今天之前（不含今天） |
| `afterToday` | 今天之后（不含今天） |
| `thisWeek` | 本周内（周一开始） |
| `beforeThisWeek` | 本周之前 |
| `afterThisWeek` | 本周之后 |
| `thisMonth` | 本月内 |
| `beforeThisMonth` | 本月之前 |
| `afterThisMonth` | 本月之后 |

上一段 / 下一段会按“整段”判断：周、月、年、日期段的开始和结束都必须在限制内，否则对应按钮禁用。`min` / `max` 仍可同时使用，最终取更严格的一边。

## 日期显示

- `date`：`YYYY-MM-DD`
- `week` / `range`：同年 `YYYY-MM-DD 至 MM-DD`，跨年写全
- `month`：`YYYY年M月`
- `year`：`YYYY年`

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/date-switcher.vue -->
