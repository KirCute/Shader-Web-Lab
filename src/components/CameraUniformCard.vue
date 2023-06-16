<template>
  <el-collapse-item :title="'相机：' + getTypeName(this.cameraType)" :name="collapseName">
    <el-divider/>
    <el-form label-width="120px">
      <el-form-item label="相机类型">
        <el-select v-model="cameraType" placeholder="Select">
          <el-option key="orthogonal" label="正交相机" :value="0"/>
          <el-option key="perspective" label="透视相机" :value="1"/>
          <el-option key="perspective_aim" label="透视相机（注视一点）" :value="2"/>
        </el-select>
      </el-form-item>
      <el-divider/>

      <el-form-item label="观察矩阵变量名">
        <el-input v-model="viewMatUniformName"/>
      </el-form-item>
      <el-divider/>

      <el-form-item label="投影矩阵变量名">
        <el-input v-model="projectionMatUniformName"/>
      </el-form-item>
    </el-form>
  </el-collapse-item>
</template>

<script>
import * as math from 'mathjs';
import {toTranslationMat, toRotationMat, mathjsMatToArray, toQuaternion} from '../utils';

export default {
  name: "CameraUniform",
  props: ['collapseName'],
  data() {
    return {
      viewMatUniformName: 'uViewMatrix',
      projectionMatUniformName: 'uProjectionMatrix',
      cameraType: 2,
      viewPositionD: 5.,
      viewPositionX: 5.,
      viewPositionY: 5.,
      viewPositionZ: 5.,
      viewRotationRoll: 0.,
      viewRotationPitch: 0.,
      viewRotationYaw: 0.,
      viewQuaternionX: 0.,
      viewQuaternionY: 0.,
      viewQuaternionZ: 0.,
      viewQuaternionW: 0.,
      projectionAspectRatio: 16 / 9,
      projectionFov: Math.PI / 2.,
      projectionOrthogonalWidth: 1.6,
      projectionNearClip: 0.1,
      projectionFarClip: 10.0,
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
      if (this.cameraType === 2) {

      } else {
        const translation = toTranslationMat(this.viewPositionX, this.viewPositionY, this.viewPositionZ);
        const rotation = toRotationMat(this.viewRotationRoll, this.viewRotationPitch, this.viewRotationYaw);
        const viewMatrix = math.multiply(rotation, translation);
        this.viewMatrix = mathjsMatToArray(viewMatrix, transpose = true);
      }
    },
    reCalculateProjectionMat() {
      if (this.cameraType === 0) {  // 正交
        this.projectionMatrix[0] = 2.0 / this.projectionOrthogonalWidth;
        this.projectionMatrix[5] = 2.0 / (this.projectionMatrix[0] / this.projectionAspectRatio);
        this.projectionMatrix[10] = 1.0 / (this.projectionNearClip - this.projectionFarClip);
        this.projectionMatrix[14] = this.projectionNearClip / (this.projectionNearClip - this.projectionFarClip);
      } else {  // 投影
        this.projectionMatrix[5] = math.cot(this.projectionFov / 2.0);
        this.projectionMatrix[0] = this.projectionMatrix[5] / this.projectionAspectRatio;
        this.projectionMatrix[10] = this.projectionFarClip / (this.projectionNearClip - this.projectionFarClip);
        this.projectionMatrix[14] = (this.projectionNearClip * this.projectionFarClip) / (this.projectionNearClip - this.projectionFarClip);
      }
    },
    reCalculateQuaternion() {
      const result = toQuaternion(this.viewRotationRoll, this.viewRotationPitch, this.viewRotationYaw);
      this.viewQuaternionX = result[0];
      this.viewQuaternionY = result[1];
      this.viewQuaternionZ = result[2];
      this.viewQuaternionW = result[3];
    }
  }
}
</script>

<style scoped>

</style>