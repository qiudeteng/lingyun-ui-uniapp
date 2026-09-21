# lingyun-button

按钮。默认玻璃样式。

## 示例

```vue
<lingyun-button variant="glass" size="large" text="继续" @click="onSubmit" />
<lingyun-button variant="borderedProminent" text="保存" />
<lingyun-button variant="glass" role="destructive" text="删除" />
<lingyun-button variant="glass" block text="通栏" :loading="busy" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `variant` | `glass` 玻璃，`borderedProminent` 实心强调 | glass |
| `size` | `large` / `medium` / `small` | large |
| `role` | `normal` / `destructive` / `success` / `warning` | normal |
| `text` | 文案。也可用默认插槽 | '' |
| `icon` | 左侧图标名，见 lingyun-icon | '' |
| `block` | 撑满一行 | false |
| `disabled` | 禁用 | false |
| `loading` | 加载中 | false |
## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点击 |
