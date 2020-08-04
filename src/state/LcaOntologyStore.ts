import LcaCountTableProcessor from "./../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import NcbiTaxon, { NcbiId } from "./../business/ontology/taxonomic/ncbi/NcbiTaxon";
import { Ontology } from "./../business/ontology/Ontology";
import Tree from "./../business/ontology/taxonomic/Tree";
import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";
import { CountTable } from "./../business/counts/CountTable";
import { Peptide } from "./../business/ontology/raw/Peptide";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import NcbiOntologyProcessor from "./../business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";

export type TaxonomicCountTableMeta = {
    processor: LcaCountTableProcessor,
    loading: boolean
}

export type TaxonomicOntologyData = {
    assay: ProteomicsAssay,
    originalData: TaxonomicCountTableMeta,
    ontology: Ontology<NcbiId, NcbiTaxon>,
    tree: Tree
}

export interface TaxonomicOntologyState {
    ontologyData: TaxonomicOntologyData[]
}

const lcaState = {
    ontologyData: []
};

const lcaGetters: GetterTree<TaxonomicOntologyState, any> = {
    originalData(state: TaxonomicOntologyState): (assay: ProteomicsAssay) => TaxonomicCountTableMeta | undefined {
        return assay => state.ontologyData.find(a => a.assay.id === assay.id)?.originalData;
    },

    ontology(state: TaxonomicOntologyState): (assay: ProteomicsAssay) => Ontology<NcbiId, NcbiTaxon> | undefined {
        return assay => state.ontologyData.find(a => a.assay.id === assay.id)?.ontology;
    },

    tree(state: TaxonomicOntologyState): (assay: ProteomicsAssay) => Tree | undefined {
        return assay => state.ontologyData.find(a => a.assay.id === assay.id)?.tree;
    }
};

function getOrCreateData(state: TaxonomicOntologyState, assay: ProteomicsAssay) {
    let data = state.ontologyData.find(a => a.assay.id === assay.id);
    if (!data) {
        data = {
            assay: assay,
            originalData: {
                processor: undefined,
                loading: false
            },
            ontology: undefined,
            tree: undefined
        }
        state.ontologyData.push(data);
    }
    return data;
}

const lcaMutations: MutationTree<TaxonomicOntologyState> = {
    SET_COUNT_TABLE_LOADING(state: TaxonomicOntologyState, [assay, loading]: [ProteomicsAssay, boolean]) {
        const assayData = getOrCreateData(state, assay);
        assayData.originalData.loading = loading;
    },

    SET_COUNT_TABLE_PROCESSOR(state: TaxonomicOntologyState, [assay, processor]: [ProteomicsAssay, LcaCountTableProcessor]) {
        const assayData = getOrCreateData(state, assay);
        assayData.originalData.processor = processor;
    },

    SET_ONTOLOGY(state: TaxonomicOntologyState, [assay, ontology]: [ProteomicsAssay, Ontology<NcbiId, NcbiTaxon>]) {
        const assayData = getOrCreateData(state, assay);
        assayData.ontology = ontology;
    },

    SET_TREE(state: TaxonomicOntologyState, [assay, tree]: [ProteomicsAssay, Tree]) {
        const assayData = getOrCreateData(state, assay);
        assayData.tree = tree;
    }
}

const lcaActions: ActionTree<TaxonomicOntologyState, any> = {
    processOntologyForAssay: {
        root: true,
        async handler(
            store: ActionContext<TaxonomicOntologyState, any>,
            [
                assay,
                countTable,
                communicationSource
            ]: [
                ProteomicsAssay,
                CountTable<Peptide>,
                CommunicationSource
            ]
        ) {
            store.commit("SET_COUNT_TABLE_LOADING", [assay, true]);

            const countTableProcessor = new LcaCountTableProcessor(
                countTable,
                assay.getSearchConfiguration(),
                communicationSource
            );
            const taxaTable = await countTableProcessor.getCountTable();
            const taxaPeptideMapping = await countTableProcessor.getAnnotationPeptideMapping();

            const ontologyProcessor = new NcbiOntologyProcessor(communicationSource);
            const ontology = await ontologyProcessor.getOntology(taxaTable);

            const tree = new Tree(taxaTable, ontology, taxaPeptideMapping);

            store.commit("SET_TREE", [assay, tree]);
            store.commit("SET_ONTOLOGY", [assay, ontology]);
            store.commit("SET_COUNT_TABLE_PROCESSOR", [assay, countTableProcessor]);
            store.commit("SET_COUNT_TABLE_LOADING", [assay, false]);

            store.dispatch("lcaOntologyProcessed", [assay, ontology], { root: true });
        }
    },

    cancelAnalysis(store: ActionContext<TaxonomicOntologyState, any>, assay: ProteomicsAssay) {
        const data = lcaState.ontologyData.find(a => a.assay.id === assay.id);
        if (data) {
            data.originalData.processor.cancel();
        }
    }
}

export const lcaOntologyStore = {
    namespaced: true,
    state: lcaState,
    getters: lcaGetters,
    mutations: lcaMutations,
    actions: lcaActions
};



