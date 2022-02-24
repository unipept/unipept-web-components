<template>
    <div class="go-table-container">
        <h2>{{ titleize(namespace) }}</h2>
        <v-row>
            <v-col :cols="9">
                <amount-table
                    annotation-name="GO-term"
                    :item-retriever="itemRetriever"
                    :external-url-constructor="getUrl"
                    :loading="loading"
                    :items-to-peptides="itemsToPeptides"
                    :taxa-to-peptides="taxaToPeptides"
                    :tree="tree"
                    :item-to-csv-summary="itemToCsvSummary"
                    :count-name="countName"
                    :show-percentage="showPercentage">
                </amount-table>
            </v-col>
            <v-col :cols="3">
                <quick-go-card :items="definitions">
                </quick-go-card>
            </v-col>
        </v-row>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

import {
    FunctionalCode,
    NcbiId,
    Peptide,
    Tree,
    GoDefinition,
    GoCode
} from "@/business";

import AmountTable from "@/components/tables/AmountTable.vue";
import QuickGoCard from "@/components/analysis/functional/QuickGoCard.vue";
import AmountTableItemRetriever from "@/components/tables/AmountTableItemRetriever";
import StringUtils from "@/business/misc/StringUtils";

@Component({
    components: { AmountTable, QuickGoCard }
})
export default class GoSummary extends Vue {
    /*******************************************************************************************************************
     *  Properties that are always required for this summary to function.
     ******************************************************************************************************************/

    @Prop({ required: true })
    private itemRetriever: AmountTableItemRetriever<GoCode, GoDefinition>;
    /**
     * All GO-definitions for this namespace, ordered by popularity, descending.
     */
    @Prop( { required: true })
    private definitions: GoDefinition[];
    @Prop({ required: true })
    private namespace: string;

    /*******************************************************************************************************************
     * Properties that are required to display the functional <-> taxonomical link (e.g. the taxonomic tree per table
     * item, etc.) If these are not all present, this link will not be presented by the table.
     ******************************************************************************************************************/

    /**
     * Maps a functional annotation onto all peptides that are annotated with this annotation. This property is required
     * for the functional <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private itemsToPeptides: Map<FunctionalCode, Peptide[]>;
    /**
     * Maps a taxon identifier onto all peptides that belong to this taxon. This property is required for the functional
     * <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private taxaToPeptides: Map<NcbiId, Peptide[]>;
    /**
     * A taxonomic tree computed from the assay that's currently being rendered. This property is required for the
     * functional <-> taxonomical link to be displayed!
     */
    @Prop({ required: false })
    private tree: Tree;

    /*******************************************************************************************************************
     * Properties required to export a CSV summary per item.
     ******************************************************************************************************************/

    /**
     * Function that returns a CSV summary for the given functional code. If this function is not present, no download
     * button per row will be provided by the amount table.
     */
    @Prop({ required: false })
    private itemToCsvSummary: (code: FunctionalCode) => string;

    /*******************************************************************************************************************
     * Properties that are purely esthetically or that can be used to further tune the AmountTable.
     ******************************************************************************************************************/

    /**
     * What items are being displayed as counts? (e.g. peptides, proteins, ...)
     */
    @Prop({ required: false, default: "Peptides" })
    protected countName: string;
    /**
     * Do we display the absolute or relative counts for peptides and proteins in the table? Absolute counts will be
     * used if this property is set to false.
     */
    @Prop({ required: false, default: false })
    protected showPercentage: boolean;

    @Prop({ required: false, default: false })
    private loading: boolean;

    private getUrl(code: string): string {
        return `http://amigo.geneontology.org/amigo/search/ontology?q=${code}`;
    }

    private titleize(val: string): string {
        return StringUtils.stringTitleize(val);
    }
}
</script>

<style>
    .go-table-container .row {
        flex-wrap: nowrap;
    }

    .go-table-container {
        margin-top: 16px;
    }
</style>
