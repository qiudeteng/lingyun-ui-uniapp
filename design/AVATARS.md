# Avatars 规范（强制 · lingyun-avatar）

头像：图片或文字缩写。默认圆形。显示形式、圆角幅度与 [`IMAGES.md`](./IMAGES.md) 同一套，尺寸档仍是头像自己的 sm / md / lg。

## 1. 两套正交概念（勿混）

| 概念 | 属性 | 管什么 |
|------|------|--------|
| **显示形式** | `shape` | 直角方形 / 圆角矩形 / 圆形 |
| **显示尺寸** | `size` | 盒子多大 |
| **圆角幅度** | `radius` | **仅** `shape=rounded` 时角多圆；与 size 无关 |

`md` / `lg` 写在 `size` 上是尺寸档；写在 `radius` 上是圆角档。

尺寸 **1pt = 1px**。禁止 `rpx`。

## 2. `shape`（显示形式）

| 值 | 说明 |
|----|------|
| `square` | 直角方形（`border-radius: 0`） |
| `rounded` | 圆角矩形，幅度由 `radius` 定 |
| `circle`（默认） | 圆形（`50%`） |

兼容：`shape=rect` → `square`。

## 3. `size`（尺寸）

| `size` | px |
|--------|-----|
| `sm` | 28 |
| `md`（默认） | 40 |
| `lg` | 64 |

## 4. `radius`（仅 rounded）

与图片相同。

| `radius` | px |
|----------|-----|
| `none` | 0 |
| `sm` | 4 |
| `md` | 8 |
| `lg` | 12 |
| `xl` | 16 |
| `2xl` | 26（默认） |
| number | 自定义 |

`square` / `circle` 时忽略 `radius`。

## 5. API

```vue
<lingyun-avatar text="Ada Lovelace" size="lg" />
<lingyun-avatar src="/static/avatar.png" />
<lingyun-avatar text="方" size="lg" shape="square" />
<lingyun-avatar text="圆角" size="lg" shape="rounded" radius="lg" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `src` | `''` | 图片地址 |
| `text` | `''` | 无图时缩写（取首字母） |
| `size` | `md` | sm=28 / md=40 / lg=64（px） |
| `shape` | `circle` | `square` \| `rounded` \| `circle` |
| `radius` | `2xl` | 仅 rounded。`2xl` 为 26px |
| `backgroundColor` | 淡蓝 | 底色 |

## 6. 自检

- [ ] 不传 `shape` 时仍是圆形
- [ ] `radius` 只在 `rounded` 时改变圆角
- [ ] 尺寸为 `px`
