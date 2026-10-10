<template>
  <lingyun-app-page title="Layout">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Layout</text>
        <text class="hero__desc">lingyun-row / lingyun-col · 24 分栏</text>
      </view>

      <lingyun-section title="基础" hint="span">
        <lingyun-row class="row-gap">
          <lingyun-col :span="24">
            <view class="cell cell--a"><text class="cell__text">24</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row class="row-gap">
          <lingyun-col :span="12">
            <view class="cell cell--a"><text class="cell__text">12</text></view>
          </lingyun-col>
          <lingyun-col :span="12">
            <view class="cell cell--b"><text class="cell__text">12</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row class="row-gap">
          <lingyun-col :span="8">
            <view class="cell cell--a"><text class="cell__text">8</text></view>
          </lingyun-col>
          <lingyun-col :span="8">
            <view class="cell cell--b"><text class="cell__text">8</text></view>
          </lingyun-col>
          <lingyun-col :span="8">
            <view class="cell cell--a"><text class="cell__text">8</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row class="row-gap">
          <lingyun-col :span="6">
            <view class="cell cell--a"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6">
            <view class="cell cell--b"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6">
            <view class="cell cell--a"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6">
            <view class="cell cell--b"><text class="cell__text">6</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row>
          <lingyun-col v-for="index in 6" :key="index" :span="4">
            <view class="cell" :class="index % 2 ? 'cell--a' : 'cell--b'">
              <text class="cell__text">4</text>
            </view>
          </lingyun-col>
        </lingyun-row>
      </lingyun-section>

      <lingyun-section title="间隔" hint="gutter 20">
        <lingyun-row :gutter="20">
          <lingyun-col v-for="index in 4" :key="index" :span="6">
            <view class="cell" :class="index % 2 ? 'cell--a' : 'cell--b'">
              <text class="cell__text">6</text>
            </view>
          </lingyun-col>
        </lingyun-row>
      </lingyun-section>

      <lingyun-section title="混合" hint="16 + 8、8 + 8 + 4 + 4">
        <lingyun-row class="row-gap" :gutter="12">
          <lingyun-col :span="16">
            <view class="cell cell--a"><text class="cell__text">16</text></view>
          </lingyun-col>
          <lingyun-col :span="8">
            <view class="cell cell--b"><text class="cell__text">8</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row :gutter="12">
          <lingyun-col :span="8">
            <view class="cell cell--a"><text class="cell__text">8</text></view>
          </lingyun-col>
          <lingyun-col :span="8">
            <view class="cell cell--b"><text class="cell__text">8</text></view>
          </lingyun-col>
          <lingyun-col :span="4">
            <view class="cell cell--a"><text class="cell__text">4</text></view>
          </lingyun-col>
          <lingyun-col :span="4">
            <view class="cell cell--b"><text class="cell__text">4</text></view>
          </lingyun-col>
        </lingyun-row>
      </lingyun-section>

      <lingyun-section title="偏移" hint="offset">
        <lingyun-row class="row-gap" :gutter="12">
          <lingyun-col :span="6">
            <view class="cell cell--a"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6" :offset="6">
            <view class="cell cell--b"><text class="cell__text">6 + 6</text></view>
          </lingyun-col>
        </lingyun-row>
        <lingyun-row :gutter="12">
          <lingyun-col :span="12" :offset="6">
            <view class="cell cell--a"><text class="cell__text">12，左空 6</text></view>
          </lingyun-col>
        </lingyun-row>
      </lingyun-section>

      <lingyun-section title="对齐" hint="justify center">
        <lingyun-row justify="center">
          <lingyun-col :span="6">
            <view class="cell cell--a"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6">
            <view class="cell cell--b"><text class="cell__text">6</text></view>
          </lingyun-col>
          <lingyun-col :span="6">
            <view class="cell cell--a"><text class="cell__text">6</text></view>
          </lingyun-col>
        </lingyun-row>
      </lingyun-section>

      <lingyun-section title="响应式" hint="xs / sm / md / lg / xl" is-last>
        <lingyun-row :gutter="10">
          <lingyun-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
            <view class="cell cell--a"><text class="cell__text">A</text></view>
          </lingyun-col>
          <lingyun-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11">
            <view class="cell cell--b"><text class="cell__text">B</text></view>
          </lingyun-col>
          <lingyun-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11">
            <view class="cell cell--a"><text class="cell__text">C</text></view>
          </lingyun-col>
          <lingyun-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
            <view class="cell cell--b"><text class="cell__text">D</text></view>
          </lingyun-col>
        </lingyun-row>
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

  .row-gap {
    margin-bottom: 12px;
  }

  .cell {
    box-sizing: border-box;
    min-height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell--a {
    background-color: var(--lingyun-fill-secondary, rgba(120, 120, 128, 0.16));
  }

  .cell--b {
    background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .cell__text {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>
