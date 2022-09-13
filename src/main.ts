import Vue from "vue"
import App from "./App.vue"
import pinia from './plugins/pinia';

Vue.config.productionTip = false

new Vue({
  pinia,
  render: h => h(App),
}).$mount("#app")
