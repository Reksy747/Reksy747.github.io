import { createApp } from 'vue'
import App from './App.vue'
import { pinia, initStore, startUrlSync } from './state/store.js'
import './styles/tokens.scss'
import './styles/base.scss'

initStore(window)
startUrlSync(window)
createApp(App).use(pinia).mount('#app')
