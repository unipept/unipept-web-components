import {
    CountTable,
    EcCode, EcCountTableProcessor,
    EcDefinition, EcOntologyProcessor,
    GoCode,
    GoCountTableProcessor,
    GoDefinition, GoOntologyProcessor,
    InterproCode, InterproCountTableProcessor,
    InterproDefinition, InterproOntologyProcessor, LcaCountTableProcessor,
    NcbiId, NcbiOntologyProcessor,
    NcbiTaxon,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor,
    PeptideData,
    ProteomicsAssay, Tree, TreeNode
} from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
import { ActionContext, ActionTree, GetterTree, Module, MutationTree } from "vuex";

export type AssayAnalysisStatus = {
    assay: ProteomicsAssay,
    // Progress value ([0 - 100]) or -1 if indeterminate
    progress: {
        // Current progress value of the analysis (should be a number between 0 and 100 or -1 for indeterminate).
        value: number,
        // Description of the current step in the analysis process.
        step: string,
        // Time at which the current analysis step started.
        startProcessingTime: number,
        // Estimated time it will still take to finish this analysis step.
        eta: number
    },
    // All information related to errors that could have occurred during the analysis process.
    error: {
        // Did an error occur?
        status: boolean,
        // Message describing what went wrong during the analysis.
        message: string
    },
    // Is the analysis currently in progress? This value is false if the analysis has not been started yet, or if
    // it ended (either successfully or unsuccessfully).
    analysisInProgress: boolean,
    // Did the analysis process finish?
    analysisReady: boolean,

    // Keeps track of the original, unfiltered version of the data.
    originalData: {
        peptideCountTable: CountTable<Peptide>,
        goCountTableProcessor: GoCountTableProcessor,
        ecCountTableProcessor: EcCountTableProcessor,
        interproCountTableProcessor: InterproCountTableProcessor,
        ncbiCountTableProcessor: LcaCountTableProcessor,
        tree: TreeNode
    },

    // All the different count tables and associated actions, according to the currently active filtering parameters.
    filteredData: {
        peptideCountTable: CountTable<Peptide>,
        goCountTableProcessor: GoCountTableProcessor,
        ecCountTableProcessor: EcCountTableProcessor,
        interproCountTableProcessor: InterproCountTableProcessor,
        ncbiCountTableProcessor: LcaCountTableProcessor,
        tree: TreeNode
    },

    // A mapping containing all information that was found in the analysis source associated with the assay (organised
    // per peptide).
    pept2Data: ShareableMap<Peptide, PeptideData>,
    // All known information for each GO-term that occurs in the GO count table
    goOntology: Ontology<GoCode, GoDefinition>
    // All known information for each EC-number that occurs in the EC count table
    ecOntology: Ontology<EcCode, EcDefinition>,
    // All known information for each InterPro-entry that occurs in the InterPro count table
    interproOntology: Ontology<InterproCode, InterproDefinition>,
    // All known information for each NCBI taxon that occurs in the NCBI count table
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
}

export type AssayStoreState = {
    assays: AssayAnalysisStatus[],
    activeAssay: AssayAnalysisStatus
}

export default class AssayStoreFactory {
    constructor() {}

    public constructAssayStore(): Module<AssayStoreState, any>  {
        const state = {
            assays: [],
            activeAssay: undefined
        };

        const findAssayIndex = function(needle: ProteomicsAssay, haystack: AssayAnalysisStatus[]): number {
            return haystack.findIndex((item: AssayAnalysisStatus) => item.assay.id === needle.id);
        }

        const analyseAssay = async(
            assayStatus: AssayAnalysisStatus,
            store: ActionContext<AssayStoreState, any>
        ) => {
            const assay = assayStatus.assay;

            // Analysis of the assay started and we should update the status flag accordingly.
            store.commit("UPDATE_ANALYSIS_IN_PROGRESS", [assay, true]);
            store.commit("UPDATE_ANALYSIS_READY", [assay, false]);

            try {
                const communicationSource = assay.getAnalysisSource().getCommunicationSource();

                // First we compute a peptide count table for this assay.
                const peptideCountTableProcessor = new PeptideCountTableProcessor();
                const peptideCountTable = await peptideCountTableProcessor.getPeptideCountTable(
                    assay.getPeptides(),
                    assay.getSearchConfiguration()
                );

                const pept2Data = await communicationSource.getPept2DataCommunicator().process(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    {
                        onProgressUpdate(progress: number) {
                            store.commit(
                                "UPDATE_PROGRESS",
                                [assay, Math.round(progress * 100), "Analysing peptides"]
                            );
                        }
                    }
                );

                store.commit("UPDATE_PEPTIDE_TABLE", [assay, peptideCountTable, pept2Data]);

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing GO count table"]);
                const goCountTableProcessor = new GoCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getGoCommunicator()
                );
                // Preload all GO-related data
                await goCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing GO ontology"]);
                const goOntologyProcessor = new GoOntologyProcessor(communicationSource.getGoCommunicator());
                const goOntology = await goOntologyProcessor.getOntology(goCountTableProcessor.getCountTable());

                store.commit(
                    "UPDATE_GO_TERMS",
                    [
                        assay,
                        goCountTableProcessor,
                        goOntology
                    ]
                );

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing EC count table"]);
                const ecCountTableProcessor = new EcCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getEcCommunicator()
                );
                // Preload all EC-related data
                await ecCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing EC ontology"]);
                const ecOntologyProcessor = new EcOntologyProcessor(communicationSource.getEcCommunicator());
                const ecOntology = await ecOntologyProcessor.getOntology(ecCountTableProcessor.getCountTable());

                store.commit(
                    "UPDATE_EC_NUMBERS",
                    [
                        assay,
                        ecCountTableProcessor,
                        ecOntology
                    ]
                );

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing InterPro count table"]);
                const interproCountTableProcessor = new InterproCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getInterproCommunicator()
                );
                // Preload all EC-related data
                await interproCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing InterPro ontology"]);
                const iprOntologyProcessor = new InterproOntologyProcessor(communicationSource.getInterproCommunicator());
                const iprOntology = await iprOntologyProcessor.getOntology(interproCountTableProcessor.getCountTable());

                store.commit(
                    "UPDATE_INTERPRO_ENTRIES",
                    [
                        assay,
                        iprOntologyProcessor,
                        iprOntology
                    ]
                );

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing lowest common ancestors"]);
                const lcaCountTableProcessor = new LcaCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data
                );
                await lcaCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing NCBI ontology"]);
                const ncbiOntologyProcessor = new NcbiOntologyProcessor(communicationSource.getNcbiCommunicator());
                const ncbiOntology = await ncbiOntologyProcessor.getOntology(lcaCountTableProcessor.getCountTable());

                store.commit("UPDATE_PROGRESS", [assay, -1, "Computing taxonomic tree"]);
                const tree = new Tree(
                    lcaCountTableProcessor.getCountTable(),
                    ncbiOntology,
                    lcaCountTableProcessor.getAnnotationPeptideMapping()
                );

                store.commit(
                    "UPDATE_NCBI_ENTRIES",
                    [
                        assay,
                        lcaCountTableProcessor,
                        ncbiOntology,
                        tree
                    ]
                );

                store.commit("UPDATE_ANALYSIS_READY", [assay, true]);
            } catch (err) {
                // If an error occurs during one of the analysis steps, we will directly inform the user and stop the
                // analysis process.
                store.commit("UPDATE_ERROR", [assay, true, err.message]);
            } finally {
                // The analysis for this assay is over.
                store.commit("UPDATE_ANALYSIS_IN_PROGRESS", [assay, false]);
            }
        }

        const assayGetters: GetterTree<AssayStoreState, any> = {
            assays(state: AssayStoreState): AssayAnalysisStatus[] {
                return state.assays;
            },

            activeAssay(state: AssayStoreState): AssayAnalysisStatus {
                return state.activeAssay;
            },

            analysisInProgress(state: AssayStoreState): boolean {
                return state.assays.some(item => item.analysisInProgress);
            },

            assayData(state: AssayStoreState): (assay: ProteomicsAssay) => AssayAnalysisStatus {
                return (assay: ProteomicsAssay) => {
                    const idx = findAssayIndex(assay, state.assays);
                    return state.assays[idx];
                }
            }
        }

        const assayMutations: MutationTree<AssayStoreState> = {
            ADD_ASSAY(state: AssayStoreState, assay: ProteomicsAssay) {
                state.assays.push({
                    assay,
                    progress: {
                        value: -1,
                        step: "",
                        startProcessingTime: new Date().getTime(),
                        eta: 0
                    },
                    error: {
                        status: false,
                        message: ""
                    },
                    analysisInProgress: false,
                    analysisReady: false,
                    peptideCountTable: null,
                    pept2Data: null,
                    goCountTableProcessor: null,
                    goOntology: null,
                    ecCountTableProcessor: null,
                    ecOntology: null,
                    interproCountTableProcessor: null,
                    interproOntology: null,
                    ncbiCountTableProcessor: null,
                    ncbiOntology: null,
                    tree: null
                });
            },

            REMOVE_ASSAY(state: AssayStoreState, assay: ProteomicsAssay) {
                const idx = findAssayIndex(assay, state.assays);
                if (idx >= 0) {
                    state.assays.splice(idx, 1);
                }
            },

            ACTIVATE_ASSAY(state: AssayStoreState, assay: ProteomicsAssay) {
                const idx = findAssayIndex(assay, state.assays);
                state.activeAssay = state.assays[idx];
            },

            UPDATE_PROGRESS(
                state: AssayStoreState,
                [assay, value, step]: [ProteomicsAssay, number, string]
            ) {
                const idx = findAssayIndex(assay, state.assays);

                const progressObj = state.assays[idx].progress;

                if (progressObj.step !== step) {
                    // Reset the timer
                    progressObj.startProcessingTime = new Date().getTime();
                }

                if (value !== -1) {
                    // We can only calculate an ETA if a valid progress value has been given.
                    const elapsedTime = new Date().getTime() - progressObj.startProcessingTime;

                    if (elapsedTime > 500) {
                        const progressToDo = 100 - value;
                        const multiplier = progressToDo / value;
                        progressObj.eta = (elapsedTime * multiplier) / 1000;
                    }
                }

                progressObj.value = value;
                progressObj.step = step;
            },

            UPDATE_ERROR(
                state: AssayStoreState,
                [assay, errorStatus, errorMessage]: [ProteomicsAssay, boolean, string]
            ) {
                const idx = findAssayIndex(assay, state.assays);

                state.assays[idx].error.status = errorStatus;
                state.assays[idx].error.message = errorMessage;
            },

            UPDATE_ANALYSIS_IN_PROGRESS(
                state: AssayStoreState,
                [assay, inProgress]: [ProteomicsAssay, boolean]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].analysisInProgress = inProgress;
            },

            UPDATE_ANALYSIS_READY(
                state: AssayStoreState,
                [assay, analysisReady]: [ProteomicsAssay, boolean]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].analysisReady = analysisReady;
            },

            UPDATE_PEPTIDE_TABLE(
                state: AssayStoreState,
                [assay, peptideCountTable, pept2Data]: [ProteomicsAssay, CountTable<Peptide>, ShareableMap<Peptide, PeptideData>]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].peptideCountTable = peptideCountTable;
                state.assays[idx].pept2Data = pept2Data;
            },

            UPDATE_GO_TERMS(
                state: AssayStoreState,
                [assay, goProcessor, goOntology]: [ProteomicsAssay, GoCountTableProcessor, Ontology<GoCode, GoDefinition>]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].goCountTableProcessor = goProcessor;
                state.assays[idx].goOntology = goOntology;
            },

            UPDATE_EC_NUMBERS(
                state: AssayStoreState,
                [assay, ecProcessor, ecOntology]: [ProteomicsAssay, EcCountTableProcessor, Ontology<EcCode, EcDefinition>]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].ecCountTableProcessor = ecProcessor;
                state.assays[idx].ecOntology = ecOntology;
            },

            UPDATE_INTERPRO_ENTRIES(
                state: AssayStoreState,
                [assay, iprProcessor, iprOntology]: [ProteomicsAssay, InterproCountTableProcessor, Ontology<InterproCode, InterproDefinition>]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].interproCountTableProcessor = iprProcessor;
                state.assays[idx].interproOntology = iprOntology;
            },

            UPDATE_NCBI_ENTRIES(
                state: AssayStoreState,
                [assay, ncbiProcessor, ncbiOntology, tree]: [ProteomicsAssay, LcaCountTableProcessor, Ontology<NcbiId, NcbiTaxon>, TreeNode]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].ncbiCountTableProcessor = ncbiProcessor;
                state.assays[idx].ncbiOntology = ncbiOntology;
                state.assays[idx].tree = tree;
            }
        }

        const assayActions: ActionTree<AssayStoreState, any> = {
            /**
             * Initialize the queue that is responsible for processing all assays that are currently part of the store.
             * All assays that are added to the store and for which the `ready` status is false will be processed
             * sequentially.
             *
             * @param store
             */
            initializeAssayQueue(store: ActionContext<AssayStoreState, any>) {
                setInterval(
                    async() => {
                        if (!store.getters.analysisInProgress) {
                            // If no assay is currently being processed and at least one assay is waiting to be
                            // processed, we should start the analysis for this assay.
                            const assaysInQueue = store.getters.assays.filter(
                                (a: AssayAnalysisStatus) => !a.analysisReady
                            );

                            if (assaysInQueue.length > 0) {
                                await analyseAssay(assaysInQueue[0], store);
                            }
                        }
                    },
                    1000
                )
            },

            /**
             * Set an assay as the currently active assay. This means that this is the assay for which all of the
             * analysis will currently be displayed in the application. Note that only one assay can be active at any
             * time and that the previously active assay will thus no longer be active.
             *
             * @param store The store instance for which the active assay should be changed.
             * @param assay The assay that should be activated. Must be an assay that was added to this store with the
             * `addAssay` mutation before.
             */
            activateAssay(store: ActionContext<AssayStoreState, any>, assay: ProteomicsAssay) {
                store.commit("ACTIVATE_ASSAY", assay);
            },

            /**
             * Add an assay to the store and start to analyse it once the required resources are freed up.
             *
             * @param store The store instance to which a new assay should be added.
             * @param assay The assay that should be added and for which the analysis should be executed.
             */
            addAssay(store: ActionContext<AssayStoreState, any>, assay: ProteomicsAssay) {
                // First add the assay to the store.
                store.commit("ADD_ASSAY", assay);

            }
        }

        return {
            state,
            getters: assayGetters,
            mutations: assayMutations,
            actions: assayActions
        };
    }
}

