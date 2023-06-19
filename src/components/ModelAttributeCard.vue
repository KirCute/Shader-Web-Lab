<template>
  <card-header :title="'模型' + (usingIndexInvalid() ? '' : (': ' + models[usingModel].name))">
    <el-form label-width="100px" size="small">
      <el-form-item label="展示模型">
        <el-select v-model="selectedModel" placeholder="Select" class="inline-first">
          <el-option v-for="(m, i) in models" :key="i" :label="m.name" :value="i"/>
        </el-select>
        <el-button @click="this.$refs.fileInput.click()" class="inline-last">
          <el-icon class="el-icon--left"><Upload/></el-icon>上传模型
        </el-button>
        <input ref="fileInput" @change="clickUploadFiles" type="file" multiple style="display: none;"/>
      </el-form-item>
      <el-form-item label="顶点位置变量名">
        <el-input v-if="usingIndexInvalid()" disabled placeholder="顶点位置不存在"/>
        <el-input v-else v-model="attributeMapping.position" @change="requestRebindVertex"/>
      </el-form-item>
      <el-form-item label="顶点法线变量名">
        <el-input v-if="usingIndexInvalid() || !models[usingModel].model.hasVertexNormal" disabled placeholder="顶点法线不存在"/>
        <el-input v-else v-model="attributeMapping.normal" @change="requestRebindVertex"/>
      </el-form-item>
      <el-form-item label="纹理坐标变量名">
        <el-input v-if="usingIndexInvalid() || !models[usingModel].model.hasTextureCoordinate" disabled placeholder="纹理坐标不存在"/>
        <el-input v-else v-model="attributeMapping.texCoord" @change="requestRebindVertex"/>
      </el-form-item>
      <el-divider/>

      <el-form-item label="模型矩阵变量名">
        <el-input v-model="modelMatUniformName"/>
      </el-form-item>
      <el-form-item label="平移 (XYZ)">
        <el-input-number class="inline-first" v-model="pose.x" :step="0.1" @change="reCalculateModelMat"/>
        <el-input-number class="inline" v-model="pose.y" :step="0.1" @change="reCalculateModelMat"/>
        <el-input-number class="inline-last" v-model="pose.z" :step="0.1" @change="reCalculateModelMat"/>
      </el-form-item>
      <el-form-item label="旋转 (RPY)">
        <el-slider v-model="pose.roll" :min="-3.14" :max="3.14" :step="0.01" show-input
                   @input="reCalculateModelMat" class="col-first"/>
        <el-slider v-model="pose.pitch" :min="-3.14" :max="3.14" :step="0.01" show-input
                   @input="reCalculateModelMat" class="col"/>
        <el-slider v-model="pose.yaw" :min="-3.14" :max="3.14" :step="0.01" show-input
                   @input="reCalculateModelMat" class="col-last"/>
      </el-form-item>
    </el-form>
  </card-header>
</template>

<script>
import {generateIdentityMat4, getType, mathjsMatToArray, toRotationMat, toTranslationMat} from '../utils'
import * as math from "mathjs";

export default {
  name: "ModelAttributeCard",
  data() {
    return {
      modelMatUniformName: 'uModelMatrix',
      attributeMapping: {
        position: 'aPosition',
        normal: 'aNormal',
        texCoord: 'aTexCoord'
      },
      pose: {
        x: 0.,
        y: 0.,
        z: 0.,
        roll: 0.,
        pitch: 0.,
        yaw: 0.
      },
      selectedModel: -1,
      usingModel: -1,
      models: [],
      modelMatrix: generateIdentityMat4(),
      firstRendered: true
    };
  },
  methods: {
    rebindVertexBuffer(gl, shaderProgram) {
      const index = this.selectedModel;
      if (gl === undefined || shaderProgram === undefined || index < 0 || index >= this.models.length) return;
      this.usingModel = index;

      let vertex_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.models[index].model.vertex_buffer), gl.STATIC_DRAW);

      const vertexSize = (3 + (this.models[index].model.hasVertexNormal ? 3 : 0) + (this.models[index].model.hasTextureCoordinate ? 2 : 0)) * 4;
      const positionOffset = 0;
      const normalOffset = 12;
      const texOffset = normalOffset + (this.models[index].model.hasVertexNormal ? 12 : 0);
      let attrPosition = gl.getAttribLocation(shaderProgram, this.attributeMapping.position);
      gl.vertexAttribPointer(attrPosition, 3, gl.FLOAT, false, vertexSize, positionOffset);
      gl.enableVertexAttribArray(attrPosition);
      if (this.models[index].model.hasVertexNormal) {
        let attrNormal = gl.getAttribLocation(shaderProgram, this.attributeMapping.normal);
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, vertexSize, normalOffset);
        gl.enableVertexAttribArray(attrNormal);
      }
      if (this.models[index].model.hasTextureCoordinate) {
        let attrTexCoord = gl.getAttribLocation(shaderProgram, this.attributeMapping.texCoord);
        gl.vertexAttribPointer(attrTexCoord, 2, gl.FLOAT, false, vertexSize, texOffset);
        gl.enableVertexAttribArray(attrTexCoord);
      }
    },
    clickUploadFiles() {
      const that = this;
      const selectedFiles = this.$refs.fileInput.files;
      for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const fileContents = new Uint8Array(event.target.result);
          if (!that.addModel(selectedFiles[i].name, fileContents)) {
            console.log('err');
            // todo 报告模型加载失败
          }
        };
        reader.readAsArrayBuffer(selectedFiles[i]);
      }
    },
    uploadModels(models) {
      let promises = [];
      models.forEach(m => {
        promises.push(fetch(m.path).then(response => response.arrayBuffer()).then(buffer => new Uint8Array(buffer)));
      });
      Promise.all(promises).then(results => {
        for (let i = 0; i < results.length; i++) {
          if (!this.addModel(models[i].name, results[i])) {
            console.log('err');
            // todo 报告模型加载失败
          }
        }
      });
    },
    addModel(fileName, modelBytesArray) {
      return assimpjs().then((ajs) => {
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

        let model = {
          hasTextureCoordinate: Array.isArray(resultJson.meshes[0].texturecoords),
          hasVertexNormal: Array.isArray(resultJson.meshes[0].normals),
          materials: [],
          vertex_buffer: []
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
            model.materials.push(material);
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
            model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3]);
            model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3 + 1]);
            model.vertex_buffer.push(resultJson.meshes[0].vertices[vi * 3 + 2]);
            if (model.hasVertexNormal) {
              model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3]);
              model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3 + 1]);
              model.vertex_buffer.push(resultJson.meshes[0].normals[vi * 3 + 2]);
            }
            if (model.hasTextureCoordinate) {
              model.vertex_buffer.push(resultJson.meshes[0].texturecoords[vi * 2]);
              model.vertex_buffer.push(resultJson.meshes[0].texturecoords[vi * 2 + 1]);
            }
          });
        });
        this.models.push({name: fileName, model: model});
        if (this.selectedModel < 0) {
          this.selectedModel = 0;
        }
        return true;
      });
    },
    requestRebindVertex() {
      this.usingModel = -1;
    },
    reCalculateModelMat() {
      while (this.pose.roll >= 3.14) this.pose.roll -= 6.28;
      while (this.pose.roll < -3.14) this.pose.roll += 6.28;
      while (this.pose.pitch >= 3.14) this.pose.pitch -= 6.28;
      while (this.pose.pitch < -3.14) this.pose.pitch += 6.28;
      while (this.pose.yaw >= 3.14) this.pose.yaw -= 6.28;
      while (this.pose.yaw < -3.14) this.pose.yaw += 6.28;
      const translation = toTranslationMat(this.pose.x, this.pose.y, this.pose.z);
      const rotation = toRotationMat(this.pose.roll, this.pose.pitch, this.pose.yaw);
      const modelMatrix = math.multiply(translation, rotation);
      this.modelMatrix = mathjsMatToArray(modelMatrix, true);
    },
    bindUniform(gl, shaderProgram) {
      if (this.selectedModel !== this.usingModel) {
        this.rebindVertexBuffer(gl, shaderProgram);
      }
      if (this.firstRendered) {
        this.firstRendered = false;
        this.reCalculateModelMat();
      }
      const uniModelMat = gl.getUniformLocation(shaderProgram, this.modelMatUniformName);
      gl.uniformMatrix4fv(uniModelMat, false, this.modelMatrix);
    },
    glDraw(gl) {
      gl.drawArrays(gl.TRIANGLES, 0, this.models[this.selectedModel].model.vertex_buffer.length /
          (3 + (this.models[this.selectedModel].model.hasVertexNormal ? 3 : 0) +
              (this.models[this.selectedModel].model.hasTextureCoordinate ? 2 : 0)));
    },
    usingIndexInvalid() {
      return this.usingModel < 0 || this.usingModel >= this.models.length;
    }
  }
}
</script>

<style scoped>
.inline {
  flex-grow: 1;
  margin-left: 5px;
  margin-right: 5px;
}

.inline-first {
  flex-grow: 1;
  margin-right: 5px;
}

.inline-last {
  flex-grow: 1;
  margin-left: 5px;
}

.col-first {
  margin-bottom: 5px;
}

.col {
  margin-top: 5px;
  margin-bottom: 5px;
}

.col-last {
  margin-top: 5px;
}
</style>