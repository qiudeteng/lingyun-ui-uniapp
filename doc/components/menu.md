# lingyun-menu

下拉菜单。`actions` 描述每一行。

## 示例

```vue
<lingyun-menu
  v-model:show="open"
  :actions="[
    { key: 'edit', label: '编辑', icon: 'compose' },
    { key: 'remove', label: '删除', role: 'destructive' },
  ]"
  @select="onSelect"
/>

<!-- 全宽：手机铺满可用宽度，PC / PAD 上限 400，定位仍贴触发按钮 -->
<lingyun-menu v-model:show="fullOpen" full-width :actions="actions" @select="onSelect">
  <template #trigger>
    <lingyun-button text="全宽菜单" @click="fullOpen = !fullOpen" />
  </template>
</lingyun-menu>
```

### 顶部 toolbar 筛选按钮

不要自己往工具栏 `#trailing` 塞按钮。用 `lingyun-app-page` 的 `trailing-buttons`（支持二维分组），监听 `trailing-action`，拿事件里的 `anchor` 打开全宽菜单即可，按钮尺寸与小程序胶囊避让由 app-page 统一处理。完整示例见 demo `pages/demo/filter-menu`。

```vue
<lingyun-app-page
  title="订单"
  :trailing-buttons="[[{ key: 'filter', icon: 'tune', label: '筛选' }]]"
  :trailing-buttons-hidden="filterMenuOpen"
  @trailing-action="onToolbarAction"
>
  <lingyun-menu
    v-model:show="filterOpen"
    full-width
    :anchor="menuAnchor"
    @closed="filterMenuOpen = false"
  >
    <template #default="{ close }">
      <view class="filter-form">
        <!-- 自定义筛选表单 -->
        <lingyun-button text="应用" block @click="apply(close)" />
      </view>
    </template>
  </lingyun-menu>
</lingyun-app-page>
```

```ts
function onToolbarAction(payload: { key?: string; anchor?: object | null }): void {
  if (payload.key !== 'filter') return
  filterMenuOpen.value = true
  menuAnchor.value = payload.anchor || null
  filterOpen.value = true
}
```

菜单打开期间 `trailing-buttons-hidden` 会让右上角按钮组淡出，`closed` 动画结束后再恢复，避免按钮从浮层边缘露出。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `actions` | 行：`{ key, label, subtitle, icon, iconSrc, activeIconSrc, iconClass, selected, submenu, role, disabled }`；`iconSrc` 优先于 `icon` 字形；`iconClass` 用 CSS 绘制图标（内置 `lingyun-menu__symbol-icon--sun` / `--moon`），`selected` 时用 `activeIconSrc` 并显示勾选 | [] |
| `placement` | 弹出方向 | — |
| `maskClosable` | 点外面关闭 | true |
| `fullWidth` | 全宽面板：手机铺满可用宽度，PC / PAD 上限 400；定位仍跟随触发器 | false |
| `anchor` | 视口坐标 `{ top, left, width, height }`；传了就用它定位，不再依赖 `trigger` 插槽 | null |
## 事件

| 事件 | 说明 |
| --- | --- |
| `select` | 选中一行 |

## 自定义内容

不传 `actions`（或传空数组）时，默认插槽接管菜单面板，菜单只负责弹出、定位、遮罩和动效，里面的表单完全由页面自定义。插槽作用域提供 `{ close, show }`，调用 `close()` 收起菜单。`actions` 非空时优先渲染内置菜单行，默认插槽不生效。

```vue
<lingyun-menu v-model:show="filterOpen" full-width>
  <template #trigger="{ toggle }">
    <view class="filter-slot" @click="toggle">
      <lingyun-icon type="tune" :size="22" />
    </view>
  </template>
  <template #default="{ close }">
    <view class="filter-form">
      <lingyun-segmented-control v-model="status" :items="statusItems" size="small" />
      <lingyun-button text="应用" block @click="apply(close)" />
    </view>
  </template>
</lingyun-menu>
```

完整示例见 demo `pages/demo/filter-menu`：顶部筛选按钮打开全宽菜单，内部是状态 / 时间范围 / 排序 / 只看我的 / 重置与应用的自定义表单。

## 动效

打开时从触发按钮中心、原位置长出一颗 48–72px 的玻璃水滴，再拉伸成面板；点击后按钮立即隐藏，面板最终覆盖按钮原来的位置。按钮偏左时菜单左上角对齐按钮，按钮偏右时菜单右上角对齐按钮，面板向空间大的一侧展开，不会水平居中在按钮下面；圆角落定 32 并轻微回弹，约 0.46s。面板内容晚约 0.1s 淡入，H5 同时从模糊清晰化。关闭时内容先淡出，面板反向收缩并淡出；菜单几乎完全消失后按钮再淡入，不做下挂小水滴（异形融合需要画布，Web / 小程序暂不实现）。对齐 iOS 27 菜单，规范见 `design/MENUS.md` §3.1。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/menus.vue -->
