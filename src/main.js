import { createApp } from 'vue'
import './styles/style.css'
import App from './App.vue'
import VueKonva from 'vue-konva';
import { Trash, Plus } from 'lucide-vue-next'

const app = createApp(App)

app.use(VueKonva)
app.component('LucideTrash', Trash)
app.component('LucidePlus', Plus)
app.mount('#app')