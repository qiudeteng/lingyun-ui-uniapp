# Image 规范（强制 · lingyun-image）

> 图片包装器：懒加载、失败占位、显示形式、尺寸、拉伸模式。内容层，非玻璃。

## 权威来源

1. uni-app [`image`](https://uniapp.dcloud.net.cn/component/image.html)（`mode` / `lazy-load`）
2. [`COLORS.md`](./COLORS.md) · Fill Tertiary（占位底）
3. 与 [`AVATARS.md`](./AVATARS.md) 分工：头像用 `lingyun-avatar`；通用图用本组件

## 1. 两套正交概念（勿混）

| 概念 | 属性 | 管什么 |
|------|------|--------|
| **显示形式** | `shape` | 直角方形 / 圆角矩形 / 圆形 |
| **显示尺寸** | `size` 或 `width`/`height` | 盒子多大 |
| **圆角幅度** | `radius` | **仅** `shape=rounded` 时角多圆；与 size 无关 |
| **拉伸** | `mode` | 图在盒子里怎么铺 |
| **加载中** | 默认 UI | 骨架式**从左到右扫光**（内联，不引用组件；`#placeholder` 可覆盖） |

`md` / `xl` 若写在 `size` 上 = 尺寸档；写在 `radius` 上 = 圆角档。Demo 须分开演示。

尺寸 **1pt = 1px**。禁止 `rpx`。

## 2. `shape`（显示形式）

| 值 | 说明 |
|----|------|
| `square` | 直角方形（`border-radius: 0`） |
| `rounded`（默认） | 圆角矩形，幅度由 `radius` 定 |
| `circle` | 圆形（`50%`）；未设 height 时高=宽 |

兼容：`circle` 布尔、`shape=rect` → `square`。

## 3. `size` / `width` / `height`（尺寸）

| `size` | px（正方形盒子） |
|--------|------------------|
| `xs` | 32 |
| `sm` | 48 |
| `md` | 72 |
| `lg` | 96 |
| `xl` | 120 |
| number | 自定义边长 |

- 传了 `width` / `height` 时优先用它们（可非正方形）。
- 未传 `size` 且未传宽高：宽 `100%`，高按 mode（`widthFix` 为 `auto`，否则 `100%`）。

## 4. `radius`（仅 rounded）

| `radius` | px |
|----------|-----|
| `none` | 0 |
| `sm` | 4 |
| `md` | 8（默认） |
| `lg` | 12 |
| `xl` | 16 |
| number | 自定义 |

`square` / `circle` 时忽略 `radius`。

## 5. `mode`（拉伸）

| 值 / 别名 | 行为 |
|-----------|------|
| `aspectFill` / `cover` | 保持比例裁剪填满（默认） |
| `aspectFit` / `contain` | 保持比例完整显示 |
| `scaleToFill` / `fill` | 拉伸铺满 |
| `widthFix` / `heightFix` | 定宽或定高自适应 |
| `top` / `center` / … | 不缩放对齐 |

## 6. API

```vue
<!-- 形式：同尺寸三种外形 -->
<lingyun-image src="…" shape="square" size="md" />
<lingyun-image src="…" shape="rounded" size="md" radius="lg" />
<lingyun-image src="…" shape="circle" size="md" />

<!-- 尺寸：同外形不同大小 -->
<lingyun-image src="…" shape="circle" size="sm" />
<lingyun-image src="…" shape="circle" size="xl" />

<!-- 自由宽高 -->
<lingyun-image src="…" width="100%" :height="180" shape="rounded" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `src` | `''` | 图片地址 |
| `shape` | `rounded` | `square` \| `rounded` \| `circle` |
| `size` | — | 尺寸档 / 数字；与 width·height 二选一优先后两者 |
| `width` / `height` | — | 显式宽高 |
| `radius` | `md` | 仅 rounded |
| `mode` | `aspectFill` | 拉伸；可用别名 |
| `lazy` / `lazyLoad` | `true` | 懒加载 |
| `showLoading` | `true` | 加载中显示扫光占位 |
| `errorSrc` | `''` | 失败替换图 |
| `preview` | `false` | 点击预览 |

插槽：`error`、`placeholder`、默认覆盖层。事件：`load`、`error`、`click`。

## 7. Demo 用图

[Lorem Picsum](https://picsum.photos) `seed` URL；微信需配置 `picsum.photos` 合法域名。

## 8. 自检

- [ ] shape / size / radius 语义不混用；demo 分区演示
- [ ] 懒加载、失败占位、mode 在 mp-weixin 可用
- [ ] 尺寸为 `px`；暗黑占位底 Fill Tertiary
