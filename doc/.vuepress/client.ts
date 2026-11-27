import { defineClientConfig } from 'vuepress/client'
import { onMounted } from 'vue'
import PhonePreview from './components/PhonePreview.vue'
import HomeLayout from './layouts/HomeLayout.vue'
import { installLingyunH5Scrollbar } from '../../src/uni_modules/lingyun-ui/utils/h5Scrollbar'

export default defineClientConfig({
  layouts: {
    HomeLayout,
  },
  rootComponents: [PhonePreview],
  setup() {
    /* 文档壳页面级滚动改用悬浮滚动条：原生条不占布局，长页面体验与演示应用一致 */
    onMounted(() => {
      installLingyunH5Scrollbar()
    })
  },
})
