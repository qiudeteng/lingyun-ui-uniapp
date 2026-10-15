<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import HomeLanding from '../components/HomeLanding.vue'

onMounted(() => {
  document.documentElement.classList.add('ly-home-root')
  document.body.classList.add('ly-home-root')
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('ly-home-root')
  document.body.classList.remove('ly-home-root')
})
</script>

<template>
  <ParentLayout>
    <template #page>
      <main class="ly-home-page">
        <HomeLanding />
      </main>
    </template>
  </ParentLayout>
</template>

<style lang="scss">
.ly-home-page {
  box-sizing: border-box;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  min-height: calc(100vh - var(--navbar-height, 3.6rem));
  background:
    radial-gradient(120% 80% at 10% 0%, color-mix(in srgb, var(--lingyun-system-blue, #0088ff) 18%, transparent), transparent 55%),
    radial-gradient(100% 70% at 90% 18%, color-mix(in srgb, var(--lingyun-system-green, #34c759) 14%, transparent), transparent 50%),
    var(--lingyun-bg-grouped-primary, #f2f2f7);
  color: var(--lingyun-label, #1c1c1e);
}
</style>
