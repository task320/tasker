import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-task-list',
      component: require('@/components/ListMain').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
