<template>
    <v-radio-group v-model="normalizer">
        <div
            v-for="normalizationType in Array.from(normalizationTypes.keys())"
            :key="normalizationType" style="margin-bottom: 8px;">
            <v-radio :label="normalizationType" :value="normalizationType"></v-radio>
            <div style="margin-left: 32px;">
                {{ normalizationTypes.get(normalizationType).information }}
            </div>
        </div>
    </v-radio-group>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Normalizer from "./../../business/normalisation/Normalizer";
import AllNormalizer from "./../../business/normalisation/AllNormalizer";
import RowNormalizer from "./../../business/normalisation/RowNormalizer";
import ColumnNormalizer from "./../../business/normalisation/ColumnNormalizer";
import { Watch } from "vue-property-decorator";

@Component
export default class NormalizationSelector extends Vue {
    private normalizer: string = "";

    private normalizationTypes: Map<string, {information: string, factory: () => Normalizer}> = new Map([
        [
            "All",
            {
                information: "Normalize over all data points of the input. Values are normalized with respect to the global maximum and minimum value.",
                factory: () => new AllNormalizer()
            }
        ],
        [
            "Rows",
            {
                information: "Normalize values on a row-per-row basis. Values are normalized with respect to the maximum and minimum value in their respective row.",
                factory: () => new RowNormalizer()
            }
        ],
        [
            "Columns",
            {
                information: "Normalize values on a column-per-column basis. Values are normalized with respect to the maximum and minimum value in their respective column.",
                factory: () => new ColumnNormalizer()
            }
        ]
    ]);

    created() {
        this.normalizer = this.normalizationTypes.keys().next().value;
    }

    mounted() {
        this.onNormalizerChanged();
    }

    @Watch("normalizer")
    private onNormalizerChanged() {
        this.$emit("update-normalizer", this.normalizationTypes.get(this.normalizer).factory());
    }
}
</script>

<style scoped>

</style>
