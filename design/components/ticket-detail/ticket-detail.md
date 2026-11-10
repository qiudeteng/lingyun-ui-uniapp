# design/components/ticket-detail

对应源码：`src/components/ticket-detail/ticket-detail.vue`

工单详情内容面板，供列表 + 详情 demo 的宽屏右栏与手机独立详情页共用。

- Hero：22/28 标题 + 右侧状态（待处理橙 / 处理中蓝 / 已完成绿），下方 13/18 次级色「客户 · 负责人 · 优先级优先级」
- 工单信息：`lingyun-section` + `lingyun-list`，行依次为客户、负责人、优先级、创建时间、更新时间、服务地址（地址过长时用 `note` 第二行）
- 问题描述：`lingyun-section` 内 15/22 正文段落，左右 16 内距
- 处理记录：有日志时显示 `lingyun-timeline`，最新一条用 `active` 状态高亮
- 组件只接收 `ticket`，不发请求、不处理跳转；宽窄屏的容器与滚动由页面负责
- 视觉遵循 `LISTS.md` / `TIMELINE.md` 与 Liquid Glass 内容层规范（卡片标准材质，不做逐行玻璃）
