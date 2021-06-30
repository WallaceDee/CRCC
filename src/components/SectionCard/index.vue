<template>
  <Card class="dark" shadow>
    <p class="title" slot="title">{{ title }}</p>
    <slot></slot>
  </Card>
</template>
<script>
export default {
  name: 'SectionCard',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
<style lang="less">
.dark {
  .ivu-card-head {
    border-bottom: none;
  }
}
</style>
<style lang="less" scoped>
.dark {
  background: rgba(25, 31, 46, 0.7);
  .ivu-card-head {
    border-bottom: none;
  }
  .title {
    color: #fff;
  }
}
</style>
