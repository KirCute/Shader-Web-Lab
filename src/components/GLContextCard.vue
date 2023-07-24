<template>
  <card-header :title="$t('variable.context.title')">
    <el-form label-width="100px" size="small">
      <el-form-item :label="$t('variable.context.backgroundColor')">
        <el-input-number v-model="backgroundColor[0]" :step="0.01" :min="0." :max="1." class="inline-first"/>
        <el-input-number v-model="backgroundColor[1]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-input-number v-model="backgroundColor[2]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-input-number v-model="backgroundColor[3]" :step="0.01" :min="0." :max="1." class="inline"/>
        <el-color-picker v-model="color" show-alpha color-format="hex" class="inline-last"/>
      </el-form-item>
      <el-form-item v-for="(e, i) in enabled" :key="i" :label="e.name">
        <el-checkbox v-model="e.value" @change="onEnabledChange(e.symbol, e.value)"/>
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
      gl: undefined,
      enabled: [],
      backgroundColor: [0., 0., 0., 1.],
    };
  },
  methods: {
    initializeGL(gl) {
      this.gl = gl;
      this.enabled = [
        {name: this.$t('variable.context.blend'), symbol: gl.BLEND, value: false},
        {name: this.$t('variable.context.cull'), symbol: gl.CULL_FACE, value: true},
        {name: this.$t('variable.context.depthTest'), symbol: gl.DEPTH_TEST, value: true},
        {name: this.$t('variable.context.dither'), symbol: gl.DITHER, value: false},
        {name: this.$t('variable.context.polygonOffsetFill'), symbol: gl.POLYGON_OFFSET_FILL, value: false},
        {name: this.$t('variable.context.sampleAlphaToCoverage'), symbol: gl.SAMPLE_ALPHA_TO_COVERAGE, value: false},
        {name: this.$t('variable.context.smpCoverage'), symbol: gl.SAMPLE_COVERAGE, value: false},
        {name: this.$t('variable.context.scissorTest'), symbol: gl.SCISSOR_TEST, value: false},
        {name: this.$t('variable.context.stencilTest'), symbol: gl.STENCIL_TEST, value: false}
      ];
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.CULL_FACE);
    },
    onEnabledChange(symbol, value) {
      if (value) this.gl.enable(symbol);
      else this.gl.disable(symbol);
    },
    clearColor() {
      if (this.gl === undefined) return;
      this.gl.clearColor(
          this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3]
      );
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    },
    loadQuery(query) {
      if (this.gl === undefined) return;
      if (Array.isArray(query.backgroundColor) && (query.backgroundColor.length === 4 || query.backgroundColor.length === 3)) {
        this.backgroundColor[0] = query.backgroundColor[0];
        this.backgroundColor[1] = query.backgroundColor[1];
        this.backgroundColor[2] = query.backgroundColor[2];
        this.backgroundColor[3] = query.backgroundColor.length === 4 ? query.backgroundColor[3] : 1.0;
      }
      if (typeof (query.blend) == 'boolean') this.onEnabledChange(this.gl.BLEND, query.blend);
      if (typeof (query.cull) == 'boolean') this.onEnabledChange(this.gl.CULL_FACE, query.cull);
      if (typeof (query.depthTest) == 'boolean') this.onEnabledChange(this.gl.DEPTH_TEST, query.depthTest);
      if (typeof (query.dither) == 'boolean') this.onEnabledChange(this.gl.DITHER, query.dither);
      if (typeof (query.polygonOffsetFill) == 'boolean') this.onEnabledChange(this.gl.POLYGON_OFFSET_FILL, query.polygonOffsetFill);
      if (typeof (query.sampleAlphaToCoverage) == 'boolean') this.onEnabledChange(this.gl.SAMPLE_ALPHA_TO_COVERAGE, query.sampleAlphaToCoverage);
      if (typeof (query.smpCoverage) == 'boolean') this.onEnabledChange(this.gl.SAMPLE_COVERAGE, query.smpCoverage);
      if (typeof (query.scissorTest) == 'boolean') this.onEnabledChange(this.gl.SCISSOR_TEST, query.scissorTest);
      if (typeof (query.stencilTest) == 'boolean') this.onEnabledChange(this.gl.STENCIL_TEST, query.stencilTest);
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
</style>