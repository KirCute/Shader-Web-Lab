<template>
  <card-header :init-expanded="expanded" :badge="error"
               :title="$t('variable.custom.prefix') + 'mat4' + $t('variable.custom.suffix') + (uniformName.length === 0 ? '' : ': '+ uniformName)">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.custom.name')">
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
      <el-form-item :label="$t('variable.custom.value')">
        <el-input-number v-model="value[0]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[1]" :step="step" class="inline"/>
        <el-input-number v-model="value[2]" :step="step" class="inline"/>
        <el-input-number v-model="value[3]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item>
        <el-input-number v-model="value[4]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[5]" :step="step" class="inline"/>
        <el-input-number v-model="value[6]" :step="step" class="inline"/>
        <el-input-number v-model="value[7]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item>
        <el-input-number v-model="value[8]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[9]" :step="step" class="inline"/>
        <el-input-number v-model="value[10]" :step="step" class="inline"/>
        <el-input-number v-model="value[11]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item>
        <el-input-number v-model="value[12]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[13]" :step="step" class="inline"/>
        <el-input-number v-model="value[14]" :step="step" class="inline"/>
        <el-input-number v-model="value[15]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item :label="$t('variable.custom.step')">
        <el-input-number v-model="step" :min="0" :step="0.01" style="flex: 1;"/>
      </el-form-item>
    </el-form>
    <el-dialog v-model="showDeleteDialog" :title="$t('variable.custom.del.title')" width="30%" align-center>
      <span>{{
          $t('variable.custom.del.askPrefix') +
          $t('variable.custom.prefix') + 'mat4' + $t('variable.custom.suffix') + uniformName +
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
import {Delete, WarnTriangleFilled} from "@element-plus/icons-vue";

export default {
  name: "CustomMat3UniformCard",
  props: {
    id: Number,
    parent: Object,
    initValue: {type: Object, default: {value: [1.,0.,0.,0., 0.,1.,0.,0., 0.,0.,1.,0., 0.,0.,0.,1.], step: .1}},
    name: {type: String, default: ''},
    expanded: {type: Boolean, default: false}
  },
  components: {
    Delete, WarnTriangleFilled
  },
  data() {
    return {
      showDeleteDialog: false,
      uniformName: this.name.length === 0 ? 'uUnnamed' + this.id : this.name,
      value: (this.initValue.value || [1.,0.,0.,0., 0.,1.,0.,0., 0.,0.,1.,0., 0.,0.,0.,1.]).concat(),
      step: this.initValue.step || .1,
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
      gl.uniformMatrix4fv(uni, true, this.value);
      this.error = uni === null;
    },
    genQuery() {
      return { type: 'mat4', initValue: { value: this.value, step: this.step }, name: this.name };
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
</style>