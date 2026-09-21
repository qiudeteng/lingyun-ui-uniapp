# Activity Views 规范（强制 · lingyun-activity-view）

> iOS 分享面板。内容层用分组列表，面板本身是玻璃浮层。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · Activity Views**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/p/F67968EA-A7A0-4A17-A510-D770D8F5C5FD/canvas
2. [HIG · Activity views](https://developer.apple.com/design/human-interface-guidelines/activity-views)

半高卡片画板取样约 **402 × 500**。内容符号 `Activity View/Light/Contents` 的结构：顶栏、联系人横滑、应用横滑、圆形快捷动作、分组动作列表、底部 Edit Actions。

## 1. 形态

| 档位 | 窄屏 | 宽屏（≥700） |
|------|------|----------------|
| `half` | 与 Sheet Medium 相同：四周内缩 **8**、四角 **34**、玻璃 `#fff` @ **0.72** + 全端 blur、高 **500** | 宽 **402** 居中，四角 **32**，留白 **32**，不透明分组底 |
| `full` | 与 Sheet Large 相同：贴边贴底、顶角 **38**、不透明分组底。顶缘在页面顶栏之下（状态栏 + 栏身），避开微信胶囊 | 同上，高度随窗口 |

半高面板材质对齐 `lingyun-sheets`（§6.2-A.1）：`lingyun-glass-surface` 之后必须写死 `rgba(255,255,255,0.72)` 和全端 `backdrop-filter`。只留 mixin 时，小程序会丢掉模糊，底停在 0.42，看起来过透。暗黑用 `$lingyun-glass-overlay-bg-dark`。全高和宽屏与 Sheet Large / iPad 一样改不透明分组底。位移用 `transform`，不对玻璃节点写 `opacity`。

**标题行固定**：缩略图、标题、关闭钮在滚动区外面；Collaborate、联系人及以下在滚动区内。挂载：H5 `Teleport`→`body`，mp-weixin `root-portal`，根自挂 `theme-*`。

## 2. 结构

| 区块 | 尺寸 | 说明 |
|------|------|------|
| 关闭 | **46** 玻璃圆钮 | `@include lingyun-glass-control`，图标 16，Label 色。按下只换底色，不对玻璃节点写 `opacity` |
| 缩略图 | 默认 40，圆角约 22% | `thumbnail` |
| 弹出按钮 | 高 36 胶囊 | `menuText` / `menuIcon`（Collaborate） |
| 权限行 | 13 / Secondary | `permissionText`，右侧 disclosure |
| 联系人 | 头像 64 + 20 应用角标 | `contacts` |
| 应用 | 60 图标，圆角 14 | `apps`，图标用 `lingyun-icon` |
| 快捷动作 | 60 圆，0.5 描边 | `shortcuts` |
| 动作组 | 圆角 **26**，行高 44，图标在左 | `groups`，分割线 inset 48 |
| Edit Actions | 高 44 胶囊 | `editText`，点选不关闭 |

应用图标没有系统彩色资源，用 `lingyun-icon` + `color` 近似，不引入第二套图标。

内容左右内边距统一 **16**（标题、Collaborate、权限行、横滑行、动作组）。权限行再内缩 **14**，文案对齐胶囊内图标，右侧箭头对齐胶囊内箭头。

## 3. API

```vue
<lingyun-activity-view
  v-model:show="open"
  detent="half"
  title="Title"
  menu-text="Collaborate"
  menu-icon="staff"
  permission-text="Everyone can make changes"
  :contacts="contacts"
  :apps="apps"
  :shortcuts="shortcuts"
  :groups="groups"
  @select="onSelect"
/>
```

`select` 载荷：`{ kind, item, index, groupIndex }`。`kind` 为 `contact` / `app` / `shortcut` / `action` / `edit`。`edit`、`menu`、`permission` 不自动关闭。

## 4. 自检

- [ ] 半高约 500、顶角 38、底边贴屏；宽屏收成 402 居中卡片
- [ ] 联系人 / 应用 / 快捷动作可横滑；分组圆角 26
- [ ] 玻璃面板未写 `opacity`；H5 Teleport、mp `root-portal`、自挂 `theme-*`
- [ ] 微信小程序可编译
