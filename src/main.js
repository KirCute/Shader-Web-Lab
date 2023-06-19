import './assets/main.css'
import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import CardHeader from "./components/CardHeader.vue";
import GLContextCard from "./components/GLContextCard.vue";
import ModelAttributeCard from "./components/ModelAttributeCard.vue";
import CameraUniformCard from "./components/CameraUniformCard.vue";
import CustomFloatUniformCard from "./components/CustomFloatUniformCard.vue";
import CustomVec2UniformCard from "./components/CustomVec2UniformCard.vue";
import CustomVec3UniformCard from "./components/CustomVec3UniformCard.vue";
import CustomVec4UniformCard from "./components/CustomVec4UniformCard.vue";
import CustomMat2UniformCard from "./components/CustomMat2UniformCard.vue";
import CustomMat3UniformCard from "./components/CustomMat3UniformCard.vue";
import CustomMat4UniformCard from "./components/CustomMat4UniformCard.vue";
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);
app.component('card-header', CardHeader);
app.component('swl-gl-context', GLContextCard);
app.component('swl-model-attribute', ModelAttributeCard);
app.component('swl-camera-uniform', CameraUniformCard);
app.component('swl-float-uniform', CustomFloatUniformCard);
app.component('swl-vec2-uniform', CustomVec2UniformCard);
app.component('swl-vec3-uniform', CustomVec3UniformCard);
app.component('swl-vec4-uniform', CustomVec4UniformCard);
app.component('swl-mat2-uniform', CustomMat2UniformCard);
app.component('swl-mat3-uniform', CustomMat3UniformCard);
app.component('swl-mat4-uniform', CustomMat4UniformCard);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app');