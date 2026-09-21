# Buttons 规范（强制 · lingyun-button）

> `lingyun-button` **必须**按苹果官方 Buttons 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的按钮专章，与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Buttons**  
   符号：https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons  
   画布：https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/DFCF7064-B052-4DCA-B903-9052EE7AB4BD/canvas
2. **HIG · Buttons**  
   https://developer.apple.com/design/human-interface-guidelines/buttons
3. **Liquid Glass 总则**  
   [`UI_SPEC.md`](./UI_SPEC.md)

---

## 1. Sketch 符号矩阵（已核对）

### 1.1 样式 Style → `variant`

| Sketch 名称 | lingyun `variant` | 用途 |
|-------------|-------------------|------|
| Bordered Prominent | `borderedProminent` | 最突出主操作 |
| Bordered | `bordered` | 次级有底按钮 |
| Borderless（Default） | `borderless` | 纯文本/轻操作 |
| Glass | `glass` | **默认**：Liquid Glass 控件层 |
| Glass Prominent | ⏳ 未实现 | 带 Tint 的玻璃主操作（Sketch 由 `Tinted Glass` + `Tint Color` 两层拼） |

兼容别名：`filled`→`borderedProminent`，`plain`→`borderless`，`gray`/`tinted`→`bordered`。

### 1.2 内容 Content

| Sketch | 说明 |
|--------|------|
| Symbol | 仅图标；Large 常见 **50×50** |
| Text | 仅文案；Large 常见 **72×50** |
| Symbol + Text | 图标+文案；Large 常见 **91×50** |

### 1.3 尺寸 Size

Sketch 实测（`Buttons/Light/*/*/Default` · `.../Text/1 - Idle` 的 Inspect）：

| Sketch | 高度 | padding（纵/横） |
|--------|------|------------------|
| Bordered / Bordered Prominent / Borderless · Large | **50** | 16 / 20 |
| 同上 · Medium | **34** | 8 / 12 |
| 同上 · Small | **28** | 5 / 10 |
| **Glass · Large** | **46** | **14 / 20** |
| Glass · Regular | 34 | 8 / 12 |
| Glass · Small | 28 | 5 / 10 |

⚠️ **Glass 的 Large 比 Bordered 矮 4**（46 vs 50），不是同高；`lingyun-button` 已按此拆开。

当前实现的 `size` 阶梯（历史沿用，比 Sketch 多插了一档 40）：

| size | 高度 | 对应 Sketch |
|------|------|-------------|
| `large`（默认） | 50（glass 46） | Large |
| `medium` | 40 | — （自有档） |
| `small` | 34 | Medium |
| `mini` | 28 | Small |

实现换算：**1pt = 1px**。❌ 禁止 `rpx`。

触控热区：**≥ 44×44 pt（44×44 px）**（HIG）。

### 1.4 外观 Appearance

- `Dark` / `Light`；玻璃与边框对比度随明暗自适应。
- 状态至少：**Idle**、**Disabled**；按下用 hover 反馈。

### 1.5 Role

| role | 规则 |
|------|------|
| `normal` | 默认 |
| `success` | 绿色语义（System Green） |
| `warning` | 橙色语义（System Orange） |
| `destructive` | 红色语义；禁止当作「最可能点击」的主按钮叙事（HIG） |
| `cancel` | 取消/关闭，弱于主操作 |

---

## 2. API（lingyun-button）

```vue
<lingyun-button
  variant="glass"
  size="large"
  role="normal"
  text="Continue"
  @click="onTap"
/>

<lingyun-button variant="borderedProminent" text="Save" />
<lingyun-button variant="bordered" text="Edit" />
<lingyun-button variant="borderless" text="Skip" />
<lingyun-button variant="glass" role="destructive" text="Delete" />
<lingyun-button variant="glass" role="success" text="Done" />
<lingyun-button variant="borderedProminent" role="warning" text="Retry" />
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `variant` | string | `glass` | Sketch Style（不用 prop 名 `style`，避免与 CSS 冲突） |
| `size` | string | `large` | `large` \| `medium` \| `small` \| `mini` |
| `role` | string | `normal` | `normal` \| `success` \| `warning` \| `destructive` \| `cancel` |
| `text` | string | `''` | 文案；亦可用默认插槽 |
| `icon` | string | `''` | 简易符号；或 `#icon` 插槽 |
| `block` | boolean | `false` | 通栏 |
| `disabled` | boolean | `false` | |
| `loading` | boolean | `false` | 内嵌 activity indicator（HIG） |

---

## 3. 视觉硬规则

- 默认 **胶囊圆角**（Sketch `border-radius: calc(infinity * 1px)`）。
- `glass` 必须走 **`@include lingyun-glass-control`**（见 §3.1）。❌ 不要用 `lingyun-glass-regular`（小程序退 0.94 实霜，真机死白）；❌ 也不要用 `lingyun-glass-surface`（那是面板档，模糊 20 太重）。
- `borderedProminent`：System Blue **实底，无描边、无投影**（Sketch 只有 `background-color` + 圆角）。
- Disabled：不透明度约 0.4。
- 文案：Title Case、短动词开头（HIG）。
- 同组多选项用 **variant 区分主次**，勿乱变 size（HIG）。

### 3.1 控件级玻璃配方（Sketch 图层样式 `Liquid Glass/Light|Dark · Regular - Small`）

按钮玻璃和浮层面板玻璃**不是一档**。逐项来自 `Buttons/Light|Dark/Large/Glass/Default` 的 Inspect：

| 项 | Light | Dark |
|----|-------|------|
| 背景模糊 | **6px**（不是面板的 20） | 同左 |
| 填充 | `#F8F8F8 20%`(Luminosity) + `#000 25%` + `#FFF 25%` + `#444 60%`(Plus lighter)，合成 ≈ `rgba(255,255,255,.42)` | `#000 100%`(Screen) + `#999 17%` ≈ `rgba(153,153,153,.17)` |
| 光学描边 | `0 0 0 0.5px #DBDBDB`（≈白底 14% 黑）+ 两侧 `±1.25px/-0.75` 加强 | `#BFBFBF` 同法 |
| 投影 | `0 8px 15px rgba(0,0,0,.02)` —— 几乎不可见 | `.04` |
| 透镜内缘 | 上下 `inset 0 ±1px` 高光 + `±4px blur .5 spread -4` 提亮；两侧 `inset ±20px 0 20px -30px` 压暗 | 同结构，强度减半 |

实现：`styles/setting/_glass.scss` 的 `$lingyun-glass-control-*` + `@mixin lingyun-glass-control`。  
描边走 `box-shadow`（`border` 最细只有 1px，画不出 0.5）。

---

## 4. 自检

- [ ] variant / size / role 与 Sketch·HIG 一致
- [ ] Large：Bordered / Prominent / Borderless **50**，Glass **46**（padding 20）
- [ ] `glass` 用 `lingyun-glass-control`：模糊 6、0.5px 中性描边、投影近乎不可见
- [ ] `borderedProminent` 无描边无投影
- [ ] 按下不冲掉玻璃描边 / 内缘光（只压底色 + `scale(.98)`）
- [ ] 图标按钮近正方形；文本按钮内边距充足
- [ ] 热区 ≥ 44pt；Disabled / Loading 符合 HIG
- [ ] 符合 `UI_SPEC.md` Liquid Glass
