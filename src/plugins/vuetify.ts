import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
  },
  theme: {
    themes: {
      light: {
        primary: "#2196F3",
        secondary: "#ffc107",
        accent: "#2196F3"
      }
    }
  }
});