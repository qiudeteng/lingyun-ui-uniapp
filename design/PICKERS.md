# Picker 规范（强制 · lingyun-picker / lingyun-data-picker）

> 自绘选择器。**不用原生 `picker`**：开启 `darkmode` 后原生弹层跟系统外观，手动浅色时仍会发黑。  
> **日期 / 时间**对齐 Sketch [Examples/Date and Time Picker](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Examples%252FDate%2520and%2520Time%2520Picker)（Compact 日历 + Time 行）。  
> **Selector / 级联**弹层视觉对齐 [`SHEETS.md`](./SHEETS.md) medium，但**不依赖** `lingyun-sheets`。  
> 进多控件表单页时用 [`FORMS.md`](./FORMS.md) 的 `lingyun-form-item` 包裹。

## 权威来源

1. **Sketch · Examples/Date and Time Picker**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Examples%252FDate%2520and%2520Time%2520Picker
2. **HIG · Pickers**  
   https://developer.apple.com/design/human-interface-guidelines/pickers
3. **Liquid Glass** · [`UI_SPEC.md`](./UI_SPEC.md) §6.2-A.1

---

## 1. 弹层共性

| 项 | Selector / 级联 | Date / DateTime（日历） | Time（滚轮） |
|----|-----------------|-------------------------|--------------|
| 形态 | 底部 Sheet medium | 同左；内容为 Compact 日历卡 | 同左；内容为滚轮 |
| 触发器 | 行：标题 + 值 + disclosure；**非 cell** 同 Text Field：高 52、圆角 26、Fill Tertiary | 同左；日期值可用 capsule 强调 | 同左 |
| 材质 | `lingyun-glass-surface` + `#fff`@0.72；自挂 `theme-*` | 同左 | 同左 |
| 几何 | 四周内缩 **8**、**四角 34**（对齐 Sketch Medium Detent 悬浮卡片）；宽屏面板宽上限 **420** 水平居中 | 同左 | 同左 |
| 关闭 | 遮罩 / 取消 / Grabber 下滑 ≥72 | 同左；**完成**写入 | 同左 |
| 挂载 | H5 `Teleport`→`body`；mp `root-portal` | 同左 | 同左 |
| 依赖 | ❌ 禁止 `lingyun-sheets` / `lingyun-toolbars` | 同左 | 同左 |

---

## 2. Compact Date and Time（Sketch 核对）

Sketch 符号 **Compact Date and Time Picker** ≈ **320 × 378**（内容区参考；实现可随 sheet 宽铺满）：

| 区 | 约定 |
|----|------|
| Header | 日→月：左标题 + disclosure。月→年：左 `YYYY年` + disclosure；右箭头切年。年视图：左页范围；右箭头翻 12 年页 |
| Header 图标 | 全部走 `lingyun-icon`，**统一 16px + primary 色**：disclosure `bottom`（距标题 **6px**）、翻页 `left` / `right`。**禁止**叠两个图标拼「双箭头」 |
| Week | `日一二三四五六`（周日为首）；次要字色、小字号 |
| Month 格 | 日视图：7×**固定 6 行**；月份视图：**3×4**；二者共用 **body 292px**，切模式不抖 |
| 选中 | **Label 实心圆** + 反白字（Light 黑底 / Dark 白底）；**不是** primary 蓝圆 |
| 今日 | `primary-soft` 浅底圆 + Label 字（未选中时） |
| 越界 | `start` / `end` 外不可点，三/四级字色 |
| Time 行（datetime） | 左标签「时间」；中：时刻 capsule；右：AM/PM 分段（`hour12` 时） |
| 时刻编辑 | 点时刻 capsule 展开 / 收起 `picker-view` 时分列 |

---

## 3. lingyun-picker

```vue
<lingyun-picker v-model="idx" :range="options" title="City" />
<lingyun-picker v-model="day" mode="date" title="Date" />
<lingyun-picker v-model="span" mode="daterange" title="区间" />
<lingyun-picker v-model="week" mode="week" title="周" />
<lingyun-picker v-model="when" mode="datetime" title="日期时间" />
<lingyun-picker v-model="time" mode="time" title="Time" />
<!-- 旧滚轮日期 -->
<lingyun-picker v-model="day" mode="date" picker-style="wheels" />
```

Demo：

- Selector / 级联 → `pages/demo/pickers`
- 日期 / 时间 / 日期时间（丰富用例）→ `pages/demo/date-time-pickers`

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` | — | selector 为 index；date / time / datetime 为字符串；**daterange / week** 为 `[start, end]`（`YYYY-MM-DD`） |
| `mode` | `selector` | `selector` / `date` / `daterange` / `week` / `time` / `datetime` |
| `pickerStyle` | `auto` | `auto`：date / daterange / week / datetime→日历，其它→滚轮；可强制 `calendar` / `wheels`（daterange / week 仅日历） |
| `range` / `rangeKey` | — | selector 选项 |
| `start` / `end` | — | date / datetime / daterange / week 边界（`YYYY-MM-DD`） |
| `fields` | `day` | date：`day`（默认日历日）/ `month`（年月格，点选确认 `YYYY-MM`）/ `year`（年格，点选确认 `YYYY`）；`wheels` 同值格式 |
| `weekStartsOn` | `0` | **week**：周起始，`0`=周日（默认，对齐表头）… `6`=周六 |
| `lunar` | `false` | 日历日格：数字下方显示农历 |
| `marks` | `[]` | 日历标记：`{ date, badge?, dot? }[]`。`badge` 右上角小字（如「班」「休」）；`dot` 底部圆点：`true`/`red`（默认红）/ `orange` / `green`。无行间横线 |
| `hour12` | `false` | time / datetime：12 小时 + AM/PM |
| `minuteInterval` | `1` | 分钟步进（1 / 5 / 10 / 15 / 30） |
| `title` / `placeholder` / `disabled` | — | 同前 |
| `cancelText` / `confirmText` | `取消` / `完成` | 弹层按钮 |
| `variant` | `auto` | `field` / `cell` / `auto`（form-item 内 cell） |

值格式：

| mode | 字符串 |
|------|--------|
| `date` | `YYYY-MM-DD`；`fields=month` → `YYYY-MM`；`fields=year` → `YYYY` |
| `daterange` | `[start, end]`，均为 `YYYY-MM-DD`；同一天可选 |
| `week` | `[weekStart, weekEnd]`，默认周日→周六（可用 `weekStartsOn` 改） |
| `time` | `HH:mm`（24h 存储） |
| `datetime` | `YYYY-MM-DD HH:mm` |

`daterange` 交互：第一次点开始日，第二次点结束日（若早于开始则自动对调）；再点则重新选开始。中间日浅蓝底，起止为选中圆。

`week` 交互：点任意一天即选中其所在整周（7 天高亮）；再点另一周则切换。

**天视图补位（强制）**：日历固定 **6 行 × 7 列 = 42 格**，1 号之前与月末之后的空位用**相邻月真实日期**补齐，灰显（Label Tertiary）且**不可点**（要跨月先翻月）。补位格仍参与周 / 区间高亮，否则整周条带会在月首月尾断开、圆角缺口很难看；但补位格即使命中选中日 / 今天也**不画实心圈或蓝底**，避免看着像可点。格子起始日与表头星期均随 `weekStartsOn` 旋转——两者必须一致，否则整周高亮会跨两行。

事件：`update:modelValue`、`update:value`、`change`、`cancel`

---

## 4. lingyun-data-picker（数据驱动级联）

`localdata` 树驱动多列；改左列时右侧列按 `children` 重算。弹层仍为滚轮 Sheet（非日历）。

```vue
<lingyun-data-picker
  v-model="region"
  title="地区"
  :localdata="regionTree"
/>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `value` | `[]` | **路径值数组** |
| `localdata` | `[]` | `{ text, value, children? }[]` |
| `map` | `{ text, value, children }` | 字段映射 |
| `separator` | `' / '` | 行上展示拼接符 |
| `title` / `placeholder` / `disabled` | — | 同 picker |
| `cancelText` / `confirmText` | `取消` / `完成` | 弹层按钮 |

事件：`change` → `{ value, text, path, detail }`；`cancel`

---

## 5. 注意事项

1. **底边一定要贴屏**：`lingyun-glass-surface` 里带 `border-radius`（16）与四边 `border`，`@include` 必须写在 `border-bottom-*-radius: 0` / `border-bottom: 0` **之前**，否则底部会被 mixin 还原成 16 圆角 + 一条描边——真机上像被截断的卡片。`lingyun-sheets` 同理。
2. 表头图标只用 `lingyun-icon`，统一 16px；**不要**叠两个图标拼双箭头。

---

## 6. 自检

- [ ] 弹层为悬浮卡片：四周内缩 8、四角 34；收起后无残留露头
- [ ] 宽屏（iPad / 桌面 H5）面板不铺满：宽 ≤420 且水平居中
- [ ] date / datetime 为日历（非默认三列滚轮）；选中为 Label 圆、今日为 soft 圆
- [ ] `daterange` 可点选起止，区间高亮；值为 `[start, end]`
- [ ] `week` 点选整周（默认周日～周六）；值为 `[weekStart, weekEnd]`
- [ ] 天视图首尾用灰色相邻月日期补齐（不可点）；选月首 / 月末那周时条带完整不断开
- [ ] `lunar` 数字下显示农历；`marks.badge` 右上小字、`marks.dot` 底部红/橙/绿点；无行间横线
- [ ] datetime 底栏 Time + 时刻 capsule；`hour12` 时有 AM/PM
- [ ] 浅色弹层为玻璃浅色（非系统黑）
- [ ] 未 import `lingyun-sheets`
- [ ] H5 不被 card 裁切；mp-weixin 可运行
- [ ] Grabber 下滑可关
