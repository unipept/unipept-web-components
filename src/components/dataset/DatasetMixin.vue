<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MetaProteomicsAssay from "../../logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "../../logic/data-management/StorageType";
import StorageWriter from "../../logic/data-management/visitors/storage/StorageWriter";
import { EventBus } from "../EventBus";
import Assay from "../../logic/data-management/assay/Assay";

@Component
/**
 * The CreateDatasetCard provides the user with a form for creating a new Assay, based on a list of peptides. The user 
 * can indicate it's preference to storing this card in persistent storage. Note that this component does not stores or 
 * selects assays by itself, it only emits an event with it's intended action.
 */
export default class DatasetMixin extends Vue {
    protected pendingStore: boolean = false;

    protected selectDataset(assay: Assay): void {
        /**
         * Fired after creation of a new assay by the user. This assay is not automatically processed or added to the
         * list of selected assays by this component.
         * 
         * @event create-dataset
         * @property {Assay} assay The new assay that was created by the user.
         */
        this.$emit("create-dataset", assay);
    }

    protected deleteDataset(dataset: Assay): void {
        this.$store.dispatch("deleteDataset", dataset);
        this.$emit("delete-dataset", dataset);
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
                    EventBus.$emit("store-dataset", assay);
                }
                this.pendingStore = false;
            }
        );
    }
}
</script>
