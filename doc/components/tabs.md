# lingyun-tabs

顶部可滚动 Tab View。支持 `underline` / `pill` 两种形态、横向滚动、激活项居中滚入、滑动指示器、吸顶。

## 示例

```vue
<lingyun-tabs v-model="current" :items="tabs">
  <template #default="{ activeKey }">
    <view v-if="activeKey === 'all'">全部内容</view>
    <view v-else-if="activeKey === 'pending'">待处理内容</view>
  </template>
</lingyun-tabs>
```

```ts
const tabs = [
  { key: 'all', text: '全部', icon: 'list' },
  { key: 'pending', text: '待处理', badge: 3 },
  { key: 'done', text: '已完成' },
  { key: 'canceled', text: '已取消', disabled: true },
]
```

### Pill · 可滚动

```vue
<lingyun-tabs v-model="current" :items="manyTabs" variant="pill" />
```

### 吸顶

```vue
<lingyun-tabs
  v-model="current"
  :items="tabs"
  sticky
  :sticky-top="60"
>
  <template #default="{ activeKey }">
    <view>长内容放在插槽内，Tabs 才能持续吸顶</view>
  </template>
</lingyun-tabs>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `v-model` | 当前 Tab key | — |
| `items` | `LingyunTabItem[]` | `[]` |
| `variant` | `underline` / `pill` | `underline` |
| `scrollable` | 是否横向滚动 | `true` |
| `sticky` | 吸顶 | `false` |
| `sticky-top` | 吸顶距顶部偏移（px）；不传时读取 `lingyun-app-page` 顶部 inset | — |
| `align` | `start` / `center` | `start` |
| `show-indicator` | 显示滑动指示条 / 选中胶囊 | `true` |
| `safe-area` | 内容底部安全区 | `false` |
| `z-index` | 吸顶层级 | `10` |

`items` 项：

```ts
interface LingyunTabItem {
  key: string
  text: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}
```

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `key` | 当前 Tab 变化 |
| `change` | `{ key, item, index }` | 切换 Tab |

## 插槽

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ activeKey, activeItem, activeIndex }` | 内容区；按 activeKey 渲染 |
| `prefix` | — | Tab 栏左侧附加 |
| `suffix` | — | Tab 栏右侧附加 |

## 方法

通过 `ref` 调用：

```ts
tabsRef.value?.select('pending')
tabsRef.value?.scrollToKey('pending')
tabsRef.value?.refresh()
```

## 说明

- 通过 `lingyun-app-page` / `lingyun-toolbars` 的 `segments` + `segment-control="tabs"` 可把同一份数据渲染成工具栏下方的顶部 Tabs，事件与分段控件一致（`segmentValue` / `segment-click` / `segment-change`）。
- 激活 Tab 会居中滚入可视区，左右两侧保留可见 Tab；首尾项受内容边界限制。`scrollable=false` 时不滚动。
- `sticky` 依赖 CSS `position: sticky`；**长内容必须放在默认插槽内**，否则包含块过短，无法持续吸顶。
- 页面有固定顶栏时传 `sticky-top`（如 `60`）；在 `lingyun-app-page` 内未传时会尝试使用其顶部 inset。
- 图标使用 `lingyun-icon`，badge 使用 `lingyun-badge size="small"`。
