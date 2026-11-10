# 列表与详情 Demo

演示页面：`/pages/demo/list-detail`  
独立详情页：`/pages/demo/list-detail-item`  
设计说明：`design/pages/demo/list-detail.md`

宽屏「列表 + 详情」分栏示例：左侧是固定手机宽度（375px）的独立小页面，搜索、状态筛选、时间切换都在左栏内完成；窄屏只显示左栏，点行进入独立详情页。

## 结构

- 宽屏（窗口 ≥ 690）：隐藏页面壳 toolbar，左侧 375px、0.5px 分隔线，右侧详情占满剩余宽度；左右各自滚动。两栏各用一个 `lingyun-toolbars`（左对齐两行标题）：左侧「工单 / N 条结果」+ 搜索按钮，右侧「工单详情 / 当前单号」，相当于两张独立页面拼在一起。
- 左栏独立页面：toolbar 搜索按钮与移动端列表页一致，点击展开输入框、取消清空；状态分段用 toolbar 的 `segments` 行；底部 `lingyun-date-switcher` 浮在列表上方（绝对定位，不占列表高度，列表尾部留出可滚过的缓冲）。
- 滚动效果：左右两栏 toolbar 都是浮动头部，列表 / 详情从下方穿过；头部高度实测后给内容做顶部占位，滚动时整条 toolbar 进入玻璃。
- 纯列表：左栏用 Primary 底色，`lingyun-list plain` 全宽平铺，行直接贴左栏两边，无卡片 / 圆角 / 投影 / 分组头。
- 联动：关键词、状态、日期范围同时过滤；宽屏自动选中第一条结果；条件变化时列表回到顶部；无结果时列表区空态可一键重置。
- 数据：`listDetailDemo.ts` 提供 38 条工单（8 条完整样例 + 30 条批量样本），方便验证长列表滚动与筛选。
- 窄屏：保留页面 toolbar（返回 / 标题 / 主题）并开启 `searchable`，左栏就是整页；点行 `navigateTo` 到 `/pages/demo/list-detail-item?id=<工单号>`，详情是普通页面，带返回。
- 详情：共用 `ticket-detail` 组件，含工单信息、问题描述与处理记录时间线；右栏 toolbar 同样浮动，详情从下方穿过并驱动自身玻璃。

## 使用

左栏的搜索、分段与日期条只作用于列表，不放进全局工具栏——这样右栏详情不会被无关的筛选控件干扰：

```vue
<view class="list-pane">
  <lingyun-toolbars
    class="pane-header"
    title-style="title2LineLeft"
    title="工单"
    :subtitle="`${filtered.length} 条结果`"
    searchable
    :segments="statusOptions"
    :segment-value="statusFilter"
    segment-control="segmented"
    :fixed="false"
    :safe-area="false"
    :show-back="false"
    v-model:searching="searching"
    v-model:search-value="keyword"
    @segment-change="onStatusSegmentChange"
  />
  <scroll-view scroll-y class="list-scroll">
    <view class="list-top-spacer" :style="{ height: headerHeight + 'px' }" />
    <lingyun-list plain>…</lingyun-list>
    <view class="list-bottom-spacer" />
  </scroll-view>
  <lingyun-date-switcher class="list-date" :fixed="false" :safe-area="false" @change="onDateChange" />
</view>
```

组件用法见 [列表](../components/list.md)、[顶栏](../components/toolbars.md)、[分段控件](../components/segmented-control.md)、[日期切换器](../components/date-switcher.md)、[时间线](../components/timeline.md)。
