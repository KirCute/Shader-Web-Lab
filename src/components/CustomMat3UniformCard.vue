<template>
  <card-header :title="'自定义mat3变量' + (uniformName.length === 0 ? '' : ': '+ uniformName)">
    <el-form label-width="100px" size="small">
      <el-form-item label="变量名">
        <div style="display: flex; justify-content: space-between; flex: 1;">
          <el-input v-model="uniformName" class="uniform-name"/>
          <el-button @click="showDeleteDialog = true" class="delete-button" type="danger"> <el-icon><Delete/></el-icon> </el-button>
        </div>
      </el-form-item>
      <el-form-item label="值">
        <el-input-number v-model="value[0]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[1]" :step="step" class="inline"/>
        <el-input-number v-model="value[2]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item>
        <el-input-number v-model="value[3]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[4]" :step="step" class="inline"/>
        <el-input-number v-model="value[5]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item>
        <el-input-number v-model="value[6]" :step="step" class="inline-first"/>
        <el-input-number v-model="value[7]" :step="step" class="inline"/>
        <el-input-number v-model="value[8]" :step="step" class="inline-last"/>
      </el-form-item>
      <el-form-item label="步长">
        <el-input-number v-model="step" :min="0" :step="0.01" style="flex: 1;"/>
      </el-form-item>
    </el-form>
    <el-dialog v-model="showDeleteDialog" title="删除自定义变量" width="30%" align-center>
      <span>确定要删除自定义mat3变量{{ uniformName }}吗？</span>
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
  name: "CustomMat3UniformCard",
  props: {
    id: Number,
    parent: Object,
    initValue: {type: Array, default: [1., 0., 0., 0., 1., 0., 0., 0., 1.]},
    name: {type: String, default: ''}
  },
  data() {
    return {
      showDeleteDialog: false,
      uniformName: this.name.length === 0 ? 'uUnnamed' + this.id : this.name,
      value: this.initValue.concat(),
      step: 0.1,
    };
  },
  methods: {
    destroy() {
      this.showDeleteDialog = false;
      this.parent.deleteUniform(this.id);
    },
    bindUniform(gl, shaderProgram) {
      const uni = gl.getUniformLocation(shaderProgram, this.uniformName);
      gl.uniformMatrix3fv(uni, true, this.value);
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