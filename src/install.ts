import * as components from './components'
import vuetify from './plugins/vuetify';
import fullscreen from 'vue-fullscreen';
import Vuex from "vuex";

const install = (Vue: any, options: any = {}) => {
  for (let key in components) {
    let _key = options.prefix ? options.prefix + key : key
    // @ts-ignore
    Vue.component(_key, components[key]) 
  }
  Vue.use(vuetify);
  Vue.use(fullscreen);
  Vue.use(Vuex);
}

// auto install
// @ts-ignore
if (typeof window !== 'undefined' && window.Vue) {
  // @ts-ignore
  install(window.Vue)
}

export { install }
