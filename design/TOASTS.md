# Toasts & HUD 规范（强制 · lingyun-toast / lingyun-hud）

> 轻提示与加载遮罩；面板玻璃一律按 [`UI_SPEC.md`](./UI_SPEC.md) **§6.2-A.1**。

## 权威来源

1. HIG · Feedback / Progress indicators  
2. [`UI_SPEC.md`](./UI_SPEC.md) §6.2-A.1 · [`ACTIVITY_INDICATORS.md`](./ACTIVITY_INDICATORS.md)

## 1. Toast（lingyun-toast）

| 项 | 约定 |
|----|------|
| 形态 | 屏幕中部偏下小胶囊；短文案 |
| 材质 | §6.2-A.1 玻璃；可略透于 Sheet（默认仍 0.72） |
| 类型 | `default` / `success` / `error` / `loading` |
| 时长 | 默认 **2000** ms；`loading` 不自动关 |
| 动效 | 外层 fade/位移；**玻璃节点禁止 opacity 显隐** |

### API

```vue
<lingyun-toast v-model:show="open" text="Saved" type="success" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `show` / `modelValue` | — | 显隐 |
| `text` | `''` | 文案 |
| `type` | `default` | default / success / error / loading |
| `duration` | `2000` | 自动关闭 ms；0 或 loading 不自动关 |
| `zIndex` | `1200` | 层级 |

事件：`update:show`、`update:modelValue`、`close`

工具：全局（**无需 import**）——须 `app.use(lingyunUi)`，宿主在 `lingyun-app-page`

```ts
uni.showLingyunToast('Saved')
uni.showLingyunToast({ text: 'Success', type: 'success' })
uni.showLingyunToast({ text: 'Uploading…', type: 'loading' })
uni.hideLingyunToast()
```

> 实现：`lingyun-ui/utils/feedback.ts`。不 fallback `uni.showToast`。连点会重置进场动画与计时。
## 2. HUD（lingyun-hud）

| 项 | 约定 |
|----|------|
| 形态 | 全屏遮罩 + 中央玻璃块 + Activity + 可选文案 |
| 材质 | §6.2-A.1；遮罩 Light ≈0.2 / Dark ≈0.52 |
| 默认 | 不自动关；点遮罩默认不关 |

### API

```vue
<lingyun-hud v-model:show="busy" text="Loading…" />
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `show` / `modelValue` | — | 显隐 |
| `text` | `''` | 可选文案 |
| `maskClosable` | `false` | 点遮罩关闭 |
| `zIndex` | `1200` | 层级 |

工具：全局 `uni.showLingyunHud` / `uni.hideLingyunHud`

```ts
uni.showLingyunHud('Loading…')
uni.hideLingyunHud()
uni.showLingyunHud({ text: 'Tap mask to close', maskClosable: true })
```

## 3. 自检

- [ ] 玻璃透底；无面板 opacity 显隐
- [ ] Toast 自动消失；HUD loading 可关
- [ ] 浅色 / 暗黑；mp-weixin 可运行
