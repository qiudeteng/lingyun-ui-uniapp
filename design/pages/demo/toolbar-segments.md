# design/pages/demo/toolbar-segments

对应源码：`src/pages/demo/toolbar-segments.vue`

演示 `lingyun-app-page` 的顶栏下方分段控制。

- `segments` 数据配置分段项，显示在顶部 toolbar 下方
- `v-model:segment-value` 双向绑定当前值
- 切换时同时发 `segment-click` 和 `segment-change`，参数 `{ value, item }`
- 分段行高度 40（Small 32 + 下边距 8），页面顶部留白自动增加
- 相关规范：[`TOOLBARS.md`](../../../TOOLBARS.md)、[`SEGMENTED_CONTROLS.md`](../../../SEGMENTED_CONTROLS.md)
