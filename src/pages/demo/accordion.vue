<template>
  <lingyun-app-page title="Accordion">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Accordion</lingyun-text>
        <lingyun-text type="subtitle" block>
          折叠分组 · 单开 / 多开 · 自定义内容
        </lingyun-text>
      </view>

      <lingyun-section title="FAQ · 单开" hint="v-model=string">
        <lingyun-accordion
          v-model="faqOpen"
          :items="faqItems"
          @change="onChange"
        />
        <lingyun-text type="caption" color="secondary" block class="hint">
          当前展开：{{ faqOpen || '无' }}
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="设置 · 多开 + 自定义内容" hint="multiple · content slot">
        <template #extra>
          <view class="actions">
            <lingyun-button
              variant="borderless"
              size="small"
              text="全部展开"
              @click="accordionRef?.openAll()"
            />
            <lingyun-button
              variant="borderless"
              size="small"
              text="全部收起"
              @click="accordionRef?.closeAll()"
            />
          </view>
        </template>
        <lingyun-accordion
          ref="accordionRef"
          v-model="settingOpen"
          multiple
          :items="settingItems"
          @change="onChange"
        >
          <template #content="{ item }">
            <view class="setting-content">
              <text class="setting-content__text">{{ item.content }}</text>
              <lingyun-tag v-if="item.key === 'notify'" text="推荐开启" color="blue" />
            </view>
          </template>
        </lingyun-accordion>
        <lingyun-text type="caption" color="secondary" block class="hint">
          已展开 {{ settingOpen.length }} 项
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="含禁用项" hint="disabled">
        <lingyun-accordion v-model="disabledOpen" :items="disabledItems" />
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
import type {
  LingyunAccordionChangePayload,
  LingyunAccordionItem,
} from '@/uni_modules/lingyun-ui/components/lingyun-accordion/types'

const faqItems: LingyunAccordionItem[] = [
  {
    key: 'delivery',
    title: '配送时间可以修改吗？',
    subtitle: '下单后 30 分钟内',
    content: '下单后 30 分钟内可联系门店修改配送时间；超过 30 分钟请联系客服协调。',
  },
  {
    key: 'storage',
    title: '冰淇淋蛋糕如何保存？',
    content: '建议 -18°C 冷冻保存，食用前 10–15 分钟取出回温，口感更好。',
  },
  {
    key: 'invoice',
    title: '可以开具发票吗？',
    subtitle: '支持电子普通发票',
    content: '结算页填写抬头与税号，订单完成后会发送电子发票到预留邮箱。',
  },
]

const settingItems: LingyunAccordionItem[] = [
  {
    key: 'notify',
    title: '订单通知',
    subtitle: '制作、配送、签收',
    content: '接收订单状态变化提醒，及时了解制作与配送进度。',
  },
  {
    key: 'member',
    title: '会员权益',
    subtitle: '积分、生日券、专属价',
    content: '会员日双倍积分，生日月自动发放蛋糕券。',
  },
  {
    key: 'privacy',
    title: '隐私与地址',
    subtitle: '收货地址、手机号',
    content: '地址仅用于订单配送，可在「地址管理」中修改或删除。',
  },
]

const disabledItems: LingyunAccordionItem[] = [
  { key: 'normal', title: '可展开项', content: '这是正常可展开的内容。' },
  {
    key: 'locked',
    title: '暂不可用',
    subtitle: '需要门店管理员权限',
    content: '无权限时不会展开。',
    disabled: true,
  },
]

const faqOpen = ref('delivery')
const settingOpen = ref<string[]>(['notify'])
const disabledOpen = ref('')
const lastAction = ref('')
const accordionRef = ref<{ openAll: () => void; closeAll: () => void } | null>(null)

function onChange(payload: LingyunAccordionChangePayload) {
  lastAction.value = `${payload.open ? '展开' : '收起'} ${
    payload.key || '全部'
  }`
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
  padding: 24px 20px 8px;
}

.hint {
  padding-top: 8px;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.setting-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.setting-content__text {
  flex: 1;
  font-size: 15px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}
</style>
