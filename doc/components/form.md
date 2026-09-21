# lingyun-form

表单容器。`model` 是整份数据，`rules` 按字段名校验。字段用 `lingyun-form-item` 的 `name` 对应。

## 示例

```vue
<lingyun-form :model="form" :rules="rules">
  <lingyun-form-item name="name" label="姓名" required>
    <lingyun-text-field v-model="form.name" placeholder="请输入" />
  </lingyun-form-item>
</lingyun-form>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `model` | 表单数据 | {} |
| `rules` | 校验规则，键为字段名 | {} |
| `inset` | 分组卡片内缩 | true |
