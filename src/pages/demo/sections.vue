<template>
  <lingyun-app-page title="Sections">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Sections</text>
        <text class="hero__desc">lingyun-section · 分组卡片 / 布局容器</text>
      </view>

      <lingyun-section title="Default（Glass）" hint="默认 Liquid Glass 表面">
        <text class="body-text">内容区默认无内边距；用全局工具类排版。</text>
      </lingyun-section>

      <lingyun-section
        title="Title · Subtitle · Extra"
        subtitle="Secondary line"
        hint="Hint under the title"
        extra="More"
        @click="onSectionClick"
      >
        <text class="body-text">点标题 / Extra / 内容区会 toast 分区类型。</text>
      </lingyun-section>

      <lingyun-section title="Plain" :glass="false" hint="glass=false · 实底 + 描边阴影">
        <text class="body-text">弱端或需要实色卡片时用 plain。</text>
      </lingyun-section>

      <lingyun-section title="Row / Stack / Matrix">
        <view class="lingyun-section-matrix">
          <text class="lingyun-section-matrix__label">lingyun-section-row</text>
          <view class="lingyun-section-row">
            <view class="chip chip--blue">A</view>
            <view class="chip chip--green">B</view>
            <view class="chip chip--orange">C</view>
            <view class="chip chip--gray">D</view>
          </view>
        </view>
        <view class="lingyun-section-matrix">
          <text class="lingyun-section-matrix__label">lingyun-section-stack</text>
          <view class="lingyun-section-stack">
            <view class="bar">第一行</view>
            <view class="bar">第二行</view>
            <view class="bar">第三行</view>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="Cover slot" subtitle="自定义封面">
        <template #cover>
          <view class="demo-cover">
            <text class="demo-cover__label">Cover</text>
          </view>
        </template>
        <text class="body-text">用 #cover 插槽放图或渐变，不必依赖远程图片。</text>
      </lingyun-section>

      <lingyun-section title="Actions" hint="底部操作区">
        <text class="body-text">表单说明或次要文案放在 body。</text>
        <template #actions>
          <view class="lingyun-section-row">
            <lingyun-button variant="bordered" size="mini" text="次要" @click="toast('次要')" />
            <lingyun-button
              variant="borderedProminent"
              size="mini"
              text="主要"
              @click="toast('主要')"
            />
          </view>
        </template>
      </lingyun-section>

      <lingyun-section
        title="Padding"
        hint="spacing=0 后用 headerPadding / bodyPadding 分别控制"
        spacing="0"
        header-padding="14px 12px 0"
        body-padding="12px 12px 16px"
      >
        <view class="pad-box">
          <text class="body-text">header 与 body 内边距独立</text>
        </view>
      </lingyun-section>

      <lingyun-section
        title="Full bleed"
        :is-full="true"
        hint="isFull · 全宽、去左右边线；title / spacing 不变"
      >
        <text class="body-text">通栏铺满宽度，标题区样式与默认一致。</text>
      </lingyun-section>

      <lingyun-section title="Last block" hint="isLast 加大底外边距" is-last>
        <text class="body-text">页面最后一块 section 建议加 is-last。</text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  function toast(title: string): void {
    uni.showToast({ title, icon: 'none' })
  }

  function onSectionClick(type: string): void {
    toast(`click: ${type}`)
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

  .body-text {
    display: block;
    font-size: 15px;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .chip {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .chip--blue {
    background-color: #007aff;
  }

  .chip--green {
    background-color: #34c759;
  }

  .chip--orange {
    background-color: #ff9500;
  }

  .chip--gray {
    background-color: #8e8e93;
  }

  .bar {
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
    color: var(--lingyun-label, #1c1c1e);
    background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .demo-cover {
    height: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 12px 14px;
    box-sizing: border-box;
    background: linear-gradient(135deg, #5ac8fa 0%, #007aff 55%, #5856d6 100%);
    border-radius: 14px 14px 0 0;
  }

  .demo-cover__label {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
  }

  .pad-box {
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 10px;
    background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }
</style>
