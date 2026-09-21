# Text 规范（强制 · lingyun-text）

> 语义化文本；内容层，非玻璃。对齐 [HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)（iOS **Large** 默认档）与 [`COLORS.md`](./COLORS.md) Labels / Accents。

## 权威来源

1. Apple HIG · Typography（Text Styles）
2. [`COLORS.md`](./COLORS.md) · Labels / System Accents
3. 仓库内既有字号约定：Body **17/22**、Subheadline **15/20** 等（与 Lists / Alerts 一致）

## 1. 字阶 `type`（1pt = 1px）

| `type` | 字号 / 行高 | 字重 | 场景 |
|--------|-------------|------|------|
| `largeTitle` | 34 / 41 | Regular | 大标题 |
| `title1` | 28 / 34 | Regular | 一级标题 |
| `title2` | 22 / 28 | Regular | 二级标题 |
| `title3` | 20 / 25 | Regular | 三级标题 |
| `headline` | 17 / 22 | Semibold | 列表/区块标题 |
| `body` | 17 / 22 | Regular | **正文**（默认） |
| `callout` | 16 / 21 | Regular | 强调说明 |
| `subheadline` | 15 / 20 | Regular | **副标题** |
| `footnote` | 13 / 18 | Regular | 脚注 / 提示 |
| `caption1` | 12 / 16 | Regular | 图注 |
| `caption2` | 11 / 13 | Regular | 更小图注 |

### 常用别名

| 别名 | 映射 | 默认色 |
|------|------|--------|
| `title` | `title3` | Label |
| `subtitle` | `subheadline` | Secondary |
| `caption` | `caption1` | Secondary |
| `hint` | `footnote` | Tertiary |

`emphasized` / `bold`：在对应档用 Emphasized 字重（多为 Semibold / Bold）。

## 2. 颜色 `color`

| 值 | 说明 |
|----|------|
| `label`（默认） | Primary Label |
| `secondary` / `tertiary` / `quaternary` | 次级 Labels |
| `primary` / `link` | System Blue / Link |
| `success` / `warning` / `error` | Green / Orange / Red |
| `white` / `inherit` | 白字 / 继承 |
| 任意 CSS 色 | 如 `#FF2D55`、`rgb(...)`、`var(--x)` |

自定义色优先于语义 token。

## 3. API

```vue
<lingyun-text type="title">页面标题</lingyun-text>
<lingyun-text type="subtitle">副标题说明</lingyun-text>
<lingyun-text type="body">正文内容</lingyun-text>
<lingyun-text type="hint">辅助提示</lingyun-text>
<lingyun-text type="headline" color="primary">强调</lingyun-text>
<lingyun-text color="#AF52DE">自定义色</lingyun-text>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `text` | `''` | 文案；也可用默认插槽 |
| `type` | `body` | 字阶 / 别名 |
| `color` | 按 type 默认 | 语义色或自定义色 |
| `align` | `left` | `left` / `center` / `right` |
| `lines` | `0` | `>0` 时省略；`1` 单行 |
| `emphasized` / `bold` | `false` | 加粗档 |
| `block` | `false` | `true` 时 `display:block` 占满一行 |
| `selectable` | `false` | 可选中 |

事件：`click`

## 4. 自检

- [ ] 字号为 `px`；暗黑下 Labels / Accents 可读
- [ ] 自定义色与语义色均生效；别名映射正确
- [ ] `lines` 省略在 mp-weixin 可用
- [ ] 微信小程序可编译运行
