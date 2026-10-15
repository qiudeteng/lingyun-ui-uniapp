/**
 * 把三个扩展包的 changelog 注入为手册页，避免在 doc/ 手抄第二份。
 * 源文件：src/uni_modules/lingyun-ui{,-charts,-page}/changelog.md
 */
import { createPage } from 'vuepress/core'
import type { App, Plugin } from 'vuepress/core'
import { fs, getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url)
const REPO_ROOT = path.resolve(__dirname, '../../..')

type PackageKey = 'ui' | 'charts' | 'page'

interface ChangelogDoc {
  key: PackageKey
  routePath: string
  source: string
  packageJson: string
  heading: string
}

const DOCS: ChangelogDoc[] = [
  {
    key: 'ui',
    routePath: '/changelog/ui.html',
    source: 'src/uni_modules/lingyun-ui/changelog.md',
    packageJson: 'src/uni_modules/lingyun-ui/package.json',
    heading: '组件 · lingyun-ui',
  },
  {
    key: 'charts',
    routePath: '/changelog/charts.html',
    source: 'src/uni_modules/lingyun-ui-charts/changelog.md',
    packageJson: 'src/uni_modules/lingyun-ui-charts/package.json',
    heading: '图表 · lingyun-ui-charts',
  },
  {
    key: 'page',
    routePath: '/changelog/page.html',
    source: 'src/uni_modules/lingyun-ui-page/changelog.md',
    packageJson: 'src/uni_modules/lingyun-ui-page/package.json',
    heading: '页面 · lingyun-ui-page',
  },
]

function readPackageVersion(relPath: string): string {
  const filePath = path.resolve(REPO_ROOT, relPath)
  if (!fs.existsSync(filePath)) return ''
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { version?: string }
    return json.version || ''
  } catch {
    return ''
  }
}

export function readLingyunPackageVersions(): Record<PackageKey, string> {
  return {
    ui: readPackageVersion(DOCS[0].packageJson),
    charts: readPackageVersion(DOCS[1].packageJson),
    page: readPackageVersion(DOCS[2].packageJson),
  }
}

export const injectChangelogs = (): Plugin => ({
  name: 'lingyun-inject-changelogs',

  async onInitialized(app: App) {
    for (const doc of DOCS) {
      const filePath = path.resolve(REPO_ROOT, doc.source)
      if (!fs.existsSync(filePath)) {
        app.env.isDebug && console.warn(`[lingyun-inject-changelogs] 源文件不存在：${filePath}`)
        continue
      }

      const version = readPackageVersion(doc.packageJson)
      const raw = await fs.readFile(filePath, 'utf-8')
      const content = [
        `# ${doc.heading}`,
        '',
        version ? `当前版本 **${version}**。` : '',
        '',
        `源文件：\`${doc.source}\``,
        '',
        '---',
        '',
        raw.trim(),
        '',
      ]
        .filter((line, index, list) => {
          // 去掉连续空行造成的多余空白（版本缺失时）
          if (line !== '') return true
          return index === 0 || list[index - 1] !== ''
        })
        .join('\n')

      app.pages.push(
        await createPage(app, {
          path: doc.routePath,
          frontmatter: {
            title: doc.heading,
            editLink: false,
          },
          content,
        }),
      )
    }
  },
})
