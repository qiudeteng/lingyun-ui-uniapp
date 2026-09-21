<template>
  <lingyun-app-page title="Popover">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Popover</text>
        <text class="hero__desc">方向 · 箭头位置 · 尺寸</text>
      </view>

      <lingyun-section title="Direction">
        <view class="compass">
          <view class="compass__row compass__row--center">
            <lingyun-popover
              :show="which === 'top'"
              placement="top"
              @update:show="onShow('top', $event)"
            >
              <template #trigger>
                <lingyun-button size="small" text="Top" @click="toggle('top')" />
              </template>
              <text class="tip">箭头朝上，面板在触发器上方。</text>
            </lingyun-popover>
          </view>
          <view class="compass__row compass__row--spread">
            <lingyun-popover
              :show="which === 'right'"
              placement="right"
              @update:show="onShow('right', $event)"
            >
              <template #trigger>
                <lingyun-button size="small" text="Right" @click="toggle('right')" />
              </template>
              <text class="tip">箭头朝左，面板在右侧。</text>
            </lingyun-popover>
            <lingyun-popover
              :show="which === 'left'"
              placement="left"
              @update:show="onShow('left', $event)"
            >
              <template #trigger>
                <lingyun-button size="small" text="Left" @click="toggle('left')" />
              </template>
              <text class="tip">箭头朝右，面板在左侧。</text>
            </lingyun-popover>
          </view>
          <view class="compass__row compass__row--center">
            <lingyun-popover
              :show="which === 'bottom'"
              placement="bottom"
              @update:show="onShow('bottom', $event)"
            >
              <template #trigger>
                <lingyun-button size="small" text="Bottom" @click="toggle('bottom')" />
              </template>
              <text class="tip">箭头朝下，面板在触发器下方。</text>
            </lingyun-popover>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="Arrow">
        <view class="row">
          <lingyun-popover
            v-for="align in aligns"
            :key="align"
            :show="which === align"
            placement="bottom"
            :arrow-align="align"
            width="240"
            @update:show="onShow(align, $event)"
          >
            <template #trigger>
              <lingyun-button size="small" :text="alignLabel[align]" @click="toggle(align)" />
            </template>
            <text class="tip">箭头 {{ alignLabel[align] }}，不跟按钮中心。</text>
          </lingyun-popover>
        </view>
      </lingyun-section>

      <lingyun-section title="Size" is-last>
        <view class="sizes">
          <view v-for="item in sizes" :key="item.key" class="sizes__item">
            <lingyun-popover
              :show="which === item.key"
              placement="bottom"
              :width="item.width"
              @update:show="onShow(item.key, $event)"
            >
              <template #trigger>
                <lingyun-button
                  size="small"
                  :text="item.label"
                  @click="toggle(item.key)"
                />
              </template>
              <text class="tip" :class="'tip--' + item.key">{{ item.text }}</text>
            </lingyun-popover>
          </view>
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const which = ref('')
  const aligns = ['leading', 'middle', 'trailing'] as const
  const alignLabel: Record<(typeof aligns)[number], string> = {
    leading: 'Leading',
    middle: 'Middle',
    trailing: 'Trailing',
  }
  const sizes = [
    { key: 'small', label: 'Small · 168', width: 168, text: '短说明。' },
    {
      key: 'medium',
      label: 'Medium · 240',
      width: 240,
      text: '中等宽度。箭头仍指向按钮，左右留出面板边距。',
    },
    {
      key: 'large',
      label: 'Large · 320',
      width: 320,
      text: '大号面板用来放稍长的说明。宽度由 width 指定，高度随文案增高，四个方向的箭头描边在暗黑下也能看清。',
    },
  ]

  function toggle(key: string): void {
    which.value = which.value === key ? '' : key
  }

  function onShow(key: string, val: boolean): void {
    if (val) which.value = key
    else if (which.value === key) which.value = ''
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .compass {
    padding: 28px 8px 12px;
  }

  .compass__row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .compass__row--center {
    justify-content: center;
  }

  .compass__row--spread {
    justify-content: space-between;
    margin: 36px 0;
  }

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 8px 4px 12px;
  }

  .sizes {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 4px 16px;
  }

  .sizes__item {
    margin-bottom: 12px;
  }

  .tip {
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .tip--large {
    font-size: 15px;
    line-height: 22px;
  }
</style>
