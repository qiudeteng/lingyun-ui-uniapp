# Toolbars 规范（强制 · lingyun-toolbars）

> `lingyun-toolbars` **必须**按苹果官方 Toolbars（iPhone · Light）设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Toolbar / 顶栏专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Toolbars/Light/iPhone**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone
2. **Sketch Inspect · Top - Standard/Title**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/50E31F7A-5C7C-4D9B-870E-FCB141048A44#Inspect
3. **Sketch Inspect · Top - Standard/Large**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/0E48874D-FCAE-47BC-8DE2-3F33ECC936ED#Inspect
4. **Sketch Inspect · Top - Sheet/Title**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/27FC19DA-7D0C-4A0E-952B-C79274579616#Inspect
5. **HIG / Liquid Glass**  
   [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) · [`UI_SPEC.md`](./UI_SPEC.md)

---

## 1. Sketch 符号矩阵（已核对）

两组：**Top - Standard**（无 Grabber）与 **Top - Sheet**（有 Grabber）。Sheet 比同名 Standard **高 16**。

### 1.1 Placement → `placement`

| Sketch | lingyun | Grabber |
|--------|---------|---------|
| Top - Standard | `standard`（默认） | 无 |
| Top - Sheet | `sheet` | **60 × 4**，Y≈5，居中，圆角 2，`#CFCFCF` |

### 1.2 Title style → `titleStyle`

| Sketch | lingyun `titleStyle` | Standard 尺寸 | Sheet 尺寸 |
|--------|----------------------|---------------|------------|
| Title | `title`（默认） | **402 × 60**（按钮 44 · 上下各 **8**） | **402 × 76** |
| Compact Large | `compactLarge` | 402 × 60 | 402 × 76 |
| Large | `large` | **402 × 111** | **402 × 127** |
| Title 2 Line | `title2Line` | 402 × 60 | 402 × 76 |
| Title 2 Line Large | `title2LineLarge` | **402 × 131** | **402 × 147** |
| Title 2 Line Left | `title2LineLeft` | 402 × 60 | 402 × 76 |

实现换算：**1pt = 1px**。❌ 禁止 `rpx`。

### 1.3 结构

**Standard / Title**

- **Leading**：Back Button（**44 × 44** Glass 圆钮 + chevron）+ 可选额外 Leading Buttons
- **Title**：居中；SF Pro **Semibold 600** / **17** / LH **22** / Labels · Liquid Glass **1 Primary**（`#1a1a1a`）
- **Trailing**：Trailing Button（常见 **44 × 44** Bordered Prominent / System Blue）

**Sheet / Title**

- **Grabber** → **Leading Button**（关闭 􀆄）→ **Title** → **Trailing Button**

**Large**

- 顶行同 Title 的 Leading / Trailing（**无**居中小标题）
- **大标题**左对齐落在按钮行下方（内容滚动时可收成 inline）

### 1.4 材质（HIG · Scroll Edge）

- 栏身默认 **全透明**；`lingyun-app-page` 把顶栏占位写到滚动内容**第一个根节点**的 `padding-top`（选择器在全局 `_app-page-layout.scss`，避免组件 data-v 打不中插槽）。高度与占位对齐 **`uni-nav-bar`**：状态栏用 `getWindowInfo().statusBarHeight`（真机）；微信内容行用胶囊推算后与设计 **60** 取大，**始终保留上下各 8**（有状态栏时下边距再 +5 → 13）。微信上勿单独依赖 CSS `--status-bar-height`（固定 25px）。H5 无胶囊时栏身用设计值 **60**（上下各 8）。Bleed 选择器：小程序 `view:first-child`，H5 `uni-view` / `div:first-child`（禁止 `*`）。
- 微信小程序：栏身 `paddingRight` 避开胶囊后，居中 Title / Grabber 须用 `--ly-toolbar-center-shift = (rightInset - padX) / 2` 校正到**屏宽几何中心**（窄屏 padX **16**，宽屏 **20**），否则视觉偏左；`title2LineLeft` 不校正。
- 滚动后内容从栏后穿过；`glassProgress`（0→1，约 **56px**）用 blur / 填充渐变 Regular Glass。
- **默认页面级滚动**（`lingyun-app-page` 的 `pageScroll` 默认 `true`）：没有 `@scroll` 可用，`glassProgress` 由顶部哨兵节点（高 = `glassDistance`）的 `IntersectionObserver` 露出比例驱动，语义等价 `scrollTop / glassDistance`。含文本输入的页面必须保持该默认，原因见 [`TEXTFIELDS.md`](./TEXTFIELDS.md) §5。
- 惯性快速回顶时微信 `scroll-view` 可能丢末帧：走内层 `scroll-view`（`:page-scroll="false"`）时 `lingyun-app-page` 用短 settle + `scrolltoupper` 对齐真实 `scrollTop`，不改变滚动中的渐变。
- 操作钮保持独立 **Regular Glass / Prominent** 圆钮。
- 内层自管 `scroll-view`（`:body-scroll="false"`）时用 `useLingyunAppPageScroll`（建议同时绑 `scrolltoupper` → `reportScroll(0)`）。
- `:page-scroll="false"` 只用于需要 `scroll-y` 锁的场景（横向 swipe 行）；该模式下**不要放文本输入**。

### 1.5 宽屏（iPad / Mac）

窗口宽度 **≥ 700** 时改走 Sketch **Toolbars/Light/iPad/Top**（画板 **1210**），不再套 iPhone 60。折叠屏展开（如 717 宽）同一档。

| 项 | iPhone | iPad / Mac |
|----|--------|------------|
| 栏身 | **60**（上 8 / 下 8） | **54**（上 **0** / 下 **10**，内容行 44 顶对齐） |
| 左右内边距 | 16 | **20** |
| 钮间距 | 8 | **12** |
| 按钮 | 44 | **44**（48pt 只用于 iPhone Duo，不用于 iPad 顶栏） |
| Large 额外 | 51（总高 111） | **48**（总高 102） |
| 2 Line Large 额外 | 71 | **71**（总高 125） |
| 窗口按钮 | 无 | **仅 Mac 桌面**：**41×22**（Close / Minimize / Expand）。有左侧导航时画在侧栏顶栏，与内容顶栏对齐；无侧栏时仍在 Toolbar Leading。iPad 全屏示例不带；微信永不显示 |

标题仍是 Semibold **17 / 22**，色为 Labels · Liquid Glass **1 Primary** `#1a1a1a`，相对栏身几何中心，不跟按钮组走。状态栏高度继续用 `getWindowInfo().statusBarHeight`（iPad 示例为 32，不写死）。窄屏「状态栏挪 5px 到下边距」在宽屏关闭。

拉宽 / 收窄窗口时顶栏与 `lingyun-app-page` 占位一起重算。

同一断点下 `lingyun-app-page` 会在左侧停靠导航。固定顶栏的 `left` 为 `var(--lingyun-page-nav-width, 0px)`（有导航时 **220**），栏身只覆盖右侧内容区，标题仍在该栏身内居中。浮层里 `fixed=false` 的顶栏不读这个变量。

---

## 2. API（lingyun-toolbars）

```vue
<lingyun-toolbars title="Title" @back="onBack" />

<lingyun-toolbars
  placement="sheet"
  title="Title"
  @close="onClose"
/>

<lingyun-toolbars
  title-style="large"
  title="Title"
>
  <template #trailing>
    <lingyun-button variant="borderedProminent" size="mini" icon="↑" />
  </template>
</lingyun-toolbars>

<lingyun-toolbars
  title-style="title2Line"
  title="Title"
  subtitle="Subtitle"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `placement` | string | `standard` | `standard` \| `sheet` |
| `titleStyle` | string | `title` | 见上表 |
| `title` | string | `''` | 主标题 |
| `subtitle` | string | `''` | 副标题（2 Line） |
| `showBack` | boolean / `'auto'` | `'auto'` | Standard 显示返回；微信勿依赖未传 Boolean（会被写成 false） |
| `showClose` | boolean / `'auto'` | `'auto'` | Sheet 显示关闭 |
| `showGrabber` | boolean / `'auto'` | `'auto'` | Sheet 顶部拖条 |
| `showTrailing` | boolean | `true` | 默认 Trailing 占位钮（与 `trailing` 插槽叠加） |
| `glassProgress` | number | `0` | 0~1，栏身液态玻璃强度（滚动渐变） |
| `fixed` | boolean | `false` | 顶部 fixed |
| `safeArea` | boolean | `true` | 预留状态栏（JS `statusBarHeight`，对齐 uni-status-bar；微信内容行对齐胶囊） |

| 事件 | 说明 |
|------|------|
| `back` / `close` | 返回 / 关闭 |
| `trailing` | 默认 Trailing 点击 |

插槽：`leading`、`trailing`、`title`、`subtitle`、`back`、`close`。

---

## 3. 自检

- [ ] 栏身默认透明；滚动后 `glassProgress` 渐变为 Liquid Glass（约 56px 满）
- [ ] Standard Title：栏身 **60**（上下各 **8**）；有状态栏时下边距 **13**（8+5）；按钮不贴边
- [ ] Sheet Grabber **60×4**、居中、Y≈5
- [ ] 栏身默认透明；滚动后玻璃渐显；Back / 操作钮 **44×44**
- [ ] Inline 标题 Semibold 17 / LH 22 / Liquid Glass 1 Primary（`#1a1a1a`）；Large 左对齐大标题
- [ ] safeArea 时状态栏用 JS statusBarHeight；微信内容行与胶囊对齐（同 uni-nav-bar）
- [ ] 微信真机：居中 Title 对齐**屏宽中心**（不因右侧胶囊 inset 偏左）；Grabber 同理；左对齐 Title 不受影响
- [ ] H5 / 无胶囊：Title 仍对称居中
- [ ] 尺寸 `px`，对照 Sketch Inspect 与 Liquid Glass HIG
- [ ] 宽屏（窗口 ≥700）：栏身 **54**、左右 **20**、钮间距 **12**、按钮仍 **44**；Large 额外 **48**
- [ ] Mac 桌面宽屏：有左侧导航时交通灯在侧栏顶栏；无侧栏时在 Toolbar Leading。**41×22**（红 / 黄 / 绿）；iPad 与微信不显示
- [ ] 窄屏仍是 iPhone **60**（上下各 8）；微信胶囊避让与标题居中校正不变
