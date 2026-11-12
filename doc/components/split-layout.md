# lingyun-split-layout

列表 + 详情分栏布局组件。窗口 **≥ `splitAt`（默认 900）** 左右分栏：左栏固定 `listWidth`（默认 375，手机逻辑宽度），右栏占满剩余；**窄屏只渲染左栏**，详情由业务在点行时打开独立页面。

组件内部封好了 [`doc/guide/split-pages.md`](/guide/split-pages.html) 里的坑：app-page（关顶栏、`body-scroll=false`）+ 专属类 flex 行 + 浮动头部 + 0.5px 透明缝隙 + 头部高度测量，业务只写左右两栏自己的内容。

参考 demo：`/pages/demo/split-layout`（组件 Demo，整页即分栏）、`/pages/demo/list-detail`（纯列表 + 工单详情，含搜索 / 状态分段 / 底部日期条）、`/pages/demo/purchase-order-split`（订货单列表 + 详情面板）。

## 示例

```vue
<lingyun-split-layout
  title="订货单"
  :split-at="900"
  :list-width="375"
  @wide-change="onWideChange"
>
  <template #list-header>
    <lingyun-toolbars
      :fixed="false"
      title="订货单"
      :subtitle="`${orders.length} 条结果`"
      :segments="filters"
      segment-control="tabs"
      :glass-progress="listGlass"
    />
  </template>

  <template #list="{ topSpace }">
    <lingyun-purchase-order-list-panel
      class="split-panel"
      :top-space="topSpace"
      @scroll="onListScroll"
      @purchase-order-click="onSelect"
    />
  </template>

  <template #detail-header>
    <lingyun-toolbars :fixed="false" title="订货单详情" :subtitle="current.number" />
  </template>

  <template #detail="{ topSpace }">
    <lingyun-purchase-order-detail-panel
      class="split-panel"
      :order="current"
      :top-space="topSpace"
      @scroll="onDetailScroll"
    />
  </template>
</lingyun-split-layout>
```

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `title` | app-page 标题（分栏时两栏 toolbar 自带标题，通常留空） | '' |
| `splitAt` | 分栏门槛：窗口宽度 ≥ 该值分栏，窄屏只显示左栏 | 900 |
| `listWidth` | 宽屏左栏宽度 px | 375 |
| `showNav` | 透传 `lingyun-app-page`：宽屏是否保留应用导航列 | true |
| `showTabbar` | 透传 `lingyun-app-page`：是否显示底部 Tab | false |

## 插槽

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `list-header` | `{ wide }` | 左栏浮动头部（放非 fixed 的 `lingyun-toolbars`） |
| `list` | `{ wide, topSpace }` | 左栏内容；`topSpace` 是头部实测高度 px |
| `detail-header` | `{ wide, topSpace }` | 右栏浮动头部（仅宽屏渲染） |
| `detail` | `{ wide, topSpace }` | 右栏内容（仅宽屏渲染） |

## 事件 / 方法

| 名称 | 说明 |
| --- | --- |
| `wide-change` | `(wide: boolean)`，挂载时立即抛一次；业务用它决定点行是切换右侧还是打开独立详情页 |
| `ready` | 首次测量完成后抛 |
| `measureHeaders()` | 通过 ref 调用，动态插拔头部内容后手动重测 |

## 注意事项

- 头部插槽里用 **非 fixed** 的 `lingyun-toolbars`；玻璃进度由内容区的滚动事件驱动（`scroll` 事件 → `:glass-progress`），组件本身不监听内层滚动。
- `topSpace` 交给内容做顶部占位（面板的 `top-space` 或自绘 spacer），不要再自己 `createSelectorQuery` 量头部。
- **左栏底色由组件统一提供**：窄屏整页是列表页 → Primary 背景；宽屏左栏是抬升的列表列 → grouped-secondary（浅色白 / 暗黑 `#1c1c1e`），与右侧详情分层。插槽内容**不要再自己设左栏背景**，否则暗黑下会和右侧详情糊成一片。
- **小程序**：插槽内容在小程序里不参与 flex 拉伸，内容容器（`.ly-split-layout__content`）有确定高度并作为定位参照——插槽里的根节点用绝对定位铺满容器（示例里的 `.split-panel`），否则会被内容撑高或塌成 0：
  ```scss
  .split-panel {
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  ```
- 窄屏左栏头部的返回钮由业务判断（导航停靠 / 宿主页时不显示），组件不管导航状态。
- 选中态（`selectedKey`）等视觉语义仍由两栏内容自己决定，参考 [`split-pages.md`](/guide/split-pages.html) §2.6。
