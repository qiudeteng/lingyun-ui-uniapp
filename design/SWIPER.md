# Swiper 规范（lingyun-swiper）

> 图片轮播。默认按 **4:3**（`ratio=0.75`）显示，支持左右滑动、自动轮播、循环和懒加载；圆点默认关闭，业务可用缩略图作为指示器（配合 `v-model:current`）。

> 与 [`lingyun-swipe-action`](./SWIPE_ACTIONS.md) 区分：后者是列表行左右滑出操作菜单，不是轮播。

## 1. 尺寸与材质

| 项 | 规格 |
|----|------|
| 宽度 | 100% |
| 比例 | `ratio` = 高 / 宽，默认 **0.75（4:3）**；高度由比例撑开，宽度变化时保持比例 |
| 图片 | `mode="aspectFill"` 铺满，`lazy-load`；不拉伸、不出现白边 |
| 圆角 | `radius`，默认 **0**（由外层 Sheet / 卡片裁切）；需要独立圆角时再传 |
| 背景 | `fill-tertiary`，图片加载前不留白 |

## 2. 交互

- 左右滑动切换；`circular` 默认 true（末张滑到首张）。
- `autoplay` 默认 **false**，`interval` 默认 4000ms；开启后按间隔轮播，切换到下一张触发 `change`。
- 指示器：
  - 内置圆点 `indicator`（默认 false），颜色 `indicatorColor` / `indicatorActiveColor`。
  - 业务缩略图作为指示器：监听 `update:current` / `change` 高亮缩略图；点缩略图写回 `current` 即可切图。
- 点击图片抛 `click`，由业务决定是否预览大图。

## 3. API

```vue
<lingyun-swiper
  v-model:current="current"
  :images="images"
  :ratio="0.75"
  autoplay
  :interval="5000"
  circular
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `images` | 图片地址数组 | `[]` |
| `current` | 当前下标（`v-model:current`） | 0 |
| `autoplay` | 自动轮播 | false |
| `interval` | 自动轮播间隔 ms | 4000 |
| `duration` | 切换动画 ms | 300 |
| `circular` | 循环 | true |
| `ratio` | 高 / 宽 | 0.75 |
| `mode` | 图片裁剪模式 | aspectFill |
| `radius` | 圆角 px | 0 |
| `indicator` | 内置圆点 | false |
| `indicatorColor` / `indicatorActiveColor` | 圆点颜色 / 选中色 | 白 40% / 白 |
| `lazyLoad` | 图片懒加载 | true |

| 事件 | 载荷 |
|------|------|
| `update:current` / `change` | `{ current, image }` |
| `click` | `{ current, image }` |

## 4. 自检

- [ ] 4:3 容器在任何宽度下保持比例，图片 `aspectFill` 无变形。
- [ ] 左右滑动切图；`circular` 末张到首张。
- [ ] 自动轮播时缩略图 / 圆点同步，手动滑动后继续轮播。
- [ ] 圆角为 0 时由外层裁切；传 `radius` 时图片四角随圆角裁切。
- [ ] 与 `lingyun-swipe-action` 概念不混用。
