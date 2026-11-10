# lingyun-combobox

可搜索选择：字段触发 + Popover 搜索列表。

规范见 [`design/COMBOBOX.md`](../../design/COMBOBOX.md)。

## 示例

```vue
<lingyun-combobox
  v-model="store"
  label="配送门店"
  :items="[
    { label: '酒仙桥店', value: 'jiuxianqiao', description: '北京市朝阳区酒仙桥路 12 号' },
    { label: '望京店', value: 'wangjing', description: '北京市朝阳区望京街 9 号' },
  ]"
  clearable
  @change="onChange"
/>
```

```ts
import type {
  LingyunComboboxChangePayload,
  LingyunComboboxItem,
} from '@/uni_modules/lingyun-ui/components/lingyun-combobox/types'

const store = ref<string | number | null>('jiuxianqiao')
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `modelValue` | 当前值 | null |
| `items` | 选项 `{ label, value, description?, disabled? }[]` | `[]` |
| `label` | 字段标签 | `''` |
| `placeholder` | 空态文案 | 请选择 |
| `searchPlaceholder` | 搜索框占位 | 搜索 |
| `emptyText` | 无匹配文案 | 没有匹配项 |
| `showSearch` | 显示搜索框 | true |
| `clearable` | 显示清除钮 | false |
| `disabled` | 禁用 | false |
| `readonly` | 只读 | false |
| `dropdownWidth` | 下拉宽度；0 跟随触发器 | 0 |
| `maxHeight` | 列表最大高度 px | 240 |
| `zIndex` | 浮层层级 | 1250 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选择 / 清除 |
| `change` | 参数 `{ value, item }` |
| `open` / `close` | 下拉打开 / 关闭 |
| `search` | 搜索值变化，参数字符串 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `open()` / `close()` | 打开 / 关闭下拉 |

## 说明

- 点击字段打开，透明遮罩点击关闭。
- 打开后自动聚焦搜索框；小程序键盘抬起时列表缩短并重新定位，避免被键盘遮挡。
- 搜索按 label / description 过滤；回车选择第一条可选项。
- 禁用项不可选；`readonly` 不打开。
- 下拉复用 Popover 玻璃，不另造浮层。
