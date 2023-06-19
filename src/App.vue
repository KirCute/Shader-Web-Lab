<template>
  <el-container class="swl-all">
    <el-header class="swl-header-bar">
      Shader Web Lab
    </el-header>

    <el-container class="swl-content">
      <el-aside class="swl-tools-bar">

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
            <div id="custom-uniform-root"/>
            <el-popover placement="right" :width="390" trigger="click">
              <template #reference>
                <el-button class="swl-attributes" circle>
                  <el-icon class="el-icon"> <Plus/> </el-icon>
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
                </el-row>
              </el-col>
            </el-popover>
          </el-scrollbar>
        </el-main>
      </el-aside>
      <el-aside class="swl-main">
        <el-header class="swl-vert-container">
          <v-ace-editor v-model:value="vertShader" lang="glsl" theme="github" class="swl-vert"/>
        </el-header>
        <el-footer class="swl-frag-container">
          <v-ace-editor v-model:value="fragShader" lang="glsl" theme="github" class="swl-frag"/>
        </el-footer>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script>
import ace from 'ace-builds'
import {VAceEditor} from 'vue3-ace-editor';
import glslUrl from 'ace-builds/src-noconflict/mode-glsl?url';
import snippetsGlslUrl from 'ace-builds/src-noconflict/snippets/glsl?url';
import themeGithubUrl from 'ace-builds/src-noconflict/theme-github?url';
import {createApp} from "vue";
import CustomFloatUniformCard from "./components/CustomFloatUniformCard.vue";
import CustomVec2UniformCard from "./components/CustomVec2UniformCard.vue";
import CustomVec3UniformCard from "./components/CustomVec3UniformCard.vue";
import CustomVec4UniformCard from "./components/CustomVec4UniformCard.vue";
import CustomMat2UniformCard from "./components/CustomMat2UniformCard.vue";
import CustomMat3UniformCard from "./components/CustomMat3UniformCard.vue";
import CustomMat4UniformCard from "./components/CustomMat4UniformCard.vue";

ace.config.setModuleUrl('ace/mode/glsl', glslUrl);
ace.config.setModuleUrl('ace/snippets/glsl', snippetsGlslUrl);
ace.config.setModuleUrl('ace/theme/github', themeGithubUrl);

export default {
  data() {
    return {
      gl: undefined,
      vertShader: '',
      fragShader: '',
      shaderProgram: undefined,
      customUniforms: [],
      nextCustomUniformId: 0
    };
  },
  components: {
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

        // debug
        let uniLightPosition = gl.getUniformLocation(this.shaderProgram, "lightPosition");
        let uniAmbient = gl.getUniformLocation(this.shaderProgram, "ambient");
        let uniDiffuse = gl.getUniformLocation(this.shaderProgram, "diffuse");
        let uniSpecular = gl.getUniformLocation(this.shaderProgram, "specular");
        let uniColor = gl.getUniformLocation(this.shaderProgram, "objectColor");
        let uniShininess = gl.getUniformLocation(this.shaderProgram, "shininess");

        /*let xRotMat = gl.getUniformLocation(this.shaderProgram, "xRotMatrix");
        let yRotMat = gl.getUniformLocation(this.shaderProgram, "yRotMatrix");
        let zRotMat = gl.getUniformLocation(this.shaderProgram, "zRotMatrix");

        let ang = Date.now() % 4000 / 2000 * Math.PI
        gl.uniformMatrix4fv(xRotMat, false, [
          Math.cos(ang), Math.sin(ang), 0., 0.,
          -Math.sin(ang), Math.cos(ang), 0., 0.,
          0., 0., 1., 0.,
          0., 0., 0., 1.,]);
        gl.uniformMatrix4fv(yRotMat, false, [
          Math.cos(ang), 0., -Math.sin(ang), 0.,
          0., 1., 0., 0.,
          Math.sin(ang), 0., Math.cos(ang), 0.,
          0., 0., 0., 1.,]);
        gl.uniformMatrix4fv(zRotMat, false, [
          1., 0., 0., 0.,
          0., Math.cos(ang), Math.sin(ang), 0.,
          0., -Math.sin(ang), Math.cos(ang), 0.,
          0., 0., 0., 1.,]);*/
        gl.uniform3f(uniLightPosition, 0., 8., 0.);
        gl.uniform3f(uniAmbient, 0.2, 0.2, 0.2);
        gl.uniform3f(uniDiffuse, 0.5, 0.5, 0.5);
        gl.uniform3f(uniSpecular, 0.7, 0.7, 0.7);
        gl.uniform3f(uniColor, 1.0, 0.5, 0.5);
        gl.uniform1f(uniShininess, 120.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // end debug

        gl.clear(gl.COLOR_BUFFER_BIT);
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
        const log = gl.getShaderInfoLog(vertShader);
        // todo
        console.error(log);
        return;
      }

      let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShader, this.fragShader);
      gl.compileShader(fragShader);
      if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(fragShader);
        // todo
        console.error(log);
        return;
      }

      this.shaderProgram = gl.createProgram();
      gl.attachShader(this.shaderProgram, vertShader);
      gl.attachShader(this.shaderProgram, fragShader);
      gl.linkProgram(this.shaderProgram);
      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(this.shaderProgram);
        // todo
        console.error(log);
        return;
      }
      gl.useProgram(this.shaderProgram);

      this.$refs.attributeModel.requestRebindVertex();
    },
    createNewUniform(type) {
      let uniformType;
      switch (type) {
        case 'float': uniformType = CustomFloatUniformCard; break;
        case 'vec2': uniformType = CustomVec2UniformCard; break;
        case 'vec3': uniformType = CustomVec3UniformCard; break;
        case 'vec4': uniformType = CustomVec4UniformCard; break;
        case 'mat2': uniformType = CustomMat2UniformCard; break;
        case 'mat3': uniformType = CustomMat3UniformCard; break;
        case 'mat4': uniformType = CustomMat4UniformCard; break;
        default: return;
      }
      const uniform = createApp(uniformType, {
        id: this.nextCustomUniformId,
        parent: this
      });
      let element = document.createElement('div');
      uniform.mount(element);
      document.getElementById('custom-uniform-root').appendChild(element);
      this.customUniforms.push({id: this.nextCustomUniformId, element: element, component: uniform});
      this.nextCustomUniformId++;
    },
    deleteUniform(id) {
      let idx = 0;
      while (idx < this.customUniforms.length && this.customUniforms[idx].id !== id) idx++;
      if (idx < this.customUniforms.length) {
        this.customUniforms[idx].component.unmount(this.customUniforms[idx].element);
        this.customUniforms[idx].element.remove();
        this.customUniforms.splice(idx, 1);
      }
    }
  },
  created() {
    const vertXhr = new XMLHttpRequest();
    vertXhr.open('GET', '/assets/default.vert');
    vertXhr.onreadystatechange = () => {
      if (vertXhr.readyState === 4 && vertXhr.status === 200) {
        this.vertShader = vertXhr.responseText;
        this.recompileShader();
      }
    };
    vertXhr.send();
    const fragXhr = new XMLHttpRequest();
    fragXhr.open('GET', '/assets/default.frag');
    fragXhr.onreadystatechange = () => {
      if (fragXhr.readyState === 4 && fragXhr.status === 200) {
        this.fragShader = fragXhr.responseText;
        this.recompileShader();
      }
    };
    fragXhr.send();
  },
  mounted() {
    this.$refs.attributeModel.uploadModels([
      {name: '正方体（预设）', path: '/assets/models/cube.fbx'},
      {name: '球体（预设）', path: '/assets/models/sphere.fbx'}
    ]);
    const canvas = this.$refs.canvas;
    this.gl = canvas.getContext('webgl');
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
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
  background-color: darkblue;
}

.swl-tools-bar {
  width: 4vw;
  height: 100%;
  overflow: hidden;
  background-color: blue;
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
  border-left: 1px solid #ccc;
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
  border-bottom: 1px solid #ccc;
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
