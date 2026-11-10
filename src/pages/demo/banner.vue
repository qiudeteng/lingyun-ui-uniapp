<template>
  <lingyun-app-page title="Banner">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Banner</lingyun-text>
        <lingyun-text type="subtitle" block>
          营销横幅 · 图片 / 卡片 · 标题 / 操作 / 关闭
        </lingyun-text>
      </view>

      <lingyun-section title="图片横幅" hint="overlay=bottom · action · closable">
        <lingyun-banner
          image="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=500&fit=crop&q=80"
          title="秋日限定 · 栗子奶油蛋糕"
          description="当季栗子与轻奶油，门店现做，数量有限。"
          action-text="去看看"
          action-icon="right"
          overlay="bottom"
          :height="180"
          closable
          @click="onClick"
          @action="onAction"
          @close="onClose"
        />
      </lingyun-section>

      <lingyun-section title="卡片横幅" hint="无图片 · 主色操作">
        <lingyun-banner
          title="新客首单立减 20 元"
          description="注册会员后自动发放优惠券，下单即可使用。"
          action-text="领取优惠"
          overlay="none"
          :height="132"
          @action="onAction"
        />
      </lingyun-section>

      <lingyun-section title="自定义内容" hint="默认插槽">
        <lingyun-banner
          image="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=500&fit=crop&q=80"
          overlay="full"
          :height="160"
        >
          <view class="custom-banner">
            <lingyun-badge text="限时" color="orange" size="small" />
            <lingyun-text type="title3" color="white" block emphasized>
              周末亲子烘焙课
            </lingyun-text>
            <lingyun-text type="caption" color="white" block>
              报名即送 6 寸蛋糕体验券
            </lingyun-text>
          </view>
        </lingyun-banner>
      </lingyun-section>

      <lingyun-section title="禁用" hint="disabled">
        <lingyun-banner
          title="活动已结束"
          description="关注下次门店活动"
          overlay="none"
          :height="110"
          disabled
        />
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

function onClick() {
  lastAction.value = '点击横幅'
}

function onAction() {
  lastAction.value = '点击横幅操作'
}

function onClose() {
  lastAction.value = '关闭横幅'
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

.custom-banner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
</style>
