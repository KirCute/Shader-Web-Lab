<template>
  <card-header :title="'时间相关变量' + (uniformName.length === 0 ? '' : ': '+ uniformName)">
    <el-form label-width="100px" size="small">
      <el-form-item label="变量名">
        <div style="display: flex; justify-content: space-between; flex: 1;">
          <el-input v-model="uniformName" class="uniform-name"/>
          <el-button @click="showDeleteDialog = true" class="delete-button" type="danger"> <el-icon><Delete/></el-icon> </el-button>
        </div>
      </el-form-item>
      <el-form-item label="单位">
        <el-select v-model="divCoefficient" @change="limitMod" style="flex: 1;">
          <el-option key="msec" label="毫秒" :value="1."/>
          <el-option key="sec" label="秒" :value="1000."/>
          <el-option key="min" label="分钟" :value="60000."/>
          <el-option key="hour" label="小时" :value="3600000."/>
        </el-select>
      </el-form-item>
      <el-form-item label="取模方法">
        <el-select v-model="modType" style="flex: 1;">
          <el-option key="none" label="不取模" :value="0"/>
          <el-option key="only" label="仅取模" :value="1"/>
          <el-option key="tri" label="取模且偶数周期取反" :value="2"/>
          <el-option key="normal" label="取模且归一化" :value="3"/>
          <el-option key="tri_normal" label="取模、归一化且偶数周期取反" :value="4"/>
        </el-select>
      </el-form-item>
      <el-form-item label="偏移量">
        <el-input-number v-model="offset" step-strictly class="uniform-name"/>
        <el-button @click="resetOffset" class="delete-button"> <el-icon><Timer/></el-icon> </el-button>
      </el-form-item>
      <el-form-item v-if="modType !== 0" label="模">
        <el-input-number v-model="mod" :min="1. / divCoefficient" style="flex: 1;"/>
      </el-form-item>
    </el-form>
    <el-dialog v-model="showDeleteDialog" title="删除自定义变量" width="30%" align-center>
      <span>确定要删除时间相关变量{{ uniformName }}吗？</span>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="destroy">确认</el-button>
      </span>
      </template>
    </el-dialog>
  </card-header>
</template>

<script>
export default {
  name: "CustomTimeUniformCard",
  props: {id: Number, parent: Object},
  data() {
    return {
      showDeleteDialog: false,
      uniformName: 'uUnnamed' + this.id,
      modType: 0,
      divCoefficient: 1.,
      offset: 0.,
      mod: 1.
    };
  },
  methods: {
    destroy() {
      this.showDeleteDialog = false;
      this.parent.deleteUniform(this.id);
    },
    bindUniform(gl, shaderProgram) {
      const uni = gl.getUniformLocation(shaderProgram, this.uniformName);
      let value, sampleTime, sign;
      switch (this.modType) {
        case 0:
          value = (Date.now() + this.offset) / this.divCoefficient;
          break;
        case 1:
          value = (Date.now() + this.offset) / this.divCoefficient % this.mod;
          break;
        case 2:
          sampleTime = (Date.now() + this.offset) / this.divCoefficient;
          sign = Math.floor(sampleTime / this.mod) % 2;
          value = sign === 0 ? sampleTime % this.mod : (this.mod - sampleTime % this.mod);
          break;
        case 3:
          value = ((Date.now() + this.offset) / this.divCoefficient) % this.mod / this.mod;
          break;
        case 4:
          sampleTime = (Date.now() + this.offset) / this.divCoefficient;
          sign = Math.floor(sampleTime / this.mod) % 2;
          value = sign === 0 ? sampleTime % this.mod / this.mod : (this.mod - sampleTime % this.mod / this.mod);
          break;
      }
      gl.uniform1f(uni, value);
    },
    resetOffset() {
      this.offset = -Date.now();
    },
    limitMod() {
      this.mod = Math.max(this.mod, 1. / this.divCoefficient);
    }
  }
}
</script>

<style scoped>
.uniform-name {
  flex-grow: 1;
  margin-right: 5px;
}

.delete-button {
  margin-left: 5px;
}
</style>