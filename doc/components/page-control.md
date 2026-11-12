# lingyun-page-control

轮播下方的圆点。`v-model` 为当前下标。

## 示例

```vue
<lingyun-page-control v-model="index" :count="5" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue / current` | 当前下标 | — |
| `count` | 总页数 | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/page-controls.vue -->
