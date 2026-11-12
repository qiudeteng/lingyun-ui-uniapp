# lingyun-banner

营销横幅：图片 / 卡片、标题 / 说明 / 操作 / 关闭。

规范见 [`design/BANNERS.md`](../../design/BANNERS.md)。

## 示例

```vue
<lingyun-banner
  image="https://images.unsplash.com/..."
  title="秋日限定 · 栗子奶油蛋糕"
  description="当季栗子与轻奶油，门店现做，数量有限。"
  action-text="去看看"
  action-icon="right"
  overlay="bottom"
  :height="180"
  closable
  @action="onAction"
/>
```

无图片卡片：

```vue
<lingyun-banner
  title="新客首单立减 20 元"
  description="注册会员后自动发放优惠券。"
  action-text="领取优惠"
  overlay="none"
  :height="132"
/>
```

自定义内容：

```vue
<lingyun-banner :image="cover" overlay="full" :height="160">
  <lingyun-text type="title3" color="white">周末亲子烘焙课</lingyun-text>
</lingyun-banner>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `image` | 背景图 URL；空为卡片 | `''` |
| `imageMode` | 图片裁剪模式 | aspectFill |
| `title` | 标题 | `''` |
| `description` | 说明 | `''` |
| `actionText` | 操作文案 | `''` |
| `actionIcon` | 操作图标名 | `''` |
| `overlay` | `none` / `top` / `bottom` / `full` | bottom |
| `height` | 高度 px | 160 |
| `radius` | 圆角 px | 20 |
| `backgroundColor` | 无图时的背景色 | `''` |
| `closable` | 显示关闭钮 | false |
| `disabled` | 禁用 | false |

## 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点击横幅 |
| `action` | 点击操作 |
| `close` | 关闭 |

## 方法

| 方法 | 说明 |
| --- | --- |
| `show()` | 关闭后重新显示 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 替换标题 / 说明内容 |
| `action` | 自定义操作按钮 |

## 说明

- 图片横幅默认白色文字；建议使用 `bottom` / `full` 遮罩保证可读。
- 关闭后组件隐藏。
- 不自动轮播；多张轮播请用 `lingyun-swiper`。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/banner.vue -->
