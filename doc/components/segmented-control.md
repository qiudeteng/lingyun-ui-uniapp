# lingyun-segmented-control

分段选择。`items` 可以是字符串，或 `{ key, text }`。

## 示例

```vue
<lingyun-segmented-control v-model="current" :items="['日', '周', '月']" />
<lingyun-segmented-control
  v-model="tab"
  size="small"
  :items="[{ key: 'a', text: '项 1' }, { key: 'b', text: '项 2' }]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `items` | 选项 | [] |
| `modelValue` | 当前值：下标或 key | — |
| `size` | `large` / `small` | large |
| `disabled` | 整组禁用 | false |
| `block` | 撑满宽度 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/segmented-controls.vue -->
