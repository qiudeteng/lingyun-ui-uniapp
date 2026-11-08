# Location Picker 规范（强制 · lingyun-location-picker）

> 位置选择：门店 / 收货地址。小程序 / App 走原生 `uni.chooseLocation`，H5 使用 uni 内置地图并注入腾讯地图 Key。
> 只负责触发与结果回写，不内置地图 UI。

## 1. 结构

```text
位置选择（内容层标准卡片）
├── 位置图标（36px 蓝色软底）
├── 文本区
│   ├── 标签（选择位置）
│   ├── 已选名称 / 占位
│   ├── 详细地址（可选）
│   └── 坐标（可选）
└── 右箭头（只读时隐藏）
```

- 触发器是内容层标准卡片，不铺 Liquid Glass；地图 UI 由平台 / uni 内置选择器提供。
- H5 的 uni 内置地图选择器样式由 uni-h5 决定，不在本组件内重写。

## 2. 尺寸

| 项 | 规格 |
|----|------|
| 行最小高度 | 64px |
| 内边距 | 12px 14px |
| 圆角 | 16px |
| 描边 | 0.5px Separator |
| 图标块 | 36×36，圆角 10，Primary Soft 底 |
| 标签 | 12/16，Secondary |
| 名称 / 占位 | 15/20；已选 600 Label，占位 400 Tertiary |
| 地址 | 12/16，Secondary，单行省略 |
| 坐标 | 11/14，Tertiary |
| 按下态 | 透明度 0.72 |
| 禁用 | 0.5 透明度，不响应 |

## 3. 状态

| 状态 | 表现 |
|------|------|
| 空 | 显示占位「请选择门店或收货地址」 |
| 已选 | 名称 + 地址；可选坐标 |
| 只读 | 展示已选内容，隐藏右箭头，不响应 |
| 禁用 | 0.5 透明度，不响应 |
| 取消 | 平台选择器取消，不抛错误 |
| 失败 | toast + `error` 事件 |

## 4. 平台与 Key

- **微信小程序**：`uni.chooseLocation`；`manifest.json` 已声明 `requiredPrivateInfos: ["chooseLocation"]` 与 `scope.userLocation` 权限。
- **H5**：使用 uni-h5 内置 `chooseLocation` 地图选择器，组件在打开前把腾讯 Key 注入 `__uniConfig.qqMapKey`。
  - Key 从 `VITE_TENCENT_MAP_KEY` 读取，只放在本机 `.env.local`，**不要提交**。
  - 腾讯控制台需开启 JavaScript API / WebService，并配置 H5 域名白名单（`localhost:5175` + 生产域名）。
  - 未配置 Key 时提示「未配置腾讯地图 Key」并抛 `error`。
- **App**：`uni.chooseLocation` 需要本地 manifest 配置地图 SDK / Key；仓库不提交 App Key，按发布环境本地配置。
- 返回坐标统一为腾讯 / GCJ-02；业务存库时保留 `name`、`address`、`latitude`、`longitude`。

## 5. 交互

- 点击整行打开平台位置选择器；已有位置时以该坐标作为初始中心。
- 成功回写 `v-model` 并抛 `change(location)`。
- 取消抛 `cancel`；失败抛 `error({ message })`。
- 只读 / 禁用不打开选择器。
- 组件不申请权限、不自行绘制地图；权限与地图 UI 由平台负责。

## 6. 自检

- [ ] 空 / 已选 / 只读 / 禁用状态正确
- [ ] 小程序原生 chooseLocation 能打开并回写名称 / 地址 / 坐标
- [ ] H5 内置地图能加载腾讯底图，搜索 / 选点 / 回写正常
- [ ] Key 只在本机 `.env.local`，未提交
- [ ] 取消不报错，失败有 toast 与 `error`
- [ ] 暗黑下卡片与文字可读
- [ ] 尺寸全部 `px`，未使用 `rpx`
- [ ] H5 与 mp-weixin 编译、运行验证
