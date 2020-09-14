import LcaCountTableProcessor from "./../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import NcbiTaxon, { NcbiId } from "./../business/ontology/taxonomic/ncbi/NcbiTaxon";
import { Ontology } from "./../business/ontology/Ontology";
import Tree from "./../business/ontology/taxonomic/Tree";
import { ActionTree, GetterTree, MutationTree } from "vuex";
export declare type TaxonomicCountTableMeta = {
    processor: LcaCountTableProcessor;
    loading: boolean;
};
export declare type TaxonomicOntologyData = {
    assay: ProteomicsAssay;
    originalData: TaxonomicCountTableMeta;
    ontology: Ontology<NcbiId, NcbiTaxon>;
    tree: Tree;
};
export interface TaxonomicOntologyState {
    ontologyData: TaxonomicOntologyData[];
}
export declare const lcaOntologyStore: {
    namespaced: boolean;
    state: {
        ontologyData: any[];
    };
    getters: GetterTree<TaxonomicOntologyState, any>;
    mutations: MutationTree<TaxonomicOntologyState>;
    actions: ActionTree<TaxonomicOntologyState, any>;
};
