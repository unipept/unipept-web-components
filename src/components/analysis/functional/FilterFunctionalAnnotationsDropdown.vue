<template>
    <span class="filter-annotations-menu">
        <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ on }">
                <v-btn fab x-small v-on="on" :elevation="0">
                    <v-icon>mdi-settings</v-icon>
                </v-btn>
            </template>
            <v-card max-width="310px" height="100px">
                <v-card-text>
                    <span>Filtering</span>
                    <div class="input-group">
                        <span class="input-group-addon">≥</span>
                        <input type="number" min="0" max="100" autocomplete="off" step="5" class="form-control" v-model.lazy="model" @change="model = Math.min(Math.max(parseInt(model), 0), 100)">
                        <span class="input-group-addon">% of annotated proteins</span>
                    </div>
                    <a v-if="model !== '5'" class="pull-right" @click="model = '5'">reset to 5%</a>
                </v-card-text>
            </v-card>
        </v-menu>
    </span>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { showInfoModal } from "../../../logic/modal";

@Component({
    components: {},
    computed: {
        model: {
            get() {
                return this.content;
            },
            set(val) {
                this.content = val;
                this.$emit("input", val);
            }
        }
    }
})
export default class FilterFunctionalAnnotationsDropdown extends Vue {
    @Prop({ default: "5" }) value: string;

    content: string = this.value;

    @Watch("value") onValueChanged(newValue: string, oldValue: string) {
        this.content = newValue;
    }

    showFunctionalModal() {
        let modalContent = `
            <h4 id="quick-explanation">Quick explanation</h4>
            <p>By default Unipept does not report all found annotations. It uses a clever filtering technique that removes untrustworthy annotations. The strength of This filter is expressed as a percentage.</p>
            <ul>
                <li><strong>0%</strong> means no filtering occurs. <br>
                    We assign the annotation <var>A</var>. to a peptide sequence <var>P</var> if there is at least one protein that contains an exact match for <var>P</var> and has been assigned the annotation <var>A</var>.
                </li>
                <li><strong>100%</strong> is the strongest level of filtering. <br> In this case we require that every protein that contains a certain peptide sequence <var>P</var> has the annotation <var>A</var>. before we assign the annotation <var>A</var>. to the peptide.</li>
            </ul>
            <p>
                The default value is 5%. This means that a peptide sequence <var>P</var> is assumed to be annotated with an annotation <var>A<var> if at least 5% of the UniProt entries<a href="#fn1" class="footnote-ref" id="fnref1"><sup>1</sup></a> in which <var>P</var> occurs has been annotated with <var>A<var>.
            </var></var></var></var></p>
            <h4 id="in-more-depth">In more depth</h4>
            <p>
                When you supply a list of peptides to Unipept, it needs to find out what functional annotations correspond to each of those peptides. To do this we look at the UniProt proteins that in which each of your peptides occurs.
            </p>
            <section class="card">
                <div class="row">
                    <div class="col-xs-5">
                        <p class="card-supporting-text">
                            <strong>1. Fetch protein information</strong><br>
                            UniProt proteins are annotated with GO Terms and EC numbers. We want to project these on tryptic peptides.
                        </p>
                    </div>
                    <div class="col-xs-7">
                        <img class="img-responsive" src="/images/mpa/proteoms.svg" alt="Proteoms">
                    </div>
                </div>
            </section>

            <section class="card">
                <div class="row">
                    <div class="col-xs-5">
                        <p class="card-supporting-text">
                            <strong>2. Digest and copy annotations</strong><br>
                            We perform an in-scilo trypsin digest of the proteins. The annotations of the proteins are copied to the products of the digests.
                        </p>
                    </div>
                    <div class="col-xs-7">
                        <img class="img-responsive" src="/images/mpa/matches.svg" alt="Matches">
                    </div>
                </div>
            </section>

            <section class="card">
                <div class="row">
                    <div class="col-xs-5">
                        <p class="card-supporting-text">
                            <strong>3. Summarise annotations per tryptic</strong><br>
                            We can now see the annotations that various proteins assigned to a supplied tryptic peptide.
                            In the next step we will count these.
                        </p>
                    </div>
                    <div class="col-xs-7">
                        <img class="img-responsive" src="/images/mpa/annotations.svg" alt="Annotations">
                    </div>
                </div>
            </section>

            <section class="card">
                <p class="card-supporting-text">
                    <strong>4. Summarise annotations per tryptic and store in database</strong><br>
                    In unipept we do the above experiment for each tryptic peptide in the UniProtKB during a precomputaion step. The number of occurrences of each annotation is stored in a database. When one of the sequences is used in an analysis we look up the results and only take annotations that occur in more than 5% of the matched Uniprot entries into account.
                </p>
                <img class="img-responsive" src="/images/mpa/summary.svg" alt="Summary">
            </section>
            <hr>
            <ol>
                <li id="fn1"><p>Only UniProt entries with at least one annotation are taken into account.<a href="#fnref1" class="footnote-back">↩</a></p></li>
            </ol>
        `;

        showInfoModal("Functional Annotation filtering", modalContent, { wide: true })
    }
}
</script>

<style lang="less">
    .input-group {
        position: relative;
        display: table;
        border-collapse: separate;
    }

    .input-group-addon:first-child {
        border-right: 0;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
    }

    .input-group-addon {
        padding: 6px 12px;
        font-size: 14px;
        font-weight: normal;
        line-height: 1;
        color: #555555;
        text-align: center;
        background-color: #eeeeee;
        border: 1px solid #cccccc;
        border-radius: 2px;
        display: table-cell;
        width: 1%;
        white-space: nowrap;
        vertical-align: middle;
    }

    .input-group .form-control:not(:first-child):not(:last-child) {
        border-radius: 0;
    }

    .input-group-addon, .input-group-btn, .input-group .form-control {
        display: table-cell;
    }

    .input-group .form-control {
        position: relative;
        z-index: 2;
        float: left;
        width: 100%;
        margin-bottom: 0;
    }

    .form-control {
        display: block;
        width: 100%;
        height: 33px;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.38461538;
        color: #555555;
        background-color: #ffffff;
        background-image: none;
        border: 1px solid #cccccc;
        border-radius: 2px;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    }

    .filter-annotations-menu .v-btn {
        float: right;
    }

    .filter-annotations-menu .input-group {
        width: 160px;
    }
</style>
