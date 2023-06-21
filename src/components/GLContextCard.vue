<template>
  <card-header title="OpenGL上下文">
    <el-form label-width="100px" size="small">
      <el-form-item label="背景色 (RGBA)">
        <el-input-number v-model="backgroundColor[0]" :step="0.01" :min="0." :max="1." class="inline-first"/>
        <el-input-number v-model="backgroundColor[1]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-input-number v-model="backgroundColor[2]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-input-number v-model="backgroundColor[3]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-color-picker v-model="color" show-alpha color-format="hex" class="inline-last"/>
      </el-form-item>
    </el-form>
  </card-header>
</template>

<script>
import {hexToRgba, rgbaToHex} from "../utils";

export default {
  name: "GLContextCard",
  computed: {
    color: {
      get: function () {
        return rgbaToHex(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3]);
      },
      set: function (newValue) {
        const rgb = hexToRgba(newValue);
        this.backgroundColor[0] = rgb[0];
        this.backgroundColor[1] = rgb[1];
        this.backgroundColor[2] = rgb[2];
        this.backgroundColor[3] = rgb[3];
      }
    }
  },
  data() {
    return {
      backgroundColor: [0., 0., 0., 1.],
    };
  },
  methods: {
    clearColor(gl) {
      gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3]);
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
</style>