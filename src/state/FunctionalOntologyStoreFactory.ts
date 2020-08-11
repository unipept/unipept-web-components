import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import { Ontology, OntologyIdType } from "./../business/ontology/Ontology";
import { CountTable } from "./../business/counts/CountTable";
import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";
import { Peptide } from "./../business/ontology/raw/Peptide";
import FunctionalCountTableProcessor from "./../business/processors/functional/FunctionalCountTableProcessor";
import FunctionalDefinition from "./../business/ontology/functional/FunctionalDefinition";
import SearchConfiguration from "./../business/configuration/SearchConfiguration";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import FunctionalOntologyProcessor from "./../business/ontology/functional/FunctionalOntologyProcessor";
import FunctionalResponse from "./../business/communication/functional/FunctionalResponse";

export type FunctionalCountTableMeta<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> = {
    processor: FunctionalCountTableProcessor<Id, DefinitionType>,
    loading: boolean
}

export type FunctionalOntologyData<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> = {
    assay: ProteomicsAssay,
    originalData: FunctionalCountTableMeta<Id, DefinitionType>,
    filteredData: FunctionalCountTableMeta<Id, DefinitionType>,
    ontology: Ontology<Id, DefinitionType>
}

export interface FunctionalOntologyState<Id extends OntologyIdType, DefinitionType extends FunctionalDefinition> {
    ontologyData: FunctionalOntologyData<Id, DefinitionType>[]
}

/**
 * Class that contains all information required to build a new store that manages the count tables for a specific
 * functional ontology type. This store adheres to a specific API that will automatically be called by the parent store.
 */
export default class FunctionalOntologyStoreFactory<
    Id extends OntologyIdType,
    DefinitionType extends FunctionalDefinition,
    ResponseType extends FunctionalResponse<Id>
> {
    public createOntologyStore(
        functionalProcessorFactory: (
            x: CountTable<Peptide>,
            configuration: SearchConfiguration,
            communicationSource: CommunicationSource
        ) => FunctionalCountTableProcessor<Id, DefinitionType>,

        ontologyProcessorFactory: (
            communicationSource: CommunicationSource
        ) => FunctionalOntologyProcessor<Id, DefinitionType, ResponseType>,
    ) {
        const state = {
            ontologyData: []
        };

        const getters = this.createGetters();
        const mutations = this.createMutations();
        const actions = this.createActions(functionalProcessorFactory, ontologyProcessorFactory, state);

        return {
            namespaced: true,
            state,
            getters,
            mutations,
            actions
        };
    }

    private createGetters(): GetterTree<FunctionalOntologyState<Id, DefinitionType>, any> {
        return {
            originalData(
                state: FunctionalOntologyState<Id, DefinitionType>
            ): (assay: ProteomicsAssay) => FunctionalCountTableMeta<Id, DefinitionType> | undefined {
                return (assay: ProteomicsAssay) => state.ontologyData.find(a => a.assay.id === assay.id)?.originalData;
            },

            filteredData(
                state: FunctionalOntologyState<Id, DefinitionType>
            ): (assay: ProteomicsAssay) => FunctionalCountTableMeta<Id, DefinitionType> | undefined {
                return (assay: ProteomicsAssay) => state.ontologyData.find(a => a.assay.id === assay.id)?.filteredData;
            },

            ontology(
                state: FunctionalOntologyState<Id, DefinitionType>
            ): (assay: ProteomicsAssay) => Ontology<Id, DefinitionType> | undefined {
                return (assay: ProteomicsAssay) => state.ontologyData.find(a => a.assay.id === assay.id)?.ontology;
            }
        }
    }

    private createMutations(): MutationTree<FunctionalOntologyState<Id, DefinitionType>> {
        /**
         * Returns the data from the state associated with the given assay. If no such assay is present in the data,
         * a new data item will be created and added to the state.
         *
         * @param state The state in which the requested assay should be looked up.
         * @param assay The assay for which the associated data should be returned.
         */
        function getOrCreateData(state: FunctionalOntologyState<Id, DefinitionType>, assay: ProteomicsAssay) {
            let data = state.ontologyData.find(a => a.assay.id === assay.id);
            if (!data) {
                data = {
                    assay: assay,
                    originalData: {
                        processor: undefined,
                        loading: false
                    },
                    filteredData: {
                        processor: undefined,
                        loading: false
                    },
                    ontology: undefined
                }
                state.ontologyData.push(data);
            }
            return data;
        }

        return {
            SET_COUNT_TABLE_LOADING(
                state: FunctionalOntologyState<Id, DefinitionType>,
                [assay, loading]: [ProteomicsAssay, boolean]
            ) {
                const assayData = getOrCreateData(state, assay);
                assayData.originalData.loading = loading;
            },

            SET_COUNT_TABLE_PROCESSOR(
                state: FunctionalOntologyState<Id, DefinitionType>,
                [assay, processor]: [ProteomicsAssay, FunctionalCountTableProcessor<Id, DefinitionType>]
            ) {
                const assayData = getOrCreateData(state, assay);
                assayData.originalData.processor = processor;
            },

            RESET(
                state: FunctionalOntologyState<Id, DefinitionType>,
                assay: ProteomicsAssay
            ) {
                const assayData = getOrCreateData(state, assay);
                const origData = assayData.originalData;
                assayData.filteredData.processor = origData.processor;
                assayData.filteredData.loading = false;
            },

            SET_FILTERED_LOADING(
                state: FunctionalOntologyState<Id, DefinitionType>,
                [assay, loading]: [ProteomicsAssay, boolean]
            ) {
                const assayData = getOrCreateData(state, assay);
                assayData.filteredData.loading = loading;
            },

            SET_FILTERED_PROCESSOR(
                state: FunctionalOntologyState<Id, DefinitionType>,
                [assay, processor]: [ProteomicsAssay, FunctionalCountTableProcessor<Id, DefinitionType>]
            ) {
                const assayData = getOrCreateData(state, assay);
                assayData.filteredData.processor = processor;
            },

            SET_ONTOLOGY(
                state: FunctionalOntologyState<Id, DefinitionType>,
                [assay, ontology]: [ProteomicsAssay, Ontology<Id, DefinitionType>]
            ) {
                const assayData = getOrCreateData(state, assay);
                assayData.ontology = ontology;
            }
        }
    }

    private createActions(
        functionalProcessorFactory: (
            x: CountTable<Peptide>,
            configuration: SearchConfiguration,
            communicationSource: CommunicationSource,
            filterPercentage: number
        ) => FunctionalCountTableProcessor<Id, DefinitionType>,

        ontologyProcessorFactory: (
            communicationSource: CommunicationSource
        ) => FunctionalOntologyProcessor<Id, DefinitionType, ResponseType>,

        state: FunctionalOntologyState<Id, DefinitionType>
    ): ActionTree<FunctionalOntologyState<Id, DefinitionType>, any> {
        return {
            processOntologyForAssay: {
                root: true,
                async handler(
                    store: ActionContext<FunctionalOntologyState<Id, DefinitionType>, any>,
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

                    const countTableProcessor = functionalProcessorFactory(
                        countTable,
                        assay.getSearchConfiguration(),
                        communicationSource,
                        FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE
                    );
                    // Preload the functional count table...
                    const functionalTable = await countTableProcessor.getCountTable();

                    const ontologyProcessor = ontologyProcessorFactory(communicationSource);
                    const ontology = await ontologyProcessor.getOntology(functionalTable);

                    store.commit("SET_ONTOLOGY", [assay, ontology]);
                    store.commit("SET_COUNT_TABLE_PROCESSOR", [assay, countTableProcessor]);
                    store.commit("SET_COUNT_TABLE_LOADING", [assay, false]);
                    store.commit("SET_FILTERED_PROCESSOR", [assay, countTableProcessor]);
                }
            },

            cancelAnalysis(
                store: ActionContext<FunctionalOntologyState<Id, DefinitionType>, any>,
                assay: ProteomicsAssay,
            ) {
                const data = state.ontologyData.find(a => a.assay.id === assay.id);
                if (data) {
                    data.originalData.processor.cancel();
                    data.filteredData.processor.cancel();
                }
            },

            filterForAssay: {
                root: true,
                async handler(
                    store: ActionContext<FunctionalOntologyState<Id, DefinitionType>, any>,
                    [
                        assay,
                        filteredCountTable,
                        communicationSource
                    ]: [
                        ProteomicsAssay,
                        CountTable<Peptide>,
                        CommunicationSource
                    ]
                ) {
                    store.commit("SET_FILTERED_LOADING", [assay, true]);

                    const countTableProcessor = functionalProcessorFactory(
                        filteredCountTable,
                        assay.getSearchConfiguration(),
                        communicationSource,
                        FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE
                    );
                    await countTableProcessor.getCountTable();

                    store.commit("SET_FILTERED_PROCESSOR", [assay, countTableProcessor]);
                    store.commit("SET_FILTERED_LOADING", [assay, false]);
                }
            },

            resetFilter: {
                root: true,
                async handler(
                    store: ActionContext<FunctionalOntologyState<Id, DefinitionType>, any>,
                    assay: ProteomicsAssay
                ) {
                    store.commit("RESET", assay);
                }
            }
        }
    }
}
