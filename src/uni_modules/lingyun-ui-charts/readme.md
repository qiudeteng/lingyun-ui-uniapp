# 凌云UI Charts

`uni_modules` 图表包，标签 `<lingyun-ui-charts />`，easycom 自动注册。

📖 [使用手册](https://lingyun.xinyicanyin.com/)（组件用法、属性、示例；右侧手机框实时预览）

📦 [仓库](https://github.com/qiudeteng/lingyun-ui-uniapp)
🐛 欢迎反馈：使用中遇到问题或有建议，请在 [仓库 Issues](https://github.com/qiudeteng/lingyun-ui-uniapp/issues) 提交，也欢迎 PR 共同完善。

**使用手册** → 仓库 [`doc/charts/README.md`](../../../doc/charts/README.md)（`pnpm manual:dev`），各图种 → [`doc/charts/`](../../../doc/charts/)  
**设计约定** → [`design/CHARTS.md`](../../../design/CHARTS.md)  
**系列色** → `js_sdk/u-charts/config-colors.js`

```vue
<lingyun-ui-charts
  type="column"
  canvasId="lychart-column"
  :chartData="chartData"
  :opts="chartOpts"
  :canvas2d="true"
  :inScrollView="true"
  :ontouch="true"
/>
```

容器必须有高度（Demo 为 280px）。完整示例、图种数据、属性与事件见使用手册。

```
lingyun-ui-charts/
├── components/lingyun-ui-charts/
├── js_sdk/u-charts/     # config-colors / config-ucharts / config-echarts
└── static/              # ECharts 运行时
```

升级引擎前备份 `config-colors.js`、`config-ucharts.js`、`config-echarts.js`。不要把本包 `.js` 改成 `.ts`。
