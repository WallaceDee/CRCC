<template>
  <div id="app" :key="appKey">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      appKey: new Date().getTime()
    }
  },
  watch: {
    $route() {
      this.appKey = new Date().getTime()
    }
  },
  mounted() {}
}
</script>
<style lang="less">
html {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
* {
  -webkit-overflow-scrolling: touch;
}
body,
html {
  height: 1080px;
  // overflow: hidden;
}
#app {
  height: 1080px;
  overflow: auto;
}
</style>
