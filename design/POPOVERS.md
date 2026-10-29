# Popovers 规范（强制 · lingyun-popover）

锚定浮层 · 对齐 [Sketch Popovers](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/FE2B4D2A-D8C4-4E0A-93EB-CA4A70F48792/canvas#Inspect)。面板玻璃 **§6.2-A.1**（勿对玻璃节点写 opacity）。

箭头与面板同色，始终指向触发器中心；`arrowAlign` 决定箭头落在面板哪一侧（面板随之偏移）：`auto` / `middle` 面板居中，`leading` 面板向后展开，`trailing` 面板向前展开。贴视口边时面板夹在边距内，箭头仍指向锚点。

箭头是面板的延伸，两者看起来是一整块：

- **底色**：箭头填充与面板同一底色（浅色 `rgba(255,255,255,0.72)`，暗黑跟面板的 overlay 底色）。箭头**不加** `backdrop-filter`：它只能模糊自己 22×14 的小框，在与面板交界处会出一条暗线。
- **描边**：两条斜边各画 1px，颜色同面板 hairline；面板描边在箭头处挖空，只挖到斜边内侧，两条线接成一圈。
- **位置**：箭头尖离面板边缘至少「圆角 + 半个箭头宽」（默认面板 16 + 11 = 27px，`menu` 面板 32 + 11 = 43px），箭头底边不压到圆角弧线上。

```vue
<lingyun-popover v-model:show="open" placement="bottom" :width="240">
  <template #trigger="{ toggle }">
    <lingyun-button text="Info" @click="toggle" />
  </template>
  <text>短说明文案</text>
</lingyun-popover>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `show` / `modelValue` | — | 显隐 |
| `placement` | `bottom` | top / bottom / left / right（空间不够翻到对侧） |
| `width` | `0` | 面板宽（px）。0 跟触发器，并限制在 160–280 |
| `showArrow` | `true` | 是否画箭头 |
| `arrowAlign` | `auto` | auto / leading / middle / trailing |
| `maskClosable` | `true` | 点遮罩关闭 |
| `zIndex` | `1100` | 层级 |
| `variant` | `''` | `menu`：Sketch Menus 面板（圆角 32、内边距 10），给 `lingyun-menu` 用 |
| `anchor` | `null` | 视口坐标矩形 `{ left, top, width, height }`。传了就指向它，不测 `trigger` 插槽；触发点不在本组件里时用（如表格表头的筛选图标） |
| `estimateHeight` | `0` | 面板预估高度（px），用来判断下方放不下时翻到上方。0 用默认值 |

事件：`update:show` / `update:modelValue`（开关）、`close`（关闭时）

插槽 `#trigger` 暴露 `{ show, toggle }`（小程序自定义组件点击不冒泡，须在触发器上 `@click="toggle"`）。

> 动效：普通浮层对齐 Alert——lift `scale(1.16→1)` 弹性曲线，遮罩淡入。`variant="menu"` 走菜单材质化：点击后按钮立即隐藏，从按钮中心、原位置长出一颗 48–72px 的玻璃水滴；面板按按钮位置自动贴左上角或右上角（不水平居中），覆盖按钮位置并落成 32 圆角，内容晚一步淡入 / 去模糊。关闭时面板反向收缩、淡出，菜单几乎完全消失后按钮再淡入；不做下挂小水滴（详见 [`MENUS.md`](./MENUS.md) §3.1）。mp 用 `root-portal`，H5 用 `Teleport` 到 `body`。

## 自检

- [ ] 有箭头，且指向触发器（auto 时不贴死面板中心）
- [ ] 玻璃透底；主题 class 挂在浮层根
- [ ] 箭头与面板同色，浅色 / 暗黑交界处都没有暗线、亮线；斜边描边与面板描边连成一圈，不断开
- [ ] trailing / leading 时箭头不压到面板圆角上
- [ ] demo 覆盖四向、leading / middle / trailing、以及 168 / 240 / 320 三档宽度
- [ ] `variant="menu"` 从按钮中心长成水滴、覆盖按钮并收成 32 圆角，内容晚一步淡入
- [ ] mp-weixin 可锚定打开 / 关闭
