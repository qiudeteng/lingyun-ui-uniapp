<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vuepress/client'

const props = withDefaults(
  defineProps<{
    href: string
    variant?: 'bordered-prominent' | 'glass'
  }>(),
  { variant: 'bordered-prominent' },
)

const resolvedHref = computed(() => {
  if (/^https?:\/\//.test(props.href)) return props.href
  return withBase(props.href)
})

const external = computed(() => /^https?:\/\//.test(props.href))
</script>

<template>
  <a
    class="ly-doc-btn"
    :class="`ly-doc-btn--${variant}`"
    :href="resolvedHref"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
  </a>
</template>

<style lang="scss" scoped>
@import '../../../src/uni_modules/lingyun-ui/styles/theme.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/variables.scss';
@import '../../../src/uni_modules/lingyun-ui/styles/setting/_glass.scss';

.ly-doc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 980px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.ly-doc-btn:hover {
  text-decoration: none;
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.ly-doc-btn--bordered-prominent {
  color: #fff;
  background-color: var(--lingyun-primary, #{$lingyun-primary});
  border: 0;
  box-shadow: none;
}

.ly-doc-btn--bordered-prominent:hover {
  color: #fff;
}

.ly-doc-btn--glass {
  @include lingyun-glass-control;
  min-height: 46px;
  color: var(--lingyun-label, #{$lingyun-main-color});
}

.ly-doc-btn--glass:hover {
  color: var(--lingyun-label, #{$lingyun-main-color});
}
</style>
