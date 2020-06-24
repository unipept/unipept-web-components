import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import { Peptide } from "./../business/ontology/raw/Peptide";
import { CountTable } from "./../business/counts/CountTable";
import { ActionContext, ActionTree, GetterTree, MutationTree, Store } from "vuex";
import PeptideCountTableProcessor from "./../business/processors/raw/PeptideCountTableProcessor";
import Pept2DataCommunicator from "./../business/communication/peptides/Pept2DataCommunicator";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import Assay from "@/business/entities/assay/Assay";

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
    pept2dataCommunicator: Pept2DataCommunicator
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
        return (assay: ProteomicsAssay) => assay ? state.assayData.find(a => a.assay.id === assay.id) : undefined;
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
                peptideCountTable: undefined,
                filteredPeptideCountTable: undefined,
                pept2dataCommunicator: undefined
            });
        }
    },

    REMOVE_ASSAY(state: AssayState, assay: ProteomicsAssay) {
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

    SET_PEPT2DATA_COMMUNICATOR(state: AssayState, [assay, pept2DataCommunicator]: [ProteomicsAssay, Pept2DataCommunicator]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        assayData.pept2dataCommunicator = pept2DataCommunicator;
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

    SET_ASSAY_ERROR(state: AssayState, [assay, error]: [ProteomicsAssay, string]) {
        const assayData = state.assayData.find(a => a.assay.id === assay.id);
        const analysisMeta = assayData.analysisMetaData;

        analysisMeta.error = error;
        analysisMeta.status = "error";
    }
};

export type CommunicationSourceFactory = (pept2DataCommunicator: Pept2DataCommunicator, assay: ProteomicsAssay, countTable: CountTable<Peptide>) => Promise<CommunicationSource>;

const createAssayActions: (factory: CommunicationSourceFactory) => ActionTree<AssayState, any> = (
    factory: CommunicationSourceFactory
) => {
    return {
        activateAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("ACTIVATE_ASSAY", assay);
        },

        addAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("ADD_ASSAY", assay);
        },

        removeAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("REMOVE_ASSAY", assay);
        },

        resetActiveAssay(store: ActionContext<AssayState, any>) {
            let shouldReselect: boolean = true;
            if (store.getters.activeAssay) {
                const idx: number = store.getters.assays.findIndex(data => data.assay.getId() === store.getters.activeAssay.getId());
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

        async processAssay(store: ActionContext<AssayState, any>, assay: ProteomicsAssay) {
            store.commit("RESET_ASSAY", assay);

            try {
                const countTableProcessor = new PeptideCountTableProcessor();
                const countTable = await countTableProcessor.getPeptideCountTable(
                    assay.getPeptides(),
                    assay.getSearchConfiguration()
                );

                const pept2DataCommunicator = new Pept2DataCommunicator();
                await pept2DataCommunicator.process(countTable, assay.getSearchConfiguration(), {
                    onProgressUpdate: (progress: number) => store.commit(
                        "UPDATE_ASSAY_PROGRESS",
                        [assay, progress]
                    )
                });

                store.commit("SET_PEPT2DATA_COMMUNICATOR", [assay, pept2DataCommunicator]);
                store.commit("SET_COUNT_TABLE", [assay, countTable]);
                store.commit("SET_FILTERED_TABLE", [assay, countTable]);

                const communicationSource = await factory(pept2DataCommunicator, assay, countTable);

                store.dispatch("processOntologyForAssay", [assay, countTable, communicationSource]);
                store.dispatch("resetActiveAssay");
            } catch (err) {
                store.commit("SET_ASSAY_ERROR", [assay, err.toString()]);
            }
        },
    };
}

export const createAssayStore: (communicationFactory: CommunicationSourceFactory) => any = (
    communicationFactory
) => {
    return {
        state: assayState,
        mutations: assayMutations,
        getters: assayGetters,
        actions: createAssayActions(communicationFactory)
    }
};
