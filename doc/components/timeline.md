# lingyun-timeline

纵向时间线：时间、标题、说明、状态圆点与图标。用于订单轨迹、操作日志、审批记录。

规范见 [`design/TIMELINE.md`](../../design/TIMELINE.md)。

## 示例

```vue
<lingyun-timeline
  :items="[
    { key: 'create', title: '订单已提交', time: '今天 10:24', description: '6 寸蛋糕', status: 'success', icon: 'checkmarkempty' },
    { key: 'pay', title: '支付成功', time: '今天 10:25', description: '微信支付 ¥228.00', status: 'success' },
    { key: 'make', title: '门店制作中', time: '今天 10:40', description: '预计 20 分钟完成', status: 'active', icon: 'compose' },
    { key: 'deliver', title: '等待骑手取货', time: '预计 11:10' },
  ]"
/>
```

可点击：

```vue
<lingyun-timeline :items="items" clickable @item-click="onItemClick" />
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `items` | 时间线数据，`LingyunTimelineItem[]` | `[]` |
| `clickable` | 整项可点击 | false |
| `emptyText` | 无数据文案 | 暂无记录 |
| `accentColor` | `active` 状态主色 | 系统蓝 |

### LingyunTimelineItem

```ts
interface LingyunTimelineItem {
  key: string
  title: string
  description?: string
  time?: string
  icon?: string
  color?: string
  status?: 'default' | 'active' | 'success' | 'warning' | 'error'
}
```

- `icon` 有值时圆点变为 24px 实心底 + 白色图标。
- `color` 覆盖圆点颜色，不改变标题颜色。

## 事件

| 事件 | 说明 |
| --- | --- |
| `item-click` | `clickable` 时点击，参数 `{ key, index, item }` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换圆点内容，作用域 `{ item, index, status }` |
| `extra` | 说明下方扩展，作用域 `{ item, index }` |
| `empty` | 空态内容 |

## 说明

- 固定纵向左轨布局，不做左右交替。
- 连接线不随状态变色，保持 Separator；状态只影响圆点与标题。
- 内容层标准材质，不铺 Liquid Glass。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/timeline.vue -->
