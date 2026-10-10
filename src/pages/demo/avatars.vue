<template>
  <lingyun-app-page title="Avatars">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Avatars</text>
        <text class="hero__desc">shape=形式 · size=尺寸 · radius=圆角幅度（仅 rounded）</text>
      </view>

      <lingyun-section title="显示尺寸 size（默认圆形）">
        <view class="row">
          <view class="cell">
            <lingyun-avatar text="S" size="sm" />
            <text class="cap">sm</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="MD" size="md" />
            <text class="cap">md</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="LG User" size="lg" />
            <text class="cap">lg</text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="显示形式 shape（同 size=lg）">
        <view class="row">
          <view class="cell">
            <lingyun-avatar text="方" size="lg" shape="square" />
            <text class="cap">square</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="圆角" size="lg" shape="rounded" />
            <text class="cap">rounded</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="圆" size="lg" shape="circle" />
            <text class="cap">circle</text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="圆角幅度 radius（仅 rounded · 同 size=lg）" is-last>
        <view class="row">
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="none" />
            <text class="cap">none</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="sm" />
            <text class="cap">sm</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="md" />
            <text class="cap">md</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="lg" />
            <text class="cap">lg</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="xl" />
            <text class="cap">xl</text>
          </view>
          <view class="cell">
            <lingyun-avatar text="A" size="lg" shape="rounded" radius="2xl" />
            <text class="cap">2xl</text>
          </view>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts"></script>

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

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 16px;
    padding: 8px 0;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .cap {
    font-size: 12px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
