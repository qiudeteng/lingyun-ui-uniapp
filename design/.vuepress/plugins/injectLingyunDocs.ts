/**
 * 把 凌云UI / 凌云UI Charts 包内的 readme / changelog 注入为文档站页面。
 *
 * 走 Plugin API 而不是把文件复制进 design/，原因有两条：
 * 1. design/ 禁止为 src/uni_modules/** 建镜像目录（见 design/README.md §5）；
 * 2. 复制会产生第二份真相，改了组件库文档却忘了同步站点。
 */
import type { App, Plugin } from 'vuepress/core'
import { createPage } from 'vuepress/core'
import { fs, getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url)
const REPO_ROOT = path.resolve(__dirname, '../../..')

interface InjectedDoc {
  /** 站点路径 */
  routePath: string
  /** 相对仓库根的源文件 */
  source: string
  title: string
}

const DOCS: InjectedDoc[] = [
  { routePath: '/lingyun-ui/readme.html', source: 'src/uni_modules/lingyun-ui/readme.md', title: '凌云UI 使用说明' },
  { routePath: '/lingyun-ui/changelog.html', source: 'src/uni_modules/lingyun-ui/changelog.md', title: '凌云UI 更新日志' },
  { routePath: '/lingyun-ui-charts/readme.html', source: 'src/uni_modules/lingyun-ui-charts/readme.md', title: '凌云UI Charts 使用说明' },
  { routePath: '/lingyun-ui-charts/changelog.html', source: 'src/uni_modules/lingyun-ui-charts/changelog.md', title: '凌云UI Charts 更新日志' },
]

/**
 * 源文件里的链接形如 `](../../../design/UI_SPEC.md)`，注入后所处路径不同，
 * 统一改写成站内绝对路径。
 */
const rewriteDesignLinks = (raw: string): string =>
  raw.replace(/\]\((?:\.\.\/)+design\/([^)\s#]+?)\.md(#[^)]*)?\)/g, '](/$1.html$2)')

export const injectLingyunDocs = (): Plugin => ({
  name: 'lingyun-inject-docs',

  async onInitialized(app: App) {
    for (const doc of DOCS) {
      const filePath = path.resolve(REPO_ROOT, doc.source)

      if (!fs.existsSync(filePath)) {
        app.env.isDebug && console.warn(`[lingyun-inject-docs] 源文件不存在：${filePath}`)
        continue
      }

      const raw = await fs.readFile(filePath, 'utf-8')

      app.pages.push(
        await createPage(app, {
          path: doc.routePath,
          frontmatter: { title: doc.title, editLink: false },
          content: rewriteDesignLinks(raw),
        }),
      )
    }
  },
})
