# Swipe Actions 规范（强制 · lingyun-swipe-action）

> `lingyun-swipe-action` / `lingyun-swipe-action-item` **必须**按苹果官方 Lists · Rows with Swipe Actions 开发与验收。  
> 本文是 `design/UI_SPEC.md` 的滑动操作专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Lists/Light/Rows with Swipe Actions**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions
2. **HIG · Lists and tables**（swipe actions）  
   https://developer.apple.com/design/human-interface-guidelines/lists
3. **Liquid Glass / Lists 总则**  
   [`UI_SPEC.md`](./UI_SPEC.md) · [`LISTS.md`](./LISTS.md)

滑动操作是 **内容层行内交互**：按钮用 **System Color 实心**，**不是** Liquid Glass。与 `lingyun-list-item` **组合使用**，勿把手势揉进 list-item。

---

## 1. Sketch 符号（已核对）

| 符号 | 尺寸 | 说明 |
|------|------|------|
| Default · Symbol + Label · Leading / Trailing | **402 × 52** | Regular 行 |
| Default · Symbol Only · Leading / Trailing | **402 × 52** | 仅符号 |
| Large · Leading / Trailing | **402 × 68** | Tall 行（有 Subtitle） |

### 1.1 结构

- **Leading**：右滑露出左侧按钮（常见 Purple / Blue / Green）
- **Trailing**：左滑露出右侧按钮（常见 Orange / Blue / Red destructive）
- 按钮为 **胶囊**（非通栏色块）：高 **44**，Symbol+Label 宽 **84**，Symbol Only **44×44**；按钮间距 **10**；行内垂直居中；**最外侧按钮贴卡片/屏边**（无额外 inset）
- 内容：图标 + 文案 **横向**（Symbol 左、Label 右）；Symbol Only 仅符号
- 变体：**Symbol + Label**、**Symbol Only**

### 1.2 换算（1pt = 1px，禁止 rpx）

| 项 | pt | px |
|----|----|-----|
| 行高 Regular / Tall | 52 / 68 | 52 / 68 |
| 按钮高 | **44** | 44 |
| Symbol+Label 宽 | **84** | 84 |
| Symbol Only | **44 × 44** | 44 |
| 按钮间距 | **10** | 10 |
| 外侧边缘 inset | **0**（贴边） | 0 |
| 开启阈值（实现） | — | **30** |
| 三钮 Trailing Stack 宽 | **272**（84×3 + 10×2） | 272 |

---

## 2. 组件职责

| 组件 | 职责 |
|------|------|
| `lingyun-swipe-action` | 容器：登记子项、`closeAll` / 互斥 `closeOther` |
| `lingyun-swipe-action-item` | 跟手滑动 + 左右 options / 插槽 |

跟手实现按端分层，策略对齐 `uni-swipe-action`：

| 端 | 实现 | 文件 |
|----|------|------|
| 微信小程序 / H5 | **WXS**（H5 由 uni-app 编译为 js） | `wx.wxs` + `mp-wxs.js` |
| App-vue / App-harmony | **renderjs**（WXS 仅微信与 H5 可用） | `render.js` + `mp-wxs.js` |
| 其它小程序（支付宝 / 百度 / 头条 / QQ 等） | JS 降级（长列表性能较弱） | `mp-js.js` |

**不支持 APP-NVUE**：本仓库 `vueVersion: 3` 不走 nvue，且 Liquid Glass 样式（`backdrop-filter` / 阴影 / 绝对定位位移）在 weex 渲染器下不可用，故不提供官方那套 `bindingx` 方案。官方的 `mpalipay.js`（旧 `movable-view` 方案）它自身也未引用，同样不做。

---

## 3. API

```vue
<lingyun-swipe-action>
  <lingyun-swipe-action-item
    :right-options="rightOptions"
    :left-options="leftOptions"
    @click="onAction"
  >
    <lingyun-list-item title="Title" detail="Detail" accessory="disclosure" />
  </lingyun-swipe-action-item>
</lingyun-swipe-action>
```

| Prop | 说明 |
|------|------|
| `leftOptions` / `rightOptions` | `[{ text?, icon?, iconType?, key?, role\|color?, style? }]`；`iconType` 走 `uni-icons`（推荐，正方形） |
| `role` / `color` | `destructive`/`red` · `warning`/`orange` · `primary`/`blue` · `success`/`green` · `purple` · `pink` · `indigo` · `teal` · `default`/`gray` |
| `show` | `none` \| `left` \| `right`（受控；`autoClose=false` 时） |
| `autoClose` | 默认 `true`，打开一项关闭其它 |
| `closeOnClick` | 默认 `true`，点按钮后收回 |
| `threshold` | 开启阈值，默认 30 |
| `disabled` | 禁止滑动 |

插槽：默认内容；`left` / `right` 自定义按钮区。

事件：`click`（`{ content, index, position, key }`）、`change`（`none|left|right`）。

容器方法：`closeAll()`、`resize()`。

---

## 4. 注意事项（踩坑）

1. **独立组件，勿塞进 list-item** — 手势 / 互斥 / WXS 与行排版解耦；list-item 仍作内容子节点。
2. **须包在 `lingyun-swipe-action` 内** — 否则 `autoClose` 互斥无效。
3. **与 `lingyun-list` 组合**：swipe-item 包住 list-item；list-item 仍 `inject` 登记分割线（首行逻辑不受影响）。
4. **按钮非玻璃、非通栏色块** — System Color 实心胶囊（44 高 / 84 宽），间距 10；勿做成旧版全高无缝色条。
5. **滑开分层对齐 Sketch** — 横向跟手约 **32px** 内灰胶囊 `opacity` 0→1；定型打开保持 1，取消跟回弹淡出到 0：
   - **Row（灰胶囊）**：`--lingyun-swipe-row-bg` = System Gray 5（浅 **`#E5E5EA`** / 暗 **`#2C2C2E`**）+ pill 半径（52 行 → 26、68 行 → 34）
   - 胶囊画在**独立无子节点背景层** `__row-bg`（absolute inset 0 + pill + `opacity`），**不要**画在 `__content` 上：详见 §4.11。
   - **按钮区底（reveal）**：卡片色 Grouped Secondary（浅白 / 暗 **`#1C1C1E`**）。组件内**不自绘**，直接透 `lingyun-list__card`；独立使用时由调用方给底（可用 `--lingyun-swipe-reveal-bg`）。自绘不透明矩形会在卡片首尾行戳出直角（微信 `overflow` 不保证裁子自定义组件）。
   - 滑开行不显示分割线：滑动一开始（胶囊 progress>0）即藏**本行顶线**与**下一行顶线**（视觉底边）。下一行顶线用独立字段 `hideDividerFromPrev`（勿改下一行自己的 `hideDivider`，否则互斥/取消时会上下线错乱）。list-item 用 class 藏线，勿 `v-if` 挂卸载。
6. **最外侧操作按钮贴边** — 无额外 inset；钮间仍 **10**；靠内容一侧留 **10** 与圆角 Row 分离。
7. **同组行高宜一致** — Regular 与 Tall 混滑时按钮仍 44 居中，行高不齐会显乱（对齐 Lists §4）。
8. **页面滚动冲突 / 斜滑出界卡半开** — 横向确认后再跟手；阈值勿过小（默认 30）。
    - 拦滚动：WXS **`return false`** + H5 `preventDefault`；**禁止**手势中途 `setData` 改 `scroll-y`（H5/小程序都会打断触摸）。
    - **纵向位移 ≥ 40px**（`LEAVE_ROW_Y`）视为滑出本行，立刻按阈值开/关（H5 斜滑出界常丢 end/cancel）。
    - **`touchcancel` = `touchend` 结算**；PC 的 `mouseleave` 在拖动中也会结算。
9. **小程序跟手：位移逻辑照抄官方 `uni-swipe-action`（血泪红线）** — `wx.wxs` 的 `showWatch` / `touchstart` / `touchmove` / `touchend` / `move` / `getDom` / `moveDirection` / `openState` 与 `mp-wxs.js` 的 `is_show`、`change`、`closeSwipe` **保持与 `src/uni_modules/uni-swipe-action` 一致**，容器互斥同样走改 `is_show`：
   - `:change:prop="wxsswipe.showWatch"` + `:prop="is_show"` **必须与手势监听挂在同一个 `__box` 节点**。`change` 回写 `is_show` 会再触发一次 `showWatch`，由 WXS 重新校准 `transform` —— 这个**自愈回路**正是官方在 iOS 上不闪的原因。曾把 prop 拆到空节点「躲 setData」，反而丢掉校准、快滑惯性时胶囊与按钮整段消失。
   - 不要自创 `deltaX` 补偿、阈值判定分支或「延迟关闭」定时器（曾导致取消滑动后胶囊残留）。
10. **灰胶囊 opacity 可跟手；分割线随 progress>0 立即隐藏** — 灰胶囊跟手用 `__row-bg.setStyle({ opacity })`（约 **32px** 内 0→1）；分割线经 `setSwipeDividersHidden`：
    - 本行：`swipeSurface.hideDivider`
    - 下一行（视觉底边）：`swipeSurface.hideDividerFromPrev`（**不要**写下一行的 `hideDivider`，会和邻居自己的打开态打架 → iOS 偶发只剩上线或下线）
    - list-item：非首行始终挂 divider 节点，用 `--hidden` class 藏，勿 `v-if` 反复挂卸载
    - 跟手：`transition: none`；定型：与 `ani` 同曲线落到 0/1，且 `move(..., followCapsule=false)` 避免回弹位移覆盖透明度。
    - callMethod 只在 hide 布尔变化时触发，不每帧 setData。
    - ❌ 不要用 `--open` 类切胶囊 opacity；❌ 不要在手势跟手里给按钮写 `scale`（叠父级 `translateX` 会 iOS 卡帧）。
    - ✅ 定型打开后可用按钮自身 CSS `@keyframes` 放大出现（`--reveal`，与 WXS 跟手无关）。
11. **动画期闪烁看渲染开销，不是看状态同步（血泪红线）** — `ani` 那 0.3s 内位移层纯 CSS transition。官方 `uni-swipe-action` 在 iOS 真机全程不闪，所以**凡是我们比官方多出来的每帧开销都要摘掉**：
    - **随 `transform` 动画的子树上禁止 `overflow: hidden` + 大圆角**。曾把灰胶囊画在 `__content` 上（`overflow: hidden` + pill），iOS 每帧按 9999px 圆角重新裁剪整行（按钮 + 文字 + 图标），这就是「自动滑动全程按钮一直闪」的主因。正解：胶囊改成**独立无子节点**的 `__row-bg` 背景层，圆角只绘制自身；跟手/定型都只切 `opacity`（合成属性，不触发重排重绘）。
    - **按钮组定位照官方** `left/right: 0` + `translateX(±100%)`。曾改成 `left/right: 100%` 想躲「嵌套百分比 transform」，但官方就是 `translateX` 且不闪 —— 这条假设不成立，已撤回。
    - **不要给 `__box` 加 `will-change` / `backface-visibility` / `translateZ(0)` 提层**。官方都没有；`translateZ(0)` 还会被 WXS 写的 inline `transform: translateX(...)` 覆盖，提层无效还在首帧冲突。
    - `ani` 时长与曲线也对齐官方：`0.3s cubic-bezier(0.165, 0.84, 0.44, 1)`。
    - 排查手法：在 demo 页放官方对照组（纯官方 / 官方壳 + 我们的行），先定位闪的是手势层、行内容还是我们的样式。
12. **按钮必须 catch 全部三个 touch 事件（血泪红线）** — 按钮上 `touchstart` / `touchend` 用了 `.stop`，`touchmove` **也必须** `.stop`：
    - 漏掉 `touchmove` 的后果：手指按在按钮上回拖时，手势层只收到 move，`startX` 与 `state.x` 还是**上一次手势的残留值**，算出的 `deltaX` 会把行推到乱位；而 `touchend` 被 catch 后 `moveDirection` 永不执行 → 行停在松手的位置、打开态类名也没机会摘，灰底铺满整行看着就是「一个大胶囊」。
    - 症状「WEB 正常、真机异常」是因为桌面走 `mousedown/mousemove/mouseup`，按钮上没有拦截。
    - 全拦之后按钮区就完全不参与跟手了，但滑开后可拖的内容区只剩几十 px（三个 84 宽按钮占掉 282），回拖时手指基本落在按钮上。故 `appTouchMove` 里做**反向滑动收起**：位移 > 40（与点击判定同阈值）就改 `is_show`，交给 `showWatch` 带动画归位。不要试图在这里跟手——Vue 层碰不到 WXS 的 `state` / `transform`，只能走 prop 自愈回路。
    - 手势层另有 `touching` 守卫：没收到 `touchstart` 就丢弃后续 `touchmove` / `touchend`，兜住同类错位。
13. **滑动行必须关掉按压 hover** — 微信**不会**因横向拖动取消 `hover-class`（只有页面滚动才取消），`hover-start-time=0` 的灰底会跟手全程存在、松手后才消失，叠上 `transition` 就是「松手时胶囊闪一下」。`lingyun-list-item` 通过 `lingyunSwipeHost`（**常量**注入，非手势状态）判定后置空 `hover-class`；代价是滑动行没有点按高亮。

---

## 5. 自检

- [ ] Leading / Trailing 均可配置；destructive 为系统红
- [ ] 滑开分层：Row 灰胶囊由 `__row-bg` 独立层绘制，按钮外侧贴边；打开保持，滑回清除
- [ ] `__content` 上无 `overflow` / `border-radius` / 背景；`__box` 上无 `will-change` / `backface-visibility`
- [ ] 按钮为 44 高胶囊（Symbol+Label 84 / Only 44），间距 10
- [ ] Symbol + Label / Symbol Only 可用
- [ ] `autoClose` 互斥；点按钮可收回
- [ ] 微信小程序可跟手滑动，WXSS 无非法选择器
- [ ] iOS 真机：慢滑、快滑（带惯性）、滑一半取消，均无闪烁 / 消失 / 胶囊残留
- [ ] iOS 真机：滑开后**在按钮区反向滑动**能收起（不卡在半开、灰底不铺满整行）；在按钮区轻点仍触发对应 action
- [ ] iOS 真机：斜滑（上/下离开当前行）松手或被系统取消后，行会按阈值**自动开/关**，不卡半开；竖滑列表仍正常
- [ ] 对照 Sketch Rows with Swipe Actions · Trailing
