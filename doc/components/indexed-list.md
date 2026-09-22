# lingyun-indexed-list

索引列表。按字母分成一组组卡片，右侧有一条字母索引，按住可以跳到对应分组。数据和点击跟 `uni-indexed-list` 一样。

组件自己滚动，页面要给它一个确定的高度。

## 示例

```vue
<lingyun-indexed-list
  :options="[
    { letter: 'A', data: ['阿坝', '安庆'] },
    { letter: 'B', data: ['北京'] },
  ]"
  @click="onClick"
/>
```

`data` 也可以写成 `{ name, checked }`。`show-select` 打开后，点一行会勾选，并在事件里带回当前所有已选项。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `options` | `{ letter, data }` 分组 | [] |
| `show-select` | 点选模式 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | `{ item, select }`。`item` 含 `key`、`name`、`itemIndex`、`checked` |
