/**
 * Vite 配置文件（uni-app 通过 vite-plugin-uni 构建多端）
 */
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [uni(), generateRouter()],
  server: {
    // 绑所有网卡：真机 / 局域网可直接开 H5，启动日志会打印 Network 地址
    host: true,
    port: 5173,
    // 端口被占时直接报错，避免真机连到另一个端口
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 5.4+：现代 Sass API
        api: 'modern-compiler',
        // lingyun-ui/styles 仍为 @import 体系（fork 自 uni-scss）；先静默弃用噪声，后续再迁 @use
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
          'legacy-js-api',
        ],
      },
    },
  },
})
