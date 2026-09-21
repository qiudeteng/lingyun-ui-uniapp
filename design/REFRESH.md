# Refresh 规范（强制 · lingyun-refresh）

下拉刷新：包装 `scroll-view` 的 `refresher-*`（mp 可用），不自研手势。

```vue
<lingyun-refresh v-model:refreshing="busy" @refresh="onRefresh" height="400px">
  <view>…content…</view>
</lingyun-refresh>
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `refreshing` | `false` | 刷新中（受控） |
| `enabled` | `true` | 是否可下拉 |
| `threshold` | `45` | 触发阈值 |
| `height` | `100%` | 滚动区高度 |
| `refresherBackground` | 跟主题 | 下拉区背景；默认 Light `#f2f2f7` / Dark `#000`（微信默认白，暗黑必设） |
| `refresherDefaultStyle` | 跟主题 | `black` / `white` / `none`；暗黑用 `white` 菊花 |

事件：`refresh` —— 业务结束后将 `refreshing` 置 `false`。

> mp-weixin：`scroll-view` 的 `refresher-background` 默认 `#FFF`，不设会在暗黑下露白。
