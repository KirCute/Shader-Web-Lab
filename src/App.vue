<template>
  <el-container class="swl-all">
    <el-header class="swl-header-bar">
      <img src="./assets/logo.png" alt="Shader Web Lab" style="width: 130px; height: 30px;"/>
      <div style="flex: 1;"/>
      <el-link class="swl-header-button">
        <el-icon :size="20"><Sunny/></el-icon>
      </el-link>
      <el-link class="swl-header-button">
        <el-icon :size="20"><Moon/></el-icon>
      </el-link>
      <el-link class="swl-header-button">
        <el-icon :size="20"><Share/></el-icon>
      </el-link>
      <el-link class="swl-header-button" href="/">
        <el-icon :size="20"><Avatar/></el-icon>
      </el-link>
      <el-link class="swl-header-button">
        <el-icon :size="20"><InfoFilled/></el-icon>
      </el-link>
    </el-header>

    <el-container class="swl-content">
      <el-aside class="swl-tools-bar">
        <div style="flex: 1;"/>
        <el-badge is-dot class="swl-tools-button" :hidden="!log.fragmentCompileError && !log.vertexCompileError && !log.shaderLinkError">
          <el-link :underline="false" style="background: transparent;" @click="logDrawerVisible = !logDrawerVisible">
            <el-icon size="1.6vw"><Bell/></el-icon>
          </el-link>
          <el-drawer v-model="logDrawerVisible" :title="$t('shaderLog.title')" direction="ltr">
            <el-text tag="b" size="large" style="font-weight: bold;">{{ $t('shaderLog.vertShader') }}</el-text>
            <p>{{ log.vertexCompileLog }}</p>
            <el-divider/>
            <el-text tag="b" size="large" style="font-weight: bold;">{{ $t('shaderLog.fragShader') }}</el-text>
            <p>{{ log.fragmentCompileLog }}</p>
            <el-divider/>
            <el-text tag="b" size="large" style="font-weight: bold;">{{ $t('shaderLog.link') }}</el-text>
            <p>{{ log.shaderLinkLog }}</p>
          </el-drawer>
        </el-badge>
        <el-link :underline="false" class="swl-tools-button" @click="settingDrawerVisible = !settingDrawerVisible">
          <el-icon size="1.6vw"><Setting/></el-icon>
        </el-link>
        <el-drawer v-model="settingDrawerVisible" :title="$t('setting.title')" direction="ltr">
          <el-form>
            <el-form-item label="Language">
              <el-select v-model="usingLanguage" @change="changeLang">
                <el-option v-for="lang in validLanguages" :key="lang.symbol" :label="lang.name" :value="lang.symbol"/>
              </el-select>
            </el-form-item>
          </el-form>
        </el-drawer>
      </el-aside>

      <el-aside class="swl-aside">
        <el-header ref="canvasContainer" class="swl-canvas-container">
          <canvas ref="canvas" class="swl-canvas"/>
        </el-header>
        <el-main class="swl-attributes-container">
          <el-scrollbar style="flex-grow: 1;">
            <swl-gl-context ref="glContext" class="swl-attributes"/>
            <swl-model-attribute ref="attributeModel" :gl="gl" :shaderProgram="shaderProgram" class="swl-attributes"/>
            <swl-camera-uniform ref="uniformCamera" class="swl-attributes"/>
            <div v-for="uniform in customUniforms" :key="uniform.id">
              <swl-float-uniform v-if="uniform.type === 'float'" ref="customUniforms" :id="uniform.id" :parent="this"
                                 :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                 class="swl-attributes"/>
              <swl-vec2-uniform v-if="uniform.type === 'vec2'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-vec3-uniform v-if="uniform.type === 'vec3'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-vec4-uniform v-if="uniform.type === 'vec4'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-mat2-uniform v-if="uniform.type === 'mat2'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-mat3-uniform v-if="uniform.type === 'mat3'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-mat4-uniform v-if="uniform.type === 'mat4'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
              <swl-time-uniform v-if="uniform.type === 'time'" ref="customUniforms" :id="uniform.id" :parent="this"
                                :name="uniform.name" :init-value="uniform.initValue" :expanded="uniform.expanded"
                                class="swl-attributes"/>
            </div>
            <el-popover placement="right" :width="390" :visible="addUniformPopoverVisible">
              <template #reference>
                <el-button class="swl-attributes" circle @click="addUniformPopoverVisible = !addUniformPopoverVisible"
                           @blur="addUniformPopoverVisible = false" type="primary">
                  <el-icon><Plus/></el-icon>
                </el-button>
              </template>
              <el-col>
                <el-row style="margin-bottom: 10px;">
                  <el-button @click="createNewUniform('float')">Float</el-button>
                  <el-button @click="createNewUniform('vec2')">Vec2</el-button>
                  <el-button @click="createNewUniform('vec3')">Vec3</el-button>
                  <el-button @click="createNewUniform('vec4')">Vec4</el-button>
                  <el-button @click="createNewUniform('mat2')">Mat2</el-button>
                </el-row>
                <el-row>
                  <el-button @click="createNewUniform('mat3')">Mat3</el-button>
                  <el-button @click="createNewUniform('mat4')">Mat4</el-button>
                  <el-button @click="createNewUniform('time')">Time</el-button>
                </el-row>
              </el-col>
            </el-popover>
          </el-scrollbar>
        </el-main>
      </el-aside>
      <el-aside class="swl-main">
        <el-header class="swl-vert-container">
          <v-ace-editor v-model:value="vertShader" @change="recompileShader" lang="glsl" theme="github" class="swl-vert"/>
        </el-header>
        <el-footer class="swl-frag-container">
          <v-ace-editor v-model:value="fragShader" @change="recompileShader" lang="glsl" theme="github" class="swl-frag"/>
        </el-footer>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script setup>
import {useI18n} from "vue-i18n";
import {validLanguages} from "./lang";

const {locale} = useI18n();

const changeLang = (val) => {
  locale.value = val;
  localStorage.setItem('lang', val);
};
</script>

<script>
import {VAceEditor} from 'vue3-ace-editor';
import ace from 'ace-builds';
import glslUrl from 'ace-builds/src-noconflict/mode-glsl?url';
import snippetsGlslUrl from 'ace-builds/src-noconflict/snippets/glsl?url';
import themeGithubUrl from 'ace-builds/src-noconflict/theme-github?url';
import {Avatar, Bell, InfoFilled, Moon, Plus, Setting, Share, Sunny} from "@element-plus/icons-vue";
import {attachPrefixToUrl, safeJsonParse} from "./utils";
import globalConfig from '../globalConfig.js';
import {convertToCurrentVersion} from "./query";

ace.config.setModuleUrl('ace/mode/glsl', glslUrl);
ace.config.setModuleUrl('ace/snippets/glsl', snippetsGlslUrl);
ace.config.setModuleUrl('ace/theme/github', themeGithubUrl);

const defaultQuery = {
  version: globalConfig.version,
  context: {
    backgroundColor: [0., 0., 0., 1.],
    blend: false,
    cull: true,
    depthTest: true,
    dither: false,
    polygonOffsetFill: false,
    sampleAlphaToCoverage: false,
    smpCoverage: false,
    scissorTest: false,
    stencilTest: false
  },
  model: {
    upload: [],
    selected: undefined,
    attributePosition: 'aPosition',
    attributeNormal: 'aNormal',
    attributeTexCoord: 'aTexCoord',
    uniModelMat: 'uModelMatrix',
    pose: [0., 0., 0., 0., 0., 0.]
  },
  camera: {
    type: 2,
    uniViewMat: 'uViewMatrix',
    position: [0., 0., 0.],
    rotation: [-0.785, 0.785, 0.],
    depth: 10.,
    uniProjectionMat: 'uProjectionMatrix',
    fov: 0.785,
    ortRecWidth: 1.6,
    nearClip: 0.1,
    farClip: 20.,
  },
  uniforms: [
    {type: 'vec3', initValue: {value: [0., 8., 0.]}, name: 'lightPosition'},
    {type: 'vec3', initValue: {value: [.2, .2, .2]}, name: 'ambient'},
    {type: 'vec3', initValue: {value: [.5, .5, .5]}, name: 'diffuse'},
    {type: 'vec3', initValue: {value: [.7, .7, .7]}, name: 'specular'},
    {type: 'vec3', initValue: {value: [1., .5, .5]}, name: 'objectColor'},
    {type: 'float', initValue: {value: 120.}, name: 'shininess'}
  ]
}

export default {
  data() {
    return {
      gl: undefined,
      vertShader: '',
      fragShader: '',
      shaderProgram: undefined,
      customUniforms: [],
      nextCustomUniformId: 0,
      addUniformPopoverVisible: false,
      logDrawerVisible: false,
      settingDrawerVisible: false,
      log: {
        vertexCompileError: false,
        vertexCompileLog: "",
        fragmentCompileError: false,
        fragmentCompileLog: "",
        shaderLinkError: false,
        shaderLinkLog: ""
      },
      usingLanguage: localStorage.getItem('lang') || 'zhCN'
    };
  },
  components: {
    Plus, Avatar, InfoFilled, Sunny, Moon, Share, Bell, Setting,
    VAceEditor,
  },
  methods: {
    redraw() {
      try {
        const canvas = this.$refs.canvas;
        const parentElement = canvas.parentElement;
        canvas.width = parentElement.clientWidth;
        canvas.height = parentElement.clientHeight;
        const gl = this.gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        this.$refs.uniformCamera.bindUniform(gl, this.shaderProgram);
        this.$refs.attributeModel.bindUniform(gl, this.shaderProgram);
        if (Array.isArray(this.$refs.customUniforms)) {
          this.$refs.customUniforms.forEach(uniform => uniform.bindUniform(gl, this.shaderProgram));
        } else if (typeof (this.$refs.customUniforms) === 'object') {
          this.$refs.customUniforms.bindUniform(gl, this.shaderProgram);
        }
        this.$refs.glContext.clearColor(gl);
        this.$refs.attributeModel.glDraw(gl);
      } catch (err) {
        console.log(err);
      }
      requestAnimationFrame(this.redraw);
    },
    recompileShader() {
      if (this.gl === undefined) return;
      const gl = this.gl;

      let vertShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertShader, this.vertShader);
      gl.compileShader(vertShader);
      if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        this.log.vertexCompileLog = gl.getShaderInfoLog(vertShader);
        this.log.vertexCompileError = true;
      } else {
        this.log.vertexCompileLog = this.$t('shaderLog.compilePass');
        this.log.vertexCompileError = false;
      }

      let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShader, this.fragShader);
      gl.compileShader(fragShader);
      if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        this.log.fragmentCompileLog = gl.getShaderInfoLog(fragShader);
        this.log.fragmentCompileError = true;
      } else {
        this.log.fragmentCompileLog = this.$t('shaderLog.compilePass');
        this.log.fragmentCompileError = false;
      }

      if (this.log.vertexCompileError || this.log.fragmentCompileError) {
        this.log.shaderLinkLog = this.$t('shaderLog.unlinked');
        return;
      }
      this.shaderProgram = gl.createProgram();
      gl.attachShader(this.shaderProgram, vertShader);
      gl.attachShader(this.shaderProgram, fragShader);
      gl.linkProgram(this.shaderProgram);
      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        this.log.shaderLinkLog = gl.getProgramInfoLog(this.shaderProgram);
        this.log.shaderLinkError = true;
        return;
      } else {
        this.log.shaderLinkLog = this.$t('shaderLog.linkPass');
        this.log.shaderLinkError = false;
      }

      gl.useProgram(this.shaderProgram);
      this.$refs.attributeModel.requestRebindVertex();
    },
    createNewUniform(type, initValue = undefined, name = undefined, expanded = true) {
      this.customUniforms.push({
        id: this.nextCustomUniformId,
        type: type,
        initValue: initValue,
        name: name,
        expanded: expanded
      });
      this.nextCustomUniformId++;
    },
    deleteUniform(id) {
      let idx = 0;
      while (idx < this.customUniforms.length && this.customUniforms[idx].id !== id) idx++;
      if (idx < this.customUniforms.length) this.customUniforms.splice(idx, 1);
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('vertShader')) {
      this.vertShader = urlParams.get('vertShader');
    } else {
      const vertXhr = new XMLHttpRequest();
      vertXhr.open('GET', attachPrefixToUrl('/assets/default.vert'));
      vertXhr.onreadystatechange = () => {
        if (vertXhr.readyState === 4 && vertXhr.status === 200) {
          this.vertShader = vertXhr.responseText;
          this.recompileShader();
        }
      };
      vertXhr.send();
    }
    if (urlParams.has('fragShader')) {
      this.fragShader = urlParams.get('fragShader');
    } else {
      const fragXhr = new XMLHttpRequest();
      fragXhr.open('GET', attachPrefixToUrl('/assets/default.frag'));
      fragXhr.onreadystatechange = () => {
        if (fragXhr.readyState === 4 && fragXhr.status === 200) {
          this.fragShader = fragXhr.responseText;
          this.recompileShader();
        }
      };
      fragXhr.send();
    }
    this.recompileShader();
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    let customQuery = convertToCurrentVersion(safeJsonParse(urlParams.get('custom')));
    const queryParseErr = urlParams.has('custom') && customQuery === undefined;
    customQuery = customQuery || defaultQuery;

    if (queryParseErr) {
      // TODO summon error dialog
    }
    if (Array.isArray(customQuery.uniforms)) {
      customQuery.uniforms.forEach(uniform => this.createNewUniform(uniform.type, uniform.initValue, uniform.name, false));
    }
    this.$refs.attributeModel.loadQuery(customQuery.model);
    this.$refs.attributeModel.uploadModels([
      {name: this.$t('variable.model.prefab.cube'), path: attachPrefixToUrl('/assets/models/cube.fbx')},
      {name: this.$t('variable.model.prefab.sphere'), path: attachPrefixToUrl('/assets/models/sphere.fbx')}
    ]);
    this.$refs.uniformCamera.loadQuery(customQuery.camera);
    const canvas = this.$refs.canvas;
    this.gl = canvas.getContext('webgl');
    this.$refs.glContext.initializeGL(this.gl);
    this.$refs.glContext.loadQuery(customQuery.context);
    requestAnimationFrame(this.redraw);
  }
};
</script>

<style scoped>
.swl-all {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow: hidden;
}

.swl-header-bar {
  width: 100%;
  height: 40px;
  overflow: hidden;
  display: flex;
  padding: 5px 40px;
  border-bottom: 1px solid #D4D7DE;
  background-image: url('/assets/header_background.png');
  background-repeat: repeat;
}

.swl-header-button {
  margin: 5px;
  user-select: none;
  background: transparent;
}

.swl-tools-bar {
  width: 4vw;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0.7vw;
  border-right: 1px solid #D4D7DE;
  background-image: url('/assets/header_background.png');
  background-repeat: repeat;
}

.swl-tools-button {
  margin: 0.5vw;
  user-select: none;
  background: transparent;
}

.swl-content {
  flex-grow: 1;
  overflow: hidden;
}

.swl-aside {
  width: 40vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.swl-main {
  width: 56vw;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid #D4D7DE;
}

.swl-canvas-container {
  width: 100%;
  padding-bottom: 56.25%;
  position: relative;
  overflow: hidden;
}

.swl-attributes-container {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1px 0;
}

.swl-attributes {
  margin: 10px var(--el-main-padding);
}

.swl-vert-container {
  width: 100%;
  height: 50%;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  border-bottom: 1px solid #D4D7DE;
}

.swl-frag-container {
  width: 100%;
  height: 50%;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
}

.swl-vert {
  width: 100%;
  height: 100%;
}

.swl-frag {
  width: 100%;
  height: 100%;
}

.swl-canvas {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
