import Vue from "vue";
import Vuetify from "vuetify";
import { options } from "@/plugins/vuetify";

Vue.use(Vuetify);
const vuetify = new Vuetify(options);

// Vuetify support in StoryBook.
export const decorators = [
  (story, context) => {
    // wrap the passed component within the passed context
    const wrapped = story(context)
    // extend Vue to use Vuetify around the wrapped component
    return Vue.extend({
      components: {
        wrapped
      },
      vuetify,
      template: `
        <v-app>
          <v-container fluid>
            <wrapped />
          </v-container>
        </v-app>
      `
    })
  },
]
