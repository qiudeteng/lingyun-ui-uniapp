## 1.0.2（2026-09-22）
- `lingyun-list` / `lingyun-list-item`：首行分割线改为沿 `$parent` 登记一次，去掉列表级 `provide/inject`，避免长列表整表重绘。样式不变。
- 新增 `lingyun-indexed-list`：索引列表，结构对齐 `uni-indexed-list`，分组卡片加右侧字母条。
- 新增 `lingyun-grid` / `lingyun-grid-item`：宫格，结构对齐 `uni-grid`，卡片走分组材质。
- 新增 `lingyun-goods-nav`：商品底栏，结构对齐 `uni-goods-nav`，左侧图标胶囊走控件玻璃，右侧按钮用系统蓝。
- Mac 宽屏停靠左侧导航时，窗口交通灯画在侧栏顶栏，内容顶栏不再重复。
- `lingyun-app-page`：宽屏停靠左侧导航时，`showBack` 为 `auto` 不再显示返回按钮。
## 1.0.1（2026-09-21）
- 修复 `lingyun-segmented-control` 在中文 key 下的选中胶囊错位：段 id 改用 index 生成，不再依赖 key 文本清洗，避免不同中文 key 生成重复 id 导致 `createSelectorQuery` 命中错误节点。
## 1.0.0（2026-09-21）

- 首次发布：一套对齐 Apple Liquid Glass 的 uni-app 多端组件库，所有 lingyun-* 均位于本包 components/ 下；样式走 lingyun-ui/styles 的 $lingyun-glass-* token，尺寸一律 px；兼容 H5 与微信小程序（mp-weixin 为硬门禁）。
