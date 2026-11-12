# 列表与详情 Demo

演示页面：`/pages/demo/list-detail`  
独立详情页：`/pages/demo/list-detail-item`  
设计说明：`design/pages/demo/list-detail.md`

宽屏「列表 + 详情」分栏示例：左侧是固定手机宽度（375px）的独立小页面，搜索、状态筛选、时间切换都在左栏内完成；窄屏只显示左栏，点行进入独立详情页。

## 结构

- 分栏门槛：窗口宽度 ≥ 900 才左右分栏（iPad 竖屏 768 走单栏，横屏 1024 起分栏）。
- 宽屏：隐藏页面壳 / 宿主 toolbar；左右 pane toolbar 用默认 `safe-area` 在内部预留状态栏，左侧再设 `avoid-capsule=false`（胶囊在右侧详情上方，左栏不需要避让），右侧保持默认胶囊避让；左侧 375px、0.5px 分隔线，右侧详情占满剩余宽度；左右各自滚动。两栏各用一个 `lingyun-toolbars`（左对齐标题、不显示副标题）：左侧「工单」+ 搜索按钮 + 状态分段，右侧「工单详情」。
- 左栏独立页面：toolbar 搜索按钮与移动端列表页一致，点击展开输入框、取消清空；状态分段用 toolbar 的 `segments` 行；底部 `lingyun-date-switcher` 浮在列表上方（绝对定位，不占列表高度，列表尾部留出可滚过的缓冲）。
- 滚动效果：左右两栏 toolbar 都是浮动头部，列表 / 详情从下方穿过；头部高度实测后给内容做顶部占位，滚动时整条 toolbar 进入玻璃。
- 纯列表：左栏用 Primary 底色，`lingyun-list plain` 全宽平铺，行直接贴左栏两边，无卡片 / 圆角 / 投影 / 分组头。
- 联动：关键词、状态、日期范围同时过滤；宽屏自动选中第一条结果；条件变化时列表回到顶部；无结果时列表区空态可一键重置。
- 数据：`listDetailDemo.ts` 提供 38 条工单（8 条完整样例 + 30 条批量样本），方便验证长列表滚动与筛选。
- 窄屏：页面 toolbar 就是整页顶部（左侧导航未停靠且非宿主时才带返回；`safe-area` 处理状态栏与胶囊）；点行 `navigateTo` 到 `/pages/demo/list-detail-item?id=<工单号>`，详情是普通页面，带返回。
- 详情：共用 `ticket-detail` 组件，含工单信息、问题描述与处理记录时间线；右栏 toolbar 同样浮动，详情从下方穿过并驱动自身玻璃。

## 使用

左栏的搜索、分段与日期条只作用于列表，不放进全局工具栏——这样右栏详情不会被无关的筛选控件干扰。页面结构用 `lingyun-split-layout`（内部已关掉页面壳 toolbar、量好浮动头部高度），两栏 toolbar 用配套的 `lingyun-split-toolbar` 放进 header 插槽（固定标题样式 / 分段形态 / 顶部补偿）；插槽内容用组件的结构工具类（`lingyun-split-layout-pane` / `-scroll`）。`wide` 与头部实测高度从 `layout-change` 存进页面状态，不要解构作用域插槽参数（小程序点行后会空白，见 [分栏布局](../components/split-layout.md)）：

```vue
<lingyun-split-layout
  title="列表与详情"
  :split-at="900"
  :list-width="375"
  @layout-change="onLayoutChange"
>
  <template #list-header>
    <lingyun-split-toolbar
      title="工单"
      searchable
      search-placeholder="搜索工单 / 客户"
      :segments="statusOptions"
      :segment-value="statusFilter"
      :show-back="!navDocked && !hosted"
      :avoid-capsule="!wide"
      :glass-progress="listGlass"
      v-model:searching="searching"
      v-model:search-value="keyword"
      @search-cancel="onSearchCancel"
      @segment-change="onStatusSegmentChange"
      @back="onPageBack"
    />
  </template>
  <template #list>
    <view class="lingyun-split-layout-pane">
      <scroll-view scroll-y class="lingyun-split-layout-scroll">
        <view class="list-top-spacer" :style="{ height: listTopSpace + 'px' }" />
        <lingyun-list plain>…</lingyun-list>
        <view class="list-bottom-spacer" />
      </scroll-view>
      <lingyun-date-switcher class="list-date" :fixed="!wide" :safe-area="!wide" @change="onDateChange" />
    </view>
  </template>
  <template #detail-header>
    <lingyun-split-toolbar title="工单详情" :glass-progress="detailGlass" />
  </template>
</lingyun-split-layout>
```

组件用法见 [列表](../components/list.md)、[顶栏](../components/toolbars.md)、[分段控件](../components/segmented-control.md)、[日期切换器](../components/date-switcher.md)、[时间线](../components/timeline.md)。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/list-detail.vue -->
<!-- demo-source: src/pages/demo/listDetailDemo.ts -->
<!-- demo-source: src/components/ticket-detail/ticket-detail.vue -->
