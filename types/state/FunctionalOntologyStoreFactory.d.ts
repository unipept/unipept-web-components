import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import { Ontology, OntologyIdType } from "./../business/ontology/Ontology";
import { CountTable } from "./../business/counts/CountTable";
import { ActionTree, GetterTree, MutationTree } from "vuex";
import { Peptide } from "./../business/ontology/raw/Peptide";
import FunctionalCountTableProcessor from "./../business/processors/functional/FunctionalCountTableProcessor";
import FunctionalDefinition from "./../business/ontology/functional/FunctionalDefinition";
import SearchConfiguration from "./../business/configuration/SearchConfiguration";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import FunctionalOntologyProcessor from "./../business/ontology/functional/FunctionalOntologyProcessor";
import FunctionalResponse from "./../business/communication/functional/FunctionalResponse";
export declare type FunctionalCountTableMeta<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> = {
    processor: FunctionalCountTableProcessor<Id, DefinitionType>;
    loading: boolean;
};
export declare type FunctionalOntologyData<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> = {
    assay: ProteomicsAssay;
    originalData: FunctionalCountTableMeta<Id, DefinitionType>;
    filteredData: FunctionalCountTableMeta<Id, DefinitionType>;
    ontology: Ontology<Id, DefinitionType>;
};
export interface FunctionalOntologyState<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> {
    ontologyData: FunctionalOntologyData<Id, DefinitionType>[];
}
/**
 * Class that contains all information required to build a new store that manages the count tables for a specific
 * functional ontology type. This store adheres to a specific API that will automatically be called by the parent store.
 */
export default class FunctionalOntologyStoreFactory<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition, ResponseType extends FunctionalResponse<Id>> {
    createOntologyStore(functionalProcessorFactory: (x: CountTable<Peptide>, configuration: SearchConfiguration, communicationSource: CommunicationSource) => FunctionalCountTableProcessor<Id, DefinitionType>, ontologyProcessorFactory: (communicationSource: CommunicationSource) => FunctionalOntologyProcessor<Id, DefinitionType, ResponseType>): {
        namespaced: boolean;
        state: {
            ontologyData: any[];
        };
        getters: GetterTree<FunctionalOntologyState<Id, DefinitionType>, any>;
        mutations: MutationTree<FunctionalOntologyState<Id, DefinitionType>>;
        actions: ActionTree<FunctionalOntologyState<Id, DefinitionType>, any>;
    };
    private createGetters;
    private createMutations;
    private createActions;
}
