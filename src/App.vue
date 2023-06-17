<script setup>
import {Plus} from '@element-plus/icons-vue'
</script>

<script>
import ace from 'ace-builds'
import {VAceEditor} from 'vue3-ace-editor';
import glslUrl from 'ace-builds/src-noconflict/mode-glsl?url';
import snippetsGlslUrl from 'ace-builds/src-noconflict/snippets/glsl?url';
import themeGithubUrl from 'ace-builds/src-noconflict/theme-github?url';
import {generateIdentityMat4, getType} from './utils';

ace.config.setModuleUrl('ace/mode/glsl', glslUrl);
ace.config.setModuleUrl('ace/snippets/glsl', snippetsGlslUrl);
ace.config.setModuleUrl('ace/theme/github', themeGithubUrl);

const CameraType = {
  ORTHOGONAL: 0,
  PERSPECTIVE: 1,
  PERSPECTIVE_LOOKING_AT: 2,
}

export default {
  data() {
    return {
      gl: undefined,
      vertShader: '',
      fragShader: '',
      shaderProgram: undefined,
      attributeMapping: {
        position: 'aPosition',
        normal: 'aNormal',
        texCoord: 'aTexCoord'
      },
      model: {
        hasTextureCoordinate: false,
        hasVertexNormal: false,
        materials: [],
        vertex_buffer: [],
        modelMat: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      },
      camera: {
        //canvasWidth: 0,
        //canvasHeight: 0,
        type: CameraType.PERSPECTIVE_LOOKING_AT,
        viewMat: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        projectionMat: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      },
      uniformActiveNames: []
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
        //const devicePixelRatio = window.devicePixelRatio || 1;
        //this.camera.canvasWidth = Math.floor(parentElement.clientWidth * devicePixelRatio)
        //this.camera.canvasHeight = Math.floor(parentElement.clientHeight * devicePixelRatio)
        const gl = this.gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        // debug
        let uniModelMat = gl.getUniformLocation(this.shaderProgram, "uModelMatrix");
        let uniViewMat = gl.getUniformLocation(this.shaderProgram, "uViewMatrix");
        let uniProjectionMat = gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix");
        let uniLightPosition = gl.getUniformLocation(this.shaderProgram, "lightPosition");
        let uniAmbient = gl.getUniformLocation(this.shaderProgram, "ambient");
        let uniDiffuse = gl.getUniformLocation(this.shaderProgram, "diffuse");
        let uniSpecular = gl.getUniformLocation(this.shaderProgram, "specular");
        let uniColor = gl.getUniformLocation(this.shaderProgram, "objectColor");
        let uniShininess = gl.getUniformLocation(this.shaderProgram, "shininess");

        let xRotMat = gl.getUniformLocation(this.shaderProgram, "xRotMatrix");
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
          0., 0., 0., 1.,]);
        gl.uniformMatrix4fv(uniModelMat, false, [
          1., 0., 0., 0.,
          0., 1., 0., 0.,
          0., 0., 1., 0.,
          0., 0., 0., 1.]);
        gl.uniformMatrix4fv(uniViewMat, false, [
          0.57735, -0.57735, 0.57735, 0.,
          0.40825, 0.40825, 0.81650, 0.,
          -0.70711, -0.70711, 0., 0.,
          0., 0., -9.19239, 1.,]
        );
        gl.uniformMatrix4fv(uniProjectionMat, false, [
          2.0920502092050206, 0., 0., 0.,
          0., 3.7323943661971835, 0., 0.,
          0., 0., -1.002002002002002, -1.,
          0., 0., -0.20020020020020018, 0.,]
        );
        gl.uniform3f(uniLightPosition, 0., 8., 0.);
        gl.uniform3f(uniAmbient, 0.2, 0.2, 0.2);
        gl.uniform3f(uniDiffuse, 0.5, 0.5, 0.5);
        gl.uniform3f(uniSpecular, 0.7, 0.7, 0.7);
        gl.uniform3f(uniColor, 1.0, 0.5, 0.5);
        gl.uniform1f(uniShininess, 120.0);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // end debug

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, this.model.vertex_buffer.length /
            (3 + (this.model.hasVertexNormal ? 3 : 0) + (this.model.hasTextureCoordinate ? 2 : 0)));
      } catch (err) {
        console.log(err);
      }
      requestAnimationFrame(this.redraw);
    },
    attachModel(fileName, modelBytesArray) {
      const that = this;
      assimpjs().then((ajs) => {
        let fileList = new ajs.FileList();
        fileList.AddFile(fileName, modelBytesArray);
        let result = ajs.ConvertFileList(fileList, 'assjson');
        if (!result.IsSuccess()) return false;

        let resultFile = result.GetFile(0);
        let jsonContent = new TextDecoder().decode(resultFile.GetContent());
        let resultJson = JSON.parse(jsonContent);
        if (resultJson.meshes.length === 0) return false;
        if (resultJson.meshes[0].vertices === undefined) return false;
        if (resultJson.meshes[0].faces === undefined) return false;
        console.log(resultJson);

        that.model = {
          hasTextureCoordinate: Array.isArray(resultJson.meshes[0].texturecoords),
          hasVertexNormal: Array.isArray(resultJson.meshes[0].normals),
          materials: [],
          vertex_buffer: [],
          modelMat: generateIdentityMat4()
        };
        if (Array.isArray(resultJson.materials)) {
          resultJson.materials.forEach(m => {
            let material = [];
            m.properties.forEach(prop => {
              let propType = getType(prop.value);
              if (propType === 'nan') return;
              material.push({
                key: prop.key,
                type: propType,
                value: prop.value,
                uniform: ''
              });
            });
            that.model.materials.push(material);
          });
        }
        /*that.model.vertex_buffer = [
          1.732, 0., -0.707,   0.92564, 0., -0.37841,   0., 0.,
          -0.866, 1.5, -0.707,   -0.46271, 0.80174, -0.37831,   0., 0.,
          0., 0., 1.414,   0., 0., 1.,   0., 0.,

          0., 0., 1.414,   0., 0., 1.,   0., 0.,
          -0.866, -1.5, -0.707,   -0.46271, -0.80174, -0.37831,   0., 0.,
          -0.866, 1.5, -0.707,   -0.46271, 0.80174, -0.37831,   0., 0.,

          0., 0., 1.414,   0., 0., 1.,   0., 0.,
          -0.866, -1.5, -0.707,   -0.46271, -0.80174, -0.37831,   0., 0.,
          1.732, 0., -0.707,   0.92564, 0., -0.37841,   0., 0.,

          -0.866, -1.5, -0.707,   -0.46271, -0.80174, -0.37831,   0., 0.,
          -0.866, 1.5, -0.707,   -0.46271, 0.80174, -0.37831,   0., 0.,
          1.732, 0., -0.707,   0.92564, 0., -0.37841,   0., 0.,];*/
        resultJson.meshes[0].faces.forEach(face => {
          face.forEach(vi => {
            that.model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3]);
            that.model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3 + 1]);
            that.model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3 + 2]);
            if (that.model.hasVertexNormal) {
              that.model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3]);
              that.model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3 + 1]);
              that.model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3 + 2]);
            }
            if (that.model.hasTextureCoordinate) {
              that.model.vertex_buffer.push(resultJson.meshes[0].texturecoords[vi * 2]);
              that.model.vertex_buffer.push(resultJson.meshes[0].texturecoords[vi * 2 + 1]);
            }
          });
        });
        that.rebindVertexBuffer();
        return true;
      });
    },
    rebindVertexBuffer() {
      if (this.gl === undefined || this.shaderProgram === undefined || this.model.vertex_buffer.length === 0) return;

      const gl = this.gl;
      let vertex_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertex_buffer), gl.STATIC_DRAW);

      const vertexSize = (3 + (this.model.hasVertexNormal ? 3 : 0) + (this.model.hasTextureCoordinate ? 2 : 0)) * 4;
      const positionOffset = 0;
      const normalOffset = 12;
      const texOffset = normalOffset + (this.model.hasVertexNormal ? 12 : 0);
      let attrPosition = gl.getAttribLocation(this.shaderProgram, this.attributeMapping.position);
      gl.vertexAttribPointer(attrPosition, 3, gl.FLOAT, false, vertexSize, positionOffset);
      gl.enableVertexAttribArray(attrPosition);
      if (this.model.hasVertexNormal) {
        let attrNormal = gl.getAttribLocation(this.shaderProgram, this.attributeMapping.normal);
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, vertexSize, normalOffset);
        gl.enableVertexAttribArray(attrNormal);
      }
      if (this.model.hasTextureCoordinate) {
        let attrTexCoord = gl.getAttribLocation(this.shaderProgram, this.attributeMapping.texCoord);
        gl.vertexAttribPointer(attrTexCoord, 2, gl.FLOAT, false, vertexSize, texOffset);
        gl.enableVertexAttribArray(attrTexCoord);
      }
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

      this.rebindVertexBuffer();
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
    fetch('/assets/cube.fbx')
        .then(response => response.arrayBuffer())
        .then(buffer => new Uint8Array(buffer))
        .then(data => this.attachModel('cube.fbx', data));
    const canvas = this.$refs.canvas;
    this.gl = canvas.getContext('webgl');
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    requestAnimationFrame(this.redraw);
  }
};
</script>

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
          <swl-gl-context class="swl-attributes"/>
          <swl-model-attribute class="swl-attributes"/>
          <swl-camera-uniform class="swl-attributes"/>
          <el-popover placement="right" :width="400" trigger="click">
            <template #reference>
              <el-button class="swl-attributes" circle :icon="Plus"/>
            </template>
            <el-button>Float</el-button>
            <el-button>Vec2</el-button>
            <el-button>Vec3</el-button>
            <el-button>Vec4</el-button>
            <el-button>Mat2</el-button>
            <el-button>Mat3</el-button>
            <el-button>Mat4</el-button>
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
