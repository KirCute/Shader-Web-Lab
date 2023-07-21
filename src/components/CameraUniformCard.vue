<template>
  <card-header :title="'相机: ' + getTypeName(this.cameraType)">
    <el-form label-width="100px" size="small">
      <el-form-item label="相机类型">
        <el-select v-model="cameraType" style="flex: 1;">
          <el-option key="orthogonal" label="正交相机" :value="0"/>
          <el-option key="perspective" label="透视相机" :value="1"/>
          <el-option key="perspective_aim" label="透视相机（注视一点）" :value="2"/>
        </el-select>
      </el-form-item>
      <el-divider/>

      <el-form-item label="观察矩阵变量名">
        <el-input v-model="viewMatUniformName"/>
      </el-form-item>
      <div v-if="cameraType === 2">
        <el-form-item label="注视点 (XYZ)">
          <el-input-number class="inline-first" v-model="viewPositionX" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline" v-model="viewPositionY" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline-last" v-model="viewPositionZ" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item label="与注视点间距">
          <el-input-number v-model="viewPositionD" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item label="注视方向 (RPY)">
          <el-slider v-model="viewRotationRoll" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-first"/>
          <el-slider v-model="viewRotationPitch" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col"/>
          <el-slider v-model="viewRotationYaw" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-last"/>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="平移 (XYZ)">
          <el-input-number class="inline-first" v-model="viewPositionX" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline" v-model="viewPositionY" :step="0.1" @change="reCalculateViewMat"/>
          <el-input-number class="inline-last" v-model="viewPositionZ" :step="0.1" @change="reCalculateViewMat"/>
        </el-form-item>
        <el-form-item label="旋转 (RPY)">
          <el-slider v-model="viewRotationRoll" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-first"/>
          <el-slider v-model="viewRotationPitch" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col"/>
          <el-slider v-model="viewRotationYaw" :min="-3.14" :max="3.14" :step="0.01" show-input
                     @input="reCalculateQuaternion" class="col-last"/>
        </el-form-item>
      </div>
      <el-divider/>

      <el-form-item label="投影矩阵变量名">
        <el-input v-model="projectionMatUniformName"/>
      </el-form-item>
      <el-form-item label="裁切平面距离">
        <el-slider v-model="projectionClip" :min="0.01" :max="clipMax" :step="0.01" show-input range
                   @input="reCalculateProjectionMat"/>
      </el-form-item>
      <div v-if="cameraType === 0">
        <el-form-item label="目标立方体宽">
          <el-input-number v-model="projectionOrthogonalWidth" :min="0.1" :step="0.1"
                           @change="reCalculateProjectionMat"/>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="FOV">
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
          return '正交相机';
        case 1:
          return '透视相机';
        case 2:
          return '透视相机（注视一点）';
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
      if (typeof (query.nearClip) === 'number' && typeof(query.farClip) === 'number' && query.nearClip < query.farClip && query.farClip < this.clipMax) {
        this.projectionClip[0] = query.nearClip;
        this.projectionClip[1] = query.farClip;
      }
      this.reCalculateQuaternion();
      this.reCalculateProjectionMat();
    }
  }
}
</script>

<style scoped>
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