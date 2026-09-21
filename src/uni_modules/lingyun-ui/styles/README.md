# 凌云UI / styles

自研样式基础层（fork 自 `uni-scss`，前缀 `lingyun-*`）。

**控件材质必须符合** [`design/UI_SPEC.md`](../../../../design/UI_SPEC.md)（Liquid Glass）。  
**主题色必须符合** [`design/COLORS.md`](../../../../design/COLORS.md)（Sketch System Colors）。

## 用途

- **设计 Token**：`$lingyun-system-*`、`$lingyun-primary`、`$lingyun-glass-*`、`--lingyun-*`
- **Glass mixin**：`@include lingyun-glass-surface`（Toolbar / Alert / Sheet / section，半透明 + blur）/ `lingyun-glass-control`（按钮等小控件，模糊 6）/ `lingyun-glass-regular`（仅极端实霜）/ `lingyun-glass-clear`
- **外观切换**：默认跟随 `prefers-color-scheme`；手动浅色 / 暗黑用 `html`/`page` 的 `.theme-light` / `.theme-dark` 或 `data-theme`（见 `useThemeStore`）
- **工具类**：间距 / 颜色 / 圆角等
- 新增组件禁止另起色板或另套模糊参数
- **尺寸一律 `px`（1pt = 1px）；禁止 `rpx`**

## 目录

```
styles/
├── index.scss
├── variables.scss       # 组件引用入口
├── theme.scss           # App 主题覆盖（System Colors）
├── tools/functions.scss
└── setting/
    ├── _system-colors.scss  # Sketch System Colors + 语义补齐
    ├── _variables.scss
    ├── _glass.scss
    ├── _color.scss          # 工具类 + CSS 变量 / Dark
    ├── _space.scss
    ├── _radius.scss
    ├── _text.scss
    ├── _border.scss
    └── _styles.scss
```

## 组件内引用

```scss
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-xxx {
  @include lingyun-glass-surface;
  color: $lingyun-primary;
}
```

全局工具类仍由 `App.vue` 引入 `theme.scss` + `index.scss`。

## 注意事项（玻璃 mixin）

| Mixin | 小程序 | 用于 | 勿用于 |
|-------|--------|------|--------|
| `lingyun-glass-surface` | 半透明 regular-bg + 建议全端 blur | section、Toolbar、**Alert / Sheet** | — |
| `lingyun-glass-control` | 半透明 control-bg + 全端 blur **6** | **按钮 / 圆钮等小控件**（Sketch `Regular - Small`） | 浮层面板（模糊档不同） |
| `lingyun-glass-regular` | ≈0.94 实霜 fallback | 仅无遮罩、必须实霜挡字的极端浮层 | Toolbar / Alert / Sheet / section / **按钮**（会「死白」） |
| `lingyun-glass-clear` | fallback | Clear + dimming | 默认控件 |

控件档与面板档的差异（模糊 6 vs 20、0.5px 中性描边、投影近乎为 0、透镜内缘）见 [`design/BUTTONS.md`](../../../../design/BUTTONS.md) §3.1。

插槽布局类（`lingyun-section-row` 等）在 `setting/_section-layout.scss`，**不要**写进组件 scoped/隔离 wxss。

更多复盘：[`design/UI_SPEC.md`](../../../../design/UI_SPEC.md) §6.2。
