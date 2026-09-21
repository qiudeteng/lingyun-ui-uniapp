# Badges 规范（强制 · lingyun-badge）

> `lingyun-badge` **必须**按苹果官方 App Icons · Badge 设计符号开发与验收。  
> 本文是 `design/UI_SPEC.md` 的角标专章；与 Sketch / HIG 冲突时以 **Sketch 符号尺寸** 为准。

## 权威来源

1. **Sketch · App Icons / Badge**（Inspect）  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4FE3C0D6-2F3E-4203-A201-C708AFA8AC55#Inspect
2. **HIG · Labels / Status**（角标语义）  
   https://developer.apple.com/design/human-interface-guidelines
3. **System Colors**  
   [`COLORS.md`](./COLORS.md)

---

## 1. Sketch 已核对（Light · Badge）

| 项 | 值 |
|----|-----|
| 符号 | `App Icons / 􀻃 - Badge / Badge` |
| 高度 | **24**（Fit） |
| 宽度 | Fit（示例「247」约 **44**） |
| 内边距 | 左右 **8** · 上下 **2.5** |
| 圆角 | **100**（胶囊 Max） |
| 填充 | System **Red** `#ff383c`（默认） |
| 文案 | SF Pro **Regular 400** / **16** / 行高 **19** / **#FFFFFF** |

实现：**1pt = 1px**。❌ 禁止 `rpx`。

> 本符号为 **实心 System Color** 角标（非 Liquid Glass 面板）。玻璃仅用于控件/导航/浮层，角标保持高对比实心填充。

---

## 2. 颜色 Color → `color`

| Sketch / 语义 | lingyun `color` | Token |
|---------------|-----------------|-------|
| Red（默认） | `red` | `--lingyun-system-red` |
| Green | `green` | `--lingyun-system-green` |
| Orange | `orange` | `--lingyun-system-orange` |
| Gray | `gray` | `--lingyun-system-gray` |

兼容别名：`error`/`danger`→`red`，`success`→`green`，`warning`→`orange`，`info`/`grey`→`gray`；亦可用 prop `type`（同 `color`）。

---

## 3. API

```vue
<lingyun-badge text="247" />
<lingyun-badge color="green" text="3" />
<lingyun-badge color="orange" :text="12" />
<lingyun-badge color="gray" text="99+" />
<lingyun-badge :text="120" :max="99" />
<lingyun-badge dot />
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `color` | string | `red` | `red` \| `green` \| `orange` \| `gray` |
| `type` | string | `''` | 兼容别名，同 `color` |
| `text` | string \| number | `''` | 角标内容；数字可走 `max` |
| `max` | number | `99` | 超出显示 `{max}+`；`≤0` 不封顶 |
| `dot` | boolean | `false` | 仅小圆点 |

---

## 4. 自检

- [ ] 高度 24、左右 pad 8、胶囊圆角
- [ ] 默认红 = System Red；绿/橙/灰走 System Colors
- [ ] 文案 Regular 16 / 白字
- [ ] 尺寸为 `px`，未使用 `rpx`
