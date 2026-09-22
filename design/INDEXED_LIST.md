# Indexed List 规范（强制 · lingyun-indexed-list）

> 索引列表。数据与点击对齐 `uni-indexed-list`。  
> 这是 **内容层**：每一字母一组卡片，走 [`LISTS.md`](./LISTS.md) 的 Grouped 材质。右侧字母条是控件，拖动时的提示气泡用控件玻璃。

## 权威来源

1. [`UI_SPEC.md`](./UI_SPEC.md) · [`LISTS.md`](./LISTS.md)
2. 对照源：`src/uni_modules/uni-indexed-list`（只保留结构）

---

## 1. 尺寸（1pt = 1px，禁止 rpx）

| 区域 | px | 说明 |
|------|----|------|
| 分组标题 | 高 42 / 字 13 Semibold | Nested Header，Secondary Label |
| 卡片圆角 | 26 | Grouped Secondary |
| 行高 | 52 | 标题 17 |
| 卡片左右 | 16 / 28 | 右侧让出字母条 |
| 分割线 | 1，左 inset 16 | 真实节点，末行不画 |
| 字母 | 16 × 16 / 字 10 | 当前字母系统蓝底白字 |
| 气泡 | 72 | `lingyun-glass-control`，拖动字母条时出现 |

按下行用 `fills.tertiary`。禁止 `#f7f7f7` 标题条、`#DEDEDE` 表格线和黑色半透明方块。

列表自己滚动（`scroll-view`），字母条不跟着滚。页面需要给组件一个确定高度。

## 2. API

```vue
<lingyun-indexed-list
  :options="[
    { letter: 'A', data: ['阿坝', '安庆'] },
    { letter: 'B', data: ['北京'] },
  ]"
  @click="onClick"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `options` | `{ letter, data }`。`data` 为字符串，或 `{ name, checked }` | [] |
| `showSelect` | 点一项切换勾选，`click` 里带回已选项 | false |

`click`：`{ item: { key, name, itemIndex, checked }, select }`。`select` 仅在 `showSelect` 时有值。
