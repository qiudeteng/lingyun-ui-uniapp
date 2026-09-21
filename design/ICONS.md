# Icons 规范（lingyun-icon）

> `lingyun-icon` 是 凌云UI 统一图标字体组件。字体来自 uni-icons（`uniicons.ttf`），class 前缀改为 `lyicon-`，避免与第三方 `uni-icons` 冲突。

## 用法

```vue
<lingyun-icon type="search" :size="18" color="secondary" />
<lingyun-icon type="heart-filled" color="error" />
<lingyun-icon type="star-filled" color="#AF52DE" />
<lingyun-icon type="clear" :size="18" @click="onClear" />
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `type` | string | `''` | 图标名（见 Icons demo） |
| `size` | number \| string | `16` | 字号；纯数字按 **px** |
| `color` | string | `''` | 语义预设或任意 CSS 色；空则 `label` |
| `customPrefix` | string | `lyicon` | 自定义字体 class 前缀 |

事件：`click`

## 颜色 `color`

与 [`TEXTS.md`](./TEXTS.md) / [`COLORS.md`](./COLORS.md) 对齐：先匹配语义名，否则当作自定义 CSS。

| 值 | 说明 |
|----|------|
| `label`（默认） | Primary Label |
| `secondary` / `tertiary` / `quaternary` | 次级 Labels |
| `primary` / `link` | System Blue / Link |
| `success` / `warning` / `error` | Green / Orange / Red |
| `red` `orange` `yellow` `green` `mint` `teal` `cyan` `blue` `indigo` `purple` `pink` `brown` | System Accents |
| `gray` / `gray2` / `gray3` | System Gray |
| `white` / `inherit` | 白字 / 继承 |
| 任意 CSS 色 | `#AF52DE`、`rgb(...)`、`var(--x)` |

## 常用 type

`search` · `clear` · `closeempty` · `close` · `left` · `right` · `top` · `bottom` · `eye` · `eye-slash` · `mic` · `upload` · `plus` · `minus` · `heart` · `star` · `home` · `person` · `settings` · `info`

完整列表见 demo `pages/demo/icons`。

## 约定

1. 尺寸一律 **px**（Sketch 1pt = 1px）；禁止 `rpx`。
2. 控件内图标优先 `lingyun-icon`，**禁止**再 CSS 自绘 clear / chevron / eye（伪元素在小程序易变形）。
3. **不换**：Sheet grabber、checkbox/radio 几何选中态、picker indicator 线。
4. `swipe-action` 的 `iconType` 走 `lingyun-icon`（与 uni-icons type 名兼容）。

## 文件

`src/uni_modules/lingyun-ui/components/lingyun-icon/`
