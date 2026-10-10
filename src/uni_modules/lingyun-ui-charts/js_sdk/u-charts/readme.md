# 凌云UI Charts · JSSDK

1. 可不经过组件，直接引用 `u-charts.ts`；编译后约 120kb。
2. 需要更小体积时，到 [uCharts 官网](https://www.ucharts.cn) 在线定制后再替换本目录文件。
3. `config-colors.ts` 为全局系列色（Light / Dark）。改色只动这一份。
4. `config-ucharts.ts` 为 uCharts 默认 option，引用 `config-colors.ts`。升级引擎前请自行备份。
5. `config-echarts.ts` 为 ECharts 默认 option，同样引用 `config-colors.ts`。升级前请自行备份。
6. 图种、数据形状与 Demo 约定见仓库 [`design/CHARTS.md`](../../../../../design/CHARTS.md)。
