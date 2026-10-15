<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vuepress/client'

const props = defineProps<{
  href: string
  title: string
  desc: string
}>()

const resolvedHref = computed(() => withBase(props.href))
</script>

<template>
  <a class="ly-doc-tile" :href="resolvedHref">
    <span class="ly-doc-tile__title">{{ title }}</span>
    <span class="ly-doc-tile__desc">{{ desc }}</span>
  </a>
</template>

<style lang="scss" scoped>
@import '../../../src/uni_modules/lingyun-ui/styles/theme.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/variables.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/setting/_glass.scss';

.ly-doc-tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
  padding: 14px 14px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease;
  @include lingyun-glass-control;
  border-radius: 16px;
}

.ly-doc-tile:hover {
  transform: translateY(-1px);
  text-decoration: none;
  color: inherit;
  background-color: var(--lingyun-glass-control-bg-pressed, #{$lingyun-glass-control-bg-pressed});
}

.ly-doc-tile__title {
  font-size: 15px;
  font-weight: 650;
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-doc-tile__desc {
  font-size: 12px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}
</style>
