# Menus 规范（强制 · lingyun-menu / lingyun-context-menu）

> 对齐 [Sketch Menus](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/F584C9FA-4B83-4874-9908-0520E29C41F1/canvas#Inspect) 的 **iPhone** 菜单。面板玻璃 **§6.2-A.1**。Context = 长按打开（无 Peek / 预览）。

## 1. 面板

`Menus/Light/iPhone`：宽 **250**，内边距 **10**，圆角 **32**。无箭头。遮罩点按关闭。

## 2. 行

| 行 | 尺寸 |
|----|------|
| 标题项 | 高 42；标题 17 / 行高 20 / Regular；主标签色 |
| 标题 + 副标题 | 高 60；副标题 13 / 行高 16 / Secondary |
| 图标 | 20，占位宽 24，与文字间距 6 |
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

- 普通项 `{ key, label, subtitle?, icon?, role?: 'destructive', disabled?, selected?, submenu? }`
- 分隔 `{ type: 'separator' }`
- 分组标题 `{ type: 'title', label }`
- 顶部快捷操作 `{ type: 'controls', items: [...] }`（项字段同普通项）

事件：`select` · `close`

## 4. Context Menu（lingyun-context-menu）

长按弹出同一套行。面板同样 250 / 圆角 32 / 内边距 10。

```vue
<lingyun-context-menu :actions="actions" @select="onSelect">
  <view>Long-press me</view>
</lingyun-context-menu>
```

## 5. 自检

- [ ] 面板宽 250、圆角 32、玻璃透底、无箭头
- [ ] 标题 17、副标题 13、destructive 为 System Red
- [ ] 分隔、分组标题、选中勾、子菜单箭头、顶部快捷操作
- [ ] mp-weixin 可点选 / 长按
