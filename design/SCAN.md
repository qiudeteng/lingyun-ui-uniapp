# Scan 规范（强制 · lingyun-scan）

> 扫码入口：小程序 / App 走 `uni.scanCode`；H5 与自定义场景用 `scanFn` 覆盖。
> 只负责触发与结果事件，不内置相机取景 UI。

## 1. 结构

```text
扫码入口（内容层）
├── 默认 triggger：lingyun-button（scan 图标 + 文案）
│   或默认插槽：业务自定义行 / 卡片
└── 说明文字（可选）
```

- 默认使用 `lingyun-button` 的 `borderedProminent` / large，可直接放进表单或分组卡片。
- 业务可用默认插槽做整行触发（左侧图标 + 标题 / 说明 + 右侧箭头），点击区域即整行。
- 不铺 Liquid Glass；自定义内容自行使用标准材质。

## 2. 尺寸

| 项 | 规格 |
|----|------|
| 默认按钮 | 复用 `lingyun-button` large；图标 `scan` |
| 图标 | 16–24px，跟随按钮尺寸 |
| 默认插槽 | 整行 ≥44px 点击区，内容自定义 |
| 说明文字 | 12/16，Secondary，距触发区 8px |
| 扫描中 | 默认按钮 loading +「扫描中…」；自定义插槽通过 `scanning` 插槽参数自行处理 |
| 禁用 | 0.5 透明度，不响应 |

## 3. 状态与事件

| 状态 | 表现 |
|------|------|
| 空闲 | 显示「扫码」/ 默认插槽 |
| 扫描中 | `scanning=true`，按钮 loading；避免重复触发 |
| 成功 | `success` 返回 `{ result, scanType, charSet, path, rawData? }` |
| 失败 | `error` 返回 `{ message, error }`；默认 toast |
| 取消 | `cancel`，不弹错误 toast |
| 禁用 | 不响应点击 |

- 点击 / 调用 `scan()` 先抛 `start`，再打开扫码。
- `scanFn` 存在时优先使用（H5 网页扫码、测试、业务自建扫码）。
- 无 `scanFn` 且为 H5 时，提示「H5 暂不支持原生扫码，请使用 scan-fn」并抛 `error`。
- 无 `scanFn` 且为小程序 / App 时调用 `uni.scanCode`。
- 空结果视为失败「未识别到扫码内容」。

## 4. 平台

- **微信小程序 / App**：`uni.scanCode({ scanType, onlyFromCamera, scanText })`。
- **H5**：无原生扫码，必须传 `scanFn`；可接浏览器相机 + 扫码库或后端识别。
- `scanFn` 可返回字符串或结果对象；返回 Promise 时支持取消（错误信息含 cancel 时抛 `cancel`）。
- 组件不申请相机权限、不内置取景框；权限与相机 UI 由平台原生扫码负责。

## 5. 自检

- [ ] 默认按钮 / 自定义插槽点击都能触发
- [ ] 小程序 / App 打开原生扫码，H5 无 scanFn 时提示并抛 error
- [ ] scanFn 成功 / 失败 / 取消路径正确
- [ ] 扫描中不可重复触发，结束后恢复
- [ ] 错误 toast 可关闭，结果事件字段完整
- [ ] 禁用态不响应
- [ ] 尺寸全部 `px`，未使用 `rpx`
- [ ] H5 与 mp-weixin 编译、运行验证
