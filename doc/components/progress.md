# lingyun-progress

进度。`type` 为线或环。

## 示例

```vue
<lingyun-progress :percent="40" show-info />
<lingyun-progress type="circle" :percent="70" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `type` | `line` 或 `circle` | line |
| `percent` | 0 到 100 | — |
| `showInfo` | 显示百分比文字 | — |
| `strokeWidth` | 线粗 | — |
| `size` | 环形尺寸 | — |
| `activeColor / backgroundColor` | 进度色 / 轨道色 | '' |
