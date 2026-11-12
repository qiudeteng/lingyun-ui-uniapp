# lingyun-accordion

折叠分组：单开 / 多开、标题 / 副标题 / 自定义内容。

规范见 `design/ACCORDION.md`。

## 示例

```vue
<lingyun-accordion
  v-model="openKey"
  :items="[
    { key: 'delivery', title: '配送时间可以修改吗？', subtitle: '下单后 30 分钟内', content: '可联系门店修改…' },
    { key: 'storage', title: '冰淇淋蛋糕如何保存？', content: '建议 -18°C 冷冻保存…' },
  ]"
/>
```

多开 + 自定义内容：

```vue
<lingyun-accordion
  ref="accordionRef"
  v-model="openKeys"
  multiple
  :items="items"
>
  <template #content="{ item }">
    <view class="row">
      <text>{{ item.content }}</text>
      <lingyun-tag text="推荐" />
    </view>
  </template>
</lingyun-accordion>
```

```ts
import type { LingyunAccordionItem } from '@/uni_modules/lingyun-ui/components/lingyun-accordion/types'

const openKey = ref('delivery')
const openKeys = ref<string[]>(['notify'])
const accordionRef = ref<{ openAll: () => void; closeAll: () => void } | null>(null)
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `items` | 折叠项 `LingyunAccordionItem[]` | `[]` |
| `modelValue` | 单开 `string`；多开 `string[]` | `''` |
| `multiple` | 多开 | false |
| `showArrow` | 显示箭头 | true |

### LingyunAccordionItem

```ts
interface LingyunAccordionItem {
  key: string
  title: string
  subtitle?: string
  content?: string
  disabled?: boolean
}
```

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 展开项变化 |
| `change` | 参数 `{ key, open, openKeys }`；批量操作 key 为空 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `openAll()` | 展开全部（仅多开） |
| `closeAll()` | 收起全部（仅多开） |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `content` | 自定义展开内容，作用域 `{ item, index, open }` |

## 说明

- 整个分组是一张标准分组卡片；每项不是独立卡片。
- 内容直接渲染，不做高度动画。
- 禁用项不响应点击。
- 单开时点击已展开项会收起。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/accordion.vue -->
