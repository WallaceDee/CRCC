import axios from 'axios'
import { Notice } from 'view-design'
// import router from '../router/manage.js'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  checkStatus(response) {
    try {
      console.log(response)
        const { status, statusText, config: { url } } = response
        if (status === 403||status === 401) {
          Notice.error({
            title:'错误',
            desc:'登录失效，请重新登录！'
          })
          localStorage.removeItem('token')
          // router.push({
          //   name:'Index'
          // })
          window.location.href='./'
        }
    } catch (e) {
        console.error(e)
    }
}
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        Authorization:localStorage.getItem('token')
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      return data
    }, error => {
      this.destroy(url)
      if (error.response) {
        this.checkStatus(error.response)
      }
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest