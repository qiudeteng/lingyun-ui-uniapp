# lingyun-group-header

分组卡片上方的分组标题。统一 Nested / Prominent / Extra Prominent 三种高度、字阶、次级色与右侧操作；`lingyun-list` 的 `header` 也由本组件渲染。

- 设计规范：`design/LISTS.md`
- 演示：`/pages/demo/demo`（页面 / 组件 / 图表分组）、`/pages/demo/lists`

## 示例

```vue
<lingyun-group-header title="组件" />

<lingyun-group-header
  title="Header"
  type="extraProminent"
  action="Action"
  @action="onAction"
/>
```

```ts
function onAction() {
  uni.showToast({ title: 'Action', icon: 'none' })
}
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `title` | 分组标题 | `''` |
| `type` | `nested` / `prominent` / `extraProminent`（也接受 `extra-prominent`） | `nested` |
| `action` | 右侧操作文案；空则不显示 | `''` |
| `inset` | 左右 16px 内距；放进已有 16px 容器时可设 `false` | true |

## 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点击右侧操作 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `title` | 自定义标题内容；默认显示 `title` |
| `action` | 自定义右侧操作；默认显示 `action` 文案 |
| 默认 | 未传 `title` 时作为标题内容 |

## 规格

| 类型 | 高度 | 字号 / 行高 | 字重 | 颜色 |
| --- | --- | --- | --- | --- |
| `nested` | 42px | 13 / 20 | 600 | `label-secondary` |
| `prominent` | 45px | 17 / 24 | 600 | `label` |
| `extraProminent` | 48px | 20 / 26 | 600 | `label` |

- 左右操作与标题同一行，`gap: 8px`；操作文案 17/22、系统主色。
- 组件只负责标题行，不画卡片、不画背景；卡片由 `lingyun-list` / `lingyun-section` 或页面提供。
- 所有尺寸 px，不使用 `rpx`；微信小程序可编译。

## 与 lingyun-list 的关系

`lingyun-list` 的 `header` / `headerType` / `headerAction` / `#header` / `#header-action` 用法保持不变，内部统一渲染为 `lingyun-group-header`。需要单独放在卡片上方时直接用本组件即可，样式与列表头一致。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/lists.vue -->
