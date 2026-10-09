## 1.0.5（2026-10-09）
- 404 空态「返回首页」在微信里水平居中：行内操作区交叉轴居中，按钮开启 `virtualHost`，避免胶囊贴在组件宿主左侧。
- `lingyun-picker` 脚本改为 TypeScript。日期解析在 `picker-date.ts`，农历文案在 `lunar.ts`。公历农历换算表仍用内置 `calendar.js`。
- `lingyun-menu` 脚本改为 TypeScript。行数据归一化仍从 `normalizeMenuActions` 导出。
- 微信控制台：列表行去掉 `uni-switch` 标签选择器；页面玻璃进度改用小程序组件实例创建交叉观察器，并打开 `nativeMode`。
- 微信 PC 客户端顶栏不再按胶囊抬高。状态栏为 0，栏身与同宽度 H5 一致（宽屏 54，窄屏 60）。
- 宽屏左栏已登录时，顶部为圆角矩形头像、标题，以及当前门店胶囊。切换写入 `useUserStore().storeId`，读这个字段的页面会一起更新。
- 宽屏里点到未注册页面时，404 在顶栏以下的内容区垂直居中。
## 1.0.4（2026-10-08）
- 微信宽屏左侧菜单切到未注册页面时留在当前页，只换右侧内容，侧栏和顶栏不再随跳转拆掉。
- 宽屏左栏菜单项支持 `iconSrc`。后台菜单图标是图片地址时画 22px 图片，字形图标仍走 `lingyun-icon`。
- 演示页 `/pages/demo/screen`：实时显示 `lingyun` 的窗口档、系统、硬件和折叠状态。
- 宽屏左栏顶部支持头像、名称、副标题。页面插槽为 `nav-avatar` / `nav-name` / `nav-subtitle`；全局资料用 `setLingyunPageNavProfile`。
- 默认名称「凌云UI」，副标题「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。名称与内容顶栏对齐，副标题挂在名称下，不撑高栏身。传入自定义名称且不传副标题时，不显示这句介绍。
- 插槽盖过对应的默认图片或文字。H5 送进挂在 body 上的侧栏，微信嵌在当前页。
## 1.0.3（2026-10-08）
- 全局 `lingyun`：当前窗口档、操作系统、是否折叠屏、折叠状态、硬件类型。模板里可写 `lingyun.os == 'ios'`。
- `lingyun-picker-cal-day`：挪到独立目录，微信 easycom 能解析日期格。
- `lingyun-icon`：字形改为直接输出字库字符，并开启 `virtualHost`，圆钮内图标可居中；脚本改为 TypeScript。
- `lingyun-toolbars`：返回、关闭、分享改用 `lingyun-icon`。圆钮仍为 44px，返回图标 28，关闭与分享 26。
- 宽屏左侧菜单支持 `setLingyunPageNavSections` 写入后台数据；不传页面 prop 时，侧栏与首页目录共用这份列表。
## 1.0.2（2026-09-22）
- `lingyun-stepper`：新增 `showValue`，为真时在 − / + 之间展示可编辑的当前值。
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
