<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { v4 as uuidv4 } from "uuid";
import Assay from "./../../business/entities/assay/Assay";
import ProteomicsAssay from "./../../business/entities/assay/ProteomicsAssay";

@Component
export default class DatasetMixin extends Vue {
    protected selectDataset(assay: Assay): void {
        /**
         * Fired after creation of a new assay by the user. This assay is not automatically processed or added to the
         * list of selected assays by this component.
         *
         * @event create-assay
         * @property {Assay} assay The new assay that was created by the user.
         */
        this.$emit("create-assay", assay);
    }

    protected deleteDataset(dataset: Assay): void {
        /**
         * Fired after the user chose to delete a specific assay from persistent storage.
         *
         * @event destroy-assay
         * @property {Assay} assay The assay that should be removed from persistent storage (and all other locations
         * were it's being used).
         */
        this.$emit("destroy-assay", dataset);
    }

    /**
     * Store a new dataset with all the given properties. This function does not store the dataset itself, it only
     * creates a new assay-object and emits the corresponding event.
     *
     * @param peptides One big string containing all peptides for this dataset. The peptides inside this string should
     * be separated by "\n" and will automatically be split by this function.
     * @param name The name of the new assay that should be stored.
     * @param save Whether the new assay should be stored in persistent storage or not. Pass true if it should be
     * stored.
     * @return The assay that was created and stored by this function.
     */
    protected storeDataset(peptides: string, name: string, save: boolean): ProteomicsAssay {
        const assay: ProteomicsAssay = new ProteomicsAssay(uuidv4());

        assay.setPeptides(peptides.split("\n"));
        assay.setDate(new Date());
        assay.setName(name);

        /**
         * Fired after creation of a new assay by the user, in the event that he also chose to
         * persistently store the assay.
         *
         * @event store-assay
         * @property {Assay} assay The assay that was created by the user and that should be persistently
         * stored.
         */
        this.$emit("store-assay", assay, save);
        return assay;
    }
}
</script>
