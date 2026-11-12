# lingyun-radio-group

包住若干 `lingyun-radio`，`v-model` 是当前选中的 `value`。

## 示例

```vue
<lingyun-radio-group v-model="city">
  <lingyun-radio value="sh" label="上海" />
  <lingyun-radio value="bj" label="北京" />
</lingyun-radio-group>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 当前值 | — |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 切换 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/checks.vue -->
