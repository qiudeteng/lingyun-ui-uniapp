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
5. **HIG · Designing for iPhone Duo**  
   https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
6. **HIG / Liquid Glass**  
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

- **Leading**：Back Button（**44 × 44** Glass 圆钮 + `lingyun-icon` `left` **28**）+ 可选额外 Leading Buttons
- **Title**：居中；SF Pro **Semibold 600** / **17** / LH **22** / Labels · Liquid Glass **1 Primary**（`#1a1a1a`）
- **Trailing**：Trailing Button（常见 **44 × 44** Bordered Prominent / System Blue）

**Sheet / Title**

- **Grabber** → **Leading Button**（关闭：`lingyun-icon` `closeempty` **26**）→ **Title** → **Trailing Button**

**Large**

- 顶行同 Title 的 Leading / Trailing（**无**居中小标题）
- **大标题**左对齐落在按钮行下方（内容滚动时可收成 inline）

### 1.4 材质（HIG · Scroll Edge）

- 栏身默认 **全透明**；`lingyun-app-page` 把顶栏占位写到滚动内容**第一个根节点**的 `padding-top`（选择器在全局 `_app-page-layout.scss`，避免组件 data-v 打不中插槽）。高度与占位对齐 **`uni-nav-bar`**：状态栏用 `getWindowInfo().statusBarHeight`（真机）；微信内容行用胶囊推算后与设计 **60** 取大，**始终保留上下各 8**（有状态栏时下边距再 +5 → 13）。微信上勿单独依赖 CSS `--status-bar-height`（固定 25px）。H5 无胶囊时栏身用设计值 **60**（上下各 8）。Bleed 选择器：小程序 `view:first-child`，H5 `uni-view` / `div:first-child`（禁止 `*`）。
- 微信小程序：栏身 `paddingRight` 避开胶囊后，居中 Title / Grabber 须用 `--ly-toolbar-center-shift = (rightInset - padX) / 2` 校正到**屏宽几何中心**（窄屏 padX **16**，宽屏 **20**），否则视觉偏左；`title2LineLeft` 不校正。
- 滚动后内容从栏后穿过；`glassProgress`（0→1，约 **56px**）用 blur / 填充渐变 Regular Glass。
- **默认页面级滚动**（`lingyun-app-page` 的 `pageScroll` 默认 `true`）：没有 `@scroll` 可用，`glassProgress` 由顶部哨兵节点（高 = `glassDistance`）的 `IntersectionObserver` 露出比例驱动，语义等价 `scrollTop / glassDistance`。含文本输入的页面必须保持该默认，原因见 [`TEXTFIELDS.md`](./TEXTFIELDS.md) §5。
- 惯性快速回顶时微信 `scroll-view` 可能丢末帧：走内层 `scroll-view`（`:page-scroll="false"`）时 `lingyun-app-page` 用短 settle + `scrolltoupper` 对齐真实 `scrollTop`，不改变滚动中的渐变。
- 操作钮保持独立玻璃圆钮；返回 / 关闭 / 右侧按钮组 / Tab Bar 统一使用 `lingyun-glass-control`。
- 内层自管 `scroll-view`（`:body-scroll="false"`）时用 `useLingyunAppPageScroll`（建议同时绑 `scrolltoupper` → `reportScroll(0)`）。
- `:page-scroll="false"` 只用于需要 `scroll-y` 锁的场景（横向 swipe 行）；该模式下**不要放文本输入**。

### 1.5 宽屏（iPad / Mac）

窗口宽度 **≥ 690** 时改走 Sketch **Toolbars/Light/iPad/Top**（画板 **1210**），不再套 iPhone 60。折叠屏展开（如 OPPO Find 692、常见 717 宽）同一档。运行时 `lingyun.screen` 与这一档对齐：宽度 &lt; 690 为 `phone`，690–1199 为 `pad`，≥ 1200 为 `pc`。`lingyun.device` 看硬件，折叠展开不会把手机改成平板。字段见使用手册「屏幕」。

| 项 | iPhone | iPad / Mac |
|----|--------|------------|
| 栏身 | **60**（上 8 / 下 8） | **54**（上 **0** / 下 **10**，内容行 44 顶对齐） |
| 顶部安全区 | 状态栏真实高度 | 系统状态栏高度；H5 / PC 无状态栏时至少 **8** |
| 左右内边距 | 16 | **20** |
| 钮间距 | 8 | **12** |
| 按钮 | 44 | **44**（48pt 只用于 iPhone Duo，不用于 iPad 顶栏） |
| Large 额外 | 51（总高 111） | **48**（总高 102） |
| 2 Line Large 额外 | 71 | **71**（总高 125） |
| 窗口按钮 | 无 | **仅 Mac 桌面**：**41×22**（Close / Minimize / Expand）。有左侧导航时画在侧栏顶栏，与内容顶栏对齐；无侧栏时仍在 Toolbar Leading。iPad 全屏示例不带；微信永不显示 |

标题仍是 Semibold **17 / 22**，色为 Labels · Liquid Glass **1 Primary** `#1a1a1a`，相对栏身几何中心，不跟按钮组走。状态栏高度继续用 `getWindowInfo().statusBarHeight`（iPad 示例为 32，不写死）。窄屏「状态栏挪 5px 到下边距」在宽屏关闭。

微信 **PC 客户端**（`platform` 为 `windows` / `mac`）没有手机状态栏，胶囊的 `top` 会把栏身撑高。这一端状态栏按 **0**，栏身不跟胶囊抬高，与同宽度的 H5 一致（宽屏 **54**，窄屏 **60**）。右侧仍按胶囊留 `rightInset`。

拉宽 / 收窄窗口时顶栏与 `lingyun-app-page` 占位一起重算。

同一断点下 `lingyun-app-page` 会在左侧停靠导航。固定顶栏的 `left` 为 `var(--lingyun-page-nav-width, 0px)`（有导航时 **220**），栏身只覆盖右侧内容区，标题仍在该栏身内居中。浮层里 `fixed=false` 的顶栏不读这个变量。侧栏顶部名称与这一栏标题垂直对齐；副标题挂在名称下，不改变栏高。规格见 [`SIDEBARS.md`](./SIDEBARS.md) §4。

### 1.6 iPhone Duo 内屏竖屏（lingyun-duo-toolbar）

Duo 内屏竖屏保留横向顶栏；外屏与内屏横屏改用右侧全高栏（见 [`SIDEBARS.md`](./SIDEBARS.md)）。顶栏对 Figma `Toolbar - Top - iPhone Duo`：

| 项 | 尺寸 |
|----|------|
| 栏身 | **84** 高；padding 上 **24** / 右 **24** / 下 **12** / 左 **20**，gap **12**；内容行 **48** |
| Leading | **48 × 48** 玻璃圆钮（返回符号约 **17pt**；本库 `lingyun-icon` 用 **22**） |
| 标题 | 左对齐，**17 / 22** Semibold，字距 **-0.43**；在 Leading 之后、工具组之前占满剩余宽度 |
| 工具组 | **164 × 48** 玻璃胶囊；3 个 **36×36** 工具项，gap **18**，左右 padding **10**；1~3 项按内容收缩 |
| 右侧预留 | **134** = 状态栏 **98** + 间距 **12** + 右内边距 **24**；组件渲染独立 **98×48** 状态栏占位，内容由系统绘制，也可用 `status` 插槽自绘 |
| 材质 | 栏身默认透明，随滚动浮出玻璃；Leading 与工具组始终是独立玻璃控件 |

HIG 规则：相关工具项应成组，不要手动加固定间距；每个非纯文字工具项同时提供标题与符号（本库用 `duo-tools` 插槽渲染符号，标题由页面无障碍标签补足）。`duo-tools` 最多放 **3** 个 **36×36** 项；页面级 `trailing` 在 Duo 下作为兼容回退，二者同时存在时优先 `duo-tools`。

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
| `trailingButtonsHidden` | boolean | `false` | 隐藏数据驱动的右侧按钮组；页面打开自己的锚点浮层时使用，避免按钮从菜单边缘露出 |
| `trailingMenuEnabled` | boolean | `false` | 显式启用 `#trailing-menu` 内置浮层；小程序插槽检测不可靠，不开启会在点击按钮时弹出空菜单 |
| `fixed` | boolean | `false` | 顶部 fixed |
| `safeArea` | boolean | `true` | 预留状态栏（JS `statusBarHeight`，对齐 uni-status-bar；微信内容行对齐胶囊） |

| 事件 | 说明 |
|------|------|
| `back` / `close` | 返回 / 关闭 |
| `trailing` | 默认 Trailing 点击 |
| `trailing-action` | 右侧自定义按钮组点击，参数 `{ key, button, index, groupIndex, buttonIndex, anchor }` |

插槽：`leading`、`trailing`、`title`、`subtitle`、`back`、`close`、`trailing-menu`。

### 右侧自定义按钮组

```vue
<lingyun-toolbars
  title="Title"
  :trailing-buttons="[
    [
      { key: 'search', icon: 'search', label: 'Search' },
      { key: 'more', icon: 'more', label: 'More' },
    ],
    [{ key: 'filter', icon: 'tune', label: 'Filter' }],
  ]"
  trailing-menu-enabled
  @trailing-action="onAction"
>
  <template #trailing-menu="{ button, index, groupIndex, buttonIndex, close }">
    <view class="my-menu">
      <!-- 自定义 menu / activity view 内容；close() 关闭浮层 -->
    </view>
  </template>
</lingyun-toolbars>
```

- `trailing-buttons` 支持一维 / 二维数组：一维是一组；二维按子数组拆成多个玻璃胶囊，组与组之间沿用工具栏 **8** 间距
- 单组内 1 个按钮为 **44×44** 圆钮，多个按 **36×36、gap 18、左右 10** 排列
- 点击先发 `trailing-action`，参数 `{ key, button, index, groupIndex, buttonIndex, anchor }`；`anchor` 是按钮视口矩形，可直接传给 `lingyun-menu` 的 `anchor` 或自行定位浮层
- 若同时传了 `trailing-menu-enabled` 和 `trailing-menu` 插槽，会自动在按钮下方打开浮层并传入 `button / index / groupIndex / buttonIndex / close`；小程序里必须显式开启，否则插槽检测会导致空菜单
- `setLingyunThemeSwitchVisible(true)` 时主题钮固定加入**第一组**，与第一组按钮共用胶囊
- 页面用 `anchor` 自己打开浮层时，把 `trailing-buttons-hidden` 绑到浮层开关（建议到 `closed` 再恢复），按钮组会淡出，避免从菜单边缘露出
- 菜单打开时整组按钮会隐藏；主题菜单与 `trailing-menu` 浮层按**按钮组右上角**对齐（不是单个按钮的右上角），单选按钮自成一组时视觉不变
- 标题右侧让位按所有按钮组的总宽度计算，页面不需要再自己处理小程序胶囊排版

### 顶部搜索（searchable / searching）

- `searchable=true` 时，右侧额外渲染一个**独立 44px 玻璃胶囊**搜索钮，位于数据按钮组之后；不和数据按钮挤在同一组
- 点击后进入搜索模式：返回 / 标题 / `#leading` / 数据按钮组 / 主题钮全部隐藏，左侧换成 44px 玻璃搜索框（搜索图标 + 输入框 + 清除钮），原搜索钮位置变成 44px 取消钮
- 输入框 `confirm-type=search`，键盘确认发 `search`；输入、取消、打开分别发 `search-input` / `search-cancel` / `search-open`
- 搜索框与取消钮都在微信胶囊安全区内，搜索框自动让出右侧胶囊
- **过渡**：搜索层从右侧滑入（约 0.32s，ease-out），左侧返回 / 标题 / 按钮组同时向左侧淡出；关闭时反向，不从中间突然切换
- `searching` 可由属性 / `v-model:searching` 控制，toolbar 自身也会发 `update:searching`；页面壳 `lingyun-app-page` 负责透传并提供 `openSearch()` / `closeSearch()` 方法
- 搜索模式不渲染标题层，大标题样式也一起隐藏

### 顶栏下方分段控制（segments）

- `segments` 数据配置一组 `{ key, text?, icon?, disabled? }`，在 toolbar **下方**渲染 Small 分段控制
- 行高 **40**（Small 32 + 下边距 8）；`segments` 为空不渲染、不占高度
- 内边距与 toolbar 一致（iPhone 16 / iPad 20），右侧同样避开微信胶囊
- `segmentValue` 受控；切换发 `update:segmentValue`，同时发 `segment-click` 和 `segment-change`，参数 `{ value, item }`
- 搜索模式只替换 toolbar 主行，分段行保留


---

## 3. 自检

- [ ] 栏身默认透明；滚动后 `glassProgress` 渐变为 Liquid Glass（约 56px 满）
- [ ] Standard Title：栏身 **60**（上下各 **8**）；有状态栏时下边距 **13**（8+5）；按钮不贴边
- [ ] Sheet Grabber **60×4**、居中、Y≈5
- [ ] 栏身默认透明；滚动后玻璃渐显；Back / 操作钮 **44×44**。钮内用 `lingyun-icon`：返回 `left` **28**，关闭 `closeempty` **26**，分享 `upload` **26**
- [ ] Inline 标题 Semibold 17 / LH 22 / Liquid Glass 1 Primary（`#1a1a1a`）；Large 左对齐大标题
- [ ] safeArea 时状态栏用 JS statusBarHeight；微信内容行与胶囊对齐（同 uni-nav-bar）
- [ ] 微信真机：居中 Title 对齐**屏宽中心**（不因右侧胶囊 inset 偏左）；Grabber 同理；左对齐 Title 不受影响
- [ ] H5 / 无胶囊：Title 仍对称居中
- [ ] 尺寸 `px`，对照 Sketch Inspect 与 Liquid Glass HIG
- [ ] 宽屏（窗口 ≥690）：栏身 **54**、左右 **20**、钮间距 **12**、按钮仍 **44**；Large 额外 **48**
- [ ] Mac 桌面宽屏：有左侧导航时交通灯在侧栏顶栏；无侧栏时在 Toolbar Leading。**41×22**（红 / 黄 / 绿）；iPad 与微信不显示
- [ ] 窄屏仍是 iPhone **60**（上下各 8）；微信胶囊避让与标题居中校正不变
- [ ] 微信 PC（windows / mac）：栏身高度与同宽度 H5 一致，不按胶囊抬高
- [ ] `searchable` 时搜索钮是独立 44px 胶囊；进入搜索后左侧内容与数据按钮组全部隐藏，搜索框 + 取消钮正常，微信胶囊不被遮挡
- [ ] 搜索展开从右往左滑入、关闭反向；左侧内容同时淡出 / 左移
- [ ] `segments` 在 toolbar 下方渲染 40 高分段行，选中态正确；为空不占高度，页面顶部留白同步
- [ ] `segment-click` / `segment-change` 都带 `{ value, item }`；`searching` 与 `v-model:searching` 双向一致
