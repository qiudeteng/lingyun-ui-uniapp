# lingyun-search-bar

搜索栏。`v-model` 绑定输入文字。

## 示例

```vue
<lingyun-search-bar v-model="query" placeholder="搜索" @confirm="onSearch" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 输入内容 | — |
| `placeholder` | 占位 | Search |
| `fixed` | 固定在顶部 | true |
| `safeArea` | 状态栏安全区 | true |
| `showCancel` | 聚焦时显示取消 | true |
| `cancelText` | 取消文案。空则用「取消」 | '' |
| `focus` | 初始聚焦 | false |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 输入变化 |
| `confirm` | 键盘搜索 |
| `cancel` | 点取消 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/search-bar.vue -->
