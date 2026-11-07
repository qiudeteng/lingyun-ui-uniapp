# Menus 规范（强制 · lingyun-menu / lingyun-context-menu）

> 对齐 [Sketch Menus](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/F584C9FA-4B83-4874-9908-0520E29C41F1/canvas#Inspect) 的 **iPhone** 菜单。面板玻璃 **§6.2-A.1**。Context = 长按打开（无 Peek / 预览）。

## 1. 面板

`Menus/Light/iPhone`：宽 **250**，内边距 **10**，圆角 **32**。无箭头。遮罩点按关闭。

全宽模式：`full-width` 时面板宽取 `min(400, 视口宽 - 24)`——手机上铺满可用宽度（左右各留 12 安全边距），PC / PAD 上限 **400**（约等于主流手机宽度）。定位规则不变，仍按触发按钮贴左上角 / 右上角，上下空间不足时翻转，不水平居中。

## 2. 行

| 行 | 尺寸 |
|----|------|
| 标题项 | 高 42；标题 17 / 行高 20 / Regular；主标签色 |
| 标题 + 副标题 | 高 60；副标题 13 / 行高 16 / Secondary |
| 图标 | 20，占位宽 24，与文字间距 6；可用 `icon` 字形、`iconSrc` 图片或 `iconClass` CSS 图标（如内置 `lingyun-menu__symbol-icon--sun` / `--moon`） |
| 按下 | Fill Secondary，圆角 22 |
| Destructive | 文字与图标 System Red `#FF383C` |
| Disabled | Tertiary，不可点 |
| 选中 | 右侧 `checkmarkempty` |
| 子菜单 | 右侧 `right` 12 |
| 分隔 | 高 21，顶 8，1px `--lingyun-separator` |
| 分组标题 | 高 27；13 / Medium / Secondary |
| 顶部快捷操作 | 高 57，图标 22，标签 11 Medium，间距 5 |

## 3. Menu（lingyun-menu）

```vue
<lingyun-menu v-model:show="open" :actions="actions" @select="onSelect">
  <template #trigger>
    <lingyun-button text="More" />
  </template>
</lingyun-menu>
```

`actions[]`：

- 普通项 `{ key, label, subtitle?, icon?, iconSrc?, activeIconSrc?, iconClass?, role?: 'destructive', disabled?, selected?, submenu? }`
- 分隔 `{ type: 'separator' }`
- 分组标题 `{ type: 'title', label }`
- 顶部快捷操作 `{ type: 'controls', items: [...] }`（项字段同普通项）

事件：`select` · `close`

`lingyun-menu` 作为左侧栏二级菜单时：

- 点击父项展开，再次点击或点击外部关闭；左侧栏二级菜单传 `mask-transparent`，保留透明遮罩用于点击外部关闭，页面不压暗；
- 传 `trigger-block` 让触发器撑满父级，导航项保持整格宽度与居中。
- 传 `placement="right"`，面板贴着父项右侧弹出，不加遮罩、不改内容区。
- 传 `full-width` 切换为全宽面板；手机铺满可用宽度，PC / PAD 上限 400，定位与动效仍按触发按钮计算。

## 3.1 打开 / 关闭动效（强制）

对齐 iOS 27 的菜单材质化：菜单不是原地缩放，而是从触发点长出来。

- **打开**：从触发按钮**中心、原位置**长出一颗玻璃水滴（直径约 **48–72px**，按按钮短边取）。触发按钮在打开期间隐藏，菜单最终面板覆盖按钮原来的位置；关闭动画结束后按钮再出现。面板从按钮位置拉伸出来，圆角起始帧用椭圆半径补偿非等比缩放，视觉仍是正圆；落定时圆角到 **32**，`transform` 用轻微回弹曲线（过冲约 **3%**），约 **0.46s**。
- **位置**：菜单按按钮所在侧的可用空间自动贴角——按钮偏左时菜单**左上角**对齐按钮左上角，按钮偏右时菜单**右上角**对齐按钮右上角；面板向空间大的一侧展开，**不要**把面板水平居中在按钮下面。按钮靠屏幕边缘时再按 12px 视口安全边距收住。
- **顶部 / 翻转**：面板向上弹出时同理贴底角，按钮落在菜单的左下角或右下角。
- **内容**：比面板晚约 **0.1s** 淡入；H5 同时从 `blur(10px)` 清晰化，小程序只做淡入（WXSS 不支持 `filter`）。
- **关闭**：内容先淡出，面板沿打开路径反向收缩并淡出（约 **0.2s** 收缩 + **0.08s** 淡出）；菜单几乎完全消失后按钮再淡入（约 **0.26s** 开始，**0.08s** 结束）。不做下挂小水滴或异形融合——Web / 小程序里要让按钮边框与水滴融成一体只能用画布绘制，当前按“菜单先消失、按钮后出现”处理。toolbar / Duo 的整个右侧操作组在打开到退场结束期间保持隐藏，`closed` 后再恢复，避免玻璃胶囊提前露出。
- 菜单无箭头；`lingyun-menu` / `lingyun-toolbars #trailing-menu` 共用 `lingyun-popover variant="menu"` 的实现。
- ❌ 不要再用普通浮层的 `scale(1.16→1)` Alert 缩放入场。

## 3.2 自定义内容（默认插槽）

菜单只负责弹出、定位、遮罩与动效时，不传 `actions`（为空数组），把表单放进默认插槽即可；插槽作用域提供 `{ close, show }`，点「应用」等按钮时调用 `close()` 收起。`actions` 非空时优先渲染内置菜单行，默认插槽不生效。

```vue
<lingyun-menu v-model:show="open" full-width>
  <template #trigger="{ toggle }">
    <view @click="toggle">筛选</view>
  </template>
  <template #default="{ close }">
    <view class="filter-form">
      <!-- 自定义表单：segmented / switch / button 等 -->
      <lingyun-button text="应用" block @click="apply(close)" />
    </view>
  </template>
</lingyun-menu>
```

插槽内容由页面自行排版；面板仍保留菜单的 32 圆角、10 内边距和 70vh 最大高度。

## 4. Context Menu（lingyun-context-menu）

长按弹出同一套行。面板同样 250 / 圆角 32 / 内边距 10。

```vue
<lingyun-context-menu :actions="actions" @select="onSelect">
  <view>Long-press me</view>
</lingyun-context-menu>
```

## 5. 自检

- [ ] 面板宽 250、圆角 32、玻璃透底、无箭头；`full-width` 时手机铺满可用宽度、PC / PAD 上限 400，定位仍贴触发按钮
- [ ] 打开时触发按钮隐藏，水滴从按钮中心长出并覆盖按钮位置；关闭时菜单先收缩淡出，几乎消失后按钮再出现
- [ ] 圆角落定 32，轻微回弹；内容晚一步淡入；H5 有 blur → 清晰，小程序只淡入
- [ ] 标题 17、副标题 13、destructive 为 System Red
- [ ] 分隔、分组标题、选中勾、子菜单箭头、顶部快捷操作
- [ ] 不传 `actions` 时默认插槽正常渲染，插槽内调用 `close()` 可收起
- [ ] mp-weixin 可点选 / 长按
