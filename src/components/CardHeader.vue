<template>
  <el-card>
    <template v-if="expanded" #header>
      <div class="card-header">
        <span class="swl-attribute-title">{{ title }}</span>
        <el-link class="swl-expand-button ban-select" :underline="false" @click="expanded = !expanded">
          {{ $t('variable.header.fold') }}
        </el-link>
      </div>
    </template>
    <div v-if="!expanded" class="card-header">
      <span class="swl-attribute-title">{{ title }}</span>
      <el-link class="swl-expand-button ban-select" :underline="false" @click="expanded = !expanded">
        {{ $t('variable.header.unfold') }}
      </el-link>
    </div>
    <slot v-if="expanded"/>
  </el-card>
</template>

<script>
export default {
  name: "CardHeader",
  props: {
    title: {type: String},
    initExpanded: {type: Boolean, default: false}
  },
  data() {
    return {
      expanded: this.initExpanded
    };
  }
}
</script>

<style scoped>
@import "/src/assets/theme/all.css";

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ban-select {
  user-select: none;
  background: transparent;
}
</style>