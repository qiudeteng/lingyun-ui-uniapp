<template>
  <lingyun-app-page title="Markdown">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Markdown</lingyun-text>
        <lingyun-text type="subtitle" block>
          Markdown 预览 · 原生节点渲染 · 链接 / 图片事件
        </lingyun-text>
      </view>

      <lingyun-section title="编辑" hint="自研解析 · GFM 常用语法">
        <lingyun-text-field
          v-model="source"
          label="Markdown"
          placeholder="输入 Markdown"
          multiline
          :rows="8"
        />
        <view class="samples">
          <lingyun-button
            size="small"
            variant="borderless"
            text="基础示例"
            @click="useSample('basic')"
          />
          <lingyun-button
            size="small"
            variant="borderless"
            text="代码与表格"
            @click="useSample('rich')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="预览" hint="lingyun-markdown">
        <view class="preview">
          <lingyun-markdown
            :content="source"
            @link-click="onLink"
            @image-click="onImage"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="说明" is-last>
        <lingyun-text type="footnote" color="secondary" block>
          不执行原始 HTML；链接与图片通过事件交给页面处理；代码块和表格可横向滚动；尺寸全部为 px，微信小程序可编译。
        </lingyun-text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basicSample = [
  '# 凌云 Markdown',
  '',
  '支持 **粗体**、*斜体*、~~删除线~~、`行内代码` 和 [链接](https://uniapp.dcloud.net.cn/)。',
  '',
  '## 列表',
  '',
  '- 无序列表',
  '  - 嵌套项',
  '- 支持任务列表',
  '- [x] 已完成',
  '- [ ] 待处理',
  '',
  '1. 有序列表',
  '2. 第二项',
  '',
  '> 引用：内容层 Markdown 预览，不执行原始 HTML。',
].join('\n')

const richSample = [
  '## 代码',
  '',
  '```ts',
  'const price = 168',
  'console.log(`合计 ¥${price}`)',
  '```',
  '',
  '## 表格',
  '',
  '| 规格 | 价格 | 库存 |',
  '| --- | ---: | :---: |',
  '| 6 寸 | 168 | 5 |',
  '| 8 寸 | 228 | 2 |',
  '',
  '## 图片',
  '',
  '![八喜冰淇淋蛋糕](https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80)',
  '',
  '---',
  '',
  '结尾段落，支持长文本自动换行。',
].join('\n')

const source = ref(basicSample)

function useSample(key: 'basic' | 'rich') {
  source.value = key === 'basic' ? basicSample : richSample
}

function onLink(payload: { href: string }) {
  uni.showToast({ title: payload.href, icon: 'none' })
}

function onImage(payload: { src: string }) {
  uni.previewImage({ urls: [payload.src] })
}
</script>

<style lang="scss">
.page {
  box-sizing: border-box;
  padding-bottom: 40px;
  min-height: 100%;
  background:
    radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
    radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
    radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
    var(--lingyun-bg-grouped, #f2f2f7);
}

.hero {
  padding: 24px 20px 8px;
}

.samples {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
}

.preview {
  padding: 4px 0 8px;
}
</style>
