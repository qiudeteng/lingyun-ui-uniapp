# lingyun-swiper

图片轮播。基于内置 `swiper`，支持左右滑动、自动轮播、循环、懒加载；默认 4:3，圆点默认关闭，业务可用缩略图作为指示器。

- 演示：`/pages/demo/swiper`
- 设计说明：`design/pages/demo/swiper.md`

> 与 `lingyun-swipe-action` 区别：`lingyun-swipe-action` 是列表行左右滑出操作菜单，不是图片轮播。

## 示例

```vue
<template>
  <lingyun-swiper
    v-model:current="current"
    :images="images"
    :ratio="0.75"
    autoplay
    :interval="5000"
    circular
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const images = [
  'https://example.com/cake-1.jpg',
  'https://example.com/cake-2.jpg',
  'https://example.com/cake-3.jpg',
]
const current = ref(0)
</script>
```

缩略图作为指示器：

```vue
<lingyun-swiper v-model:current="current" :images="images" />

<view class="thumbs">
  <view
    v-for="(image, index) in images"
    :key="index"
    class="thumb"
    :class="{ 'thumb--active': index === current }"
    @click="current = index"
  >
    <image :src="image" mode="aspectFill" />
  </view>
</view>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `images` | 图片地址数组 | `[]` |
| `current` | 当前下标，支持 `v-model:current` | 0 |
| `autoplay` | 自动轮播 | false |
| `interval` | 自动轮播间隔 ms | 4000 |
| `duration` | 切换动画时长 ms | 300 |
| `circular` | 循环轮播 | true |
| `ratio` | 高 / 宽比例；`0.75` 即 4:3 | 0.75 |
| `mode` | 图片裁剪模式 | aspectFill |
| `radius` | 圆角 px；默认 0，由外层裁切 | 0 |
| `indicator` | 是否显示内置圆点 | false |
| `indicatorColor` | 圆点颜色 | rgba(255,255,255,0.4) |
| `indicatorActiveColor` | 选中圆点颜色 | #ffffff |
| `lazyLoad` | 图片懒加载 | true |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:current` | 当前下标变化（滑动 / 自动轮播 / 外部切换） |
| `change` | 切换完成，`{ current, image }` |
| `click` | 点击图片，`{ current, image }` |

## 说明

- 宽度始终 100%，高度按 `ratio` 撑开；图片 `aspectFill` 铺满。
- 商品详情多图使用该组件：大图左右滑动、自动轮播，底部缩略图作为指示器；点缩略图同时写回 `current`。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/swiper.vue -->
