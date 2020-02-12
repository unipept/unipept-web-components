<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MetaProteomicsAssay from "../../logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "../../logic/data-management/StorageType";
import StorageWriter from "../../logic/data-management/assay/visitors/browser/BrowserStorageWriter";
import Assay from "../../logic/data-management/assay/Assay";

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
     * be seperated by "\n" and will automatically be split by this function.
     * @param name The name of the new assay that should be stored.
     * @param save Whether the new assay should be stored in persistent storage or not. Pass true if it should be
     * stored.
     * @return The assay that was created and stored by this function.
     */
    protected storeDataset(peptides: string, name: string, save: boolean): Assay {
        let assay: MetaProteomicsAssay = new MetaProteomicsAssay();            
        let storageWriter: StorageWriter = new StorageWriter();

        assay.setPeptides(peptides.split("\n"));
        assay.setDate(new Date());
        assay.setStorageType(save ? StorageType.LocalStorage : StorageType.SessionStorage);
        assay.setName(name);

        /**
         * Fired after creation of a new assay by the user, in the event that he also chose to 
         * persistently store the assay.
         * 
         * @event store-assay
         * @property {Assay} assay The assay that was created by the user and that should be persistently 
         * stored.
         */
        this.$emit("store-assay", assay);
        return assay;
    }
}
</script>
