# UI 规范：Apple Liquid Glass（强制）

> **本规范对全项目强制生效。**  
> 设计稿、业务页面视觉，以及 **凌云UI 全部组件**，都必须严格执行苹果最新 **Liquid Glass（液态玻璃）** 风格。  
> Agent / 协作者在任何改 UI、写组件、画设计稿的任务中都必须遵守；不得以「临时样式」「先能用」为由绕过。

权威参考（理解原则时以苹果文档为准）：

- [Meet Liquid Glass - WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)
- [HIG · Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [HIG · Color](https://developer.apple.com/design/human-interface-guidelines/color)
- **System Colors（Sketch · Apple iOS 27 UI Kit）**：[System Colors](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/color-variables?g=System%2520Colors) · 专章 [`COLORS.md`](./COLORS.md)
- [HIG · Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- **Alerts 符号（Sketch）**：[Alerts/Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight) · 专章 [`ALERTS.md`](./ALERTS.md)
- **Badges 符号（Sketch）**：[App Icons / Badge](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4FE3C0D6-2F3E-4203-A201-C708AFA8AC55#Inspect) · 专章 [`BADGES.md`](./BADGES.md)
- **Segmented Controls 符号（Sketch）**：[Segmented Controls](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls) · 专章 [`SEGMENTED_CONTROLS.md`](./SEGMENTED_CONTROLS.md)
- **Toolbars 符号（Sketch）**：[Toolbars/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone) · 专章 [`TOOLBARS.md`](./TOOLBARS.md)
- **Sheets 符号（Sketch）**：[Sheets/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FLight%252FiPhone) · [Sheets/Dark/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FDark%252FiPhone) · 专章 [`SHEETS.md`](./SHEETS.md)
- **Action Sheets**：[HIG](https://developer.apple.com/design/human-interface-guidelines/action-sheets) · [Sketch Action Sheets](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Action%2520Sheets) · 专章 [`ACTIONSHEETS.md`](./ACTIONSHEETS.md)
- **Activity Views**：[HIG](https://developer.apple.com/design/human-interface-guidelines/activity-views) · [Sketch Activity Views](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/F67968EA-A7A0-4A17-A510-D770D8F5C5FD/canvas) · 专章 [`ACTIVITY_VIEWS.md`](./ACTIVITY_VIEWS.md)
- **Text Fields 符号（Sketch）**：[Text Field Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/39D95D27-DDDF-4750-8ECE-18FF32FEC086#Inspect) · [Text Field Dark](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/CEBB1E12-74F7-4BF8-949D-3696FCFF4351#Inspect) · 专章 [`TEXTFIELDS.md`](./TEXTFIELDS.md)
- [HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [HIG · Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- **Buttons 符号（Sketch · Apple iOS 27 UI Kit）**：[Buttons](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons) · 专章 [`BUTTONS.md`](./BUTTONS.md)
- **Tab Bars 符号（Sketch）**：[Tab Bars](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars) · 专章 [`TABBARS.md`](./TABBARS.md)
- **Search Bar 符号（Sketch）**：[Search Selected - Placeholder](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/C46C53EC-096C-448D-94FC-AB949829C87E#Inspect) · 专章 [`SEARCHBARS.md`](./SEARCHBARS.md)
- **Lists 符号（Sketch）**：[Lists · Grouped](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect) · 专章 [`LISTS.md`](./LISTS.md)
- **Swipe Actions 符号（Sketch）**：[Rows with Swipe Actions](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions) · 专章 [`SWIPE_ACTIONS.md`](./SWIPE_ACTIONS.md)

---

## 0. 适用范围（Hard）

| 范围 | 是否必须符合 Liquid Glass |
|------|---------------------------|
| `src/uni_modules/lingyun-ui/**` 全部组件 | **必须** |
| `design/**` 设计稿中的控件 / 导航 / 浮层 | **必须** |
| 业务页中的自研控件外观（非纯内容排版） | **必须** |
| 第三方 `uni-*` 组件 | 不强行改源码；业务侧尽量用 lingyun 封装层对齐 |
| 纯内容层（正文、列表数据区、表单字段内容） | 用 **标准材质**，**不要**整页铺满玻璃 |

---

## 1. 分层模型（最重要）

Liquid Glass 是 **控件与导航功能层** 的材质，不是整页皮肤。

```
┌─────────────────────────────────────┐
│  Liquid Glass 层                      │  ← TabBar / Nav / 按钮 / 浮层 / Sheet / 工具栏
│  （半透明、折射感、高光、可形变）         │
├─────────────────────────────────────┤
│  内容层 Content                       │  ← 页面主体、列表、文章、表单内容
│  （标准材质 / 实色或轻模糊分区）         │
└─────────────────────────────────────┘
```

### 必须

- 玻璃用于：**导航栏、工具栏、Tab、主要按钮、浮动操作、弹层容器、菜单、分段控件** 等「控件」。
- **按钮**：一律按 [`BUTTONS.md`](./BUTTONS.md) / [Sketch Buttons](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons) 的 Style·Size·Role 实现，禁止自造扁平实心按钮体系。
- **Tab Bar**：一律按 [`TABBARS.md`](./TABBARS.md) / [Sketch Tab Bars](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars) 实现悬浮玻璃胶囊；禁止实心不透明底栏冒充。
- **Search Bar**：一律按 [`SEARCHBARS.md`](./SEARCHBARS.md) 实现底部固定玻璃搜索条；禁止做成 Tab 选中后才出现的附属态。
- **List**：一律按 [`LISTS.md`](./LISTS.md) / [Sketch Lists · Grouped](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect) 实现 inset 分组列表；卡片用 Grouped 标准材质，**禁止**每一行独立 Liquid Glass。
- **Swipe Actions**：一律按 [`SWIPE_ACTIONS.md`](./SWIPE_ACTIONS.md) / [Sketch Rows with Swipe Actions](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions) 独立组件实现，与 list-item **组合**；按钮用 System Color 实心，非玻璃。
- **Alert**：一律按 [`ALERTS.md`](./ALERTS.md) / [Sketch Alerts/Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight) 实现玻璃面板 + 胶囊按钮；禁止实心白卡片 + 细线分割旧样式冒充。
- **Badge**：一律按 [`BADGES.md`](./BADGES.md) / [Sketch App Icons / Badge](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4FE3C0D6-2F3E-4203-A201-C708AFA8AC55#Inspect) 实现实心 System Color 胶囊角标（默认 Red）；禁止自造非系统色。
- **Segmented Control**：一律按 [`SEGMENTED_CONTROLS.md`](./SEGMENTED_CONTROLS.md) / [Sketch Segmented Controls](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls) 实现 Tertiary 轨道 + 滑动选中胶囊；禁止旧式竖线分割样式。
- **Toolbar**：一律按 [`TOOLBARS.md`](./TOOLBARS.md) / [Sketch Toolbars/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone) 实现透明顶栏 + 44 玻璃圆钮（Sheet 含 Grabber）；禁止实心导航栏底色冒充。
- **Sheet**：一律按 [`SHEETS.md`](./SHEETS.md) / [Sketch Sheets/Light/iPhone](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FLight%252FiPhone) 实现底部 Modal Sheet（medium/large 固定档位、玻璃面板、Grabber）；禁止实心白底抽屉冒充。
- **Sidebar**：一律按 [`SIDEBARS.md`](./SIDEBARS.md) / [Sketch Sidebar](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/C28B7233-F267-4266-849D-30DBBFBDA772/canvas#Inspect) 实现悬浮玻璃侧栏；禁止实心抽屉冒充。
- **Action Sheet**：一律按 [`ACTIONSHEETS.md`](./ACTIONSHEETS.md) / [HIG Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets) 实现底部动作列表 + 独立 Cancel（§6.2-A.1 玻璃）；禁止实心灰底列表冒充。
- **Toast / HUD**：一律按 [`TOASTS.md`](./TOASTS.md) + §6.2-A.1；Activity / Progress / Empty / Picker / Switch 见对应专章。
- **Text Field**：一律按 [`TEXTFIELDS.md`](./TEXTFIELDS.md) / [Sketch Text Field Light](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/39D95D27-DDDF-4750-8ECE-18FF32FEC086#Inspect) 实现独立表单字段（Fill Tertiary、圆角 26）；禁止整块 Liquid Glass 冒充输入框。
- **Text**：一律按 [`TEXTS.md`](./TEXTS.md) / [HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography) 使用 Text Styles + Labels；禁止随意字号冒充系统字阶。
- **Image**：一律按 [`IMAGES.md`](./IMAGES.md) 使用懒加载 / 失败占位 / 圆角圆形 / `mode` 拉伸；头像场景优先 `lingyun-avatar`。
- 内容区保持清晰可读：可用浅底、卡片分区或 **标准材质**（轻 blur / 实色），但避免大面积「假玻璃」堆叠。

### 禁止

- ❌ 整页背景做成一块厚玻璃，导致内容难读。
- ❌ **玻璃叠玻璃**（glass-on-glass）：多层半透明控件互相叠盖且无合并/共享容器。
- ❌ 把正文、长列表每一行都做成独立 Liquid Glass。
- ❌ 同时混用多种互不协调的毛玻璃参数（不同 blur / 不同透明度乱飞）。

---

## 2. 材质变体

### 2.1 Regular（默认，最常用）

- 半透明 + 背景模糊，并调节明度，保证前景文字/图标可读。
- **任何上下文默认用 Regular**（按钮、导航、弹窗、侧栏等）。
- Token 前缀：`$lingyun-glass-regular-*`（见 `lingyun-ui/styles`）。

### 2.2 Clear（慎用）

- 更通透，强调底下的媒体内容。
- **仅当同时满足**：
  1. 浮在 **视觉丰富** 的背景上（大图 / 视频 / 强氛围底）；
  2. 有 **局部或全局压暗（dimming）** 保证可读；
  3. 组件 footprint 相对克制（不要大面积 Clear 面板堆文字）。
- 不满足则退回 Regular。

---

## 3. 视觉语言细则

### 3.1 光学特征（设计与实现都要有）

| 特征 | 要求 |
|------|------|
| 透光 | 能透出下层内容色调，颜色随环境自适应明/暗 |
| 模糊 | 使用 backdrop blur；无能力端用半透明实色 **降级**，不得直接变脏灰实心块糊弄 |
| 高光 | 顶部/边缘有轻微 specular 高光或内描边（1px 半透明白） |
| 阴影 | 柔和、扩散、偏冷灰；控件浮起时阴影加深，禁止生硬大黑边 |
| 圆角 | **连续圆角**感：控件常用大圆角 / pill；避免尖锐直角卡片风 |
| 描边 | 极细半透明描边（hairline），禁止粗实线边框框死玻璃 |

### 3.2 形状与密度

- 优先 **胶囊 / 大圆角** 控件，贴近系统控件气质。
- 留白充足，控件不要挤成密网格。
- 同一视觉组内圆角阶梯一致（例如 12 / 16 / 20 / pill）。

### 3.3 色彩与活力（Vibrancy）

- 主题色一律按 [`COLORS.md`](./COLORS.md) / [Sketch System Colors](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/color-variables?g=System%2520Colors)：`$lingyun-system-*` / `$lingyun-primary` 等，禁止自造第三方色板。
- 玻璃上的标签、图标使用 **高对比 / 活力色**，禁止低对比灰字压在复杂背景上。
- 品牌色可用于填充型主按钮，但仍需保留玻璃质感（半透明填充 + 高光），避免纯 flat Material 实心块。
- 暗色环境：提高玻璃不透明度或加霜化，保证 WCAG 可读；CSS 变量随 `prefers-color-scheme: dark` 切换 Dark Accents。

### 3.4 运动

- 交互带 **流体感**：按压缩放、菜单展开形变、sheet 形态过渡要连贯。
- 尊重「减少动态效果」：弱化弹性与光斑动画，保留必要状态反馈。
- 禁止无意义的闪烁、强光扫过循环动画。

---

## 4. 凌云UI 组件强制条款

凡新增 / 修改 `lingyun-*` 组件：

1. **外观必须符合本规范**；默认变体按 Regular Glass 实现。
2. 样式只通过 `lingyun-ui/styles` 的 **`$lingyun-glass-*` / `$lingyun-*` token** 扩展，禁止组件内私造第二套玻璃参数。
3. 提供（或继承）可读性降级：
   - 无 `backdrop-filter` 的端：半透明实色 + 细描边 + 阴影；
   - 「减少透明度」场景：提高不透明度 / 霜化（frost）。
4. 组件文档注释中标明：材质变体（regular / clear）、适用层级（glass 层 vs 内容层）。
5. **PR / 自检不过关不得合入**：看起来像传统实心灰按钮、粗边框卡片、无高光无模糊的「假玻璃」一律退回。

### 反例（明确禁止出现在 凌云UI）

- 纯实心 `#2979ff` 直角按钮、无高光无模糊。
- `box-shadow: 0 2px 4px #000` 生硬投影 + 不透明白底卡片冒充玻璃。
- 多层级各自 `backdrop-filter` 叠罗汉。
- 用强渐变紫粉霓虹冒充「高级感」（与 Liquid Glass 无关）。

---

## 5. 设计稿（design/）强制条款

- 控件与导航必须画出：**透明层次、模糊感、高光边、柔和投影**。
- 标注材质变体：`Regular` / `Clear`；Clear 必须同时画 dimming。
- 路径映射规则仍见本目录 `README.md`；**UI 风格以本文为准**。
- 设计稿不得交付「纯实心 Material / 安卓风厚阴影」作为 lingyun 目标态。

---

## 6. 实现指引（uni-app / CSS）

优先顺序：

1. `backdrop-filter` / `-webkit-backdrop-filter` + 半透明背景 + 细描边 + 柔光阴影（H5 / App WebView 等）。
2. 小程序等能力弱端：提高 alpha 的半透明填充 + hairline + 阴影（视觉降级，结构不变）。
3. Token 定义于 `src/uni_modules/lingyun-ui/styles/setting/_glass.scss`，经 `styles/index.scss` 导出。

### 6.1 尺寸单位（Hard）

- 自研样式（`lingyun-ui`、`src/pages`、`src/components`、`src/uni.scss`）**一律使用 `px`**。
- 与 Sketch / HIG **1pt = 1px**（按 375 逻辑宽的 CSS 像素，不按 750 屏宽换算）。
- ❌ **禁止 `rpx`**，禁止 `750rpx` 屏宽、禁止 `1pt ≈ 2rpx` 换算表。
- 第三方 `uni-*` 不强行改源码（见 §0）。
- 胶囊圆角用 `$lingyun-glass-radius-pill`（`9999px`），不要用 `rpx` 写死。

建议结构（示意）：

```scss
.lingyun-glass-regular {
  background: $lingyun-glass-regular-bg;
  border: $lingyun-glass-hairline;
  box-shadow: $lingyun-glass-shadow;
  border-radius: $lingyun-glass-radius;
  /* #ifdef H5 || APP-PLUS */
  backdrop-filter: saturate(180%) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate(180%) blur($lingyun-glass-blur);
  /* #endif */
}
```

### 6.2 注意事项（踩坑复盘 · 必读）

> 下列问题已在本仓库多次出现；改玻璃 / 列表 / 主题 / 图标前先过一遍。

#### A. 玻璃 mixin 选错 → 小程序「完全不透 / 死白」

`_glass.scss` 有两套弱端策略，**不要混用**：

| Mixin | 小程序背景 | 适用 | 反例 |
|-------|------------|------|------|
| `lingyun-glass-regular` | **fallback ≈ 0.94 实霜**（历史挡字配方） | 仅无遮罩、必须实霜挡字的极端浮层 | ❌ Toolbar / section / **一切弹层面板**（Alert / Sheet / 未来 Toast·HUD·Action Sheet 等） |
| `lingyun-glass-surface` | **regular-bg 半透明**（暗色 ≈`rgba(255,255,255,0.18)` 银霜） | section、Toolbar、**所有浮层面板**（再叠 Sketch alpha + **全端** blur） | — |
| `lingyun-glass-clear` | fallback 实霜 | 富媒体上的 Clear + dimming | — |

- 症状：WEB 半透明正常，小程序/真机像实心白块 → 多半误用了 `regular`，或玻璃节点写了 `opacity` 显隐。
- 验收：**必须以真机为准**；开发者工具对半透明合成常偏色，不能单独作为玻璃验收依据。

#### A.1 浮层 / 弹窗 / Loading 面板背景（强制 · 后续一律照此）

适用于：**Alert、Sheet、Action Sheet、Toast、HUD/Loading、Popover、Menu** 及一切盖在内容上的玻璃面板。参考实现：`lingyun-sheets` / `lingyun-alert` / `lingyun-action-sheet`。

```scss
.panel {
  @include lingyun-glass-surface;
  /* Light：对齐 Sheet；可按组件微调 alpha，但禁止改回 0.94 实霜 */
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}
.theme-dark .panel {
  background-color: #{$lingyun-glass-overlay-bg-dark}; /* #1a1a1a @ 0.7 */
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}
```

硬约束：

1. **用 `lingyun-glass-surface` + 全端 blur**，不要用 `lingyun-glass-regular` 的小程序实霜 fallback。
2. **玻璃节点禁止 `opacity` 做显隐**（小程序会弄坏 `backdrop-filter`，看起来完全不透）；淡入淡出只做遮罩；缩放/位移放外层 wrapper。
3. 挡字靠 **遮罩（mask）+ 半透明面板**，不要靠把面板抬到 ≈0.94～0.99。
4. 根节点自挂 `theme-*`（styleIsolation）。
5. 透明度可按组件微调（Toast 可更透），但手法必须与上式一致。
#### B. 插槽工具类写在组件 wxss 里 → 间距/布局丢失

小程序自定义组件默认 **styleIsolation**，组件内样式**作用不到页面插槽节点**。

- ❌ 在 `lingyun-section.vue` 里写 `.lingyun-section-row { margin… }`，页面插槽用该类 → 多行 gap 消失。
- ✅ 插槽布局类放全局（如 `styles/setting/_section-layout.scss`，经 `App.vue` → `styles/index.scss` 注入）。

#### C. `:last-child` / `::before` / `::after` 画分割线、图标 → 小程序失效或变形

- 列表行分割线：自定义组件上 `:not(:last-child)::after` **不可靠** → 用父级登记 + **真实节点**（对齐 `uni-list`）。
- 复杂图标（如 Share）：纯伪元素拼形状易糊/歪 → 优先 **真实子节点** 或可靠位图/SVG，勿只靠 `::before/::after`。

#### D. 暗黑只改 `document` / 依赖外部 `.theme-dark` 祖先 → 小程序无效

小程序无 DOM；且 **styleIsolation** 下组件内写 `.theme-dark .xxx` **匹配不到**页面上的父级 class。

须同时：

1. `manifest` 对应端 `darkmode: true` + `themeLocation` + `theme.json`（见 [uni-app 暗黑指南](https://uniapp.dcloud.net.cn/tutorial/darkmode.html#darkmode)）
2. 页面根挂 `.theme-light` / `.theme-dark`（本仓库：`lingyun-app-page`）
3. **浮层组件（Alert 等）自身根节点也要挂 `theme-*`**，实色/暗黑覆写写在本组件内（如 `.lingyun-alert.theme-dark .panel`）
4. `uni.setBackgroundColor` / `setNavigationBarColor` 同步窗体色（`theme.json` 只跟**系统**主题）

#### E. Lists：Leading / Subtitle / 分割线 / 箭头（详见 [`LISTS.md`](./LISTS.md) §4）

- Leading **两档**：30×30（无 Subtitle）/ 42×42（有 Subtitle）；默认 `thumbSize=auto`。同组混用大小图标会丑，Demo 拆组。
- 分割线 `left = 16 + 图标边长 + 16`（62 / 74），勿写死；配合真实分割线节点（见上节 C）。
- `note`/`subtitle` = 下方 Subtitle（Tall 68）；`detail` = 右侧文案——别混。
- Title↔Subtitle：稿面 gap 0，实现 **2px**。
- disclosure：用 CSS 实线 chevron，勿用过小的 `uni-icons` 箭头。
- `#icon` 插槽填满 leading 盒（`100%` + `border-radius: inherit`），勿在插槽再写死与 `auto` 冲突的尺寸。

#### F. Toolbar / 顶栏占位与滚动玻璃（详见 [`TOOLBARS.md`](./TOOLBARS.md)）

- 顶栏占位写在滚动内容**首子**的 `padding-top`；选择器须进**全局**样式（`_app-page-layout.scss`）。H5 插槽首子常无组件 `data-v`，写在 `lingyun-app-page` scoped 里会丢占位。
- Bleed 选择器：小程序 `view:first-child`，H5 `uni-view`/`div:first-child`；**禁止 `*`**（WXSS 不过）。
- 状态栏高度用 `getWindowInfo().statusBarHeight`；微信勿单独依赖 CSS `--status-bar-height`（固定 25）。
- 惯性快速回顶时微信 `scroll-view` 可能丢末帧 → settle + `scrolltoupper` 对齐真实 `scrollTop`；**不要**在滚动中途改玻璃算法「强行 opaque」。
- 暗黑透底圆钮用 `lingyun-glass-surface`（银霜）；Alert / Sheet 与 Toolbar 同为活玻璃（surface + blur + Sketch alpha），挡字靠遮罩，勿再强制 MP 实霜 fallback。
- **Alert 玻璃节点禁止 `opacity` 显隐**：小程序上同节点 `opacity` + `backdrop-filter` 会让模糊失效、看起来实心；缩放放外层 lift（详见 `ALERTS.md`）。

#### G. 浮层被 section / card 裁切（H5 尤甚）

`lingyun-section`、list card 等常带 `overflow: hidden`。浮层即使用 `position: fixed`，在 **H5** 仍可能被祖先裁在卡片内（症状：选择器 / 弹层只在 card 里露一截）。

**强制挂载**（对齐 `lingyun-popover` / `lingyun-picker`）：

| 端 | 写法 |
|----|------|
| H5 / App | `<teleport to="body">` 包住遮罩 + 面板 |
| mp-weixin | `<root-portal>` 包住同一块 |

另：浮层根自挂 `theme-*`；勿用跟系统 DarkMode 的原生 `picker` 冒充可主题化弹层（改 `picker-view` 自绘）。Cursor 规则：`.cursor/rules/overlay-portal.mdc`。

---

## 7. 无障碍

- **减少透明度**：玻璃应变「霜」：更高不透明度、更弱透视，文字对比增强。
- **增强对比**：前景近黑/近白，并加强对比描边。
- **减少动态**：关闭弹性形变与高光游走，保留按下态。
- 任何 lingyun 组件交互不得依赖「只有动画才能看懂」。

---

## 8. 自检清单（每次改 UI / 组件必勾）

- [ ] 玻璃只用在控件/导航层，未污染整页内容层
- [ ] 默认 Regular；Clear 仅用于富媒体背景且带 dimming
- [ ] 无 glass-on-glass 乱叠
- [ ] 有半透明 +（能支撑则有）blur + 高光描边 + 柔和阴影
- [ ] 圆角连续、偏胶囊/大圆角，无尖锐直角风
- [ ] 文字/图标在明暗背景下均可读
- [ ] lingyun 组件只使用 `$lingyun-glass-*` / `$lingyun-*` token
- [ ] 弱端有降级，无障碍场景可接受
- [ ] **玻璃 mixin 选对**：透底控件 / Toolbar / **一切浮层面板**用 `lingyun-glass-surface`（+ 全端 blur）；仅无遮罩极端浮层才用 `lingyun-glass-regular` 实霜（见 §6.2 / §6.2-A.1）
- [ ] **浮层面板未对玻璃节点写 opacity 显隐**（缩放/位移放外层；淡入淡出只做遮罩）
- [ ] 插槽布局类已进全局样式（非组件隔离 wxss）
- [ ] 列表分割线 / 复杂图标未依赖不可靠的 `:last-child` 或纯伪元素
- [ ] Lists Leading：30/42 与 Subtitle 规则、分割线 inset、disclosure chevron（见 `LISTS.md` §4 / 本页 §6.2-E）
- [ ] Toolbar 占位在全局首子选择器；惯性回顶有 settle（见 `TOOLBARS.md` / §6.2-F）
- [ ] 暗黑：小程序有根节点 `theme-*` + manifest darkmode（非仅 H5 document）
- [ ] 设计稿与实现同属 Liquid Glass，而非实心扁平冒充
- [ ] 主题色已对照 `COLORS.md` / Sketch System Colors（含 Dark）
- [ ] 按钮改动已对照 `BUTTONS.md` / Sketch Buttons
- [ ] Tab Bar 改动已对照 `TABBARS.md` / Sketch Tab Bars（悬浮玻璃胶囊，非实心底栏）
- [ ] Search Bar 改动已对照 `SEARCHBARS.md` / Sketch Search Selected（底部固定玻璃搜索条）
- [ ] List 改动已对照 `LISTS.md` / Sketch Lists · Grouped（内容层分组卡片，非每行玻璃）
- [ ] Swipe Actions 改动已对照 `SWIPE_ACTIONS.md`（独立组件组合 list-item，按钮实心 System Color）
- [ ] Alert 改动已对照 `ALERTS.md` / Sketch Alerts/Light（300 宽、圆角 34、胶囊按钮）
- [ ] Badge 改动已对照 `BADGES.md` / Sketch App Icons Badge（24 高、pad 8·2.5、System Color）
- [ ] Segmented Control 改动已对照 `SEGMENTED_CONTROLS.md`（Large 48 / Small 32、pad 2、gap 4）
- [ ] Toolbar 改动已对照 `TOOLBARS.md` / Sketch Toolbars（Standard 54 / Sheet 70、44 圆钮、透明栏身）
- [ ] Sheet 改动已对照 `SHEETS.md` / Sketch Sheets（底部 Modal、medium/large、Grabber、玻璃）
- [ ] Action Sheet 改动已对照 `ACTIONSHEETS.md`（两组玻璃卡、Cancel、§6.2-A.1）
- [ ] Text Field 改动已对照 `TEXTFIELDS.md` / Sketch Text Fields（Fill Tertiary、52 高、圆角 26）
- [ ] 尺寸一律 `px`（1pt = 1px），未使用 `rpx`

---

## 9. 变更流程

修改本规范必须同步：

1. `design/UI_SPEC.md`（本文）
2. `design/README.md` 中的引用（及 `COLORS.md` / `BUTTONS.md` / `TABBARS.md` / `SEARCHBARS.md` / `LISTS.md` / `SWIPE_ACTIONS.md` / `ALERTS.md` / `BADGES.md` / `SEGMENTED_CONTROLS.md` / `TOOLBARS.md` / `SHEETS.md` / `ACTIONSHEETS.md` / `TEXTFIELDS.md` 等专章）
3. 根目录 `AGENTS.md`
4. `.cursor/rules/liquid-glass-ui.mdc`（`alwaysApply: true`）
5. 如涉及 token：`lingyun-ui/styles/**` 与 `lingyun-ui/readme.md` / `changelog.md`
