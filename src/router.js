import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Workbench',
    redirect: '/Index',
    component: () => import('./views/Workbench.vue'),
    children: [
      {
        path: 'Index',
        name: 'Index',
        meta: {
          title: '首页'
        },
        component: (resolve) => require(['./views/Index'], resolve)
      },
      {
        path: 'Monitor/:trainCode',
        name: 'Monitor',
        meta: {
          title: '列车监控'
        },
        component: (resolve) => require(['./views/Monitor'], resolve)
      },
      {
        path: 'Statistics',
        name: 'Statistics',
        meta: {
          title: '故障统计'
        },
        component: (resolve) => require(['./views/Statistics'], resolve)
      },
      {
        path: 'List',
        name: 'List',
        meta: {
          title: '故障查询'
        },
        component: (resolve) => require(['./views/List'], resolve)
      }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  routes
})

export default router
