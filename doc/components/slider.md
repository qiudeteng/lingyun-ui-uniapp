# lingyun-slider

滑条。`v-model` 为当前数值。

## 示例

```vue
<lingyun-slider v-model="volume" :min="0" :max="100" />
<lingyun-slider v-model="n" min-glyph="minus" max-glyph="plus" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前值 | — |
| `min / max / step` | 范围与步长 | 0 / 100 / 1 |
| `disabled` | 禁用 | false |
| `flush` | 去掉左右内边距。放在列表行里时用 | false |
| `minGlyph / maxGlyph` | 两端图标名 | '' |
| `showTicks` | 显示刻度 | true |
| `activeColor / backgroundColor` | 已滑过 / 轨道颜色 | '' |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 拖动 |
