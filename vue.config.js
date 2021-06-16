const path = require('path')
const proxyTable = require('./src/config/proxy.js')
const CompressionPlugin = require('compression-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
const resolve = (dir) => {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: '/',
  // publicPath: isProduction ? './' : './',
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, 'src/assets/less/variable.less')] // 引入全局样式变量
    }
  },
  transpileDependencies: [
    'dom7',
    '_dom7@2.1.3@dom7',
    '_swiper@5.3.8@swiper',
    'swiper'
  ],
  configureWebpack: (config) => {
    if (isProduction) {
      config.plugins.push(
        new CompressionPlugin({
          test: /\.js$|\.css$|\.less/,
          threshold: 10240,
          deleteOriginalAssets: false
        })
      )
    }
    // config.externals = Object.assign(config.externals || {}, {
    //     vue: 'Vue',
    //     vuex: 'Vuex',
    //     'vue-router': 'VueRouter'
    // })
  },
  chainWebpack: (config) => {
    // const cdn = {
    //         css: ['/static/css/iview.css'],
    //         js: [
    //             isProduction ? '/static/js/vue.runtime.min.js' : '/static/js/vue.js',
    //             '/static/js/vuex.min.js',
    //             '/static/js/vue-router.min.js'
    //         ]
    //     }
    //     // html中添加cdn
    //     //提示
    //     //当在 multi-page 模式下构建时，webpack 配置会包含不一样的插件 (这时会存在多个 html-webpack-plugin 和 preload-webpack-plugin 的实例)。如果你试图修改这些插件的选项，请确认运行 vue inspect。
    //     //multi-page 模式下plugin名为html-index,模式为 `html-${page名}``
    // config.plugin('html').tap(args => {
    //     //暴露变量cdn到index.html
    //     args[0].cdn = cdn
    //     return args
    // })

    config.output.chunkFilename(`js/crcc-[name].[chunkhash:8].js`)
    config.output.filename('js/crcc-[name].js')

    config.resolve.alias.set('@', resolve('src'))

    config.module
      .rule('view-design') //  我目前用的是新版本的iview ,旧版本的iview，用iview代替view-design
      .test(/view-design.src.*?js$/)
      .use('babel')
      .loader('babel-loader')
      .end()

    config.module
      .rule('vue')
      .use('iview')
      .loader('iview-loader')
      .options({
        prefix: false
      })

    config.module
      .rule('eslint')
      .pre()
      .exclude.add(/node_modules/)
      .add(/libs/)
      .end()
      .test(/\.(vue|(j|t)sx?)$/)
      .use('eslint-loader')
      .loader('eslint-loader')
      .options({
        cache: true,
        extensions: ['.js', '.jsx', '.vue'],
        emitError: false,
        emitWarning: true,
        formatter: require('eslint-friendly-formatter')
      })
  },
  devServer: {
    port: 8000,
    proxy: proxyTable || {}
  }
}
