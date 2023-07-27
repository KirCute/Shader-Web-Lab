<template>
  <card-header :init-expanded="expanded" :badge="error"
               :title="$t('variable.temporal.title') + (uniformName.length === 0 ? '' : ': '+ uniformName)">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.temporal.name')">
        <div style="display: flex; justify-content: space-between; flex: 1;">
          <el-input v-model="uniformName" class="uniform-name">
            <template #append v-if="error">
              <el-tooltip placement="top" effect="dark" :content="$t('variable.error.varUndefined')">
                <el-icon color="orange"><WarnTriangleFilled/></el-icon>
              </el-tooltip>
            </template>
          </el-input>
          <el-button @click="showDeleteDialog = true" class="delete-button" type="danger">
            <el-icon><Delete/></el-icon>
          </el-button>
        </div>
      </el-form-item>
      <el-form-item :label="$t('variable.temporal.unit.title')">
        <el-select v-model="divCoefficient" @change="limitMod" style="flex: 1;">
          <el-option key="msec" :label="$t('variable.temporal.unit.ms')" :value="1."/>
          <el-option key="sec" :label="$t('variable.temporal.unit.s')" :value="1000."/>
          <el-option key="min" :label="$t('variable.temporal.unit.m')" :value="60000."/>
          <el-option key="hour" :label="$t('variable.temporal.unit.h')" :value="3600000."/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('variable.temporal.mod.title')">
        <el-select v-model="modType" style="flex: 1;">
          <el-option key="none" :label="$t('variable.temporal.mod.never')" :value="0"/>
          <el-option key="only" :label="$t('variable.temporal.mod.only')" :value="1"/>
          <el-option key="tri" :label="$t('variable.temporal.mod.triangular')" :value="2"/>
          <el-option key="normal" :label="$t('variable.temporal.mod.normalize')" :value="3"/>
          <el-option key="tri_normal" :label="$t('variable.temporal.mod.all')" :value="4"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('variable.temporal.offset')">
        <el-input-number v-model="offset" step-strictly class="uniform-name"/>
        <el-button @click="resetOffset" class="delete-button">
          <el-icon><Timer/></el-icon>
        </el-button>
      </el-form-item>
      <el-form-item v-if="modType !== 0" :label="$t('variable.temporal.modulus')">
        <el-input-number v-model="mod" :min="1. / divCoefficient" style="flex: 1;"/>
      </el-form-item>
    </el-form>
    <el-dialog v-model="showDeleteDialog" :title="$t('variable.custom.del.title')" width="30%" align-center>
      <span>{{
          $t('variable.custom.del.askPrefix') +
          $t('variable.temporal.title') + ' ' + uniformName +
          $t('variable.custom.del.askSuffix')
        }}</span>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDeleteDialog = false">{{ $t('variable.custom.del.cancel') }}</el-button>
        <el-button type="danger" @click="destroy">{{ $t('variable.custom.del.confirm') }}</el-button>
      </span>
      </template>
    </el-dialog>
  </card-header>
</template>

<script>
import {Delete, Timer, WarnTriangleFilled} from "@element-plus/icons-vue";

export default {
  name: "CustomTimeUniformCard",
  props: {
    id: Number,
    parent: Object,
    initValue: {type: Object, default: {type: 0, div: 1., offset: 0., modValue: 1.}},
    name: {type: String, default: ''},
    expanded: {type: Boolean, default: false}
  },
  components: {
    Delete, Timer, WarnTriangleFilled
  },
  data() {
    return {
      showDeleteDialog: false,
      uniformName: this.name.length === 0 ? 'uUnnamed' + this.id : this.name,
      modType: this.initValue.type || 0,
      divCoefficient: this.initValue.div || 1.,
      offset: this.initValue.offset || 0.,
      mod: this.initValue.modValue || 1.,
      error: false
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
          value = sign === 0 ? sampleTime % this.mod / this.mod : (1. - sampleTime % this.mod / this.mod);
          break;
      }
      gl.uniform1f(uni, value);
      this.error = uni === null;
    },
    resetOffset() {
      this.offset = -Date.now();
    },
    limitMod() {
      this.mod = Math.max(this.mod, 1. / this.divCoefficient);
    },
    genQuery() {
      return {
        type: 'time',
        initValue: { type: this.modType, div: this.divCoefficient, offset: this.offset, modValue: this.mod },
        name: this.name
      };
    }
  }
}
</script>

<style scoped>
@import "/src/assets/theme/all.css";

.uniform-name {
  flex-grow: 1;
  margin-right: 5px;
}

.delete-button {
  margin-left: 5px;
}
</style>