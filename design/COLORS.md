# Colors 规范（强制 · System Colors）

> 凌云UI 主题色 **必须** 对齐苹果官方 **System Colors**。  
> 本文是 `design/UI_SPEC.md` 的色彩专章。

## 权威来源

1. **Sketch · Apple iOS 27 UI Kit · System Colors**  
   https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/color-variables?g=System%2520Colors
2. **HIG · Color**  
   https://developer.apple.com/design/human-interface-guidelines/color
3. 实现：`src/uni_modules/lingyun-ui/styles/setting/_system-colors.scss`  
   主题入口：`styles/theme.scss`

---

## 1. System Accents（Sketch 已核对）

| Name | Light | Dark |
|------|-------|------|
| Red | `#ff383c` | `#ff4245` |
| Orange | `#ff8d28` | `#ff9230` |
| Yellow | `#ffcc00`（Sketch `#fc0`） | `#ffd600` |
| Green | `#34c759` | `#30d158` |
| Mint | `#00c8b3` | `#00dac3` |
| Teal | `#00c3d0` | `#00d2e0` |
| Cyan | `#00c0e8` | `#3cd3fe` |
| Blue | `#0088ff`（Sketch `#08f`） | `#0091ff` |
| Indigo | `#6155f5` | `#6d7cff` |
| Purple | `#cb30e0` | `#db34f2` |
| Pink | `#ff2d55` | `#ff375f` |
| Brown | `#ac7f5e` | `#b78a66` |

SCSS：`$lingyun-system-*` / `$lingyun-system-*-dark`  
CSS：`--lingyun-system-*`（`prefers-color-scheme: dark` 自动切换；手动切换用 `.theme-light` / `.theme-dark` 或 `data-theme`，见 `useThemeStore`）

图表系列色用同一套 Accents，落在独立包 `lingyun-ui-charts/js_sdk/u-charts/config-colors.js`（顺序 Blue → … → Pink），见 [`CHARTS.md`](./CHARTS.md)。不要在业务 `src/config` 再备一份。

---

## 2. 其余分组（Sketch Color Variables 已逐组核对）

Sketch 的 **System Colors** 分组只有 12 个强调色；同一个 Color Variables 页还有 Backgrounds / Backgrounds Grouped / Fills / Grays / Labels / Labels - Liquid Glass / Separators 等分组，实现按下表对齐。

| 类别 | Token 前缀 | 用途 |
|------|------------|------|
| Labels | `$lingyun-label*` | 主/次/三/四/五级文字 |
| Labels - Liquid Glass | `$lingyun-label-glass*` | 玻璃面上的不透明灰阶文字（见 §2.2） |
| Link | `$lingyun-link` | 链接（= Blue） |
| Backgrounds | `$lingyun-bg-*` | 系统 / Grouped 背景层级（Dark 取 **Dark - Base**） |
| Grays | `$lingyun-system-gray`…`gray6` | 中性灰阶 |
| Fills | `$lingyun-fill*` | 填充层级（含 Quinary） |
| Separators | `$lingyun-separator*` | 分隔线（Non-Opaque / Opaque / Vibrant） |
| Overlay | `$lingyun-overlay` / `$lingyun-mask` | 蒙层（**kit 无色变量**，取自 Sheets 稿实测 20% / 48%） |

### 2.1 Labels / Fills / Separators 精确值

| Token | Light | Dark |
|-------|-------|------|
| `label` | `#000` | `#fff` |
| `label-secondary` | `#3C3C43` 60% | `#EBEBF5` **60%** |
| `label-tertiary` | `#3C3C43` 30% | `#EBEBF5` 30% |
| `label-quaternary` | `#3C3C43` 18% | `#EBEBF5` 16% |
| `label-quinary` | `#3C3C43` 9% | `#EBEBF5` 9% |
| `fill` | `#787878` 20% | `#787880` 36% |
| `fill-secondary` | `#787880` 16% | `#787880` 32% |
| `fill-tertiary` | `#767680` 12% | `#767680` 24% |
| `fill-quaternary` | `#747480` 8% | `#767680` 18% |
| `fill-quinary` | `#000` 2% | `#767680` 2% |
| `separator` | `#000` 12% | `#fff` **12%** |
| `separator-opaque` | `#C6C6C8` | `#38383A` |
| `separator-vibrant` | `#E6E6E6` | `#1A1A1A` |

> Light 的 `fill` 底色是 `#787878`（三通道相同），与 secondary 之后的 `#787880` / `#767680` / `#747480` 不同，勿统一。

### 2.2 Labels - Liquid Glass

| Token | Light | Dark |
|-------|-------|------|
| `label-glass` | `#1A1A1A` | `#EDEDED` |
| `label-glass-secondary` | `#727272` | `#8A8A8A` |
| `label-glass-tertiary` | `#BFBFBF` | `#404040` |
| `label-glass-quaternary` | `#D9D9D9` | `#262626` |

⚠️ **不要**默认拿它当玻璃控件的文字色。`Buttons/Light/Large/Glass/Default` 的 Label 在 Sketch 里取样是纯 `#000000`（即普通 Labels/1 Primary），玻璃按钮沿用 `--lingyun-label`。这套 token 保留给稿子里明确标注 Liquid Glass 灰阶的场景。

---

## 3. 语义映射（业务常用）

| 业务 Token | System |
|------------|--------|
| `$lingyun-primary` | Blue |
| `$lingyun-success` | Green |
| `$lingyun-warning` | Orange |
| `$lingyun-error` | Red |
| `$lingyun-info` | Gray |
| `$lingyun-main-color` | Label |
| `$lingyun-base-color` | Secondary Label |
| `$lingyun-bg-color` | Secondary Background `#f2f2f7` |

禁止再使用 Tailwind 式第三方色（如 `#2563eb` / `#10b981`）作为主题默认。

---

## 4. 自检

- [ ] Accents 12 色 Light/Dark 与 Sketch System Colors 一致
- [ ] Labels / Fills / Separators 的 **alpha** 与 §2.1 一致（易漂：`label-secondary` Dark 60%、`separator` Dark 12%）
- [ ] Backgrounds Dark 取 **Dark - Base**（`#000` / `#1C1C1E` / `#2C2C2E`），未误取 Dark - Elevated
- [ ] 玻璃控件文字用 `--lingyun-label`，未误用 `--lingyun-label-glass`
- [ ] `theme.scss` 与 `_system-colors.scss` 同源
- [ ] 组件只用 `$lingyun-*` / `--lingyun-*`，不硬编码杂色
