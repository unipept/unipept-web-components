<template>
    <v-form ref="datasetForm">
        <v-textarea
            name="qs"
            id="qs-textarea"
            label="Peptide list"
            :rows="7"
            v-model="peptideModel"
            :loading="loading"
            :rules="[value => !!value || 'At least one peptide is required']"
            spellcheck="false">
        </v-textarea>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-text-field
                    v-on="on"
                    id="name-input"
                    name="search_name"
                    label="Name this dataset"
                    :loading="loading"
                    placeholder="e.g. Sample B5"
                    v-model="nameModel"
                    :rules="[value => !!value || 'Name is required when the dataset is set to be saved']"
                    clearable>
                </v-text-field>
            </template>
            <span>This name will be shown on the results page. Handy if you have many open tabs.</span>
        </v-tooltip>
        <v-tooltip top v-if="showSave">
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" id="save-checkbox" :disabled="loading" v-model="saveModel" hide-details>
                    <span slot="label" v-on="on">Store dataset in browser's local storage</span>
                </v-checkbox>
            </template>
            <span>Store dataset in local storage and reuse it later on.</span>
        </v-tooltip>
    </v-form>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"

import { Prop, Watch } from "vue-property-decorator";

@Component({
    components: {},
    computed: {
        peptideModel: {
            get() {
                return this.peptides;
            },
            set(val) {
                this.peptidesData = val;
                this.$emit("peptide-change", val);
            }
        },
        nameModel: {
            get() {
                return this.name;
            },
            set(val) {
                this.nameData = val;
                this.$emit("name-change", val);
            }
        },
        saveModel: {
            get() {
                return this.save;
            },
            set(val) {
                this.saveData = val;
                this.$emit("save-change", val);
            }
        }
    }
})
export default class DatasetForm extends Vue {
    @Prop({ required: false, default: "" })
    private peptides: string;
    @Prop({ required: false, default: "" })
    private name: string;
    @Prop({ required: false, default: true })
    private save: boolean;
    @Prop({ required: false, default: false })
    private loading: boolean;
    @Prop({ required: false, default: true })
    private showSave: boolean;

    private peptidesData: string = "";
    private nameData: string = "";
    private saveData: boolean = false;

    mounted() {
        this.peptidesData = this.peptides;
        this.nameData = this.name;
        this.saveData = this.save;
    }

    @Watch("peptides")
    private onPeptidesChange(newPeptides: string, oldPeptides: string) {
        this.peptidesData = newPeptides;
        this.$store;
    }

    @Watch("name")
    private onNameChange(newName: string, oldName: string) {
        this.nameData = newName;
    }

    @Watch("save")
    private onSaveChanged(newSave: boolean, oldSave: boolean) {
        this.saveData = newSave;
    }

    public isValid(): boolean {
        //@ts-ignore
        return this.$refs.datasetForm.validate();
    }
}
</script>

<style scoped>

</style>
