<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vuepress/client'

const props = defineProps<{
  href: string
  title: string
  desc: string
  version?: string
  more?: string
}>()

const resolvedHref = computed(() => withBase(props.href))
</script>

<template>
  <a class="ly-doc-card" :href="resolvedHref">
    <div class="ly-doc-card__head">
      <span class="ly-doc-card__title">{{ title }}</span>
      <span v-if="version" class="ly-doc-card__ver">{{ version }}</span>
    </div>
    <p class="ly-doc-card__desc">{{ desc }}</p>
    <span class="ly-doc-card__more">{{ more || '查看 →' }}</span>
  </a>
</template>

<style lang="scss" scoped>
@import '../../../src/uni_modules/lingyun-ui/styles/theme.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/variables.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/setting/_glass.scss';

.ly-doc-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  min-height: 168px;
  padding: 18px 16px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  @include lingyun-glass-surface;
  border-radius: 22px;
}

.ly-doc-card:hover {
  transform: translateY(-3px);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
}

.ly-doc-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.ly-doc-card__title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-doc-card__ver {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.ly-doc-card__desc {
  margin: 0;
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.ly-doc-card__more {
  font-size: 13px;
  font-weight: 600;
  color: var(--lingyun-primary, #{$lingyun-primary});
}
</style>
