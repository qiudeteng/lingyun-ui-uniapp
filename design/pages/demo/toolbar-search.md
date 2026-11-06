# design/pages/demo/toolbar-search

对应源码：`src/pages/demo/toolbar-search.vue`

演示 `lingyun-app-page` 的顶部搜索模式。

- `searchable` 打开后，右侧多一个**独立分组**的搜索按钮（与普通 trailing 按钮组分开）
- 点击搜索按钮：左侧返回 / 标题、右侧普通按钮组全部隐藏，顶部换成搜索输入框
- 原搜索按钮变成取消按钮，点击发 `search-cancel`
- 输入框 `confirm-type="search"`，确认时发 `search`，带当前关键词
- 页面通过 `v-model:searching` / `v-model:search-value` 绑定状态，也可用 `ref.openSearch()` / `ref.closeSearch()` 控制
- 搜索模式打开时页面只渲染搜索专用内容和结果；普通模式显示全部订单
- 相关规范：[`TOOLBARS.md`](../../../TOOLBARS.md)、[`SEARCHBARS.md`](../../../SEARCHBARS.md)
