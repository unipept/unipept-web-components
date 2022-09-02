import Vue from "vue";
import Vuetify, { UserVuetifyPreset } from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export const options: Partial<UserVuetifyPreset> = {
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
};
export default new Vuetify(options);