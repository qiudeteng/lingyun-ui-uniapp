<template>
  <lingyun-app-page title="Rating">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Rating</lingyun-text>
        <lingyun-text type="subtitle" block>
          评分 · 整星 / 半星 · 只读 / 禁用 / 可清除
        </lingyun-text>
      </view>

      <lingyun-section title="基础评分" hint="v-model · showValue">
        <lingyun-rating
          v-model="score"
          show-value
          value-suffix=" / 5"
          @change="onChange"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            当前评分：{{ score }}
          </lingyun-text>
          <lingyun-button
            variant="glass"
            size="small"
            text="重置"
            @click="scoreRef?.reset()"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="半星评分" hint="allowHalf · 3.5 星">
        <lingyun-rating
          v-model="halfScore"
          allow-half
          show-value
          value-suffix=" / 5"
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="只读 / 禁用" hint="readonly · disabled">
        <lingyun-rating :model-value="4" readonly show-value value-suffix=" / 5" />
        <view class="spacer" />
        <lingyun-rating
          :model-value="2.5"
          allow-half
          disabled
          show-value
          value-suffix=" / 5"
        />
      </lingyun-section>

      <lingyun-section title="可清除" hint="clearable · 再点当前分值归零">
        <lingyun-rating
          v-model="clearableScore"
          clearable
          show-value
          value-suffix=" / 5"
          @change="onChange"
        />
      </lingyun-section>

      <lingyun-section title="尺寸与颜色" hint="size=32 · activeColor=green">
        <lingyun-rating
          v-model="customScore"
          :size="32"
          active-color="green"
          @change="onChange"
        />
        <view class="spacer" />
        <lingyun-rating
          v-model="smallScore"
          :size="18"
          allow-half
          active-color="#ff2d55"
          @change="onChange"
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
import { ref } from 'vue'
import type { LingyunRatingChangePayload } from '@/uni_modules/lingyun-ui/components/lingyun-rating/types'

const score = ref(3)
const halfScore = ref(3.5)
const clearableScore = ref(4)
const customScore = ref(4)
const smallScore = ref(2.5)
const scoreRef = ref<{ reset: () => void } | null>(null)
const lastAction = ref('')

function onChange(payload: LingyunRatingChangePayload) {
  lastAction.value = `评分 ${payload.previous} → ${payload.value}`
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
    var(--lingyun-bg-grouped, #f2f2f7);
}

.hero {
  padding: 8px 4px 15px;
}

.result {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
}

.spacer {
  height: 14px;
}
</style>
