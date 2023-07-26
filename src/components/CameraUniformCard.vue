<template>
  <card-header :title="$t('variable.camera.title') + ': ' + getTypeName(this.cameraType)">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.camera.type.title')">
        <el-select v-model="cameraType" style="flex: 1;" @change="reCalculateViewMat">
          <el-option key="orthogonal" :label="$t('variable.camera.type.orthogonal')" :value="0"/>
          <el-option key="perspective" :label="$t('variable.camera.type.perspective')" :value="1"/>
          <el-option key="perspective_staring" :label="$t('variable.camera.type.perspectiveStaring')" :value="2"/>
        </el-select>
      </el-form-item>
      <el-divider/>

      <el-form-item :label="$t('variable.camera.uViewMat')">
        <el-input v-model="viewMatUniformName"/>
      </el-form-item>
      <div v-if="cameraType === 2">
        <el-form-item :label="$t('variable.camera.staring.position')">
          <el-input-number class="inline-first" v-model="viewPositionX" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline" v-model="viewPositionY" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline-last" v-model="viewPositionZ" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item :label="$t('variable.camera.staring.depth')">
          <el-input-number v-model="viewPositionD" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item :label="$t('variable.camera.staring.rotation')">
          <el-slider v-model="viewRotationRoll" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-first"/>
          <el-slider v-model="viewRotationPitch" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col"/>
          <el-slider v-model="viewRotationYaw" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-last"/>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item :label="$t('variable.camera.position')">
          <el-input-number class="inline-first" v-model="viewPositionX" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline" v-model="viewPositionY" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline-last" v-model="viewPositionZ" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item :label="$t('variable.camera.rotation')">
          <el-slider v-model="viewRotationRoll" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-first"/>
          <el-slider v-model="viewRotationPitch" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col"/>
          <el-slider v-model="viewRotationYaw" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-last"/>
        </el-form-item>
      </div>
      <el-divider/>

      <el-form-item :label="$t('variable.camera.uProjectionMat')">
        <el-input v-model="projectionMatUniformName"/>
      </el-form-item>
      <el-form-item :label="$t('variable.camera.clip')">
        <el-slider v-model="projectionClip" :min="0.01" :max="clipMax" :step="0.01" show-input range
                   @input="reCalculateProjectionMat"/>
      </el-form-item>
      <div v-if="cameraType === 0">
        <el-form-item :label="$t('variable.camera.orthogonalWidth')">
          <el-input-number v-model="projectionOrthogonalWidth" :min="0.1" :step="0.1"
                           @change="reCalculateProjectionMat"/>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item :label="$t('variable.camera.fov')">
          <el-slider v-model="projectionFov" :min="0.01" :max="3.14" :step="0.01" show-input
                     @input="reCalculateProjectionMat"/>
        </el-form-item>
      </div>
    </el-form>
  </card-header>
</template>

<script>
import * as math from 'mathjs';
import {toTranslationMat, toRotationMat, mathjsMatToArray, toQuaternion, toEuler, isInteger} from '../utils';

export default {
  name: "CameraUniform",
  data() {
    return {
      viewMatUniformName: 'uViewMatrix',
      projectionMatUniformName: 'uProjectionMatrix',
      cameraType: 1,
      viewPositionD: 10.,
      viewPositionX: 0.,
      viewPositionY: 0.,
      viewPositionZ: 0.,
      viewRotationRoll: -0.785,
      viewRotationPitch: 0.785,
      viewRotationYaw: 0.,
      viewQuaternionX: 0.,
      viewQuaternionY: 0.,
      viewQuaternionZ: 0.,
      viewQuaternionW: 0.,
      projectionAspectRatio: 16 / 9,
      projectionFov: 0.785,
      projectionOrthogonalWidth: 1.6,
      projectionClip: [0.1, 20.0],
      clipMax: 20.0,
      viewMatrix: [1., 0., 0., 0., 0., 1., 0., 0., 0., 0., 1., 0., 0., 0., 0., 1.],
      projectionMatrix: [0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., -1., 0., 0., 0., 0.],
    };
  },
  methods: {
    getTypeName(type) {
      switch (type) {
        case 0:
          return this.$t('variable.camera.type.orthogonal');
        case 1:
          return this.$t('variable.camera.type.perspective');
        case 2:
          return this.$t('variable.camera.type.perspectiveStaring');
      }
    },
    reCalculateViewMat() {
      const translation = toTranslationMat(this.viewPositionX, this.viewPositionY, this.viewPositionZ);
      const rotation = toRotationMat(this.viewRotationRoll, this.viewRotationPitch, this.viewRotationYaw);
      let viewMatrix;
      if (this.cameraType === 2) {
        const depthMat = toTranslationMat(0., 0., this.viewPositionD);
        viewMatrix = math.inv(math.multiply(math.multiply(translation, rotation), depthMat));
      } else {
        viewMatrix = math.inv(math.multiply(translation, rotation));
      }
      this.viewMatrix = mathjsMatToArray(viewMatrix, true);
    },
    reCalculateProjectionMat() {
      if (this.cameraType === 0) {  // 正交
        this.projectionMatrix[0] = 2.0 / this.projectionOrthogonalWidth;
        this.projectionMatrix[5] = 2.0 / (this.projectionMatrix[0] / this.projectionAspectRatio);
        this.projectionMatrix[10] = 1.0 / (this.projectionClip[0] - this.projectionClip[1]);
        this.projectionMatrix[14] = this.projectionClip[0] / (this.projectionClip[0] - this.projectionClip[1]);
      } else {  // 投影
        this.projectionMatrix[5] = math.cot(this.projectionFov / 2.0);
        this.projectionMatrix[0] = this.projectionMatrix[5] / this.projectionAspectRatio;
        this.projectionMatrix[10] = this.projectionClip[1] / (this.projectionClip[0] - this.projectionClip[1]);
        this.projectionMatrix[14] = (this.projectionClip[0] * this.projectionClip[1]) / (this.projectionClip[0] - this.projectionClip[1]);
      }
    },
    reCalculateQuaternion() {
      while (this.viewRotationRoll >= 3.14) this.viewRotationRoll -= 6.28;
      while (this.viewRotationRoll < -3.14) this.viewRotationRoll += 6.28;
      while (this.viewRotationPitch >= 3.14) this.viewRotationPitch -= 6.28;
      while (this.viewRotationPitch < -3.14) this.viewRotationPitch += 6.28;
      while (this.viewRotationYaw >= 3.14) this.viewRotationYaw -= 6.28;
      while (this.viewRotationYaw < -3.14) this.viewRotationYaw += 6.28;
      const result = toQuaternion(this.viewRotationRoll, this.viewRotationPitch, this.viewRotationYaw);
      this.viewQuaternionX = result[0];
      this.viewQuaternionY = result[1];
      this.viewQuaternionZ = result[2];
      this.viewQuaternionW = result[3];
      this.reCalculateViewMat();
    },
    bindUniform(gl, shaderProgram) {
      const uniViewMat = gl.getUniformLocation(shaderProgram, this.viewMatUniformName);
      const uniProjectionMat = gl.getUniformLocation(shaderProgram, this.projectionMatUniformName);
      gl.uniformMatrix4fv(uniViewMat, false, this.viewMatrix);
      gl.uniformMatrix4fv(uniProjectionMat, false, this.projectionMatrix);
    },
    loadQuery(query) {
      if (isInteger(query.type) && query.type >= 0 && query.type < 3) this.cameraType = query.type;
      if (typeof (query.uniViewMat) === 'string') this.viewMatUniformName = query.uniViewMat;
      if (Array.isArray(query.position) && query.position.length === 3) {
        this.viewPositionX = query.position[0];
        this.viewPositionY = query.position[1];
        this.viewPositionZ = query.position[2];
      }
      if (Array.isArray(query.rotation)) {
        if (query.rotation.length === 4) {
          let rot = toEuler(query.rotation[0], query.rotation[1], query.rotation[2], query.rotation[3]);
          this.viewRotationRoll = rot[0];
          this.viewRotationPitch = rot[1];
          this.viewRotationYaw = rot[2];
        } else if (query.rotation.length === 3) {
          this.viewRotationRoll = query.rotation[0];
          this.viewRotationPitch = query.rotation[1];
          this.viewRotationYaw = query.rotation[2];
        }
      }
      if (typeof (query.depth) === 'number') this.viewPositionD = query.depth;
      if (typeof (query.uniProjectionMat) === 'string') this.projectionMatUniformName = query.uniProjectionMat;
      if (typeof (query.fov) === 'number' && query.number >= 0.01 && query.number <= 3.14) this.projectionFov = query.fov;
      if (typeof (query.ortRecWidth) === 'number' && query.ortRecWidth >= 0.1) this.projectionOrthogonalWidth = query.ortRecWidth;
      if (typeof (query.clipMax) === 'number') this.clipMax = query.clipMax;
      if (typeof (query.nearClip) === 'number' && typeof(query.farClip) === 'number' && query.nearClip < query.farClip && query.farClip < this.clipMax) {
        this.clipMax = Math.max(this.clipMax, query.farClip);
        this.projectionClip[0] = query.nearClip;
        this.projectionClip[1] = query.farClip;
      }
      this.reCalculateQuaternion();
      this.reCalculateProjectionMat();
    },
    genQuery() {
      return {
        type: this.cameraType,
        uniViewMat: this.viewMatUniformName,
        position: [this.viewPositionX, this.viewPositionY, this.viewPositionZ],
        rotation: [this.viewRotationRoll, this.viewRotationPitch, this.viewRotationYaw],
        depth: this.viewPositionD,
        uniProjectionMat: this.projectionMatUniformName,
        fov: this.projectionFov,
        ortRecWidth: this.projectionOrthogonalWidth,
        clipMax: this.clipMax,
        nearClip: this.projectionClip[0],
        farClip: this.projectionClip[1]
      };
    }
  }
}
</script>

<style scoped>
@import "/src/assets/theme/all.css";

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