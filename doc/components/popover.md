# lingyun-popover

锚在触发器旁边的气泡。触发器放在名为 `trigger` 的插槽里，气泡内容放默认插槽。箭头始终指向触发器中心。

## 示例

触发器上要自己绑 `@click="toggle"`。组件外层不监听点击，小程序里自定义组件的点击也不会冒泡。

```vue
<lingyun-popover v-model:show="open" placement="bottom" :width="240">
  <template #trigger="{ toggle }">
    <lingyun-button text="更多" @click="toggle" />
  </template>
  <view>说明文字</view>
</lingyun-popover>
```

触发点不在组件里时（如表格表头的图标），不放 `trigger` 插槽，改传 `anchor`，自己控制 `show`：

```vue
<lingyun-popover
  v-model:show="open"
  :anchor="iconRect"
  arrow-align="trailing"
  :width="320"
>
  <view>筛选内容</view>
</lingyun-popover>
```

`iconRect` 是视口坐标 `{ left, top, width, height }`，可以用 `uni.createSelectorQuery()` 的 `boundingClientRect` 量出来。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `show / modelValue` | 是否打开 | — |
| `placement` | 相对触发器的方向：`top` / `bottom` / `left` / `right`。这一侧放不下时翻到对侧 | bottom |
| `showArrow` | 显示箭头 | true |
| `width` | 面板宽度（px）。0 跟触发器，并限制在 160–280 | 0 |
| `arrowAlign` | 箭头落在面板哪一侧：`auto` / `middle` 居中，`leading` 靠前（面板向后展开），`trailing` 靠后（面板向前展开）。箭头都指向触发器 | auto |
| `maskClosable` | 点外面关闭 | true |
| `zIndex` | 层级 | 1100 |
| `variant` | `menu`：菜单面板（圆角 32、内边距 10），给 `lingyun-menu` 用 | — |
| `anchor` | 视口坐标矩形 `{ left, top, width, height }`。传了就指向它，不再量 `trigger` 插槽 | null |
| `estimateHeight` | 面板预估高度（px），只用来判断要不要翻到上方。0 用默认值 | 0 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 触发器。作用域参数 `{ show, toggle }` |
| 默认 | 气泡内容 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:show` | 开关 |
| `update:modelValue` | 开关（配合 `v-model`） |
| `close` | 关闭时触发 |
