<template>
    <div>
        <v-text-field
            id="tree_search"
            v-model="searchTerm"
            style="margin-bottom: -26px;"
            name="tree_search"
            outlined
            single-line
            label="Search for an organism"
            append-icon="mdi-magnify"
        />

        <v-col
            id="searchtree"
            class="treeView multi pt-0"
            cols="6"
        />

        <v-col
            id="tree_data"
            class="pt-0"
            cols="6"
        >
            <p>
                Click on a node in the tree to see the peptides associated with that organism.
                Double-click to focus on it.
            </p>
        </v-col>
    </div>
</template>

<script setup lang="ts">
import { NcbiTree } from '@/logic';
import { onMounted, ref, watch } from 'vue';
import { constructSearchtree } from './SearchTree';

export interface Props {
    tree: NcbiTree
    equateIl: boolean
    loading: boolean
}

const props = defineProps<Props>();

const searchTerm = ref<string>('');

const searchTree = ref<any>();

watch(searchTerm, newTerm => {
    if (searchTree.value && newTerm !== "") {
        searchTree.value.search(newTerm);
    }
})

watch(() => props.tree, () => {
    if (props.tree) {
        searchTree.value = constructSearchtree(props.tree, props.equateIl, () => {});
    }
})

onMounted(() => {
    if (props.tree) {
        searchTree.value = constructSearchtree(props.tree, props.equateIl, () => {});
    }
})
</script>

<style lang="less">
    @gray-base:              #000;
    @gray-light:             lighten(@gray-base, 46.7%);
    @gray-lighter:           lighten(@gray-base, 93.5%);
    @black-divider: rgba(0,0,0,0.12);
    @black-secondary: rgba(0,0,0,0.54);
    @black-text: rgba(0,0,0,0.87);

    .treeView {
        user-select: none;
        position: relative;
        margin-top: 5px;
        float: left;
    }
    .treeView ul {
        margin: -5px 0 0 -1.5em;
        padding: 0 0 0 1.5em;
    }
    .treeView ul ul {
        background: url(@/assets/images/hierarchical_outline/list-item-contents.png) repeat-y left;
    }
    .treeView li:last-child > ul {
        background-image: none;
    }
    .treeView li {
        margin: 0;
        background: url(@/assets/images/hierarchical_outline/list-item-root.png) no-repeat top left;
        list-style-position: inside;
        list-style-image: url(@/assets/images/hierarchical_outline/button.png);
        cursor: auto;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .treeView li.collapsibleListOpen {
        list-style-image: url(@/assets/images/hierarchical_outline/button-open.png);
        cursor: pointer;
    }
    .treeView li.collapsibleListClosed {
        list-style-image: url(@/assets/images/hierarchical_outline/button-closed.png);
        cursor: pointer;
    }
    .treeView li.collapsibleListClosed ul {
        display: none;
    }
    .treeView li li {
        background-image: url(@/assets/images/hierarchical_outline/list-item.png);
        padding-left: 1.5em;
    }
    .treeView li:last-child {
        background-image: url(@/assets/images/hierarchical_outline/list-item-last.png);
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
        background-image: url(@/assets/images/hierarchical_outline/list-item-leaf.png);
        list-style-type: none;
        list-style-image: none;
    }
    .treeView li.leaf:last-child {
        background-image: url(@/assets/images/hierarchical_outline/list-item-last-leaf.png);
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
        width: 420px;
        float: right;
        padding: 8px;
        background: @gray-lighter;
        border: 1px solid #ccc;
        border-radius: 2px;
        .transition(all 1s ease-in-out);
        .shadow-z5();
        a{
            text-overflow: ellipsis;
            overflow: hidden;
            display: block;
        }
    }
    #tree_data::before {
        content: "";
        display: block;
        height: 0;
        width: 0;
        margin-left: -18px;
        border: 10px solid #ccc;
        border-width: 10px 10px 10px 0;
        border-color: transparent #ccc transparent transparent;
        position: absolute;
    }
    #tree_data h3 {
        line-height: 30px;
        margin: 3px 0 5px;
        color: @black-secondary;
    }
    #tree_data h4 {
        line-height: 25px;
        margin-left: 5px;
    }
    #tree_data h3 a {
        color: @black-text !important;
    }
    .hierarchical-outline-container legend {
        display: none;
    }
    .transition(@transition) {
        -webkit-transition: @transition;
        -o-transition: @transition;
        transition: @transition;
    }
    .transition-property(@transition-property) {
        -webkit-transition-property: @transition-property;
        transition-property: @transition-property;
    }
    .transition-delay(@transition-delay) {
        -webkit-transition-delay: @transition-delay;
        transition-delay: @transition-delay;
    }
    .transition-duration(@transition-duration) {
        -webkit-transition-duration: @transition-duration;
        transition-duration: @transition-duration;
    }
    .transition-timing-function(@timing-function) {
        -webkit-transition-timing-function: @timing-function;
        transition-timing-function: @timing-function;
    }
    .transition-transform(@transition) {
        -webkit-transition: -webkit-transform @transition;
        -moz-transition: -moz-transform @transition;
        -o-transition: -o-transform @transition;
        transition: transform @transition;
    }
    .shadow-z5() {
        box-shadow: 0 8px 10px -5px rgba(0,0,0,.14),0 16px 24px 2px rgba(0,0,0,.098),0 6px 30px 5px rgba(0,0,0,.084);
    }
    .clipboard-btn-wrapper {
        position: relative;
        display: block;
    }
    .btn-clipboard {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10;
        display: block;
        padding: 5px 8px;
        font-size: 12px;
        color: @black-secondary;
        cursor: pointer;
        background-color: #fff;
        border: 1px solid @black-divider;
        border-radius: 2px;
    }
    .btn-clipboard:hover {
        color: @black-text;
    }
    .btn-clipboard:active {
        color: @gray-light;
    }
</style>
