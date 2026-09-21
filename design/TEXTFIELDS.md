# Text Fields 规范（强制 · lingyun-text-field）

> `lingyun-text-field` **必须**按苹果官方 Text Fields（Light / Dark）设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的 Text Field 专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸 + HIG 行为** 为准。

## 权威来源

1. **Sketch · Text Field Light**（分组列表行内嵌 · 主验收）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/39D95D27-DDDF-4750-8ECE-18FF32FEC086#Inspect
2. **Sketch · Text Field Dark**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/CEBB1E12-74F7-4BF8-949D-3696FCFF4351#Inspect
3. **HIG · Text fields**  
   https://developer.apple.com/design/human-interface-guidelines/text-fields
4. **Liquid Glass / Colors / Forms**  
   [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md) · [`FORMS.md`](./FORMS.md)

---

## 0. 表单体系约定

- Text Field 有两种视觉态：
  - **`field`**：独立 Fill Tertiary 胶囊（Sheet / 孤立场景）
  - **`cell`**：分组列表行内嵌——**无独立底色 / 圆角 / 描边**，贴合 Settings 行（对齐上方 Sketch）
- Settings / 多控件表单页：用 [`FORMS.md`](./FORMS.md) 的 `lingyun-form` + `form-item` 包裹；`variant` 默认 **`auto`** → 在 `form-item` 内自动切 `cell`。
- Label / Error 由 `form-item` 负责时，控件自身不重复画 Label / Footer。
- 材质属 **内容层标准材质**；**禁止**整块 Liquid Glass 冒充输入框。

---

## 1. 尺寸与材质（1pt = 1px，禁止 rpx）

### field（独立）

| 项 | 约定 |
|----|------|
| 单行字段高 | **52** |
| 字段圆角 | **26** |
| 水平 padding | **16** |
| 正文 | **17 / 22** Body |
| Label | Footnote / Caption · secondary |
| Hint / Error | Caption · secondary / System Red |
| 背景 | `$lingyun-fill-tertiary`（暗色 `$lingyun-fill-tertiary-dark`） |
| 多行 | min-height ≥ 52；默认约 3 行可视；可选 auto-height |

### cell（Grouped 行 · Sketch 主效果）

| 项 | 约定 |
|----|------|
| 容器 | 透明；无圆角 / 独立底 |
| 行高 | 随 `form-item`（约 52；多行 stack） |
| 正文 | **17 / 22**；`row` 布局右对齐，`stack` 左对齐 |
| Label / Error | 由 `lingyun-form-item` 提供 |
| 清除 / 密码显隐 | 保留 |

---

## 2. API（lingyun-text-field）

```vue
<!-- 独立胶囊 -->
<lingyun-text-field
  v-model="name"
  label="Name"
  placeholder="Placeholder"
  hint="Helper text"
  :error="errorMsg"
  clearable
/>

<!-- 表单内：自动 cell（亦可显式 variant="cell"） -->
<lingyun-form-item name="name" label="姓名" required>
  <lingyun-text-field v-model="form.name" placeholder="请输入" />
</lingyun-form-item>
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `modelValue` / `value` | string | — | 文本 |
| `variant` | `auto` \| `field` \| `cell` | `auto` | `auto`：有 `form-item` → `cell`，否则 `field` |
| `label` | string | `''` | 上方标签；`cell` 时不渲染（由 form-item 管） |
| `placeholder` | string | `''` | 占位 |
| `hint` | string | `''` | 下方说明；`cell` 时不渲染；有 `error` 时被覆盖 |
| `error` | string | `''` | 错误文案；`field` 时描边；`cell` 时由 form-item 展示 |
| `disabled` | boolean | `false` | 禁用 |
| `readonly` | boolean | `false` | 只读 |
| `clearable` | boolean | `true` | 有内容时显示清除 |
| `secure` | boolean | `false` | 密码；内置显隐 |
| `multiline` | boolean | `false` | 多行 textarea |
| `autoHeight` | boolean | `false` | 多行随内容增高 |
| `rows` | number | `3` | 多行初始行数 |
| `maxlength` | number | `-1` | 最大长度；≤0 不限 |
| `type` | string | `text` | uni `input` type（非 secure / 非 multiline） |
| `confirmType` | string | `done` | 键盘右下角 |
| `focus` | boolean | `false` | 外部请求聚焦 |

事件：`update:modelValue`、`update:value`、`input`、`focus`、`blur`、`confirm`、`clear`、`change`、`eyes`、`keyboardheightchange`  
插槽：`leading` / `trailing` / `label` / `hint`

> 交互实现对齐 `uni-easyinput`（本地 `val`、`:focus`、virtualHost、清除/眼睛、trim、change）；视觉仍按本文 Sketch 规范。

---

## 3. 注意事项

1. **内容层 Fill Tertiary** — `field` 勿用 glass mixin 做字段底；`cell` 无独立底。
2. **清除 / 眼睛用真实节点** — 小程序伪元素易变形（对齐 search-bar）。
3. **根挂 `theme-*`** — 防 styleIsolation 暗黑失效。
4. **error 优先于 hint** — `field` 同时存在只显示 error。
5. **secure 与 multiline 互斥** — `multiline` 时忽略 secure。
6. **尺寸 px** — Sketch 1pt = 1px；禁止 rpx。
7. **form-item 内勿再写 label** — 避免双 Label。
8. **小程序 textarea** — 勿把原生 `textarea` 直接当 flex 子项；外包 `__control-wrap` 并写死 px 宽高。`input` / `textarea` 用两个独立 `v-if`（禁止 `v-else`）。祖先（`form-group` card / `section`）禁止 `overflow:hidden`。**cell 多行**：`form-item` control 用 `display:block`（勿 flex 包自定义组件，宿主撑不开原生 textarea）；cell 根 `flex:none` + 宿主 `minHeight`。
9. **cell 可点区域** — `form-item__control` 用 `flex:1; width:0` 占满右侧；text-field / picker 的 `--cell` 根与输入层须 `width:100%`，避免缩成右对齐窄条点不到。
10. **输入框不得放进内层 `scroll-view`**（见 §5）— 安卓在整屏 `scroll-view` 里必错位；`lingyun-app-page` 默认页面级滚动即可，勿再靠 `cursor-spacing` / `calc(100vh - 1px)` 调这个问题。
11. **焦点环别等原生 `focus`** — 真机上系统要等键盘唤起才回调 `focus`（肉眼可见延迟）。`focusShow` 在输入层 `touchstart` 时**预点亮**，原生 `focus` 到达即确认；`900ms` 内没聚焦、或起手位移超 `8px`（是滚动不是点击）则撤销。绑在 `__control-wrap`（= 原生输入区）而非整行胶囊：点胶囊左右内边距与清除 / 眼睛钮并不会聚焦，不能亮环。

---

## 5. 键盘避让（安卓错位根因 · 页面级滚动）

### 根因

把内容放在**整屏高 `scroll-view`** 里（顶栏 `fixed` 不占位）时，安卓微信聚焦输入框，`adjust-position` 按「页面未滚动」计算偏移，**只把原生输入层（文字 / 光标）上推，WXSS 画的胶囊外壳不动** → 「框没动、字跑了」，偏差约等于当前滚动距离，所以「一滚就错位」。

这是 `scroll-view` 路径的平台缺陷，与本组件样式无关：官方 `uni-easyinput` 同结构、同现象。`cursor-spacing`、`calc(100vh - 1px)`、把字段滚到顶等都是症状层调参，**不要再走这条路**。

### 解法：页面级滚动（`lingyun-app-page` 默认形态）

`lingyun-app-page` 的 `pageScroll` **默认 `true`**：不渲染内层 `scroll-view`，内容交由**页面自身滚动**——这是微信 `adjust-position` 唯一算得准的路径，键盘避让整体交回系统，各端一致。

```vue
<!-- 默认即页面级滚动，无需额外声明 -->
<lingyun-app-page title="Text Fields">
```

配套约定：

1. **键盘避让全交系统**：`adjust-position` 保持 `true`，组件侧不做补偿；不要再引入第二套避让。
2. 顶栏玻璃渐变没有 `@scroll` 可用，改由顶部**哨兵节点**（高 = `glassDistance`）经 `IntersectionObserver` 的露出比例驱动（见 `TOOLBARS.md` §1.4）。
3. 根节点为 `height:auto; min-height:100vh`；页面内 `min-height:100%` 会退化，全局 `_app-page-layout.scss` 已把插槽首子撑到 `100vh`，短页背景不断层。

### ❌ 不要把输入框放进内层 `scroll-view`

`:page-scroll="false"`（内层 `scroll-view`）只留给**需要 `scroll-y` 锁**的场景，例如横向 swipe 行（`pages/demo/swipe-actions`）。这类页面**不得放文本输入**——一旦滚动就会复现上面的错位，且没有可靠的补偿手段（曾尝试「关 `adjust-position` + 手动 `scroll-top` 补偿」，安卓真机仍不可用，已移除）。

同理，`:body-scroll="false"` 的页面若含输入框，输入控件须放在**不随内层滚动的节点**上（如底部固定的 `lingyun-search-bar`）。

---

## 4. 自检

- [ ] `field`：单行 52 高、圆角 26；Fill Tertiary；Label / Hint / Error
- [ ] `cell`：无胶囊底；行内右对齐；与 Sketch Grouped Text Field 一致
- [ ] 清除、密码显隐、禁用、Leading/Trailing
- [ ] 多行 textarea；浅色 / 暗黑；微信小程序可编译
- [ ] 输入框所在页走 `lingyun-app-page` 默认页面级滚动（未被 `:page-scroll="false"` / 内层 `scroll-view` 包住）
- [ ] **安卓**：先滚页面再聚焦，文字与外壳不错位；焦点行在键盘上方；切换输入框不闪
- [ ] **iOS**：聚焦位置与改动前一致（未回归）
- [ ] **真机**：手指按下即出蓝框（不等键盘）；从输入框起手滑动页面时蓝框会撤销；点清除 / 眼睛钮不亮环
- [ ] 顶栏玻璃渐变仍随滚动生效（哨兵驱动）
