<template>
  <lingyun-app-page title="Tooltip">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Tooltip</lingyun-text>
        <lingyun-text type="subtitle" block>
          轻量说明 · H5 悬停 / 移动端长按或点击
        </lingyun-text>
      </view>

      <lingyun-section title="基础 Tooltip" hint="trigger=hover · placement=top">
        <view class="row">
          <lingyun-tooltip
            text="下单后 30 分钟内可联系门店修改配送时间"
            @show="onShow"
            @hide="onHide"
          >
            <lingyun-button variant="glass" size="medium" text="配送说明" />
          </lingyun-tooltip>
        </view>
      </lingyun-section>

      <lingyun-section title="四个方向" hint="top / bottom / left / right">
        <view class="row">
          <lingyun-tooltip text="向上显示" placement="top">
            <lingyun-button variant="glass" size="small" text="Top" />
          </lingyun-tooltip>
          <lingyun-tooltip text="向下显示" placement="bottom">
            <lingyun-button variant="glass" size="small" text="Bottom" />
          </lingyun-tooltip>
          <lingyun-tooltip text="向左显示" placement="left">
            <lingyun-button variant="glass" size="small" text="Left" />
          </lingyun-tooltip>
          <lingyun-tooltip text="向右显示" placement="right">
            <lingyun-button variant="glass" size="small" text="Right" />
          </lingyun-tooltip>
        </view>
      </lingyun-section>

      <lingyun-section title="点击触发" hint="trigger=click">
        <view class="row">
          <lingyun-tooltip
            text="点击触发器显示，再次点击收起"
            trigger="click"
            placement="bottom"
          >
            <lingyun-tag text="点击我" />
          </lingyun-tooltip>
        </view>
      </lingyun-section>

      <lingyun-section title="自定义内容 / 禁用" hint="content slot · disabled">
        <view class="row">
          <lingyun-tooltip placement="bottom">
            <template #default>
              <lingyun-tag text="自定义内容" />
            </template>
            <template #content>
              <view class="custom-tip">
                <text class="custom-tip__title">取货提醒</text>
                <text class="custom-tip__desc">请提前 10 分钟到店，出示取货码。</text>
              </view>
            </template>
          </lingyun-tooltip>

          <lingyun-tooltip text="禁用状态不显示" disabled>
            <lingyun-tag text="禁用" />
          </lingyun-tooltip>
        </view>
      </lingyun-section>

      <lingyun-section
        v-if="lastAction"
        title="最近操作"
        :hint="lastAction"
        is-last
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const lastAction = ref('')

function onShow() {
  lastAction.value = 'Tooltip 显示'
}

function onHide() {
  lastAction.value = 'Tooltip 隐藏'
}
</script>

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

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.custom-tip {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.custom-tip__title {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
}

.custom-tip__desc {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}
</style>
