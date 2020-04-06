<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import FunctionalTrust from "./../../../business/processors/functional/FunctionalTrust";
import StringUtils from "./../../../business/misc/StringUtils";

@Component
export default class FunctionalSummaryMixin extends Vue {
    protected percentSettings: string = "5";

    /**
     * Creates a line indicating the trust of the function annotations
     *
     * @param trust The FATrust object that contains all necessary trust information.
     * @param kind Human readable word that fits in "To have at least one … assigned to it"
     * @return
     */
    protected computeTrustLine(trust: FunctionalTrust, kind: string): string {
        if (trust.annotatedPeptides === 0) {
            return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
        }
        if (trust.annotatedPeptides === trust.totalAmountOfPeptides) {
            return `<strong>All peptides</strong> ${trust.annotatedPeptides <= 5 ? `(only ${trust.annotatedPeptides})` : ""} have at least one ${kind} assigned to them. `;
        }
        if (trust.annotatedPeptides === 1) {
            return `Only <strong>one peptide</strong> (${StringUtils.numberToPercent(trust.annotatedPeptides / trust.totalAmountOfPeptides)}) has at least one ${kind} assigned to it. `;
        }
        return `<strong>${trust.annotatedPeptides}</strong> (${StringUtils.numberToPercent(trust.annotatedPeptides / trust.totalAmountOfPeptides)}) have at least one ${kind} assigned to them. `;
    }
}
</script>
