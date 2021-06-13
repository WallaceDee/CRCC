module.exports = {
  '/train/': {
    target: 'http://47.107.227.94:7798',
    changeOrigin: true
  },
  '/fault/': {
    target: 'http://47.107.227.94:7798',
    changeOrigin: true
  },
  '/pis/': {
    target: 'http://47.107.227.94:7798',
    changeOrigin: true
  }
  // ,
  // '/api/': {
  //   target: 'http://192.168.0.69:8005/',
  //   pathRewrite: {
  //     '^/api': ''
  //   },
  //   changeOrigin: true
  // }
}
