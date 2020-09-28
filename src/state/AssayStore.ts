import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import { Peptide } from "./../business/ontology/raw/Peptide";
import { CountTable } from "./../business/counts/CountTable";
import { ActionContext, ActionTree, GetterTree, MutationTree, Store } from "vuex";
import PeptideCountTableProcessor from "./../business/processors/raw/PeptideCountTableProcessor";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import Assay from "./../business/entities/assay/Assay";
import NcbiTaxon, { NcbiId } from "./../business/ontology/taxonomic/ncbi/NcbiTaxon";
import LcaCountTableProcessor from "./../business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import Tree from "./../business/ontology/taxonomic/Tree";
import TreeNode from "./../business/ontology/taxonomic/TreeNode";
import { Ontology } from "./../business/ontology/Ontology";
import AssayProcessor from "./../business/processors/AssayProcessor";
import ProgressListener from "./../business/progress/ProgressListener";
import FunctionalCountTableProcessor from "./../business/processors/functional/FunctionalCountTableProcessor";

export type AnalysisStatus = "healthy" | "cancelled" | "error";

/**
 * Metadata about the analysis process of an assay.
 */
export type AnalysisMeta = {
    // Which fraction of the analysis is already completed? (only takes into account the progress for pept2data)
    progress: number,
    // What's the current status of the analysis? Is it working properly, or did something go wrong?
    status: AnalysisStatus,
    // A string containing an error message if something happened while analysing an assay.
    error: string,
    // When did we receive the first processing results for this analysis?
    startProcessingTime: number,
    // Estimate of the total number of seconds the analysis will probably still take.
    eta: number
}

export type AssayData = {
    assay: ProteomicsAssay,
    analysisMetaData: AnalysisMeta,
    peptideCountTable: CountTable<Peptide>,
    filteredPeptideCountTable: CountTable<Peptide>,
    communicationSource: CommunicationSource,
    assayProcessor: AssayProcessor,
    filterPercentage: number,
    taxonFilter: NcbiTaxon
}

export interface AssayState {
    assayData: AssayData[],
    activeAssay: ProteomicsAssay
}

const assayState: AssayState = {
    assayData: [],
    activeAssay: undefined
}

const assayGetters: GetterTree<AssayState, any> = {
    /**
     * Returns all assays that are currently selected by the user.
     * @param state
     */
    assays(state: AssayState): AssayData[] {
        return state.assayData;
    },

    assayData(state: AssayState): (assay: ProteomicsAssay) => AssayData | undefined {
        return (assay: ProteomicsAssay) => assay ? state.assayData.find(
            (a: AssayData) => a.assay.id === assay.id
        ) : undefined;
    },

    activeAssay(state: AssayState): ProteomicsAssay | undefined {
        return state.activeAssay;
    }
};

const assayMutations: MutationTree<AssayState> = {
    ADD_ASSAY(state: AssayState, assay: ProteomicsAssay) {
        const data = state.assayData.find(a => a.assay.id === assay.id);
        if (!data) {
            state.assayData.push({
                assay: assay,
                analysisMetaData: {
                    progress: 0,
                    status: "healthy",
                    error: "",
                    startProcessingTime: 0,
                    eta: 0
                },
                assayProcessor: undefined,
                peptideCountTable: undefined,
                filteredPeptideCountTable: undefined,
                communicationSource: undefined,
                filterPercentage: FunctionalCountTableProcessor.DEFAULT_FILTER_PERCENTAGE,
                taxonFilter: undefined
            });
        }
    },

    REMOVE_ASSAY(state: AssayState, assay: ProteomicsAssay) {
        if (state.activeAssay?.id === assay.id) {
            state.activeAssay = undefined;
        }

        const idx = state.assayData.findIndex(a => a.assay.id === assay.id);
        if (idx >= 0) {
            state.assayData.splice(idx, 1);
        }
    },

    ACTIVATE_ASSAY(state: AssayState, assay: ProteomicsAssay) {
        state.activeAssay = assay;
    },

    SET_COUNT_TABLE(state: AssayState, [assay, countTable]: [ProteomicsAssay, CountTable<Peptide>]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.peptideCountTable = countTable;
    },

    SET_COMMUNICATION_SOURCE(state: AssayState, [assay, communicationSource]: [ProteomicsAssay, CommunicationSource]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.communicationSource = communicationSource;
    },

    SET_FILTERED_TABLE(state: AssayState, [assay, countTable]: [ProteomicsAssay, CountTable<Peptide>]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.filteredPeptideCountTable = countTable;
    },

    /**
     * Update the current progress for the assay and immediately calculate the current estimated time remaining based
     * upon the initial start time of this assay's analysis.
     */
    UPDATE_ASSAY_PROGRESS(state: AssayState, [assay, progress]: [ProteomicsAssay, number]
    ) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);

        if (!assayData) {
            return;
        }

        const analysisMeta = assayData.analysisMetaData;

        if (!analysisMeta.startProcessingTime){
            analysisMeta.startProcessingTime = new Date().getTime();
        }

        analysisMeta.progress = progress;

        const elapsedTime = new Date().getTime() - analysisMeta.startProcessingTime;

        if (elapsedTime > 500) {
            const progressToDo = 1 - progress;
            const multiplier = progressToDo / progress;
            analysisMeta.eta = (elapsedTime * multiplier) / 1000;
        }
    },

    RESET_ASSAY_METADATA(state: AssayState, assay: ProteomicsAssay) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        const analysisMeta = assayData.analysisMetaData;

        analysisMeta.progress = 0;
        analysisMeta.status = "healthy";
        analysisMeta.error = "";
        analysisMeta.startProcessingTime = 0;
        analysisMeta.eta = 0;
    },

    RESET_ASSAY(state: AssayState, assay: ProteomicsAssay) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.peptideCountTable = undefined;
        assayData.filteredPeptideCountTable = undefined;
    },

    RESET_FILTER(state: AssayState, assay: ProteomicsAssay) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.filteredPeptideCountTable = assayData.peptideCountTable;
        assayData.taxonFilter = undefined;
    },

    SET_ASSAY_ERROR(state: AssayState, [assay, error]: [ProteomicsAssay, string]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        const analysisMeta = assayData.analysisMetaData;

        analysisMeta.error = error;
        analysisMeta.status = "error";
    },

    SET_ASSAY_PROCESSOR(state: AssayState, [assay, processor]: [ProteomicsAssay, AssayProcessor]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.assayProcessor = processor;
    },

    CANCEL_ASSAY(state: AssayState, assay: ProteomicsAssay) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        const analysisMeta = assayData?.analysisMetaData;

        if (analysisMeta) {
            analysisMeta.error = "";
            analysisMeta.status = "cancelled";
        }
    },

    SET_FILTER_PERCENTAGE(state: AssayState, [assay, percentage]: [ProteomicsAssay, number]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.filterPercentage = percentage;
    },

    SET_NCBI_FILTER(state: AssayState, [assay, taxon]: [ProteomicsAssay, NcbiTaxon]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.taxonFilter = taxon;
    }
};

const createAssayActions: (assayProcessorFactory: (store: ActionContext<AssayState, any>, assay: ProteomicsAssay, progressListener: ProgressListener) => AssayProcessor) => ActionTree<AssayState, any> = (
    assayProcessorFactory: (store: ActionContext<AssayState, any>, assay: ProteomicsAssay, progressListener: ProgressListener) => AssayProcessor
) => {
    return {
        activateAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("ACTIVATE_ASSAY", assay);
        },

        addAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("ADD_ASSAY", assay);
        },

        async removeAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            await store.dispatch("cancelAnalysis", assay);
            store.commit("REMOVE_ASSAY", assay);
            store.dispatch("resetActiveAssay");
        },

        resetActiveAssay(store: ActionContext<AssayState, any>) {
            let shouldReselect: boolean = true;
            if (store.getters.activeAssay) {
                const idx: number = store.getters.assays.findIndex(
                    (data: AssayData) => data.assay.id === store.getters.activeAssay.id
                );
                shouldReselect = idx === -1;
            }

            if (shouldReselect) {
                let newActive: Assay = null;
                for (let current of store.getters.assays) {
                    const progress = current.analysisMetaData.progress;
                    if (progress === 1) {
                        newActive = current.assay;
                        break;
                    }
                }

                store.commit("ACTIVATE_ASSAY", newActive);
            }
        },

        async cancelAnalysis(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            const assayProcessor: AssayProcessor = store.getters["assayData"](assay)?.assayProcessor;
            assayProcessor?.cancel();
            store.commit("CANCEL_ASSAY", assay);
        },

        async processAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("RESET_ASSAY", assay);
            store.commit("RESET_ASSAY_METADATA", assay);

            try {
                const countTableProcessor = new PeptideCountTableProcessor();
                const countTable = await countTableProcessor.getPeptideCountTable(
                    assay.getPeptides(),
                    assay.getSearchConfiguration()
                );

                const assayProcessor = assayProcessorFactory(store, assay, {
                    onProgressUpdate: (progress: number) => store.commit(
                        "UPDATE_ASSAY_PROGRESS",
                        [assay, progress]
                    )
                });

                store.commit("SET_ASSAY_PROCESSOR", [assay, assayProcessor]);
                const communicationSource = await assayProcessor.processAssay(countTable);

                if (!assayProcessor.isCancelled()) {
                    store.commit("SET_COMMUNICATION_SOURCE", [assay, communicationSource]);
                    store.commit("SET_COUNT_TABLE", [assay, countTable]);
                    store.commit("SET_FILTERED_TABLE", [assay, countTable]);

                    store.dispatch("processOntologyForAssay", [assay, countTable, communicationSource]);
                    store.dispatch("resetActiveAssay");
                }
            } catch (err) {
                console.warn(err);
                store.commit("SET_ASSAY_ERROR", [assay, err.toString()]);
            }
        },

        async filterByTaxon(store: ActionContext<AssayState, any>, [assay, ncbiId]: [ProteomicsAssay, NcbiId]) {
            if (ncbiId === 1) {
                store.commit("RESET_FILTER", assay);
                // Notify all functional count table stores to also reset the filter.
                store.dispatch("resetFilter", assay);
                return;
            }

            async function getOwnAndChildrenSequences(
                taxonId: NcbiId,
                taxaProcessor: LcaCountTableProcessor,
                ncbiOntology: Ontology<NcbiId, NcbiTaxon>
            ): Promise<Peptide[]> {
                const taxaTable = await taxaProcessor.getCountTable();
                const peptideMapping = await taxaProcessor.getAnnotationPeptideMapping();
                const tree = new Tree(taxaTable, ncbiOntology);
                const node = tree.nodes.get(taxonId);
                const sequences: Peptide[] = [];
                const nodes: TreeNode[] = [node];
                while (nodes.length > 0) {
                    const node = nodes.pop();
                    if (peptideMapping.has(node.id)) {
                        sequences.push(...peptideMapping.get(node.id));
                    }
                    if (node.children) {
                        nodes.push(...node.children);
                    }
                }
                return sequences;
            }

            try {
                const ncbiProcessor: LcaCountTableProcessor = store.getters["ncbi/originalData"](assay).processor;
                const ncbiOntology = store.getters["ncbi/ontology"](assay);
                const peptidesForTaxon = await getOwnAndChildrenSequences(ncbiId, ncbiProcessor, ncbiOntology);

                const peptideProcessor = new PeptideCountTableProcessor();
                const filteredCountTable = await peptideProcessor.getPeptideCountTable(
                    peptidesForTaxon,
                    assay.getSearchConfiguration()
                );

                const communicationSource = store.getters["assayData"](assay).communicationSource;

                const taxon = await ncbiOntology.getDefinition(ncbiId);

                store.commit("SET_NCBI_FILTER", [assay, taxon]);
                store.commit("SET_FILTERED_TABLE", [assay, filteredCountTable]);
                store.dispatch("filterForAssay", [assay, filteredCountTable, communicationSource]);
            } catch (error) {
                console.warn(error);
                store.commit("SET_ASSAY_ERROR", [assay, error.toString()]);
            }
        },

        filterByPercentage(store: ActionContext<AssayState, any>, [assay, percentage]: [ProteomicsAssay, number]) {
            store.commit("SET_FILTER_PERCENTAGE", [assay, percentage]);
        }
    };
}

export const createAssayStore: (assayProcessorFactory: (store: ActionContext<AssayState, any>, assay: ProteomicsAssay, progressListener: ProgressListener) => AssayProcessor) => any = (
    assayProcessorFactory
) => {
    return {
        state: assayState,
        mutations: assayMutations,
        getters: assayGetters,
        actions: createAssayActions(assayProcessorFactory)
    }
};
