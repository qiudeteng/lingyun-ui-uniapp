# lingyun-rating

评分控件：整星 / 半星、只读 / 禁用、可清除、显示分值。用于评价、满意度、门店打分。

规范见 [`design/RATING.md`](../../design/RATING.md)。

## 示例

```vue
<lingyun-rating v-model="score" show-value value-suffix=" / 5" />

<lingyun-rating v-model="score" allow-half />

<lingyun-rating :model-value="4" readonly show-value value-suffix=" / 5" />
```

```ts
import { ref } from 'vue'

const score = ref(3)
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 当前分值，`v-model` | 0 |
| `max` | 星星数量，最多 10 | 5 |
| `size` | 星星尺寸 px，12–48 | 24 |
| `gap` | 星星间距 px | 4 |
| `allowHalf` | 支持半星（0.5 步进） | false |
| `readonly` | 只读 | false |
| `disabled` | 禁用，0.4 透明度 | false |
| `clearable` | 再次点击当前分值归零 | false |
| `showValue` | 显示当前分值 | false |
| `valueSuffix` | 分值后缀，如 ` / 5` | `''` |
| `label` | 无障碍标签 | 评分 |
| `activeColor` | 激活星星颜色（语义色或任意 CSS 色） | `orange` |
| `inactiveColor` | 未激活星星颜色 | `gray3` |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 分值变化 |
| `change` | 分值变化，参数 `{ value, previous }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `reset()` | 归零（只读 / 禁用时无效） |

## 说明

- 半星：点击星星左半区为 `N - 0.5`，右半区为 `N`。
- `allowHalf=false` 时 `modelValue` 向下取整。
- 星星由灰色空心星 + 裁剪的实心星叠加，半星通过 50% 宽度裁剪实现。
- 内容层控件，不铺 Liquid Glass；可放在 `lingyun-form-item` 或分组卡片中。
