<template>
  <lingyun-app-page title="Text">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Text</lingyun-text>
        <lingyun-text type="subtitle" block>lingyun-text · 字阶 + 语义色 / 自定义色</lingyun-text>
      </view>

      <lingyun-section title="常用场景">
        <view class="stack">
          <lingyun-text type="title" block>标题 Title</lingyun-text>
          <lingyun-text type="subtitle" block>副标题 Subtitle · 默认 Secondary</lingyun-text>
          <lingyun-text type="body" block>
            正文 Body。用于段落与列表主文，字号 17 / 行高 22。
          </lingyun-text>
          <lingyun-text type="hint" block>提示 Hint · Footnote + Tertiary</lingyun-text>
          <lingyun-text type="caption" block>图注 Caption</lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="字阶">
        <view class="stack">
          <lingyun-text type="largeTitle" block>Large Title</lingyun-text>
          <lingyun-text type="title1" block>Title 1</lingyun-text>
          <lingyun-text type="title2" block>Title 2</lingyun-text>
          <lingyun-text type="title3" block>Title 3</lingyun-text>
          <lingyun-text type="headline" block>Headline</lingyun-text>
          <lingyun-text type="body" block>Body</lingyun-text>
          <lingyun-text type="callout" block>Callout</lingyun-text>
          <lingyun-text type="subheadline" block>Subheadline</lingyun-text>
          <lingyun-text type="footnote" block>Footnote</lingyun-text>
          <lingyun-text type="caption1" block>Caption 1</lingyun-text>
          <lingyun-text type="caption2" block>Caption 2</lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="颜色">
        <view class="stack">
          <lingyun-text type="body" color="label" block>Label</lingyun-text>
          <lingyun-text type="body" color="secondary" block>Secondary</lingyun-text>
          <lingyun-text type="body" color="tertiary" block>Tertiary</lingyun-text>
          <lingyun-text type="body" color="primary" block>Primary</lingyun-text>
          <lingyun-text type="body" color="link" block>Link</lingyun-text>
          <lingyun-text type="body" color="success" block>Success</lingyun-text>
          <lingyun-text type="body" color="warning" block>Warning</lingyun-text>
          <lingyun-text type="body" color="error" block>Error</lingyun-text>
          <lingyun-text type="body" color="#AF52DE" block>自定义 #AF52DE</lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="强调 · 对齐 · 省略" is-last>
        <view class="stack">
          <lingyun-text type="body" emphasized block>Body Emphasized</lingyun-text>
          <lingyun-text type="body" align="center" block>居中 Center</lingyun-text>
          <lingyun-text type="body" align="right" block>右对齐 Right</lingyun-text>
          <lingyun-text type="body" :lines="1" block>
            单行省略：这是一段很长的正文，用来演示超出容器后的省略号效果。
          </lingyun-text>
          <lingyun-text type="body" :lines="2" block>
            两行省略：这是一段很长的正文，用来演示多行截断。继续补充一些文字，确保在窄宽度下会超过两行，从而出现省略号。
          </lingyun-text>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
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
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }
</style>
