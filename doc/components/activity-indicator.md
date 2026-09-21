# lingyun-activity-indicator

转圈。整页加载遮罩用 HUD，不要用这个铺满屏幕。

## 示例

```vue
<lingyun-activity-indicator size="large" />
<lingyun-activity-indicator :animating="busy" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `size` | `medium` / `large` | medium |
| `color` | 颜色 | '' |
| `animating` | 是否转动 | true |
| `hidesWhenStopped` | 停下来后隐藏 | true |
