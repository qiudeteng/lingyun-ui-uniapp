# lingyun-list

分组列表容器。行用 `lingyun-list-item`。

## 示例

```vue
<lingyun-list header="账户" header-type="extraProminent" footer="说明文字">
  <lingyun-list-item title="姓名" detail="齐成" />
  <lingyun-list-item title="通知" accessory="toggle" v-model:switch-checked="on" />
</lingyun-list>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `header` | 组标题 | — |
| `headerType` | 标题样式，如 `extraProminent` | — |
| `headerAction` | 标题右侧操作文字 | — |
| `footer` | 组底部说明 | — |
| `inset` | 左右内缩成卡片 | — |
