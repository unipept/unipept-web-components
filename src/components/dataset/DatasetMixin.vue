<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MetaProteomicsAssay from "../../logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "../../logic/data-management/StorageType";
import StorageWriter from "../../logic/data-management/visitors/storage/StorageWriter";
import { EventBus } from "../EventBus";
import Assay from "../../logic/data-management/assay/Assay";

@Component
export default class DatasetMixin extends Vue {
    protected pendingStore: boolean = false;

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

    protected storeDataset(peptides: string, name: string, save: boolean): void {
        this.pendingStore = true;

        let assay: MetaProteomicsAssay = new MetaProteomicsAssay();            
        let storageType = save ? StorageType.LocalStorage : StorageType.SessionStorage;
        let storageWriter: StorageWriter = new StorageWriter();

        assay.setPeptides(peptides.split("\n"));
        assay.setDate(new Date());
        assay.setStorageType(save ? StorageType.LocalStorage : StorageType.SessionStorage);
        assay.setName(name);

        assay.visit(storageWriter).then(
            () => {
                this.selectDataset(assay);
                if (save) {
                    /**
                     * Fired after creation of a new assay by the user, in the event that he also chose to 
                     * persistently store the assay.
                     * 
                     * @event store-assay
                     * @property {Assay} assay The assay that was created by the user and that should be persistently 
                     * stored.
                     */
                    this.$emit("store-assay", assay);
                }
                this.pendingStore = false;
            }
        );
    }
}
</script>
