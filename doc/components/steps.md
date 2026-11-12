# lingyun-steps

流程步骤条：横向 / 纵向、完成 / 进行中 / 等待 / 错误、可点击切换。用于下单、制作、配送、审批等流程。

规范见 `design/STEPS.md`。

## 示例

```vue
<lingyun-steps
  v-model="current"
  :items="[
    { key: 'order', title: '提交订单', description: '选择商品与配送时间' },
    { key: 'produce', title: '门店制作', description: '裱花与打包' },
    { key: 'deliver', title: '骑手配送', description: '预计 30 分钟送达' },
    { key: 'done', title: '完成签收', description: '确认收货并评价' },
  ]"
  clickable
  @change="onChange"
/>
```

纵向：

```vue
<lingyun-steps
  v-model="current"
  direction="vertical"
  :items="items"
/>
```

错误与禁用：

```vue
<lingyun-steps
  v-model="current"
  :items="[
    { key: 'create', title: '创建订单', status: 'finish' },
    { key: 'pay', title: '支付失败', status: 'error' },
    { key: 'ship', title: '等待发货' },
    { key: 'finish', title: '不可跳过', disabled: true },
  ]"
/>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `items` | 步骤数据，`LingyunStepItem[]` | `[]` |
| `modelValue` | 当前步骤 key 或索引，`v-model` | `''` |
| `direction` | `horizontal` / `vertical` | `horizontal` |
| `clickable` | 整步可点击切换 | false |
| `showDescription` | 显示 `description` | true |
| `scrollable` | 横向步骤多时滚动 | true |
| `accentColor` | 进行中 / 完成主色 | 系统蓝 |

### LingyunStepItem

```ts
interface LingyunStepItem {
  key: string
  title: string
  description?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
}
```

不传 `status` 时按当前步骤推导：之前为 `finish`，当前为 `process`，之后为 `wait`。

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 点击可点击步骤后回写 key |
| `change` | 切换步骤，参数 `{ key, index, item }` |

## 方法

| 方法 | 说明 |
| --- | --- |
| `select(keyOrIndex)` | 切换到指定步骤 |
| `next()` | 下一步 |
| `prev()` | 上一步 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换默认数字 / 勾选 / 关闭图标，作用域 `{ item, index, status }` |

## 说明

- 横向步骤等宽排列，步骤多时横向滚动；标题 / 说明单行省略。
- 纵向步骤的说明可多行，连接线穿过圆点间隙。
- 禁用步骤不响应点击，也不参与 `next` / `prev`。
- 内容层标准材质，不铺 Liquid Glass。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/steps.vue -->
