<script setup lang="ts">
  import { provide } from 'vue'
  import {
    LINGYUN_APP_PAGE_EMBEDDED,
    LINGYUN_CONTENT_COVER_PATH,
    LINGYUN_IN_CONTENT_COVER,
  } from '../../utils/contentCover'

  const props = defineProps<{ path: string }>()

  /* 盖层里的页面是完整页，不是宿主壳的嵌入块。 */
  provide(LINGYUN_APP_PAGE_EMBEDDED, false)
  provide(LINGYUN_IN_CONTENT_COVER, true)
  provide(LINGYUN_CONTENT_COVER_PATH, props.path)
</script>

<template>
  <view class="lingyun-content-cover-frame">
    <slot />
  </view>
</template>

<style lang="scss">
  .lingyun-content-cover-frame {
    width: 100%;
    height: 100%;
    min-height: 0;
  }
</style>
