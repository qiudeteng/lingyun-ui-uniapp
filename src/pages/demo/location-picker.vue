<template>
  <lingyun-app-page title="Location Picker">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Location Picker</lingyun-text>
        <lingyun-text type="subtitle" block>
          位置选择 · 门店 / 收货地址 · 腾讯地图
        </lingyun-text>
      </view>

      <lingyun-section title="基础选择" hint="v-model · uni.chooseLocation">
        <lingyun-location-picker
          v-model="location"
          @change="onChange"
          @open="onOpen"
          @cancel="onCancel"
          @error="onError"
        />
        <view v-if="location" class="result">
          <lingyun-text type="caption" color="secondary" block>
            {{ location.name }}
          </lingyun-text>
          <lingyun-text type="caption" color="tertiary" block>
            {{ location.address }}
          </lingyun-text>
          <lingyun-text type="caption" color="tertiary" block>
            {{ location.latitude }}, {{ location.longitude }}
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="已选回显" hint="readonly · showCoordinate">
        <lingyun-location-picker
          :model-value="savedLocation"
          readonly
          show-coordinate
        />
      </lingyun-section>

      <lingyun-section title="禁用" hint="disabled">
        <lingyun-location-picker disabled placeholder="不可选择位置" />
      </lingyun-section>

      <lingyun-section title="平台说明" hint="H5 / 小程序 / App">
        <lingyun-text type="caption" color="secondary" block>
          H5 使用腾讯地图 Key（VITE_TENCENT_MAP_KEY）；微信小程序使用原生
          chooseLocation，需要已配置地理位置权限。
        </lingyun-text>
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
import { ref } from 'vue'
import type { LingyunLocation } from '@/uni_modules/lingyun-ui/components/lingyun-location-picker/types'

const location = ref<LingyunLocation | null>(null)
const savedLocation = ref<LingyunLocation>({
  name: '八喜冰淇淋蛋糕（北京酒仙桥店）',
  address: '北京市朝阳区酒仙桥路 12 号',
  latitude: 39.968,
  longitude: 116.494,
})
const lastAction = ref('')

function onChange(value: LingyunLocation) {
  lastAction.value = `已选择：${value.name}`
}

function onOpen() {
  lastAction.value = '打开位置选择'
}

function onCancel() {
  lastAction.value = '取消位置选择'
}

function onError(payload: { message: string }) {
  lastAction.value = `位置选择失败：${payload.message}`
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

.result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 10px;
}
</style>
