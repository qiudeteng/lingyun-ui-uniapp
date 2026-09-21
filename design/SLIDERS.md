# Sliders 规范（强制 · lingyun-slider）

> 对齐 [Sketch · Sliders](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/436F4FC8-878B-4119-8BD8-FCBA87695066/canvas)（Apple iOS 27 UI Kit）。**自绘**，禁止再包原生 `slider`（微信拇指是圆点，轨道也不是 6px）。
> 列表行附属版用同一组件（`flush` + 两端 glyph），见 [`LISTS.md`](./LISTS.md)。

```vue
<lingyun-slider v-model="n" :min="0" :max="100" />
<lingyun-slider v-model="n" min-glyph="☼" max-glyph="☀" flush />
```

## 1. 尺寸（No Glyphs · Light · 1 Enabled）

帧 **402 × 52**，左右 padding **16**，轨道区宽 370。1pt = 1px。

| 层 | 尺寸 | 色 / 说明 |
|----|------|-----------|
| 轨道 | 高 **6**，圆角 **3**，垂直居中（top 23） | Fill 1 Primary `rgba(120,120,120,0.2)` |
| 已走 | 高 6，圆角 3，画到**拇指中心** | System Blue `#0088ff` |
| 拇指 Idle | **37 × 24**，全圆角，top 14 | `#fff`；阴影 `0 0.5px 4px` 与 `0 6px 13px`，均为 `#000` 12% |
| 拇指按下 | 同尺寸；外圈 Glow **57 × 38**（偏移 -10, -7） | 白 45% 0.25px + `#d9d9d9` 0.5px 双环 |
| 刻度 | **5** 个 **4 × 4** 圆点，轨道下方 4px（top 33），两端 inset 16，`space-between` | Label Quaternary |
| Glyph | 宽 **32**，高 52；SF Semibold **17** | Label Secondary。无 glyph 时不占位 |

拇指行程：左缘从 0 到 `trackWidth - 37`，数值对应拇指中心。最小值时蓝条完全压在白拇指下，看起来没有已走色。

禁用：已走色仍蓝，拇指改灰（浅 `#d1d1d6` / 暗 `#636366`），不可拖。暗黑轨道走 `--lingyun-fill`，拇指仍白。

## 2. 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `value` | `50` | 当前值 |
| `min` / `max` / `step` | 0 / 100 / 1 | 范围 |
| `disabled` | `false` | 禁用 |
| `activeColor` | System Blue | 已走色 |
| `backgroundColor` | Fill Primary | 未走色 |
| `flush` | `false` | 去掉组件左右 16（列表行已有 16 时用） |
| `minGlyph` / `maxGlyph` | 空 | 两端符号；空则 No Glyphs |
| `showTicks` | `true` | 轨道下 5 个刻度 |

`blockSize` 仅保留兼容，视觉固定 37×24。

事件：`changing`（拖动中）、`change`（松手）、`update:modelValue`

## 3. 自检

- [ ] 拇指是 37×24 白胶囊，不是原生圆点
- [ ] 轨道高 6、已走色到拇指中心、下方 5 个刻度
- [ ] 按下有 Glow；禁用拇指变灰、进度仍蓝
- [ ] 暗黑轨道换 Fill，拇指仍白
- [ ] mp-weixin 可拖，不回写原生 `:value`
