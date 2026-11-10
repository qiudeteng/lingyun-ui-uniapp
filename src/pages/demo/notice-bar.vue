<template>
  <lingyun-app-page title="Notice Bar">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Notice Bar</lingyun-text>
        <lingyun-text type="subtitle" block>
          非模态通知条 · 信息 / 成功 / 警告 / 错误
        </lingyun-text>
      </view>

      <lingyun-section title="四种状态" hint="info · success · warning · error">
        <view class="stack">
          <lingyun-notice-bar type="info" text="今日 18:00 前下单，可安排当日配送。" />
          <lingyun-notice-bar type="success" text="门店已接单，裱花师正在制作。" />
          <lingyun-notice-bar type="warning" text="冰淇淋蛋糕请及时冷藏，避免融化。" />
          <lingyun-notice-bar type="error" text="支付失败，请检查网络后重试。" />
        </view>
      </lingyun-section>

      <lingyun-section title="操作与关闭" hint="actionText · closable">
        <view class="stack">
          <lingyun-notice-bar
            type="info"
            text="绑定会员后可查看专属优惠。"
            action-text="去绑定"
            closable
            @action="onAction"
            @close="onClose"
          />
          <lingyun-notice-bar
            type="warning"
            text="配送地址有变更，请确认后再提交。"
            action-text="去修改"
            @action="onAction"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="多行 / 自定义图标" hint="multiline · icon">
        <lingyun-notice-bar
          type="warning"
          icon="location"
          text="当前门店距离较远，预计配送时间会延长 10–20 分钟。如着急可切换附近门店。"
          multiline
          closable
          @close="onClose"
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

function onAction() {
  lastAction.value = '点击通知操作'
}

function onClose() {
  lastAction.value = '关闭通知'
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

.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
