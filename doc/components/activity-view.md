# lingyun-activity-view

分享面板。半高是玻璃，全高和宽屏是不透明底，材质与 Sheet 相同。

## 示例

```vue
<lingyun-activity-view
  v-model:show="open"
  detent="half"
  title="分享"
  :contacts="[{ name: '张三', badge: 'chat' }]"
  :apps="[{ name: '信息', icon: 'chat', color: '#34c759' }]"
  :groups="[{ actions: [{ text: '拷贝', icon: 'paperclip' }] }]"
  @select="onSelect"
/>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `detent` | `half` 半高或 `full` 全高 | half |
| `title / subtitle` | 标题 | '' |
| `thumbnail` | 标题旁缩略图 | '' |
| `contacts` | 联系人横滑 | [] |
| `apps` | 应用横滑 | [] |
| `groups` | 下方操作分组 | [] |
| `showClose` | 关闭按钮 | true |
| `maskClosable` | 点遮罩关闭 | true |
## 事件

| 事件 | 说明 |
| --- | --- |
| `select` | 选中联系人、应用或操作 |
