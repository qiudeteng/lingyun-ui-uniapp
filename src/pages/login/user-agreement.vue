<template>
  <lingyun-app-page title="用户服务协议" :show-nav="false">
    <view class="policy">
      <text class="policy__h">一、协议范围</text>
      <text class="policy__p">欢迎使用本产品，使用前请仔细阅读并充分理解本协议各条款。您使用本产品即表示您同意本协议。</text>
      <text class="policy__h">二、服务内容</text>
      <text class="policy__p">本公司为您提供软件服务，包含但不限于账户管理、数据统计及相关增值服务。</text>
      <text class="policy__h">三、用户义务</text>
      <text class="policy__p">您应保证提供的信息真实、合法；不得利用本产品从事违法活动。</text>
      <text class="policy__h">四、知识产权</text>
      <text class="policy__p">本产品及相关内容的知识产权归本公司所有，未经许可不得复制或传播。</text>
      <text class="policy__h">五、其他</text>
      <text class="policy__p">本协议与您在使用过程中产生的其他约定具有同等法律效力。本公司保留对本协议条款的解释权。</text>
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
