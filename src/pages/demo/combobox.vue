<template>
  <lingyun-app-page title="Combobox">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Combobox</lingyun-text>
        <lingyun-text type="subtitle" block>
          可搜索选择 · 字段触发 + 搜索列表
        </lingyun-text>
      </view>

      <lingyun-section title="基础选择" hint="v-model · 可搜索">
        <lingyun-combobox
          v-model="store"
          label="配送门店"
          :items="stores"
          clearable
          @change="onChange"
          @open="onOpen"
          @close="onClose"
          @search="onSearch"
        />
        <lingyun-text type="caption" color="secondary" block class="hint">
          已选：{{ selectedLabel || '未选择' }}
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="带说明" hint="description · 禁用项">
        <lingyun-combobox
          v-model="channel"
          label="配送方式"
          placeholder="请选择配送方式"
          :items="channels"
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="禁用 / 只读" hint="disabled · readonly">
        <lingyun-combobox
          :model-value="store"
          label="禁用"
          :items="stores"
          disabled
        />
        <view class="spacer" />
        <lingyun-combobox
          :model-value="store"
          label="只读"
          :items="stores"
          readonly
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
import { computed, ref } from 'vue'
import type {
  LingyunComboboxChangePayload,
  LingyunComboboxItem,
} from '@/uni_modules/lingyun-ui/components/lingyun-combobox/types'

const stores: LingyunComboboxItem[] = [
  { label: '酒仙桥店', value: 'jiuxianqiao', description: '北京市朝阳区酒仙桥路 12 号' },
  { label: '望京店', value: 'wangjing', description: '北京市朝阳区望京街 9 号' },
  { label: '三里屯店', value: 'sanlitun', description: '北京市朝阳区三里屯路 19 号' },
  { label: '国贸店', value: 'guomao', description: '北京市朝阳区建国门外大街 1 号' },
  { label: '中关村店', value: 'zhongguancun', description: '北京市海淀区中关村大街 27 号' },
  { label: '西单店', value: 'xidan', description: '北京市西城区西单北大街 131 号', disabled: true },
]

const channels: LingyunComboboxItem[] = [
  { label: '门店自提', value: 'pickup', description: '到店取货，免配送费' },
  { label: '同城配送', value: 'delivery', description: '约 30 分钟送达' },
  { label: '冷链快递', value: 'express', description: '次日达，适合远距离' },
]

const store = ref<string | number | null>('jiuxianqiao')
const channel = ref<string | number | null>('delivery')
const lastAction = ref('')

const selectedLabel = computed(
  () => stores.find((item) => String(item.value) === String(store.value))?.label || '',
)

function onChange(payload: LingyunComboboxChangePayload) {
  lastAction.value = payload.item ? `选择：${payload.item.label}` : '清除选择'
}

function onOpen() {
  lastAction.value = '打开选择列表'
}

function onClose() {
  lastAction.value = '关闭选择列表'
}

function onSearch(query: string) {
  if (query) lastAction.value = `搜索：${query}`
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

.hint {
  padding-top: 8px;
}

.spacer {
  height: 12px;
}
</style>
