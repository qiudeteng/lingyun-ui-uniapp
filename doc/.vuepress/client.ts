import { defineClientConfig } from 'vuepress/client'
import PhonePreview from './components/PhonePreview.vue'
import HomeLayout from './layouts/HomeLayout.vue'

export default defineClientConfig({
  layouts: {
    HomeLayout,
  },
  rootComponents: [PhonePreview],
})
