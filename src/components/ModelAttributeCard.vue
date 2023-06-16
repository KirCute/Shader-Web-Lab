<template>
  <el-collapse-item title="模型" :name="collapseName">
    <div>
      Consistent with real life: in line with the process and logic of real
      life, and comply with languages and habits that the users are used to;
    </div>
  </el-collapse-item>
</template>

<script>
export default {
  name: "ModelAttributeCard",
  props: ['collapseName']
}
</script>

<style scoped>

</style>