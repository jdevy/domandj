import { createApp } from 'vue'
import './styles/style.css'
import App from './App.vue'
import VueKonva from 'vue-konva';

createApp(App).use(VueKonva).mount('#app');
