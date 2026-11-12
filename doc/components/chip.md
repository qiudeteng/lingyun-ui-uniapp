# lingyun-chip

可切换选中态的胶囊，适合筛选。

## 示例

```vue
<lingyun-chip v-model="on" text="仅看未读" />
<lingyun-chip text="不可点" disabled />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `text` | 文案 | '' |
| `modelValue / selected` | 是否选中 | — |
| `selectable` | 能否切换 | true |
| `disabled` | 禁用 | false |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中变化 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/tags.vue -->
