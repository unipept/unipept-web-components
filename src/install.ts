import * as components from "./components"
import Vuetify from "./plugins/vuetify";

/**
 * Install the unipept-web-components as a global library in a project.
 * 
 * @param Vue The Vue-object to which this library should be registered.
 * @param options A reference to a valid Vuetify and VueFullscreen instance, provided under the property names "vuetify" and "fullscreen".
 */
const install = (Vue: any, options: any = {}) => {
    for (let key in components) {
        let _key = options.prefix ? options.prefix + key : key
        // @ts-ignore
        Vue.component(_key, components[key]) 
    }
    Vue.use(Vuetify);
    Vue.use(options["fullscreen"]);
}

// auto install
// // @ts-ignore
// if (typeof window !== 'undefined' && window.Vue) {
//   // @ts-ignore
//   install(window.Vue)
// }

export { install }
