# lingyun-list

分组列表容器。行用 `lingyun-list-item`。

## 示例

```vue
<lingyun-list header="账户" header-type="extraProminent" footer="说明文字">
  <lingyun-list-item title="姓名" detail="齐成" />
  <lingyun-list-item title="通知" accessory="toggle" v-model:switch-checked="on" />
</lingyun-list>
```

整页纯列表（HIG Plain）：不要分组卡片，行直接铺满页面宽度。

```vue
<lingyun-list plain>
  <lingyun-list-item title="张伟 · 鲜花礼盒" note="11-10 14:30 · 微信支付" />
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
| `plain` | 全宽平铺：无卡片底色 / 圆角，强制忽略 `inset` | `false` |
