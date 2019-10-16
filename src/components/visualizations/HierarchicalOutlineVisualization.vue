<template>
    <div>
        <v-text-field style="margin-bottom: -26px;" outlined single-line label="Search for an organism" append-icon="mdi-magnify" v-model="searchTerm"></v-text-field>
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
    import Assay from "../../logic/data-management/assay/Assay";
    import Tree from "../../logic/data-management/Tree";
    import {constructSearchtree} from "../../logic/data-management/searchtree";
    import TaxaDataSource from "../../logic/data-source/TaxaDataSource";
    import DataRepository from '../../logic/data-source/DataRepository';

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
            },
            watchableSelectedSearchTerm: {
                get(): string {
                    return this.$store.getters.selectedTerm
                }
            }
        }
    })
    export default class HierarchicalOutlineVisualization extends Vue {
        @Prop({required: true}) dataRepository: DataRepository;

        searchTree!: any;

        mounted() {
            this.initSearchTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initSearchTree();
        }

        @Watch('watchableSelectedS') onActiveSearchTermChanged(newSearchTerm: string, oldSearchTerm: string) {
            if (this.searchTree && newSearchTerm !== "") {
                setTimeout(() => {
                    this.searchTree.search(newSearchTerm);
                }, 500);
            }
        }

        @Watch('watchableSelectedSearchTerm')
        private onSelectedSearchTermChanged(newSearchTerm: string) {
            if(this.searchTree && newSearchTerm) {
                this.searchTree.search(newSearchTerm);
            }
        }

        private async initSearchTree() {
            if (this.dataRepository != null) {
                let taxaDataSource: TaxaDataSource = await this.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                this.searchTree = constructSearchtree(tree, this.$store.getters.searchSettings.il, () => {});
            }
        }

        get activeSearchTerm() {
            return this.$store.getters.selectedTerm;
        }
    }
</script>

<style lang="less">
    @import './../../assets/style/variables.css.less';

    .treeView {
        -moz-user-select: none;
        position: relative;
        margin-top: 5px;
        float: left;
    }

    .treeView ul {
        margin: -5px 0 0 -1.5em;
        padding: 0 0 0 1.5em;
    }

    .treeView ul ul {
        background: url(./../../assets/images/hierarchical_outline/list-item-contents.png) repeat-y left;
    }

    .treeView li:last-child > ul {
        background-image: none;
    }

    .treeView li {
        margin: 0;
        padding: 5px 0 0;
        background: url(./../../assets/images/hierarchical_outline/list-item-root.png) no-repeat top left;
        list-style-position: inside;
        list-style-image: url(./../../assets/images/hierarchical_outline/button.png);
        cursor: auto;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .treeView li.collapsibleListOpen {
        list-style-image: url(./../../assets/images/hierarchical_outline/button-open.png);
        cursor: pointer;
    }

    .treeView li.collapsibleListClosed {
        list-style-image: url(./../../assets/images/hierarchical_outline/button-closed.png);
        cursor: pointer;
    }

    .treeView li.collapsibleListClosed ul {
        display: none;
    }

    .treeView li li {
        background-image: url(./../../assets/images/hierarchical_outline/list-item.png);
        padding-left: 1.5em;
    }

    .treeView li:last-child {
        background-image: url(./../../assets/images/hierarchical_outline/list-item-last.png);
    }

    .treeView li.root {
        background-image: none;
        list-style-type: none;
        list-style-image: none;
    }

    .treeView li.unmatch {
        display: none;
    }

    .treeView li.leaf {
        background-image: url(./../../assets/images/hierarchical_outline/list-item-leaf.png);
        list-style-type: none;
        list-style-image: none;
    }

    .treeView li.leaf:last-child {
        background-image: url(./../../assets/images/hierarchical_outline/list-item-last-leaf.png);
    }

    .treeView span.clicked {
        background: @gray-lighter !important;
        border: 1px solid #ccc !important;
        border-radius: 2px;
    }

    .treeView li.leaf span {
        cursor: pointer;
    }

    #tree_data {
        float: right;
        font-family: Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif;
        font-size: 12px;
        color: rgb(85, 85, 85);
    }

    #searchtree {
        margin-bottom: 16px;
    }
</style>
