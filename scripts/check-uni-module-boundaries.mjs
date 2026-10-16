import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const modulesRoot = path.join(root, 'src', 'uni_modules')
const sourceExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.scss', '.sass', '.css'])
const hostAliasPattern = /@\/(?!uni_modules\/)/
const specifierPattern = /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*|@use\s*|@import\s*)['"]([^'"]+)['"]/g
const errors = []

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(fullPath)
  }
  return files
}

const moduleEntries = (await readdir(modulesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
const packageIds = new Map()
const dependencies = new Map()

for (const entry of moduleEntries) {
  const packageFile = path.join(modulesRoot, entry.name, 'package.json')
  try {
    const manifest = await readJson(packageFile)
    const id = typeof manifest.id === 'string' && manifest.id ? manifest.id : entry.name
    packageIds.set(entry.name, id)
    dependencies.set(id, new Set(manifest.uni_modules?.dependencies || []))
  } catch {
    // 不是可发布 uni_modules 包的第三方目录无需参与跨包声明检查。
  }
}

function targetPackageFromSpecifier(specifier, sourceDirectory, packageRoot) {
  const aliasMatch = specifier.match(/^@\/uni_modules\/([^/]+)/)
  if (aliasMatch) return packageIds.get(aliasMatch[1]) || aliasMatch[1]
  if (specifier.startsWith('/src/')) return '__HOST__'
  if (!specifier.startsWith('.')) return null

  const resolved = path.resolve(sourceDirectory, specifier)
  const relativeToPackage = path.relative(packageRoot, resolved)
  if (!relativeToPackage.startsWith('..') && !path.isAbsolute(relativeToPackage)) return null
  const relative = path.relative(modulesRoot, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return '__HOST__'
  const directory = relative.split(path.sep)[0]
  return packageIds.get(directory) || '__HOST__'
}

for (const entry of moduleEntries) {
  const sourceId = packageIds.get(entry.name)
  if (!sourceId) continue
  const packageRoot = path.join(modulesRoot, entry.name)
  const allowed = dependencies.get(sourceId) || new Set()

  for (const file of await walk(packageRoot)) {
    const content = await readFile(file, 'utf8')
    const relativeFile = path.relative(root, file)

    if (hostAliasPattern.test(content)) {
      errors.push(`${relativeFile}：引用了宿主工程源码`)
    }

    for (const match of content.matchAll(specifierPattern)) {
      const targetId = targetPackageFromSpecifier(match[1], path.dirname(file), packageRoot)
      if (targetId === '__HOST__') {
        errors.push(`${relativeFile}：通过相对或绝对路径引用了发布包之外的源码`)
        continue
      }
      if (!targetId || targetId === sourceId || allowed.has(targetId)) continue
      errors.push(`${relativeFile}：跨包引用 ${targetId}，但 package.json 未声明依赖`)
    }
  }
}

if (errors.length) {
  console.error(`uni_modules 边界检查失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('uni_modules 边界检查通过')
}
