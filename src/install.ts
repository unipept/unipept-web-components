import * as components from './components'
import vuetify from './plugins/vuetify';

const install = (Vue: any, options: any = {}) => {
  console.log("I'M BEING INSTALLED!");
  for (let key in components) {
    let _key = options.prefix ? options.prefix + key : key
    // @ts-ignore
    Vue.component(_key, components[key]) 
  }
  Vue.use(vuetify);
}

// auto install
// @ts-ignore
if (typeof window !== 'undefined' && window.Vue) {
  // @ts-ignore
  install(window.Vue)
}

export { install }
