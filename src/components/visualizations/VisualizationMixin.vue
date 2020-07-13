<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

@Component
export default class VisualizationMixin extends Vue {
    /**
     * Propagate selections in the visualisation to the search tree and
     * The functional analysis data.
     *
     * @param id Taxon id to inspect
     * @param searchTerm Search term to put in box
     * @param [timeout=500] timeout in ms to wait before processing
     */
    public search(id: number, searchTerm, timeout = 500) {
        setTimeout(() => {
            /**
             * Fired after the user indicated that he soehow wants to filter the currently visible results in the
             * application.
             *
             * @event update-selected-taxon-id
             * @property {string} id The id of the taxon to which results should be restricted. Note that alle taxa
             * that are (both direct and indirect) children of this taxon should also be present in the filtering.
             */
            this.$emit("update-selected-taxon-id", id);
        }, timeout);
    }
}
</script>
