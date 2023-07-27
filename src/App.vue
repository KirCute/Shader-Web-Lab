<template>
  <el-container :class="'swl-all theme-' + theme">
    <el-header class="swl-header-bar">
      <div class="swl-logo"/>
      <div style="flex: 1;"/>
      <el-link class="swl-header-button" v-if="theme === 'dark'" @click="theme = 'light'">
        <el-icon :size="20"><Sunny/></el-icon>
      </el-link>
      <el-link class="swl-header-button" v-else @click="theme = 'dark'">
        <el-icon :size="20"><Moon/></el-icon>
      </el-link>
      <el-link class="swl-header-button" @click="openShareDialog">
        <el-icon :size="20"><Share/></el-icon>
        <el-dialog v-model="share.dialogVisible" :title="$t('share.title')" align-center>
          {{ $t('share.description.1') }} <br><br>
          {{ $t('share.description.2') }} <br><br>
          <el-text tag="b" size="large" style="font-weight: bold;">{{ $t('share.uploadTitle') }}</el-text><br>
          <el-table :data="share.custom.model.upload" style="width: 100%" height="30vh">
            <el-table-column align="left" width="50">
              <template #header>
                <el-link style="background-color: transparent;" @click="addNewShareUpload">
                  <el-icon><Plus/></el-icon>
                </el-link>
              </template>
              <template #default="scope">
                <el-link style="background-color: transparent;" @click="removeShareUpload(scope.$index)">
                  <el-icon><Minus/></el-icon>
                </el-link>
              </template>
            </el-table-column>
            <el-table-column :label="$t('share.uploadNameHeader')" width="200">
              <template #default="scope">
                <el-input v-model="share.upload[scope.$index].name" @input="genShareLink"/>
              </template>
            </el-table-column>
            <el-table-column :label="$t('share.uploadUrlHeader')">
              <template #default="scope">
                <el-input v-model="share.upload[scope.$index].path" @input="genShareLink"/>
              </template>
            </el-table-column>
          </el-table><br>
          <el-text tag="b" size="large" style="font-weight: bold;">{{ $t('share.defaultUsingTitle') }}</el-text><br><br>
          <el-form label-width="70px">
            <el-form-item :label="$t('share.modelTitle')">
              <el-input v-model="share.selected.fileName" :placeholder="$t('share.modelFileNamePlaceholder')" @input="genShareLink" class="inline-first"/>
              <el-input v-model="share.selected.meshName" :placeholder="$t('share.modelMeshNamePlaceholder')" @input="genShareLink" class="inline-last"/>
            </el-form-item>
            <el-form-item :label="$t('share.materialTitle')">
              <el-input v-model="share.materialSelected.fileName" :placeholder="$t('share.materialFileNamePlaceholder')" @input="genShareLink" class="inline-first"/>
              <el-input-number v-model="share.materialSelected.index" :step="1" step-strictly class="inline-last"
                               :placeholder="$t('share.materialIndexPlaceholder')" @input="genShareLink" :min="0"/>
            </el-form-item>
          </el-form>
          <el-input v-model="share.urlContent" readonly ref="shareLinkInput">
            <template #prepend>
              <el-tooltip effect="dark" placement="bottom" :content="$t('share.selectAllTooltip')">
                <el-button @click="selectAllShareLink"> <el-icon><Edit/></el-icon> </el-button>
              </el-tooltip>
            </template>
            <template #append>
              <el-tooltip effect="dark" placement="bottom" :content="$t('share.copyTooltip')">
                <el-button @click="copyShareLink"> <el-icon><List/></el-icon> </el-button>
              </el-tooltip>
            </template>
          </el-input>
        </el-dialog>
      </el-link>
      <el-link class="swl-header-button" :href="globalConfig.githubUrl">
        <el-icon :size="20">
          <svg style="background: transparent;" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="dark-gray" id="github-repo-link-right"
                  d="M 8 3.86 C 8.7 3.86 9.38 3.95 10 4.13 C 11.55 3.09 12.22 3.31 12.22 3.31 C 12.66 4.41 12.38 5.23 12.3 5.43 C 12.81 6 13.12 6.7 13.12 7.58 C 13.12 10.65 11.25 11.33 9.47 11.53 C 9.76 11.78 10 12.26 10 13 C 10 14.08 10 14.94 10 15.21 C 10 15.42 10.15 15.67 10.55 15.59 C 13.806 14.491 16 11.437 16 8 C 16 3.58 12.42 0 8 0 Z"/>
            <use href="#github-repo-link-right" x="-16.3" style="transform: scaleX(-1);"/>
          </svg>
        </el-icon>
      </el-link>
      <el-link class="swl-header-button" :href="globalConfig.personalIndex">
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
          <el-form label-width="150px">
            <el-form-item label="Language">
              <el-select v-model="usingLanguage" @change="changeLang" style="flex: 1;">
                <el-option v-for="lang in validLanguages" :key="lang.symbol" :label="lang.name" :value="lang.symbol"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('setting.theme')">
              <el-select v-model="theme" style="flex: 1;">
                <el-option v-for="t in getAvailableThemes()" :key="t" :label="$t('theme.' + t)" :value="t"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('setting.autoSwitchMaterial')">
              <el-checkbox v-model="$refs.attributeModel.autoSwitchMaterial"/>
            </el-form-item>
            <el-form-item :label="$t('setting.maxDisToFarClip')">
              <el-input-number v-model="$refs.uniformCamera.clipMax" :step="0.1" :min="0" style="flex: 1;"/>
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
                <el-button class="swl-add-attribute-button" circle @click="addUniformPopoverVisible = !addUniformPopoverVisible"
                           @blur="addUniformPopoverVisible = false">
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
          <v-ace-editor v-model:value="vertShader" @change="recompileShader" lang="glsl" :theme="getAceTheme(theme)"
                        class="swl-vert"/>
        </el-header>
        <el-footer class="swl-frag-container">
          <v-ace-editor v-model:value="fragShader" @change="recompileShader" lang="glsl" :theme="getAceTheme(theme)"
                        class="swl-frag"/>
        </el-footer>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script setup>
import {useI18n} from "vue-i18n";
import {validLanguages} from "./lang";
import globalConfig from '../globalConfig.js';
import {getAvailableThemes, initAceTheme, getAceTheme} from "./theme";

const {locale} = useI18n();
initAceTheme();

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
import {Avatar, Bell, InfoFilled, Moon, Plus, Setting, Share, Sunny, List, Edit, Minus} from "@element-plus/icons-vue";
import {ElNotification, ElMessage} from 'element-plus';
import {attachPrefixToUrl, safeJsonParseBase64, requireResource} from "./utils";
import globalConfig from '../globalConfig.js';
import {convertToCurrentVersion} from "./query";

ace.config.setModuleUrl('ace/mode/glsl', glslUrl);
ace.config.setModuleUrl('ace/snippets/glsl', snippetsGlslUrl);

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
    upload: [
      {name: 'Demo Cube', path: attachPrefixToUrl('/assets/models/cube.fbx')},
      {name: 'Demo Sphere', path: attachPrefixToUrl('/assets/models/sphere.fbx')}
    ],
    selected: {
      fileName: 'Demo Cube',
      fileIndex: 0,
      meshName: 'Cube'
    },
    materialSelected: {
      fileName: 'Demo Cube',
      fileIndex: 0,
      index: 0
    },
    attributePosition: 'aPosition',
    attributeNormal: 'aNormal',
    attributeTexCoord: 'aTexCoord',
    uniModelMat: 'uModelMatrix',
    pose: [0., 0., 0., 0., 0., 0.],
    materialBind: []
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
    clipMax: 20.
  },
  uniforms: [
    {type: 'vec3', initValue: {value: [0., 8., 0.]}, name: 'uLightPosition'},
    {type: 'vec3', initValue: {value: [.2, .2, .2]}, name: 'uAmbient'},
    {type: 'vec3', initValue: {value: [.5, .5, .5]}, name: 'uDiffuse'},
    {type: 'vec3', initValue: {value: [.7, .7, .7]}, name: 'uSpecular'},
    {type: 'vec3', initValue: {value: [1., .5, .5]}, name: 'uObjectColor'},
    {type: 'float', initValue: {value: 25}, name: 'uShininess'},
  ]
}

export default {
  data() {
    return {
      gl: undefined,
      vertShader: '',
      fragShader: '',
      firstCompilePassed: false,
      shaderProgram: undefined,
      customUniforms: [],
      nextCustomUniformId: 0,
      addUniformPopoverVisible: false,
      logDrawerVisible: false,
      settingDrawerVisible: false,
      aboutDialogVisible: false,
      share: {
        upload: defaultQuery.model.upload,
        selected: defaultQuery.model.selected,
        materialSelected: defaultQuery.model.materialSelected,
        custom: undefined,
        urlContent: '',
        dialogVisible: false,
      },
      log: {
        vertexCompileError: false,
        vertexCompileLog: "",
        fragmentCompileError: false,
        fragmentCompileLog: "",
        shaderLinkError: false,
        shaderLinkLog: ""
      },
      usingLanguage: localStorage.getItem('lang') || 'zhCN',
      theme: ''
    };
  },
  components: {
    Plus, Avatar, InfoFilled, Sunny, Moon, Share, Bell, Setting, List, Edit, Minus,
    VAceEditor,
  },
  methods: {
    redraw() {
      if (!this.firstCompilePassed) this.firstCompilePassed = this.recompileShader();
      const canvas = this.$refs.canvas;
      const parentElement = canvas.parentElement;
      canvas.width = parentElement.clientWidth;
      canvas.height = parentElement.clientHeight;
      const gl = this.gl;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      try {
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
      }
      requestAnimationFrame(this.redraw);
    },
    recompileShader() {
      if (this.gl === undefined) return false;
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
        return false;
      }
      this.shaderProgram = gl.createProgram();
      gl.attachShader(this.shaderProgram, vertShader);
      gl.attachShader(this.shaderProgram, fragShader);
      gl.linkProgram(this.shaderProgram);
      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        this.log.shaderLinkLog = gl.getProgramInfoLog(this.shaderProgram);
        this.log.shaderLinkError = true;
        return false;
      } else {
        this.log.shaderLinkLog = this.$t('shaderLog.linkPass');
        this.log.shaderLinkError = false;
      }

      gl.useProgram(this.shaderProgram);
      this.$refs.attributeModel.requestRebindVertex();
      return true;
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
    },
    openShareDialog() {
      const uniforms = [];
      this.$refs.customUniforms.forEach(uniform => {
        console.log(uniform);
        uniforms.push(uniform.genQuery());
      });
      this.share.custom = {
        version: globalConfig.version,
        context: this.$refs.glContext.genQuery(),
        model: this.$refs.attributeModel.genQuery(),
        camera: this.$refs.uniformCamera.genQuery(),
        uniforms: uniforms
      };
      if (this.genShareLink()) {
        this.share.dialogVisible = true;
      } else {
        ElMessage.error(this.$t('share.customContainIllegalCharError'));
      }
    },
    genShareLink() {
      this.share.custom.model.upload = [];
      this.share.upload.forEach(file => {
        this.share.custom.model.upload.push({name: encodeURI(file.name), path: encodeURI(file.path)});
      });
      this.share.custom.model.selected = {
        fileName: encodeURI(this.share.selected.fileName),
        fileIndex: this.share.selected.fileIndex,
        meshName: encodeURI(this.share.selected.meshName)
      };
      this.share.custom.model.materialSelected = {
        fileName: encodeURI(this.share.materialSelected.fileName),
        fileIndex: this.share.materialSelected.fileIndex,
        index: this.share.materialSelected.index || 0
      };
      const base = `${globalConfig.rootUrl}${globalConfig.baseUrl}`;
      let customBase64;
      try {
        customBase64 = btoa(JSON.stringify(this.share.custom));
      } catch (e) {
        return false;
      }
      const custom = encodeURIComponent(customBase64);
      const vert = encodeURIComponent(this.vertShader);
      const frag = encodeURIComponent(this.fragShader);
      this.share.urlContent = `${base}?custom=${custom}&vertShader=${vert}&fragShader=${frag}`;
      return true;
    },
    copyShareLink() {
      navigator.clipboard.writeText(this.share.urlContent).then(() => {
        ElMessage.success(this.$t('share.copySuccess'));
      }).catch(res => {
        ElMessage.error(this.$t('share.copyError'));
      });
    },
    selectAllShareLink() {
      this.$refs.shareLinkInput.select();
    },
    addNewShareUpload() {
      this.share.upload.push({name: '', path: ''});
      this.genShareLink();
    },
    removeShareUpload(i) {
      this.share.upload.splice(i, 1);
      this.genShareLink();
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.theme = urlParams.get('theme') || 'light';
    const shaderTemplate = urlParams.get('shaderTemplate') || 'default';
    if (urlParams.has('vertShader')) {
      this.vertShader = urlParams.get('vertShader');
    } else {
      requireResource(attachPrefixToUrl(`/assets/shader/${shaderTemplate}.vert`), text => {
        this.vertShader = text;
      });
    }
    if (urlParams.has('fragShader')) {
      this.fragShader = urlParams.get('fragShader');
    } else {
      requireResource(attachPrefixToUrl(`/assets/shader/${shaderTemplate}.frag`), text => {
        this.fragShader = text;
      });
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    let customQuery = convertToCurrentVersion(safeJsonParseBase64(urlParams.get('custom')));
    const queryParseErr = urlParams.has('custom') && customQuery === undefined;
    customQuery = customQuery || defaultQuery;

    if (queryParseErr) ElNotification({
      title: this.$t('notification.title.error'),
      message: this.$t('notification.message.uniformQueryFailed'),
      type: 'error',
    });
    if (customQuery.model === undefined) customQuery.model = {};
    if (customQuery.model.upload === undefined) customQuery.model.upload = defaultQuery.model.upload;
    this.$refs.attributeModel.loadQuery(customQuery.model);
    this.$refs.uniformCamera.loadQuery(customQuery.camera);
    if (Array.isArray(customQuery.uniforms)) {
      customQuery.uniforms.forEach(uniform => this.createNewUniform(uniform.type, uniform.initValue, uniform.name, false));
    }
    const canvas = this.$refs.canvas;
    this.gl = canvas.getContext('webgl');
    this.$refs.glContext.initializeGL(this.gl);
    this.$refs.glContext.loadQuery(customQuery.context);
    requestAnimationFrame(this.redraw);
  }
};
</script>

<style scoped>
@import "/src/assets/theme/all.css";

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
  background-repeat: repeat;
}

.swl-logo {
  width: 130px;
  height: 30px;
  background-size: cover;
  background-position: center;
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

.swl-add-attribute-button {
  margin: 10px var(--el-main-padding);
}

.swl-vert-container {
  width: 100%;
  height: 50%;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
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

.inline-first {
  flex: 1;
  margin-right: 5px;
}

.inline-last {
  flex: 1;
  margin-left: 5px;
}
</style>
