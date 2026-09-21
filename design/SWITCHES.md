# Switches & Steppers 规范（强制 · lingyun-switch / lingyun-stepper）

> 独立表单控件；视觉对齐 [`LISTS.md`](./LISTS.md) 行内附属。本批**不**强制 list-item 改为依赖本组件。

## 1. Switch（lingyun-switch）

| 项 | 约定 |
|----|------|
| 实现 | 封装原生 `switch` |
| 色 | 开态 System Blue |

```vue
<lingyun-switch v-model="on" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `checked` | `false` | 开/关 |
| `disabled` | `false` | 禁用 |
| `color` | primary | 开态色 |

事件：`update:modelValue`、`change`

## 2. Stepper（lingyun-stepper）

| 项 | 约定 |
|----|------|
| 形态 | − / + 双钮胶囊；中间分割 |
| 高 | 约 **28–32** |

```vue
<lingyun-stepper v-model="n" :min="0" :max="10" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `value` | `0` | 当前值 |
| `min` / `max` / `step` | 0 / 10 / 1 | 范围 |
| `disabled` | `false` | 禁用 |

事件：`update:modelValue`、`change`

## 3. 自检

- [ ] 独立可用；暗黑；mp-weixin 可运行
