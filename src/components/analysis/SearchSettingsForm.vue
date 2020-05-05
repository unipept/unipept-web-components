<template>
    <div :class="{'search-settings-form': true, 'd-flex': true, 'flex-row': horizontal, 'justify-space-between': horizontal }">
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <v-checkbox :disabled="disabled" v-model="equateIlModel" label="Equate I and L" hide-details>
                        <span slot="label" v-on="on">Equate I and L</span>
                    </v-checkbox>
                </div>
            </template>
            <span>Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" :disabled="disabled" v-model="filterDuplicatesModel" hide-details>
                    <span slot="label" v-on="on">Filter duplicate peptides</span>
                </v-checkbox>
            </template>
            <span>Remove duplicate peptides from the input before searching.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" :disabled="disabled" v-model="missingCleavageModel" hide-details>
                    <span slot="label" v-on="on">Advanced missing cleavage handling</span>
                </v-checkbox>
            </template>
            <span>Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

@Component({
    components: {},
    computed: {
        equateIlModel: {
            get() {
                return this.equateIl;
            },
            set(val) {
                this.equateIlData = val;
                this.$emit("update:equate-il", val);
            }
        },
        filterDuplicatesModel: {
            get(): boolean {
                return this.filterDuplicates;
            },
            set(val: boolean) {
                this.filterDuplicatesData = val;
                this.$emit("update:filter-duplicates", val);
            }
        },
        missingCleavageModel: {
            get() {
                return this.missingCleavage;
            },
            set(val) {
                this.missingCleavageData = val;
                this.$emit("update:missing-cleavage", val);
            }
        }
    }
})
export default class SearchSetingsForm extends Vue {
    @Prop({ default: false }) disabled!: boolean;
    @Prop({ default: true }) equateIl!: boolean;
    @Prop({ default: true }) filterDuplicates!: boolean;
    @Prop({ default: false }) missingCleavage!: boolean;
    /**
     * Show the component in a horizontal or vertical fashion? Set to true to show the different checkboxes on one line.
     */
    @Prop({ required: false, default: true })
    private horizontal: boolean;

    private equateIlData: boolean = this.equateIl;
    private filterDuplicatesData: boolean = this.filterDuplicates;
    private missingCleavageData: boolean = this.missingCleavage;

    @Watch("equateIl") onEquateIlChanged() {
        this.equateIlData = this.equateIl;
    }

    @Watch("filterDuplicates") onFilterDuplicatesChanged() {

        this.filterDuplicatesData = this.filterDuplicates;
    }

    @Watch("missingCleavage") onMissingCleavageChanged() {
        this.missingCleavageData = this.missingCleavage;
    }
}
</script>

<style scoped>
    .search-settings-form .v-input--selection-controls {
        margin-top: 0;
    }
</style>
