# design/pages/demo/date-switcher

对应源码：`src/pages/demo/date-switcher.vue`

展示 `lingyun-date-switcher` 底部日期切换条，页面隐藏底部 Tab 栏，固定条替代它。

- 模式：天 / 周 / 月 / 年 / 自定义日期段；由底部条右侧的圆形模式钮切换（按钮显示当前模式：天 / 周 / 月 / 年 / 自）
- 页面开关控制 `showModeSwitch`，并按模式勾选可用项（关闭全部时模式钮隐藏），菜单只列出勾选的模式
- 左右按钮切换上一段 / 下一段；中间日期严格居中
- 周固定周一到周日；月按自然月；年按自然年；日期段按当前长度整体平移
- 点击中间区域打开内置日期选择器；选择后按当前模式归一化
- 模式切换、前后切换、选择器确认都会触发 `change`，页面「选择值」展示返回 JSON 的 `value`，下方展示完整 JSON
- 范围限制：顶部可选择今天之前 / 今天之后 / 本周 / 本月等预设，越界时前后按钮禁用
- 规范：[`DATE_SWITCHERS.md`](../../../DATE_SWITCHERS.md)、[`TABBARS.md`](../../../TABBARS.md)
