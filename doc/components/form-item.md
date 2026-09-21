# lingyun-form-item

表单一行：左侧标签，右侧放输入、开关或选择器。

## 示例

```vue
<lingyun-form-item name="name" label="姓名" required>
  <lingyun-text-field v-model="form.name" placeholder="请输入" />
</lingyun-form-item>
<lingyun-form-item name="note" label="备注" layout="column" error="请填写">
  <lingyun-text-field v-model="form.note" multiline />
</lingyun-form-item>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `name` | 字段名，对应 form.rules | '' |
| `label` | 行标题 | '' |
| `required` | 显示必填 | false |
| `error` | 行内错误 | '' |
| `layout` | `row` 左右，或 `column` 上下 | row |
