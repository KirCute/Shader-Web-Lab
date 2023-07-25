<template>
  <card-header :title="$t('variable.model.title') + (usingIndexInvalid() ? '' : (': ' + models[usingModel].name))">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.model.displaying')">
        <el-select v-if="selectedModel < 0" disabled :placeholder="$t('variable.model.loading')" class="show-model"/>
        <el-select v-else v-model="selectedModel" :placeholder="$t('variable.model.placeholder')" class="show-model"
                   @change="updateUsingMaterial">
          <el-option v-for="i in models.length" :key="i-1" :value="i-1" :label="getModelName(i-1)"/>
        </el-select>
        <el-button @click="this.$refs.fileInput.click()" class="upload-button">
          <el-icon class="el-icon--left"><Upload/></el-icon> {{ $t('variable.model.upload') }}
        </el-button>
        <input ref="fileInput" @change="clickUploadFiles" type="file" multiple style="display: none;"/>
      </el-form-item>
      <el-form-item :label="$t('variable.model.material.displaying')">
        <el-select v-model="selectedMaterial" :placeholder="$t('variable.model.material.placeholder')" class="show-model" clearable>
          <el-option v-for="i in materials.length" :key="i-1" :value="i-1" :label="getMaterialName(i-1)"/>
        </el-select>
        <el-button :disabled="usingMaterialIndexInvalid()" @click="showMaterialConfigDialog = true" class="upload-button">
          <el-icon class="el-icon--left"><Setting/></el-icon> {{ $t('variable.model.material.configButton') }}
        </el-button>
        <el-dialog v-if="!usingMaterialIndexInvalid()" v-model="showMaterialConfigDialog"
                   :title="`${$t('variable.model.material.config.title')}: ${getMaterialName(usingMaterial)}`">
          <el-table :data="materials[usingMaterial].material" style="width: 100%" height="50vh">
            <el-table-column :label="$t('variable.model.material.config.key')" prop="key"/>
            <el-table-column :label="$t('variable.model.material.config.type')" prop="type" width="75"/>
            <el-table-column :label="$t('variable.model.material.config.value')" prop="value"/>
            <el-table-column :label="$t('variable.model.material.config.uniform')" prop="key">
              <template #default="scope">
                <el-input v-model="getMaterialProp(scope.row.key).uniform" placeholder="uniform"/>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </el-form-item>
      <el-divider/>

      <el-form-item :label="$t('variable.model.aPosition')">
        <el-input v-if="usingIndexInvalid()" disabled :placeholder="$t('variable.model.aPositionInvalid')"/>
        <el-input v-else v-model="attributeMapping.position" @change="requestRebindVertex"/>
      </el-form-item>
      <el-form-item :label="$t('variable.model.aNormal')">
        <el-input v-if="usingIndexInvalid() || !models[usingModel].model.hasVertexNormal" disabled :placeholder="$t('variable.model.aNormalInvalid')"/>
        <el-input v-else v-model="attributeMapping.normal" @change="requestRebindVertex"/>
      </el-form-item>
      <el-form-item :label="$t('variable.model.aTexCoord')">
        <el-input v-if="usingIndexInvalid() || !models[usingModel].model.hasTextureCoordinate" disabled :placeholder="$t('variable.model.aTexCoordInvalid')"/>
        <el-input v-else v-model="attributeMapping.texCoord" @change="requestRebindVertex"/>
      </el-form-item>
      <el-divider/>

      <el-form-item :label="$t('variable.model.uModelMat')">
        <el-input v-model="modelMatUniformName"/>
      </el-form-item>
      <el-form-item :label="$t('variable.model.position')">
        <el-input-number class="inline-first" v-model="pose.x" :step="0.1" @change="reCalculateModelMat"/>
        <el-input-number class="inline" v-model="pose.y" :step="0.1" @change="reCalculateModelMat"/>
        <el-input-number class="inline-last" v-model="pose.z" :step="0.1" @change="reCalculateModelMat"/>
      </el-form-item>
      <el-form-item :label="$t('variable.model.rotate')">
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
import {generateIdentityMat4, getType, isInteger, mathjsMatToArray, toRotationMat, toTranslationMat} from '../utils'
import {Upload} from "@element-plus/icons-vue";
import * as math from "mathjs";
import {toEuler} from '../utils'
import {ElNotification} from "element-plus";

export default {
  name: "ModelAttributeCard",
  components: {
    Upload
  },
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
      usingMaterial: -1,
      materials: [],
      materialUniforms: {},
      existFiles: {},
      autoSwitchMaterial: true,
      modelMatrix: generateIdentityMat4(),
      firstRendered: true,
      showMaterialConfigDialog: false,
    };
  },
  computed: {
    selectedMaterial: {
      get() {
        if (this.usingMaterial < 0) return '';
        return this.usingMaterial;
      },
      set(v) {
        this.usingMaterial = v === '' || v === undefined ? -1 : Number(v);
      }
    }
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
          if (that.addModel(selectedFiles[i].name, fileContents) === 0) ElNotification({
            title: this.$t('notification.title.error'),
            message: `${this.$t('notification.message.uploadFailedPrefix')}${selectedFiles[i].name}${this.$t('notification.message.uploadFailedSuffix')}`,
            type: 'error',
          });
        };
        reader.readAsArrayBuffer(selectedFiles[i]);
      }
    },
    uploadModels(models, callback = undefined) {
      let promises = [];
      models.forEach(m => {
        promises.push(fetch(m.path).then(response => response.arrayBuffer()).then(buffer => new Uint8Array(buffer)));
      });
      Promise.all(promises).then(results => {
        let failed = [];
        for (let i = 0; i < results.length; i++) {
          if (this.addModel(models[i].name, results[i]) === 0) {
            failed = failed.concat(i);
            ElNotification({
              title: this.$t('notification.title.error'),
              message: `${this.$t('notification.message.uploadFailedPrefix')}${models[i].name}${this.$t('notification.message.uploadFailedSuffix')}`,
              type: 'error',
            });
          }
        }
        if (callback) callback(failed);
      });
    },
    addModel(fileName, modelBytesArray) {
      return assimpjs().then((ajs) => {
        let fileList = new ajs.FileList();
        fileList.AddFile(fileName, modelBytesArray);
        let result = ajs.ConvertFileList(fileList, 'assjson');
        if (!result.IsSuccess()) return 0;

        let resultFile = result.GetFile(0);
        let jsonContent = new TextDecoder().decode(resultFile.GetContent());
        let resultJson = JSON.parse(jsonContent);
        if (resultJson.meshes.length === 0) return 0;
        let fileIndex = 0;
        if (fileName in this.existFiles) {
          this.existFiles[fileName] += 1;
          fileIndex = this.existFiles[fileName];
        } else {
          this.existFiles[fileName] = 0;
        }
        const success = resultJson.meshes.reduce((cnt, mesh) => {
          if (mesh.vertices === undefined) return cnt;
          if (mesh.faces === undefined) return cnt;

          const model = {
            hasTextureCoordinate: Array.isArray(mesh.texturecoords),
            hasVertexNormal: Array.isArray(mesh.normals),
            materials: [],
            vertex_buffer: []
          };
          mesh.faces.forEach(face => {
            face.forEach(vi => {
              model.vertex_buffer.push(mesh.vertices[vi * 3]);
              model.vertex_buffer.push(mesh.vertices[vi * 3 + 1]);
              model.vertex_buffer.push(mesh.vertices[vi * 3 + 2]);
              if (model.hasVertexNormal) {
                model.vertex_buffer.push(mesh.normals[vi * 3]);
                model.vertex_buffer.push(mesh.normals[vi * 3 + 1]);
                model.vertex_buffer.push(mesh.normals[vi * 3 + 2]);
              }
              if (model.hasTextureCoordinate) {
                model.vertex_buffer.push(mesh.texturecoords[vi * 2]);
                model.vertex_buffer.push(mesh.texturecoords[vi * 2 + 1]);
              }
            });
          });
          const meshName = `${mesh.name === undefined ? 'unnamed' : mesh.name}`;
          this.models.push({name: meshName, fileName: fileName, fileIndex: fileIndex, model: model, material: mesh.materialindex});
          return cnt + 1;
        }, 0);
        if (Array.isArray(resultJson.materials)) {
          resultJson.materials.forEach((m, i) => {
            const material = [];
            m.properties.forEach(prop => {
              const propType = getType(prop.value);
              if (propType === 'nan') return;
              material.push({
                key: prop.key,
                type: propType,
                value: prop.value
              });
            });
            this.materials.push({material: material, fileName: fileName, fileIndex: fileIndex, index: i});
          });
        }
        if (this.selectedModel < 0 && this.models.length > 0) {
          this.selectedModel = 0;
          this.updateUsingMaterial();
        }
        return success;
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

      if (!this.usingMaterialIndexInvalid()) {
        this.materials[this.usingMaterial].material.forEach(m => {
          const uniName = this.getMaterialProp(m.key).uniform;
          if (uniName === '') return;
          const uni = gl.getUniformLocation(shaderProgram, uniName);
          switch (m.type) {
            case 'float':
              gl.uniform1f(uni, m.value); break;
            case 'vec2':
              gl.uniform2fv(uni, m.value); break;
            case 'vec3':
              gl.uniform3fv(uni, m.value); break;
            case 'vec4':
              gl.uniform4fv(uni, m.value); break;
            case 'mat3':
              gl.uniformMatrix3fv(uni, m.value); break;
            case 'mat4':
              gl.uniformMatrix4fv(uni, m.value); break;
          }
        });
      }
    },
    glDraw(gl) {
      if (this.selectedModel < 0) return;
      gl.drawArrays(gl.TRIANGLES, 0, this.models[this.selectedModel].model.vertex_buffer.length /
          (3 + (this.models[this.selectedModel].model.hasVertexNormal ? 3 : 0) +
              (this.models[this.selectedModel].model.hasTextureCoordinate ? 2 : 0)));
    },
    usingIndexInvalid() {
      return this.usingModel < 0 || this.usingModel >= this.models.length;
    },
    usingMaterialIndexInvalid() {
      return this.usingMaterial < 0 || this.usingMaterial >= this.materials.length;
    },
    updateUsingMaterial() {
      if (!this.autoSwitchMaterial) return;
      if (this.selectedModel < 0 || this.selectedModel >= this.models.length) return;
      const curModel = this.models[this.selectedModel];
      const materialIndex = this.materials.reduce((ret, cur, ind) => {
        if (cur.fileName === curModel.fileName && cur.fileIndex === curModel.fileIndex && cur.index === curModel.material) return ind;
        return ret;
      }, undefined);
      if (materialIndex === undefined) return;
      this.usingMaterial = materialIndex;
    },
    getModelName(index) {
      if (index < 0 || index >= this.models.length) return '';
      const m = this.models[index];
      return `${m.name === undefined ? 'unnamed' : m.name} (${m.fileName}${m.fileIndex > 0 ? `_${m.fileIndex}` : ''})`;
    },
    getMaterialName(index) {
      if (index < 0 || index >= this.materials.length) return '';
      const m = this.materials[index];
      return `${m.fileName}${m.fileIndex > 0 ? `_${m.fileIndex}` : ''} [${m.index}]`;
    },
    getMaterialProp(key) {
      if (key === undefined) return undefined;
      if (this.materialUniforms[key] === undefined) this.materialUniforms[key] = {uniform: ''};
      return this.materialUniforms[key];
    },
    loadQuery(query) {
      if (query === undefined) return;
      if (Array.isArray(query.upload)) this.uploadModels(query.upload, function (failed) {
        if (typeof(query.selected) === 'object' && typeof(query.selected.fileName) === 'string') {
          const fileIndex = isInteger(query.selected.fileIndex) ? query.selected.fileIndex : 0;
          const meshName = query.selected.meshName;
          const selected = this.models.reduce((ret, cur, i) => {
            if (cur.fileName === query.selected.fileName && cur.fileIndex === fileIndex &&
                (meshName === undefined || meshName === cur.meshName)) return i;
            return ret;
          }, undefined);
          if (selected !== undefined) this.selectedModel = selected;
        }
        if (typeof(query.materialSelected) === 'object' && typeof(query.materialSelected.fileName) === 'string') {
          const fileIndex = isInteger(query.materialSelected.fileIndex) ? query.materialSelected.fileIndex : 0;
          const index = isInteger(query.materialSelected.index) ? query.materialSelected.index : 0;
          const materialIndex = this.materials.reduce((ret, cur, i) => {
            if (cur.fileName === query.materialSelected.fileName && cur.fileIndex === fileIndex && cur.index === index) return i;
            return ret;
          }, undefined);
          if (materialIndex !== undefined) this.selectedMaterial = materialIndex;
        }
      });
      if (typeof(query.attributePosition) === 'string') this.attributeMapping.position = query.attributePosition;
      if (typeof(query.attributeNormal) === 'string') this.attributeMapping.normal = query.attributeNormal;
      if (typeof(query.attributeTexCoord) === 'string') this.attributeMapping.texCoord = query.attributeTexCoord;
      if (typeof(query.uniModelMat) === 'string') this.modelMatUniformName = query.uniModelMat;
      if (Array.isArray(query.pose)) {
        if (query.pose.length === 6) {
          this.pose.x = query.pose[0];
          this.pose.y = query.pose[1];
          this.pose.z = query.pose[2];
          this.pose.roll = query.pose[3];
          this.pose.pitch = query.pose[4];
          this.pose.yaw = query.pose[5];
        } else if (query.pose.length === 7) {
          this.pose.x = query.pose[0];
          this.pose.y = query.pose[1];
          this.pose.z = query.pose[2];
          let euler = toEuler(query.pose[3], query.pose[4], query.pose[5], query.pose[6]);
          this.pose.roll = euler[0];
          this.pose.pitch = euler[1];
          this.pose.yaw = euler[2];
        }
        this.reCalculateModelMat();
      }
      if (Array.isArray(query.materialBind)) {
        query.materialBind.forEach(m => {
          if (typeof(m.key) === 'string' && typeof(m.uni) === 'string') {
            this.materialUniforms[m.key] = { uniform: m.uni };
          }
        });
      }
    }
  }
}
</script>

<style scoped>
@import "/src/assets/theme/all.css";

.show-model {
  flex-grow: 1;
  margin-right: 5px;
}

.upload-button {
  margin-left: 5px;
}

.inline {
  flex: 1;
  margin-left: 5px;
  margin-right: 5px;
}

.inline-first {
  flex: 1;
  margin-right: 5px;
}

.inline-last {
  flex: 1;
  margin-left: 5px;
}

.col-first {
  margin-bottom: 10px;
}

.col {
  margin-top: 10px;
  margin-bottom: 10px;
}

.col-last {
  margin-top: 10px;
}
</style>