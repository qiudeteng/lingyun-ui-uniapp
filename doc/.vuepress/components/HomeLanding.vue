<script setup lang="ts">
import { computed } from 'vue'
import { usePageFrontmatter, withBase } from 'vuepress/client'
import LyDocButton from './LyDocButton.vue'
import LyDocCard from './LyDocCard.vue'
import LyDocTile from './LyDocTile.vue'

type HomeFrontmatter = {
  uiVersion?: string
  chartsVersion?: string
  pageVersion?: string
}

const frontmatter = usePageFrontmatter<HomeFrontmatter>()

const uiVersion = computed(() => frontmatter.value.uiVersion || '')
const chartsVersion = computed(() => frontmatter.value.chartsVersion || '')
const pageVersion = computed(() => frontmatter.value.pageVersion || '')

const pillars = computed(() => [
  {
    title: '组件',
    desc: '按钮、列表、浮层、表单… 对齐 Apple Liquid Glass。',
    link: '/components/',
    version: uiVersion.value,
  },
  {
    title: '图表',
    desc: '柱状、折线、饼环等，主题色跟系统 Accents。',
    link: '/charts/',
    version: chartsVersion.value,
  },
  {
    title: '标准页面',
    desc: '登录等可复用整页，路由仍在业务侧。',
    link: '/page/',
    version: pageVersion.value,
  },
])

const guides = [
  { title: '接入', desc: '挂 Pinia 与组件库', link: '/guide/start.html' },
  { title: '屏幕', desc: '窄屏与宽屏布局', link: '/guide/screen.html' },
  { title: '反馈', desc: 'Toast 与 HUD', link: '/guide/feedback.html' },
  { title: '更新记录', desc: '三个扩展包 changelog', link: '/changelog/' },
]

const year = new Date().getFullYear()
</script>

<template>
  <div class="ly-home-bleed">
    <div class="ly-home__glow ly-home__glow--a" aria-hidden="true" />
    <div class="ly-home__glow ly-home__glow--b" aria-hidden="true" />
    <div class="ly-home__glow ly-home__glow--c" aria-hidden="true" />

    <div class="ly-home">
      <section class="ly-home__hero">
        <p class="ly-home__eyebrow">uni-app · Liquid Glass</p>
        <h1 class="ly-home__brand">凌云UI</h1>
        <p class="ly-home__tagline">
          对齐 Apple Liquid Glass 的多端组件库。微信小程序是硬门禁，H5 / App 一并可用。
        </p>
        <div class="ly-home__actions">
          <LyDocButton href="/guide/start.html" variant="bordered-prominent">开始接入</LyDocButton>
          <LyDocButton href="/components/" variant="glass">浏览组件</LyDocButton>
        </div>
        <p v-if="uiVersion" class="ly-home__versions">
          <span>组件 {{ uiVersion }}</span>
          <span v-if="chartsVersion">图表 {{ chartsVersion }}</span>
          <span v-if="pageVersion">页面 {{ pageVersion }}</span>
        </p>
      </section>

      <section class="ly-home__pillars" aria-label="扩展包">
        <LyDocCard
          v-for="item in pillars"
          :key="item.title"
          :href="item.link"
          :title="item.title"
          :desc="item.desc"
          :version="item.version"
        />
      </section>

      <section class="ly-home__guides" aria-label="从这里开始">
        <h2 class="ly-home__section-title">从这里开始</h2>
        <div class="ly-home__guide-grid">
          <LyDocTile
            v-for="item in guides"
            :key="item.link"
            :href="item.link"
            :title="item.title"
            :desc="item.desc"
          />
        </div>
      </section>

      <section class="ly-home__note">
        <p>
          这是组件的<strong>用法</strong>说明：怎么写、有哪些属性和示例。尺寸、玻璃材质和设计稿对照在仓库
          <code>design/</code> 里。
        </p>
        <div class="ly-home__links">
          <a href="https://github.com/qiudeteng/lingyun-ui-uniapp" target="_blank" rel="noopener">仓库</a>
          <a href="https://github.com/qiudeteng/lingyun-ui-uniapp/issues" target="_blank" rel="noopener">Issues</a>
          <a :href="withBase('/changelog/')">更新记录</a>
        </div>
      </section>

      <footer class="ly-home__footer">
        <p class="ly-home__copyright">
          Copyright © {{ year }} 凌云UI ·
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener"
          >MIT License</a>
        </p>
        <p class="ly-home__copyright-sub">开源组件库，可自由使用、修改与分发。</p>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../src/uni_modules/lingyun-ui/styles/theme.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/variables.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/setting/_glass.scss';

.ly-home-bleed {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  min-height: inherit;
}

.ly-home {
  box-sizing: border-box;
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 72px;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'SF Pro Text',
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-home__glow {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
  animation: ly-home-drift 18s ease-in-out infinite;
}

.ly-home__glow--a {
  top: -80px;
  left: -60px;
  width: 420px;
  height: 420px;
  background: color-mix(in srgb, var(--lingyun-system-blue, #0088ff) 28%, transparent);
}

.ly-home__glow--b {
  top: 40px;
  right: -100px;
  width: 360px;
  height: 360px;
  background: color-mix(in srgb, var(--lingyun-system-green, #34c759) 22%, transparent);
  animation-delay: -6s;
}

.ly-home__glow--c {
  bottom: 80px;
  left: 30%;
  width: 280px;
  height: 280px;
  background: color-mix(in srgb, var(--lingyun-system-cyan, #00c0e8) 18%, transparent);
  animation-delay: -12s;
}

@keyframes ly-home-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(12px, -18px, 0) scale(1.06);
  }
}

.ly-home__hero {
  text-align: center;
  padding: 32px 12px 40px;
  animation: ly-home-rise 0.7s ease both;
}

.ly-home__eyebrow {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lingyun-primary, #{$lingyun-primary});
}

.ly-home__brand {
  margin: 0;
  font-size: clamp(42px, 8vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-home__tagline {
  max-width: 34em;
  margin: 16px auto 0;
  font-size: 17px;
  line-height: 1.55;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.ly-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

.ly-home__versions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  justify-content: center;
  margin: 20px 0 0;
  font-size: 12px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.ly-home__versions span {
  padding: 4px 10px;
  border-radius: 980px;
  @include lingyun-glass-control;
  min-height: 0;
  height: auto;
}

.ly-home__pillars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 8px;
  animation: ly-home-rise 0.7s ease 0.08s both;
}

.ly-home__guides {
  margin-top: 40px;
  animation: ly-home-rise 0.7s ease 0.14s both;
}

.ly-home__section-title {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  border: none;
  padding: 0;
}

.ly-home__guide-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.ly-home__note {
  margin-top: 36px;
  padding: 18px 16px;
  animation: ly-home-rise 0.7s ease 0.2s both;
  @include lingyun-glass-surface;
  border-radius: 18px;
}

.ly-home__note p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.ly-home__note code {
  font-size: 0.92em;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--lingyun-fill-tertiary, rgba(120, 120, 128, 0.12));
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-home__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 14px;
}

.ly-home__links a {
  font-size: 14px;
  font-weight: 600;
  color: var(--lingyun-primary, #{$lingyun-primary});
  text-decoration: none;
}

.ly-home__links a:hover {
  text-decoration: underline;
}

.ly-home__footer {
  margin-top: 40px;
  padding-top: 24px;
  text-align: center;
  border-top: 1px solid var(--lingyun-separator, rgba(60, 60, 67, 0.18));
}

.ly-home__copyright {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.ly-home__copyright a {
  color: var(--lingyun-primary, #{$lingyun-primary});
  text-decoration: none;
  font-weight: 600;
}

.ly-home__copyright a:hover {
  text-decoration: underline;
}

.ly-home__copyright-sub {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

@keyframes ly-home-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .ly-home__pillars {
    grid-template-columns: 1fr;
  }

  .ly-home__guide-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .ly-home {
    padding: 28px 16px 56px;
  }

  .ly-home__guide-grid {
    grid-template-columns: 1fr;
  }
}
</style>
