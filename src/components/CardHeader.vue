<template>
  <el-card>
    <template v-if="expanded" #header>
      <div class="card-header">
        <span>{{ title }}</span>
        <el-link class="ban-select" :underline="false" @click="expanded = !expanded">{{ expanded ? '收起' : '展开' }}</el-link>
      </div>
    </template>
    <div v-if="!expanded" class="card-header">
      <span>{{ title }}</span>
      <el-link class="ban-select" :underline="false" @click="expanded = !expanded">{{ expanded ? '收起' : '展开' }}</el-link>
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ban-select {
  user-select: none;
  background: white;
}
</style>