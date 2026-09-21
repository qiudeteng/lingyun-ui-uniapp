# Progress 规范（强制 · lingyun-progress）

> 线性 / 环形进度条；内容层控件。

## 权威来源

1. HIG · Progress indicators  
2. [`COLORS.md`](./COLORS.md)

## 1. 形态

| 项 | 约定 |
|----|------|
| `line` | 高 **4**；轨 Fill Tertiary；填充 System Blue；圆角 2 |
| `circle` | 默认直径 **40**；线宽 **3**；同上色 |
| `percent` | 0–100 |

## 2. API

```vue
<lingyun-progress :percent="40" />
<lingyun-progress type="circle" :percent="70" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `type` | `line` | line / circle |
| `percent` | `0` | 0–100 |
| `strokeWidth` | line 4 / circle 3 | 线宽 |
| `size` | `40` | 仅 circle 直径 |
| `showInfo` | `false` | 是否显示百分比文案 |
| `activeColor` | primary | 填充色 |
| `backgroundColor` | fill-tertiary | 轨道色 |

## 3. 自检

- [ ] line / circle；暗黑可读；mp-weixin 可运行
