<template>
  <lingyun-app-page title="Mobile / PC">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Mobile / PC</text>
        <text class="hero__desc">窗口宽度小于 690 走窄屏，达到 690 的平板和电脑走宽屏</text>
      </view>

      <lingyun-mobile>
        <lingyun-section title="lingyun-mobile" hint="窄屏" is-last>
          <text class="line">当前是窄屏，只显示这一块。</text>
        </lingyun-section>
      </lingyun-mobile>

      <lingyun-pc>
        <lingyun-section title="lingyun-pc" hint="平板与电脑" is-last>
          <text class="line">当前是平板或电脑，只显示这一块。</text>
        </lingyun-section>
      </lingyun-pc>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts"></script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .line {
    display: block;
    font-size: 17px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>
