<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "@/logic/data-management/StorageType";
import StorageWriter from "@/logic/data-management/visitors/storage/StorageWriter";
import { EventBus } from "../EventBus";
import Assay from "@/logic/data-management/assay/Assay";

@Component
export default class DatasetMixin extends Vue {
    protected pendingStore: boolean = false;

    protected selectDataset(dataset: Assay): void {
        EventBus.$emit("select-dataset", dataset);
    }

    protected deleteDataset(dataset: Assay): void {
        this.$store.dispatch("deleteDataset", dataset);
        EventBus.$emit("delete-dataset", dataset);
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
