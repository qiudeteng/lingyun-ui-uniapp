import { defineClientConfig } from 'vuepress/client'
import PhonePreview from './components/PhonePreview.vue'

export default defineClientConfig({
  rootComponents: [PhonePreview],
})
