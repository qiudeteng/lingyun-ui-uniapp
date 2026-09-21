# Popovers 规范（强制 · lingyun-popover）

锚定浮层 · 对齐 [Sketch Popovers](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/FE2B4D2A-D8C4-4E0A-93EB-CA4A70F48792/canvas#Inspect)。面板玻璃 **§6.2-A.1**（勿对玻璃节点写 opacity）。

箭头与面板同色，指向触发器；`arrowAlign=auto` 时跟锚点中心，也可固定 leading / middle / trailing。暗黑箭头填充用 `rgba(142,142,147,0.98)`，外圈 `rgba(255,255,255,0.92)` 描边约 3px，避免三角贴在深色遮罩上消失。

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

事件：`close`

插槽 `#trigger` 暴露 `{ show, toggle }`（小程序自定义组件点击不冒泡，须在触发器上 `@click="toggle"`）。

> 动效对齐 Alert：lift `scale(1.16→1)` 弹性曲线；遮罩淡入。mp 用 `root-portal`，H5 用 `Teleport` 到 `body`。

## 自检

- [ ] 有箭头，且指向触发器（auto 时不贴死面板中心）
- [ ] 玻璃透底；主题 class 挂在浮层根；暗黑箭头有浅色描边，不与遮罩融在一起
- [ ] demo 覆盖四向、leading / middle / trailing、以及 168 / 240 / 320 三档宽度
- [ ] mp-weixin 可锚定打开 / 关闭
