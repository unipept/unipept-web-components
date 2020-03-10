<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import DataRepository from "../../../logic/data-source/DataRepository";
import NCBITaxon from "../../../logic/data-management/ontology/taxa/NCBITaxon";
import FATrust from "../../../logic/functional-annotations/FATrust";
import TaxaDataSource from "../../../logic/data-source/TaxaDataSource";
import FaSortSettings from "../../tables/FaSortSettings";
import { numberToPercent } from "../../../logic/utils";

@Component
export default class FunctionalSummaryMixin extends Vue {
    @Prop({ required: true })
    protected dataRepository: DataRepository;
    @Prop({ required: false, default: false })
    protected analysisInProgress: boolean;
    @Prop({ required: true })
    protected filterTaxonId: number;
    @Prop({ required: true })
    protected sortSettings: FaSortSettings;

    protected totalPeptides: number = 0;
    protected selectedNCBITaxon: NCBITaxon = null;
    protected showTaxonInfo: boolean = false;

    protected percentSettings: string = "5";

    // This function should be overriden by the implementing subclass. Due to a Vue-limitation, we cannot make this class abstract and cannot enforce the implementation of this method.
    public async recompute(): Promise<void> {}

    @Watch("dataRepository")
    @Watch("percentSettings")
    @Watch("filterTaxonId")
    private async onRecomputeNecessary() {
        this.recompute();
    }

    /**
     * Creates a line indicating the trust of the function annotations
     *
     * @param trust The FATrust object that contains all necessary trust information.
     * @param kind Human readable word that fits in "To have at least one … assigned to it"
     * @return
     */
    protected computeTrustLine(trust: FATrust, kind: string): string {
        if (trust.annotatedCount === 0) {
            return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
        }
        if (trust.annotatedCount === trust.totalCount) {
            return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them. `;
        }
        if (trust.annotatedCount === 1) {
            return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) has at least one ${kind} assigned to it. `;
        }
        return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) have at least one ${kind} assigned to them. `;
    }

    protected async getSequences(): Promise<string[]> {
        const taxaSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
        let sequences = null;
        if (this.filterTaxonId > 0) {
            const tree = await taxaSource.getTree();
            sequences = tree.getAllSequences(this.filterTaxonId);
        }
        return sequences;
    }
}
</script>
