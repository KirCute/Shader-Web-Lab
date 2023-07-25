<template>
  <card-header :init-expanded="expanded"
               :title="$t('variable.custom.prefix') + 'float' + $t('variable.custom.suffix') + (uniformName.length === 0 ? '' : ': '+ uniformName)">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.custom.name')">
        <div style="display: flex; justify-content: space-between; flex: 1;">
          <el-input v-model="uniformName" class="uniform-name"/>
          <el-button @click="showDeleteDialog = true" class="delete-button" type="danger">
            <el-icon><Delete/></el-icon>
          </el-button>
        </div>
      </el-form-item>
      <el-form-item :label="$t('variable.custom.value')">
        <el-input-number v-model="value" :step="step" style="flex: 1;"/>
      </el-form-item>
      <el-form-item :label="$t('variable.custom.step')">
        <el-input-number v-model="step" :min="0" :step="0.01" style="flex: 1;"/>
      </el-form-item>
    </el-form>
    <el-dialog v-model="showDeleteDialog" :title="$t('variable.custom.del.title')" width="30%" align-center>
      <span>{{
          $t('variable.custom.del.askPrefix') +
          $t('variable.custom.prefix') + 'float' + $t('variable.custom.suffix') + uniformName +
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
import {Delete} from "@element-plus/icons-vue";

export default {
  name: "CustomFloatUniformCard",
  props: {
    id: Number,
    parent: Object,
    initValue: {type: Object, default: {value: 0., step: .1}},
    name: {type: String, default: ''},
    expanded: {type: Boolean, default: false}
  },
  data() {
    return {
      showDeleteDialog: false,
      uniformName: this.name.length === 0 ? 'uUnnamed' + this.id : this.name,
      value: this.initValue.value || 0.,
      step: this.initValue.step || .1,
    };
  },
  components: {
    Delete
  },
  methods: {
    destroy() {
      this.showDeleteDialog = false;
      this.parent.deleteUniform(this.id);
    },
    bindUniform(gl, shaderProgram) {
      const uni = gl.getUniformLocation(shaderProgram, this.uniformName);
      gl.uniform1f(uni, this.value);
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