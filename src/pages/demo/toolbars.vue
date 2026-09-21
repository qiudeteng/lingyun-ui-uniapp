<template>
  <lingyun-app-page title="Toolbars">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Toolbars</text>
        <text class="hero__desc">lingyun-toolbars · 窄屏 iPhone 60；宽屏 iPad 54；Mac 显示窗口按钮</text>
      </view>

      <lingyun-section title="Standard · Title（60）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title="Title"
            @back="toast('back')"
            @trailing="toast('trailing')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Large（111）">
        <view class="preview">
          <lingyun-toolbars :safe-area="false" title-style="large" title="Title" @back="toast('back')" />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2Line"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line Left">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2LineLeft"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Standard · Title 2 Line Large（131）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            title-style="title2LineLarge"
            title="Title"
            subtitle="Subtitle"
            @back="toast('back')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Sheet · Title（76 · Grabber）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            placement="sheet"
            title="Title"
            @close="toast('close')"
            @trailing="toast('trailing')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Sheet · Large（127）">
        <view class="preview">
          <lingyun-toolbars
            :safe-area="false"
            placement="sheet"
            title-style="large"
            title="Title"
            @close="toast('close')"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Custom trailing" is-last>
        <view class="preview">
          <lingyun-toolbars :safe-area="false" title="Edit">
            <template #trailing>
              <lingyun-button variant="borderless" size="mini" text="Done" />
            </template>
          </lingyun-toolbars>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  function toast(msg: string): void {
    uni.showToast({ title: msg, icon: 'none' })
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

  .preview {
    margin: 0 -12px -16px;
    border-radius: 0 0 14px 14px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.12)),
      repeating-linear-gradient(
        -24deg,
        rgba(147, 197, 253, 0.35) 0 12px,
        rgba(167, 243, 208, 0.25) 12px 24px
      );
  }
</style>
