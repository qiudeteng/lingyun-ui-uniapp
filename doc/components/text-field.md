# lingyun-text-field

输入框。放在 `lingyun-form-item` 里会自动变成行内样式。

## 示例

```vue
<lingyun-text-field v-model="name" label="姓名" placeholder="请输入" clearable />
<lingyun-text-field v-model="pwd" label="密码" secure />
<lingyun-text-field v-model="notes" label="备注" multiline :rows="4" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `modelValue` | 内容 | — |
| `label` | 标题 | '' |
| `placeholder` | 占位 | ' ' |
| `hint` | 辅助说明 | '' |
| `error` | 错误文案 | '' |
| `clearable` | 显示清除 | true |
| `secure` | 密码 | false |
| `multiline` | 多行 | false |
| `rows` | 多行行数 | 3 |
| `maxlength` | 最大长度，-1 不限制 | -1 |
| `type` | 键盘类型 | text |
| `name` | 原生字段名，H5 密码管理器用它匹配账号密码 | '' |
| `autocomplete` | H5 自动填充提示，如 `username` / `current-password` | '' |
| `disabled / readonly` | 禁用 / 只读 | false |
| `variant` | `auto`：在 form-item 内为行内，否则为独立胶囊 | auto |
## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 输入 |
| `confirm` | 键盘完成 |
| `focus / blur` | 聚焦 / 失焦 |

H5 浏览器自动填充会自动同步到组件并隐藏占位符；原生密码框自带的眼睛 / 清除装饰已隐藏，只保留组件自己的显隐与清除按钮。登录页账号传 `autocomplete="username"`，密码传 `autocomplete="current-password"`。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/text-fields.vue -->
