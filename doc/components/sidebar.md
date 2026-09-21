# lingyun-sidebar

从侧边滑出的浮层菜单，盖在内容上。和宽屏里那条常驻导航不是同一个组件。

## 示例

```vue
<lingyun-sidebar
  v-model:show="open"
  v-model:current="key"
  title="资料库"
  placement="leading"
  :sections="[{ title: '浏览', items: [{ key: 'all', title: '全部' }] }]"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `current` | 当前选中 key | '' |
| `title` | 标题 | '' |
| `sections` | 分组：`{ title, items }` | [] |
| `items` | 不分组时的项列表 | [] |
| `placement` | `leading` 左侧或 `trailing` 右侧 | leading |
| `maskClosable` | 点遮罩关闭 | true |
| `closeOnSelect` | 选中后关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:show` | 开关 |
| `update:current` | 选中变化 |
