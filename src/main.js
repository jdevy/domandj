import { createApp } from 'vue'
import './styles/style.css'
import App from './App.vue'
import VueKonva from 'vue-konva'

// Lucide icons
import { Trash, Plus, RefreshCw, Settings } from 'lucide-vue-next'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Icônes Material Design (nécessaire pour Vuetify)
import '@mdi/font/css/materialdesignicons.css'

// Création de l’instance Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(VueKonva)
app.use(vuetify)

// Composants Lucide
app.component('LucideTrash', Trash)
app.component('LucidePlus', Plus)
app.component('LucideSettings', Settings)
app.component('LucideRefreshCw', RefreshCw)

app.mount('#app')
