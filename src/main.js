import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
import { useUiStore } from '@/stores/ui'

import '@/assets/styles/tokens.css'
import '@/assets/styles/base.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Saqlangan mavzuni darhol qo'llaymiz (miltillashsiz)
const ui = useUiStore(pinia)
ui.applyTheme(ui.theme)

app.use(router)
app.mount('#app')
