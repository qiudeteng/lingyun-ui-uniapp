# design/pages/demo/records

对应源码：`src/pages/demo/records.vue`

完整的「列表 + 筛选 + 搜索 + 时间选择」联动示例：收支记录列表同时受顶部搜索、右上筛选菜单和底部日期切换条影响。

- 顶部 `lingyun-app-page`：`searchable` 打开搜索，`segments` 快速切换全部 / 收入 / 支出，`trailing-buttons` 提供筛选按钮
- 筛选菜单：全宽 `lingyun-menu`，用 `anchor` 锚到筛选按钮；菜单内用 `lingyun-segmented-control` 选择状态、金额、排序，`lingyun-switch` 控制「只看有备注」，底部「重置 / 应用」
- 时间选择：底部 `lingyun-date-switcher`，支持天 / 周 / 月 / 年 / 日期段，`limit="past"` 不进入未来；选中的 `range` 直接参与数据过滤
- 列表：按日期分组（`lingyun-list`），组头显示「今天 / 昨天 / M月D日 周X」，组尾汇总当日收入与支出；行左侧为收支图标，右侧显示金额与状态（已完成 / 待结算 / 已退款）
- 搜索：实时匹配客户 / 供应商、商品、单号、支付方式、备注与状态；进入搜索态先展示搜索历史，关键词为空时隐藏底部日期条，给键盘让位
- 筛选摘要：日期、类型、状态、金额、排序、关键词以胶囊展示，关键词胶囊可点 × 清除；「重置」同时清空搜索、筛选并退出搜索态
- 分页：首次渲染 12 条，「加载更多」每次追加 12 条；搜索、筛选、时间范围变化时回到第一页
- 空态：无匹配结果时展示 `lingyun-empty`，提供「重置搜索与筛选」按钮
- 演示数据：按当前日期向前生成 120 天记录，金额、状态、支付方式固定随机种子，便于稳定复现
- 相关规范：[`SEARCHBARS.md`](../../SEARCHBARS.md)、[`LISTS.md`](../../LISTS.md)、[`DATE_SWITCHERS.md`](../../DATE_SWITCHERS.md)、[`MENUS.md`](../../MENUS.md)、[`TOOLBARS.md`](../../TOOLBARS.md)
