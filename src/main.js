// import ViewUI from 'view-design'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import components from './components/'
import VueLazyload from 'vue-lazyload'
import ViserVue from 'viser-vue'

Vue.use(components)
Vue.use(ViserVue)
    // Vue.use(ViewUI)
Vue.config.productionTip = false
Vue.use(VueLazyload)
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')