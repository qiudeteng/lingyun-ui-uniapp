# lingyun-token-field

多选标签输入：回车 / 分隔符添加、建议、去重、上限。

规范见 [`design/TOKEN_FIELDS.md`](../../design/TOKEN_FIELDS.md)。

## 示例

```vue
<lingyun-token-field
  v-model="tags"
  label="商品标签"
  :suggestions="['招牌', '新品', '低糖', '生日']"
  :max="5"
  show-count
  placeholder="输入标签后按回车"
  @add="onAdd"
  @remove="onRemove"
  @invalid="onInvalid"
/>
```

```ts
import type {
  LingyunTokenFieldAddPayload,
  LingyunTokenFieldInvalidPayload,
  LingyunTokenFieldRemovePayload,
} from '@/uni_modules/lingyun-ui/components/lingyun-token-field/types'

const tags = ref<string[]>(['招牌'])
```

仅允许建议项：

```vue
<lingyun-token-field
  v-model="tags"
  :suggestions="suggestions"
  :allow-custom="false"
/>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 已选标签 `string[]` | `[]` |
| `label` | 字段标签 | `''` |
| `placeholder` | 输入占位 | 输入后按回车添加 |
| `max` | 最大数量；0 不限 | 0 |
| `suggestions` | 建议项 | `[]` |
| `allowCustom` | 允许自定义标签 | true |
| `allowDuplicate` | 允许重复 | false |
| `addOnBlur` | 失焦时添加输入内容 | true |
| `disabled` | 禁用 | false |
| `readonly` | 只读 | false |
| `showCount` | 显示数量 | false |
| `inputMaxlength` | 输入最大长度 | 40 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 标签变化 |
| `change` | 参数 `{ tokens }` |
| `add` | 添加，参数 `{ token, tokens }` |
| `remove` | 移除，参数 `{ token, index, tokens }` |
| `invalid` | 校验失败，参数 `{ value, reason: 'duplicate' \| 'max' \| 'custom' }` |
| `focus` / `blur` | 输入聚焦 / 失焦 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `clear()` | 清空标签 |

## 说明

- 回车 / 输入逗号或中文逗号 / 失焦（`addOnBlur`）添加标签。
- 默认不允许重复；`max` 达到上限后不再添加。
- `allowCustom=false` 时只能选择建议项。
- 建议列表为内容层卡片，不做浮层。
- 点击建议添加；点击 token 关闭移除。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/token-field.vue -->
