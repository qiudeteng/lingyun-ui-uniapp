# lingyun-swipe-action

包住一个或多个 `lingyun-swipe-action-item`。本身没有属性。

## 示例

```vue
<lingyun-swipe-action>
  <lingyun-swipe-action-item
    :right-options="[{ text: '删除', role: 'destructive' }]"
    @click="onSwipe"
  >
    <lingyun-list-item title="收件箱" detail="12" />
  </lingyun-swipe-action-item>
</lingyun-swipe-action>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `—` | 无 | — |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/swipe-actions.vue -->
