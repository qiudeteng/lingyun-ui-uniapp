# Checks 规范（强制 · checkbox / radio / data-*）

> 表单单选 / 多选。**自绘控件**（不用原生 checkbox/radio：mp 默认绿且 `color` 在自定义组件常失效）。色对齐 System Blue / `--lingyun-primary`。

## 1. Checkbox（lingyun-checkbox）

```vue
<lingyun-checkbox v-model="ok" label="Agree" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `checked` | — | 选中 |
| `label` | `''` | 文案 |
| `disabled` | `false` | 禁用 |
| `color` | 主题 Primary | 选中色覆盖 |

事件：`update:modelValue`、`change`  
交互：整行可点；选中勾 / 圆点用 `lingyun-icon`（`checkmarkempty` / `smallcircle-filled`）。

## 2. Radio（lingyun-radio-group + lingyun-radio）

```vue
<lingyun-radio-group v-model="fruit">
  <lingyun-radio value="apple" label="Apple" />
  <lingyun-radio value="pear" label="Pear" />
</lingyun-radio-group>
```

| 组件 | 要点 |
|------|------|
| `lingyun-radio-group` | `v-model` 绑选中值；`@change` |
| `lingyun-radio` | `value` + `label`；须在 group 内 |

## 3. Data Checkbox（lingyun-data-checkbox）

数据驱动**多选**：传入 `localdata`，`v-model` 为选中值数组。

```vue
<lingyun-data-checkbox
  v-model="tags"
  :localdata="[
    { text: 'Work', value: 'work' },
    { text: 'Home', value: 'home', disabled: true },
  ]"
  :min="1"
  :max="3"
/>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `value` | `[]` | 选中值数组 |
| `localdata` | `[]` | `{ text, value, disabled? }[]` |
| `map` | `{ text, value, disabled }` | 字段映射 |
| `min` / `max` | — | 最少 / 最多可选数 |
| `disabled` | `false` | 整组禁用 |
| `color` | 主题 Primary | 选中色 |
| `emptyText` | `暂无数据` | 无选项文案 |

事件：`change` → `{ value, detail: { value } }`

## 4. Data Radio（lingyun-data-radio）

数据驱动**单选**：传入 `localdata`，`v-model` 为当前值。

```vue
<lingyun-data-radio
  v-model="ship"
  :localdata="[
    { text: 'Standard', value: 'standard' },
    { text: 'Express', value: 'express' },
  ]"
/>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `modelValue` / `value` | — | 当前选中值 |
| `localdata` | `[]` | 同上 |
| `map` | 同上 | 字段映射 |
| `disabled` | `false` | 整组禁用 |
| `color` | 主题 Primary | 选中色 |
| `emptyText` | `暂无数据` | 无选项文案 |

内部复用 `lingyun-radio-group` + `lingyun-radio`。

## 5. 自检

- [ ] 浅色选中为 System Blue（非微信绿）
- [ ] 暗黑跟 `--lingyun-primary`
- [ ] disabled 不可点；整行可点选
- [ ] data-*：改 `localdata` / `v-model` 可驱动勾选，无需手写子项
- [ ] mp-weixin 选中无行高抖动、无文字闪烁
