<template>
    <div>
        <div class="input-group" id="tree_search_group">
            <input type="search" name="tree_search" id="tree_search" v-model="searchTerm" placeholder="search for an organism..." class="form-control">
            <span class="input-group-addon">
                <span class="glyphicon glyphicon-search"></span>
            </span>
        </div>
        <div id="searchtree" class="treeView multi"></div>
        <div id="tree_data">
            <p>
                Click on a node in the tree to see the peptides associated with that organism.
                Double-click to focus on it.
            </p>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import PeptideContainer from "../../logic/data-management/PeptideContainer";
    import Tree from "../../logic/data-management/Tree";
    import {constructSearchtree} from "../../logic/data-management/searchtree";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import Sample from '../../logic/data-management/Sample';

    @Component({
        components: {},
        computed: {
            searchTerm: {
                get() {
                    let term = this.$store.getters.selectedTerm;
                    if (term === 'Organism') {
                        return '';
                    }
                    return term;
                },
                set(val) {
                    // should do nothing!
                }
            }
        }
    })
    export default class HierarchicalOutlineVisualization extends Vue {
        @Prop({required: true}) sample: Sample;

        searchTree!: any;

        mounted() {
            this.initSearchTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initSearchTree();
        }

        @Watch('activeSearchTerm') onActiveSearchTermChanged(newSearchTerm: string, oldSearchTerm: string) {
            if (this.searchTree && newSearchTerm !== "") {
                setTimeout(() => {
                    this.searchTree.search(newSearchTerm);
                }, 500);
            }
        }

        private async initSearchTree() {
            if (this.sample != null) {
                let taxaDataSource: TaxaDataSource = await this.sample.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                this.searchTree = constructSearchtree(tree, this.$store.getters.searchSettings.il, () => {});
            }
        }

        get activeSearchTerm() {
            return this.$store.getters.selectedTerm;
        }
    }
</script>

<style scoped>
    .treeView li:last-child {
        background-image: url(./assets/list-item-last-d5e2e48….png);
    }

</style>
