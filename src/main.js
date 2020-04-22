import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import fastClick from 'fastclick'
import router from './router'
import Axios from 'axios'
import VueLazyLoad from 'vue-lazyload'
import Loading from 'base/loading/loading'
import store from './store'
// import vueSwiper from 'vue-awesome-swiper'
// import 'swiper/dist/css/swiper.css'

import 'common/stylus/index.styl'
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
  // loading: 'https://c.jiangwenqiang.com/api/logo.jpg'
})
Vue.component('loading', Loading)
Vue.prototype.$axios = Axios
Vue.config.productionTip = false
fastClick.attach(document.body)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
