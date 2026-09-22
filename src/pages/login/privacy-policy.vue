<template>
  <lingyun-app-page title="隐私政策" :show-nav="false">
    <view class="policy">
      <text class="policy__h">一、我们收集的信息</text>
      <text class="policy__p">为提供服务，我们可能收集您的账号、设备及使用记录等信息。</text>
      <text class="policy__h">二、信息使用</text>
      <text class="policy__p">信息仅用于身份验证、安全保障及改善产品体验，不会对外出售。</text>
      <text class="policy__h">三、信息保护</text>
      <text class="policy__p">我们采取合理技术与管理措施保护您的信息安全。</text>
      <text class="policy__h">四、您的权利</text>
      <text class="policy__p">您可查询、更正或删除个人信息，也可联系我们行使相关权利。</text>
    </view>
  </lingyun-app-page>
</template>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .policy {
    padding: 16px;
  }

  .policy__h {
    display: block;
    margin-top: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  .policy__p {
    display: block;
    margin-top: 8px;
    font-size: 15px;
    line-height: 22px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }
</style>
