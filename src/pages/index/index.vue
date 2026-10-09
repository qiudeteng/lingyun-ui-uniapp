<template>
  <lingyun-app-page title="首页" :show-back="false">
    <view class="page">
      <lingyun-list
        v-for="section in sections"
        :key="section.title"
        :header="section.title"
        header-type="nested"
      >
        <lingyun-list-item
          v-for="item in section.items"
          :key="item.url"
          :title="item.title"
          :note="item.note"
          accessory="disclosure"
          @click="go(item.url)"
        />
      </lingyun-list>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getLingyunPageNavSections, resolveLingyunPageUrl } from '@/router/pageNav'
  import { openLingyunHostedPage } from '@/router/pageHost'

  const sections = computed(() => getLingyunPageNavSections())

  function go(url: string): void {
    const next = resolveLingyunPageUrl(url)
    if (!next) return
    if (openLingyunHostedPage(next, url)) return
    uni.navigateTo({ url: next })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .page {
    padding: 0 0 40px;
    box-sizing: border-box;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }
</style>
