import {
    CountTable,
    EcCode,
    EcCountTableProcessor,
    EcDefinition,
    EcOntologyProcessor,
    GoCode,
    GoCountTableProcessor,
    GoDefinition,
    GoOntologyProcessor,
    InterproCode,
    InterproCountTableProcessor,
    InterproDefinition,
    InterproOntologyProcessor,
    LcaCountTableProcessor,
    NcbiId,
    NcbiOntologyProcessor,
    NcbiTaxon,
    Ontology,
    Pept2DataCommunicator,
    Peptide,
    PeptideCountTableProcessor,
    PeptideData, PeptideTrust,
    ProteomicsAssay,
    Tree,
    TreeNode
} from "@/business";

import { ProgressReport, ProgressReportHelper } from "./../business/progress/ProgressReport";

import { ShareableMap } from "shared-memory-datastructures";
import { ActionContext, ActionTree, GetterTree, Module, MutationTree } from "vuex";
import PeptideTrustProcessor from "@/business/processors/raw/PeptideTrustProcessor";

export type AssayAnalysisStatus = {
    assay: ProteomicsAssay,
    // Current progress of calculating the original data for the assay.
    originalProgress: ProgressReport,
    // Current progress of calculating filtered data for the assay.
    filterProgress: ProgressReport,
    // All information related to errors that could have occurred during the analysis process.
    error: {
        // Did an error occur?
        status: boolean,
        // Message describing what went wrong during the analysis.
        message: string,
        object: Error
    },
    // Is the analysis currently in progress? This value is false if the analysis has not been started yet, or if
    // it ended (either successfully or unsuccessfully).
    analysisInProgress: boolean,
    // Did the analysis process finish?
    analysisReady: boolean,

    // Is the filtering process for this assay currently in progress? This value is false if the analysis has not been
    // started yet, or if it ended (either successfully or unsuccessfully).
    filterInProgress: boolean,
    // Did the filtering process finish?
    filterReady: boolean,

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
        // Percentage that was used to filter all of the above count tables on.
        percentage: number
    },

    // A mapping containing all information that was found in the analysis source associated with the assay (organised
    // per peptide).
    pept2Data: ShareableMap<Peptide, PeptideData>,
    peptideTrust: PeptideTrust,
    // All known information for each GO-term that occurs in the GO count table
    goOntology: Ontology<GoCode, GoDefinition>
    // All known information for each EC-number that occurs in the EC count table
    ecOntology: Ontology<EcCode, EcDefinition>,
    // All known information for each InterPro-entry that occurs in the InterPro count table
    interproOntology: Ontology<InterproCode, InterproDefinition>,
    // All known information for each NCBI taxon that occurs in the NCBI count table
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>,

    // ID of the rank by which we want to filter the results
    filterId: number,

    // Minimum threshold of items by which we want to filter (must be a number between 0 and 100)
    filterPercentage: number
}

export type AssayStoreState = {
    assays: AssayAnalysisStatus[],
    activeAssay: AssayAnalysisStatus
}

export default class AssayStoreFactory {
    constructor() {}

    public constructAssayStore(): Module<AssayStoreState, any>  {
        // All of the different steps that are passed when analysing a specific assay.
        const progressSteps: string[] = [
            "Analysing peptides",
            "Computing GO count table",
            "Computing GO ontology",
            "Computing EC count table",
            "Computing EC ontology",
            "Computing InterPro count table",
            "Computing InterPro ontology",
            "Computing lowest common ancestors",
            "Computing NCBI ontology",
            "Computing taxonomic tree",
            "Applying filter"
        ];

        const filterSteps: string[] = [
            "Calculating sequences subset",
            "Filter count table",
            "Compute filtered GO count table",
            "Compute filtered EC count table",
            "Compute filtered InterPro count table"
        ];

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

            if (!store.getters.activeAssay) {
                store.commit("ACTIVATE_ASSAY", assayStatus.assay);
            }

            // Analysis of the assay started and we should update the status flag accordingly.
            store.commit("UPDATE_ANALYSIS_IN_PROGRESS", [assay, true]);
            store.commit("UPDATE_ANALYSIS_READY", [assay, false]);
            store.commit("UPDATE_ERROR", [assay, false, ""]);

            try {
                const communicationSource = assay.getAnalysisSource().getCommunicationSource();

                // First we compute a peptide count table for this assay.
                const peptideCountTableProcessor = new PeptideCountTableProcessor();
                const peptideCountTable = await peptideCountTableProcessor.getPeptideCountTable(
                    assay.getPeptides(),
                    assay.getSearchConfiguration()
                );

                const [pept2Data, peptideTrust] = await communicationSource.getPept2DataCommunicator().process(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    {
                        onProgressUpdate(progress: number) {
                            store.commit(
                                "UPDATE_PROGRESS",
                                [assay, Math.round(progress * 100), 0, false]
                            );
                        }
                    }
                );

                store.commit("UPDATE_PROGRESS", [assay, -1, 1, false]);
                const goCountTableProcessor = new GoCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getGoCommunicator()
                );
                // Preload all GO-related data
                await goCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, 2, false]);
                const goOntologyProcessor = new GoOntologyProcessor(communicationSource.getGoCommunicator());
                const goOntology = await goOntologyProcessor.getOntology(goCountTableProcessor.getCountTable());

                store.commit("UPDATE_PROGRESS", [assay, -1, 3, false]);
                const ecCountTableProcessor = new EcCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getEcCommunicator()
                );
                // Preload all EC-related data
                await ecCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, 4, false]);
                const ecOntologyProcessor = new EcOntologyProcessor(communicationSource.getEcCommunicator());
                const ecOntology = await ecOntologyProcessor.getOntology(ecCountTableProcessor.getCountTable());


                store.commit("UPDATE_PROGRESS", [assay, -1, 5, false]);
                const interproCountTableProcessor = new InterproCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data,
                    communicationSource.getInterproCommunicator()
                );
                // Preload all EC-related data
                await interproCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, 6, false]);
                const iprOntologyProcessor = new InterproOntologyProcessor(communicationSource.getInterproCommunicator());
                const iprOntology = await iprOntologyProcessor.getOntology(interproCountTableProcessor.getCountTable());


                store.commit("UPDATE_PROGRESS", [assay, -1, 7, false]);
                const lcaCountTableProcessor = new LcaCountTableProcessor(
                    peptideCountTable,
                    assay.getSearchConfiguration(),
                    pept2Data
                );
                await lcaCountTableProcessor.compute();

                store.commit("UPDATE_PROGRESS", [assay, -1, 8, false]);
                const ncbiOntologyProcessor = new NcbiOntologyProcessor(communicationSource.getNcbiCommunicator());
                const ncbiOntology = await ncbiOntologyProcessor.getOntology(lcaCountTableProcessor.getCountTable());

                store.commit("UPDATE_PROGRESS", [assay, -1, 9, false]);
                const tree = new Tree(
                    lcaCountTableProcessor.getCountTable(),
                    ncbiOntology,
                    lcaCountTableProcessor.getAnnotationPeptideMapping()
                );

                // Commit all of the things that have just been calculated.
                store.commit("UPDATE_ORIGINAL_DATA", [
                    assay,
                    peptideCountTable,
                    pept2Data,
                    peptideTrust,
                    goCountTableProcessor,
                    goOntology,
                    ecCountTableProcessor,
                    ecOntology,
                    interproCountTableProcessor,
                    iprOntology,
                    lcaCountTableProcessor,
                    ncbiOntology,
                    tree
                ]);

                store.commit("UPDATE_PROGRESS", [assay, -1, 10, false]);
                store.commit("UPDATE_FILTER_DATA", [
                    assay,
                    peptideCountTable,
                    goCountTableProcessor,
                    ecCountTableProcessor,
                    interproCountTableProcessor,
                    lcaCountTableProcessor,
                    tree,
                    5
                ]);

            } catch (err) {
                console.error(err);

                // If an error occurs during one of the analysis steps, we will directly inform the user and stop the
                // analysis process.
                store.commit("UPDATE_ERROR", [assay, true, err.message, err]);
            } finally {
                // This assay should also not be filtered again!
                await store.commit("UPDATE_FILTER_READY", [assay, true]);
                await store.commit("UPDATE_ANALYSIS_READY", [assay, true]);
                // The analysis for this assay is over.
                await store.commit("UPDATE_ANALYSIS_IN_PROGRESS", [assay, false]);
            }
        }

        const filterAssay = async(
            assayStatus: AssayAnalysisStatus,
            store: ActionContext<AssayStoreState, any>
        ) => {
            const assay = assayStatus.assay;
            const taxonId = assayStatus.filterId;
            const filterPercentage = assayStatus.filterPercentage;

            store.commit("UPDATE_FILTER_IN_PROGRESS", [assay, true]);
            store.commit("UPDATE_FILTER_READY", [assay, false]);
            store.commit("UPDATE_ERROR", [assay, false, "", undefined]);

            // Simply reset the filter data to the original data if the default parameters have been used.
            if (taxonId === 1 && filterPercentage === 5) {
                store.commit("UPDATE_PROGRESS", [assay, -1, 0, true]);

                const originalAssayData = store.getters["assayData"](assay);

                // TODO, we should get rid of this timeout in the future
                await new Promise<void>((resolve) => {
                    setTimeout(() => resolve(), 100);
                });

                store.commit("UPDATE_FILTER_DATA", [
                    assay,
                    originalAssayData.originalData.peptideCountTable,
                    originalAssayData.originalData.goCountTableProcessor,
                    originalAssayData.originalData.ecCountTableProcessor,
                    originalAssayData.originalData.interproCountTableProcessor,
                    filterPercentage
                ]);

                store.commit("UPDATE_FILTER_READY", [assay, true]);
                store.commit("UPDATE_FILTER_IN_PROGRESS", [assay, false]);
            } else {
                store.commit("UPDATE_PROGRESS", [assay, -1, 0, true]);

                const getOwnAndChildrenSequences = async function(
                    taxonId: NcbiId,
                    lcaProcessor: LcaCountTableProcessor,
                    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
                ): Promise<Peptide[]> {
                    const lcaCountTable = lcaProcessor.getCountTable();
                    const peptideMapping = lcaProcessor.getAnnotationPeptideMapping();

                    const tree = new Tree(lcaCountTable, ncbiOntology);

                    const sequences: Peptide[] = [];
                    const node = tree.nodes.get(taxonId);
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
                    const assayData = store.getters["assayData"](assay);
                    const lcaProcessor = assayData.originalData.ncbiCountTableProcessor;

                    store.commit("UPDATE_PROGRESS", [assay, -1, 1, true]);

                    const peptidesForTaxon = await getOwnAndChildrenSequences(
                        taxonId,
                        lcaProcessor,
                        assayData.ncbiOntology
                    );

                    const peptideProcessor = new PeptideCountTableProcessor();
                    const filteredCountTable = await peptideProcessor.getPeptideCountTable(
                        peptidesForTaxon,
                        assay.getSearchConfiguration()
                    );

                    store.commit("UPDATE_PROGRESS", [assay, -1, 2, true]);

                    const goCountTableProcessor = new GoCountTableProcessor(
                        filteredCountTable,
                        assay.getSearchConfiguration(),
                        assayData.pept2Data,
                        assay.getAnalysisSource().getCommunicationSource().getGoCommunicator(),
                        filterPercentage
                    );
                    await goCountTableProcessor.compute();

                    store.commit("UPDATE_PROGRESS", [assay, -1, 3, true]);

                    const ecCountTableProcessor = new EcCountTableProcessor(
                        filteredCountTable,
                        assay.getSearchConfiguration(),
                        assayData.pept2Data,
                        assay.getAnalysisSource().getCommunicationSource().getEcCommunicator(),
                        filterPercentage
                    );
                    await ecCountTableProcessor.compute();

                    store.commit("UPDATE_PROGRESS", [assay, -1, 4, true]);

                    const iprCountTableProcessor = new InterproCountTableProcessor(
                        filteredCountTable,
                        assay.getSearchConfiguration(),
                        assayData.pept2Data,
                        assay.getAnalysisSource().getCommunicationSource().getInterproCommunicator(),
                        filterPercentage
                    );
                    await iprCountTableProcessor.compute();

                    store.commit("UPDATE_FILTER_DATA", [
                        assay,
                        filteredCountTable,
                        goCountTableProcessor,
                        ecCountTableProcessor,
                        iprCountTableProcessor,
                        filterPercentage
                    ]);
                } catch (error) {
                    store.commit("UPDATE_ERROR", [assay, true, error.message]);
                } finally {
                    store.commit("UPDATE_FILTER_READY", [assay, true]);
                    store.commit("UPDATE_FILTER_IN_PROGRESS", [assay, false]);
                }
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

            filterInProgress(state: AssayStoreState): boolean {
                return state.assays.some(item => item.filterInProgress);
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

                    originalProgress: ProgressReportHelper.constructProgressReportObject(progressSteps),
                    filterProgress: ProgressReportHelper.constructProgressReportObject(progressSteps),

                    error: {
                        status: false,
                        message: "",
                        object: undefined
                    },

                    originalData: {
                        peptideCountTable: null,
                        goCountTableProcessor: null,
                        ecCountTableProcessor: null,
                        interproCountTableProcessor: null,
                        ncbiCountTableProcessor: null,
                        tree: null
                    },

                    filteredData: {
                        peptideCountTable: null,
                        goCountTableProcessor: null,
                        ecCountTableProcessor: null,
                        interproCountTableProcessor: null,
                        percentage: 5
                    },

                    analysisInProgress: false,
                    analysisReady: false,

                    filterInProgress: false,
                    filterReady: false,

                    pept2Data: null,
                    peptideTrust: null,
                    goOntology: null,
                    ecOntology: null,
                    interproOntology: null,
                    ncbiOntology: null,

                    filterId: 1,
                    filterPercentage: 5
                });
            },

            REMOVE_ASSAY(state: AssayStoreState, assay: ProteomicsAssay) {
                const idx = findAssayIndex(assay, state.assays);
                if (idx >= 0) {
                    state.assays.splice(idx, 1);
                }
                if (state.activeAssay?.assay?.getId() === assay.getId()) {
                    state.activeAssay = state.assays.length > 0 ? state.assays[0] : undefined;
                }
            },

            REMOVE_ALL_ASSAYS(state: AssayStoreState) {
                state.activeAssay = undefined;
                state.assays.splice(0, state.assays.length);
            },

            ACTIVATE_ASSAY(state: AssayStoreState, assay: ProteomicsAssay) {
                const idx = findAssayIndex(assay, state.assays);
                state.activeAssay = state.assays[idx];
            },

            UPDATE_PROGRESS(
                state: AssayStoreState,
                [assay, value, step, filterProgress = false]: [ProteomicsAssay, number, number, boolean]
            ) {
                const idx = findAssayIndex(assay, state.assays);

                let progressObj: ProgressReport;

                if (filterProgress) {
                    progressObj = state.assays[idx].filterProgress;
                } else {
                    progressObj = state.assays[idx].originalProgress;
                }

                progressObj.currentValue = value;
                progressObj.currentStep = step;

                const time = new Date().getTime();

                // Update the end time for all the previous steps
                for (let i = step - 1; i >= 0; i--) {
                    if (progressObj.endTimes[i] === 0) {
                        progressObj.endTimes[i] = time;
                    }

                    if (progressObj.startTimes[i] === 0) {
                        progressObj.startTimes[i] = time;
                    }
                }

                if (progressObj.startTimes[step] === 0) {
                    progressObj.startTimes[step] = time;
                    progressObj.eta = -1;
                } else if (value !== -1) {
                    // This is already at least the second time that a progress value for this step is reported. This
                    // means that we can start to calculate an ETA (if a valid progress value has been given).
                    const elapsedTime = time - progressObj.startTimes[step];

                    if (elapsedTime > 500) {
                        const progressToDo = 100 - value;
                        const multiplier = progressToDo / value;
                        progressObj.eta = elapsedTime * multiplier;
                    } else {
                        progressObj.eta = -1;
                    }
                } else {
                    progressObj.eta = -1;
                }
            },

            UPDATE_ERROR(
                state: AssayStoreState,
                [assay, errorStatus, errorMessage, error]: [ProteomicsAssay, boolean, string, Error]
            ) {
                const idx = findAssayIndex(assay, state.assays);

                state.assays[idx].error.status = errorStatus;
                state.assays[idx].error.message = errorMessage;
                state.assays[idx].error.object = error;
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

                const progressObj = state.assays[idx].originalProgress;

                const time = new Date().getTime();

                if (analysisReady) {
                    progressObj.currentStep = 11;

                    // Store end time for the last progress
                    for (let i = 0; i < progressObj.steps.length; i++) {
                        if (progressObj.startTimes[i] === 0) {
                            progressObj.startTimes[i] = time;
                        }

                        if (progressObj.endTimes[i] === 0) {
                            progressObj.endTimes[i] = time;
                        }
                    }
                } else {
                    // Reset progress values
                    for (let i = 0; i < progressObj.steps.length; i++) {
                        progressObj.startTimes[i] = 0;
                        progressObj.endTimes[i] = 0;
                    }
                }
            },

            UPDATE_ORIGINAL_DATA(
                state: AssayStoreState,
                [
                    assay,
                    peptideCountTable,
                    pept2Data,
                    peptideTrust,
                    goProcessor,
                    goOntology,
                    ecProcessor,
                    ecOntology,
                    interproProcessor,
                    interproOntology,
                    ncbiProcessor,
                    ncbiOntology,
                    tree
                ]: [
                    ProteomicsAssay,
                    CountTable<Peptide>,
                    ShareableMap<Peptide, PeptideData>,
                    PeptideTrust,
                    GoCountTableProcessor,
                    Ontology<GoCode, GoDefinition>,
                    EcCountTableProcessor,
                    Ontology<EcCode, EcDefinition>,
                    InterproCountTableProcessor,
                    Ontology<InterproCode, InterproDefinition>,
                    LcaCountTableProcessor,
                    Ontology<NcbiId, NcbiTaxon>,
                    TreeNode
                ]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                const assayData = state.assays[idx];
                const originalAssayData = assayData.originalData;

                originalAssayData.peptideCountTable = peptideCountTable;
                assayData.pept2Data = pept2Data;
                assayData.peptideTrust = peptideTrust;
                originalAssayData.goCountTableProcessor = goProcessor;
                assayData.goOntology = goOntology;
                originalAssayData.ecCountTableProcessor = ecProcessor;
                assayData.ecOntology = ecOntology;
                originalAssayData.interproCountTableProcessor = interproProcessor;
                assayData.interproOntology = interproOntology;
                originalAssayData.ncbiCountTableProcessor = ncbiProcessor;
                assayData.ncbiOntology = ncbiOntology;
                originalAssayData.tree = tree;
            },

            UPDATE_FILTER_DATA(
                state: AssayStoreState,
                [
                    assay,
                    peptideCountTable,
                    goProcessor,
                    ecProcessor,
                    interproProcessor,
                    percentage
                ]: [
                    ProteomicsAssay,
                    CountTable<Peptide>,
                    GoCountTableProcessor,
                    EcCountTableProcessor,
                    InterproCountTableProcessor,
                    number
                ]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                const filterAssayData = state.assays[idx].filteredData;

                filterAssayData.peptideCountTable = peptideCountTable;
                filterAssayData.goCountTableProcessor = goProcessor;
                filterAssayData.ecCountTableProcessor = ecProcessor;
                filterAssayData.interproCountTableProcessor = interproProcessor;
                filterAssayData.percentage = percentage;
            },

            UPDATE_FILTER_IN_PROGRESS(
                state: AssayStoreState,
                [assay, inProgress]: [ProteomicsAssay, boolean]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].filterInProgress = inProgress;
            },

            UPDATE_FILTER_READY(
                state: AssayStoreState,
                [assay, filterReady]: [ProteomicsAssay, boolean]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].filterReady = filterReady;

                const progressObj = state.assays[idx].filterProgress;

                const time = new Date().getTime();

                if (filterReady) {
                    progressObj.currentStep = progressObj.steps.length;

                    // Store end time for the last progress
                    for (let i = 0; i < progressObj.steps.length; i++) {
                        if (progressObj.startTimes[i] === 0) {
                            progressObj.startTimes[i] = time;
                        }

                        if (progressObj.endTimes[i] === 0) {
                            progressObj.endTimes[i] = time;
                        }
                    }
                } else {
                    // Reset progress values
                    for (let i = 0; i < progressObj.steps.length; i++) {
                        progressObj.startTimes[i] = 0;
                        progressObj.endTimes[i] = 0;
                    }
                }
            },

            UPDATE_FILTER_RANK(
                state: AssayStoreState,
                [assay, rankId]: [ProteomicsAssay, number]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].filterId = rankId;
            },

            UPDATE_FILTER_PERCENTAGE(
                state: AssayStoreState,
                [assay, filterPercentage]: [ProteomicsAssay, number]
            ) {
                const idx = findAssayIndex(assay, state.assays);
                state.assays[idx].filterPercentage = filterPercentage;
            }
        };

        const assayActions: ActionTree<AssayStoreState, any> = {
            /**
             * Initialize the queue that is responsible for processing all assays that are currently part of the store.
             * All assays that are added to the store and for which the `ready` status is false will be processed
             * sequentially.
             *
             * @param store
             */
            initializeAssayQueue(store: ActionContext<AssayStoreState, any>) {
                // Initialize queue for normal analysis
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
                );

                // Initialize queue for filter analysis
                setInterval(
                    async() => {
                        if (!store.getters.filterInProgress) {
                            const filtersInQueue = store.getters.assays.filter(
                                (a: AssayAnalysisStatus) => !a.filterReady && a.analysisReady
                            );

                            if (filtersInQueue.length > 0) {
                                await filterAssay(filtersInQueue[0], store);
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
                store.commit("ADD_ASSAY", assay);
            },

            analyseAssay(store: ActionContext<AssayStoreState, any>, assay: ProteomicsAssay) {
                store.commit("UPDATE_ERROR", [assay, false, "", undefined]);
                store.commit("UPDATE_ANALYSIS_READY", [assay, false]);
            },

            removeAllAssays(store: ActionContext<AssayStoreState, any>) {
                store.commit("REMOVE_ALL_ASSAYS");
            },

            removeAssay(store: ActionContext<AssayStoreState, any>, assay: ProteomicsAssay) {
                store.commit("REMOVE_ASSAY", assay);
            },

            filterAssayByTaxon(store: ActionContext<AssayStoreState, any>, [assay, taxonId]: [ProteomicsAssay, NcbiId]) {
                store.commit("UPDATE_FILTER_RANK", [assay, taxonId]);
                store.commit("UPDATE_FILTER_READY", [assay, false]);
            },

            filterAssayByPercentage(store: ActionContext<AssayStoreState, any>, [assay, percentage]: [ProteomicsAssay, number]) {
                store.commit("UPDATE_FILTER_PERCENTAGE", [assay, percentage]);
                store.commit("UPDATE_FILTER_READY", [assay, false]);
            }
        }

        return {
            state,
            getters: assayGetters,
            mutations: assayMutations,
            actions: assayActions
        }
    }
}

