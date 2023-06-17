import './assets/main.css'
import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import CardHeader from "./components/CardHeader.vue";
import GLContextCard from "./components/GLContextCard.vue";
import ModelAttributeCard from "./components/ModelAttributeCard.vue";
import CameraUniformCard from "./components/CameraUniformCard.vue";
import 'element-plus/dist/index.css'

const app = createApp(App);
app.component('card-header', CardHeader);
app.component('swl-gl-context', GLContextCard);
app.component('swl-model-attribute', ModelAttributeCard);
app.component('swl-camera-uniform', CameraUniformCard);
app.use(ElementPlus);
app.mount('#app');
