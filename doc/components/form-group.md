# lingyun-form-group

把若干 `lingyun-form-item` 收成一组，可带组标题和页脚说明。

## 示例

```vue
<lingyun-form-group title="账号" footer="用于登录">
  <lingyun-form-item name="name" label="姓名">
    <lingyun-text-field v-model="form.name" />
  </lingyun-form-item>
</lingyun-form-group>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 组标题 | '' |
| `footer` | 组底部说明 | '' |
