<template>
    <tooltip message="Download a CSV-file with the results of this analysis.">
        <v-menu offset-y bottom left origin="top right">
            <template v-slot:activator="{ on }">
                <v-btn min-width="187" :disabled="progress !== 1 || exportLoading" v-on="on" color="default">
                    <div v-if="!exportLoading">
                        <v-icon>
                            mdi-download
                        </v-icon>
                        {{ buttonText }}
                        <v-icon>mdi-menu-down</v-icon>
                    </div>
                    <v-progress-circular v-else indeterminate color="black" :size="20">
                    </v-progress-circular>
                </v-btn>
            </template>
            <v-list>
                <v-list-item @click="downloadCsv()">
                    <v-list-item-title>Comma-separated (international)</v-list-item-title>
                </v-list-item>
                <v-list-item @click="downloadCsv(';', ',')">
                    <v-list-item-title>Semi-colon-separated (Europe)</v-list-item-title>
                </v-list-item>
                <v-list-item @click="downloadCsv('\t', ';')">
                    <v-list-item-title>Tab-separated</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </tooltip>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Tooltip from "../../custom/Tooltip.vue";
import PeptideExport from "./../../../business/export/PeptideExport";
import NetworkUtils from "./../../../business/communication/NetworkUtils";
import ProteomicsAssay from "./../../../business/entities/assay/ProteomicsAssay";
import { Prop } from "vue-property-decorator";
import { Peptide } from "./../../../business/ontology/raw/Peptide";
import { CountTable } from "./../../../business/counts/CountTable";
import CommunicationSource from "./../../../business/communication/source/CommunicationSource";


@Component({
    components: { Tooltip }
})
export default class ExportResultsButton extends Vue {
    @Prop({ required: true })
    private assay: ProteomicsAssay;
    @Prop({ required: false, default: "Download results" })
    private buttonText: string;

    private exportLoading: boolean = false;

    private get peptideCountTable(): CountTable<Peptide> {
        return this.$store.getters.assayData(this.assay)?.peptideCountTable;
    }

    private get communicationSource(): CommunicationSource {
        return this.$store.getters.assayData(this.assay)?.communicationSource;
    }

    private get progress(): number {
        return this.$store.getters.assayData(this.assay)?.analysisMetaData?.progress;
    }

    private async downloadCsv(separator: string = ",", functionalSeparator: string = ";"): Promise<void> {
        if (this.assay && this.peptideCountTable) {
            this.exportLoading = true;
            const csv: string = await PeptideExport.exportSummaryAsCsv(
                this.peptideCountTable,
                this.assay.getSearchConfiguration(),
                this.communicationSource,
                separator,
                functionalSeparator
            );
            await NetworkUtils.downloadDataByForm(csv, `${this.assay.getName()}_mpa.csv`, "text/csv");
            this.exportLoading = false;
        }
    }
}
</script>

<style scoped>

</style>
