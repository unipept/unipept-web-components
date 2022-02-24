import {
    AnalysisSource,
    CountTable,
    EcCode,
    EcCountTableProcessor,
    EcDefinition,
    EcOntologyProcessor, EcProteinCountTableProcessor,
    GoCode,
    GoCountTableProcessor,
    GoDefinition,
    GoOntologyProcessor, GoProteinCountTableProcessor,
    InterproCode,
    InterproCountTableProcessor,
    InterproDefinition,
    InterproOntologyProcessor, InterproProteinCountTableProcessor,
    LcaCountTableProcessor,
    NcbiId,
    NcbiOntologyProcessor,
    NcbiTaxon,
    OnlineAnalysisSource,
    Ontology,
    Peptide,
    PeptideData,
    ProgressReport, ProteinProcessor, SearchConfiguration, Tree
} from "@/business";
import { ActionContext, ActionTree, GetterTree, Module, MutationTree } from "vuex";
import { ShareableMap } from "shared-memory-datastructures";
import { ProgressReportHelper } from "@/business/progress/ProgressReport";
import { DataNodeLike } from "unipept-visualizations";

export type SinglePeptideAnalysisStatus = {
    peptide: Peptide,
    equateIl: boolean,

    progress: ProgressReport,
    analysisInProgress: boolean,

    error: {
        // Did an error occur?
        status: boolean,
        // Message that describes what went wrong during the analysis of this peptide
        message: string,
        // Original Error-object that caused the problem in the first place.
        object: Error
    },

    peptideData: PeptideData,

    proteinProcessor: ProteinProcessor,

    goProteinCountTableProcessor: GoProteinCountTableProcessor,
    ecProteinCountTableProcessor: EcProteinCountTableProcessor,
    interproProteinCountTableProcessor: InterproProteinCountTableProcessor,

    // These ontologies are guaranteed to contain all references that are associated with either the normal peptide
    // count tables, as well as the protein count tables.
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>,
    goOntology: Ontology<GoCode, GoDefinition>,
    ecOntology: Ontology<EcCode, EcDefinition>,
    interproOntology: Ontology<InterproCode, InterproDefinition>,

    // Tree for all taxa that are associated with the proteins that correspond to the current peptide.
    taxaTree: Tree,

    // Tree for the Enzyme Commission numbers
    ecTree: DataNodeLike
}

export type SinglePeptideStoreState = {
    peptideStatus: SinglePeptideAnalysisStatus,
    // TODO: we can use this thing here to add a possibility for the user to select a specific AnalysisSource that
    // should be used when trying to analyse this peptide
    analysisSource: AnalysisSource
}

export default class SinglePeptideStoreFactory {
    constructor() {}

    public constructSinglePeptideStoreFactory(endpoint: string): Module<SinglePeptideStoreState, any> {
        const analysisSteps: string[] = [];

        const state = {
            peptideStatus: {
                peptide: "",
                equateIl: false,

                progress: ProgressReportHelper.constructProgressReportObject(analysisSteps),
                analysisInProgress: true,

                error: {
                    status: false,
                    message: "",
                    object: undefined
                },

                peptideData: null,

                proteinProcessor: null,

                goProteinCountTableProcessor: null,
                ecProteinCountTableProcessor: null,
                interproProteinCountTableProcessor: null,

                ncbiOntology: null,
                goOntology: null,
                ecOntology: null,
                interproOntology: null,

                taxaTree: null,

                ecTree: null
            },

            analysisSource: new OnlineAnalysisSource(endpoint)
        }

        const computeEcTree = (
            ecCountTable: CountTable<EcCode>,
            ecOntology: Ontology<EcCode, EcDefinition>
        ): DataNodeLike => {
            const codeNodeMap = new Map<EcCode, DataNodeLike>();

            codeNodeMap.set("-.-.-.-",
                {
                    name: "-.-.-.-",
                    children: [],
                    count: 0,
                    selfCount: 0,
                    extra:
                        {
                            sequences: Object.create(null),
                            self_sequences: Object.create(null),
                            id: 0
                        }
                }
            );

            const getOrNew = (key) => {
                if (!codeNodeMap.has(key)) {
                    codeNodeMap.set(
                        key,
                        {
                            name: key.split(".").filter((x) => x !== "-").join("."),
                            count: 0,
                            selfCount: 0,
                            children: [],
                            extra: {
                                code: key,
                                value: 0,
                                sequences: Object.create(null),
                                self_sequences: Object.create(null),
                                id: key.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
                            }
                        }
                    );
                    const ancestors = EcDefinition.computeAncestors(key, true);
                    getOrNew(ancestors[0]).children.push(codeNodeMap.get(key));
                }
                return codeNodeMap.get(key);
            };

            const sortedEcs = ecCountTable.getOntologyIds()
                .map(id => ecOntology.getDefinition(id))
                // Only retain valid definitions
                .filter(def => def)
                .sort((a: EcDefinition, b: EcDefinition) => a.level - b.level);

            for (const ecDef of sortedEcs) {
                const toInsert = {
                    name: ecDef.code.split(".").filter((x) => x !== "-").join("."),
                    count: ecCountTable.getCounts(ecDef.code),
                    selfCount: ecCountTable.getCounts(ecDef.code),
                    children: [],
                    extra: {
                        definition: ecDef,
                        id: ecDef.code.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
                    },
                };

                codeNodeMap.set(ecDef.code, toInsert);

                const ancestors = EcDefinition.computeAncestors(ecDef.code, true);
                getOrNew(ancestors[0]).children.push(toInsert);
                for (const a of ancestors) {
                    getOrNew(a).count += toInsert.count;
                }
            }

            // Order the nodes by their id (order by EC number)
            for (const val of codeNodeMap.values()) {
                val.children.sort((a, b) => a.extra.id.localeCompare(b.extra.id));
            }

            return codeNodeMap.get("-.-.-.-");
        }

        const analysePeptide = async(
            peptideStatus: SinglePeptideAnalysisStatus,
            store: ActionContext<SinglePeptideStoreState, any>
        ) => {
            store.commit("UPDATE_PEPTIDE_ANALYSIS_IN_PROGRESS", true);

            const peptideMap = new Map<Peptide, number>();
            peptideMap.set(peptideStatus.peptide, 1);

            const peptideCountTable = new CountTable<Peptide>(peptideMap);
            const searchConfig = new SearchConfiguration(false, peptideStatus.equateIl, false);

            const [pept2Data, trust] = await state.analysisSource
                .getCommunicationSource()
                .getPept2DataCommunicator()
                .process(
                    peptideCountTable,
                    searchConfig
                );

            const proteinProcessor = new ProteinProcessor();
            await proteinProcessor.compute(peptideStatus.peptide, peptideStatus.equateIl);

            const ncbiCounts = new Map<NcbiId, number>();
            for (const protein of proteinProcessor.getProteins()) {
                ncbiCounts.set(protein.organism, 1);
            }

            ncbiCounts.set(proteinProcessor.getLca(), 1);

            for (const organismId of proteinProcessor.getCommonLineage()) {
                ncbiCounts.set(organismId, 1);
            }

            const ncbiOntologyProcessor = new NcbiOntologyProcessor(
                state.analysisSource.getCommunicationSource().getNcbiCommunicator()
            );
            const ncbiOntology = await ncbiOntologyProcessor.getOntology(new CountTable<NcbiId>(ncbiCounts));

            const taxaCounts = new Map<NcbiId, number>();

            for (const protein of proteinProcessor.getProteins()) {
                taxaCounts.set(protein.organism, (taxaCounts.get(protein.organism) || 0) + 1);
            }

            const taxaCountTable = new CountTable<NcbiId>(taxaCounts);

            const taxaTree = new Tree(taxaCountTable, ncbiOntology);

            const goProteinProcessor = new GoProteinCountTableProcessor(
                peptideStatus.peptide,
                peptideStatus.equateIl,
                state.analysisSource.getCommunicationSource().getGoCommunicator()
            );
            await goProteinProcessor.compute(proteinProcessor);

            const goOntologyProcessor = new GoOntologyProcessor(
                state.analysisSource.getCommunicationSource().getGoCommunicator()
            );
            const goOntology = await goOntologyProcessor.getOntology(goProteinProcessor.getCountTable());

            const ecProteinProcessor = new EcProteinCountTableProcessor(
                peptideStatus.peptide,
                peptideStatus.equateIl,
                state.analysisSource.getCommunicationSource().getEcCommunicator()
            );
            await ecProteinProcessor.compute(proteinProcessor);

            const ecOntologyProcessor = new EcOntologyProcessor(
                state.analysisSource.getCommunicationSource().getEcCommunicator()
            );
            const ecOntology = await ecOntologyProcessor.getOntology(ecProteinProcessor.getCountTable());

            const ecTree = computeEcTree(ecProteinProcessor.getCountTable(), ecOntology);

            const interproProteinProcessor = new InterproProteinCountTableProcessor(
                peptideStatus.peptide,
                peptideStatus.equateIl,
                state.analysisSource.getCommunicationSource().getInterproCommunicator()
            );
            await interproProteinProcessor.compute(proteinProcessor);

            const interproOntologyProcessor = new InterproOntologyProcessor(
                state.analysisSource.getCommunicationSource().getInterproCommunicator()
            );
            const interproOntology = await interproOntologyProcessor.getOntology(interproProteinProcessor.getCountTable());

            store.commit("UPDATE_PEPTIDE_DATA", [
                pept2Data.get(peptideStatus.peptide),
                ncbiOntology,
                proteinProcessor,
                goProteinProcessor,
                goOntology,
                ecProteinProcessor,
                ecOntology,
                interproProteinProcessor,
                interproOntology,
                taxaTree,
                ecTree
            ]);

            store.commit("UPDATE_PEPTIDE_ANALYSIS_IN_PROGRESS", false);
        }

        const peptideGetters: GetterTree<SinglePeptideStoreState, any> = {
            peptideStatus(state: SinglePeptideStoreState): SinglePeptideAnalysisStatus {
                return state.peptideStatus;
            }
        }

        const peptideMutations: MutationTree<SinglePeptideStoreState> = {
            UPDATE_PEPTIDE(state: SinglePeptideStoreState, peptide: Peptide) {
                state.peptideStatus.peptide = peptide;
            },

            UPDATE_PEPTIDE_CONFIGURATION(state: SinglePeptideStoreState, equateIl: boolean) {
                state.peptideStatus.equateIl = equateIl;
            },

            UPDATE_PEPTIDE_ANALYSIS_IN_PROGRESS(state: SinglePeptideStoreState, inProgress: boolean) {
                state.peptideStatus.analysisInProgress = inProgress;
            },

            UPDATE_PEPTIDE_PROGRESS(state: SinglePeptideStoreState, [value, step]: [number, number]) {
                state.peptideStatus.progress.currentStep = step;
                state.peptideStatus.progress.currentValue = value;
            },

            UPDATE_PEPTIDE_DATA(state: SinglePeptideStoreState, [
                peptideData,
                ncbiOntology,
                proteinProcessor,
                goProteinProcessor,
                goOntology,
                ecProteinProcessor,
                ecOntology,
                interproProteinProcessor,
                interproOntology,
                taxaTree,
                ecTree
            ]: [
                PeptideData,
                Ontology<NcbiId, NcbiTaxon>,
                ProteinProcessor,
                GoProteinCountTableProcessor,
                Ontology<GoCode, GoDefinition>,
                EcProteinCountTableProcessor,
                Ontology<EcCode, EcDefinition>,
                InterproProteinCountTableProcessor,
                Ontology<InterproCode, InterproDefinition>,
                Tree,
                DataNodeLike
            ]) {
                state.peptideStatus.peptideData = peptideData;
                state.peptideStatus.ncbiOntology = ncbiOntology;
                state.peptideStatus.proteinProcessor = proteinProcessor;
                state.peptideStatus.goProteinCountTableProcessor = goProteinProcessor;
                state.peptideStatus.goOntology = goOntology;
                state.peptideStatus.ecProteinCountTableProcessor = ecProteinProcessor;
                state.peptideStatus.ecOntology = ecOntology;
                state.peptideStatus.interproProteinCountTableProcessor = interproProteinProcessor;
                state.peptideStatus.interproOntology = interproOntology;
                state.peptideStatus.taxaTree = taxaTree;
                state.peptideStatus.ecTree = ecTree;
            }
        }

        const peptideActions: ActionTree<SinglePeptideStoreState, any> = {
            analyseSinglePeptide(store: ActionContext<SinglePeptideStoreState, any>, [peptide, equateIl]: [Peptide, boolean]) {
                store.commit("UPDATE_PEPTIDE", peptide);
                store.commit("UPDATE_PEPTIDE_CONFIGURATION", equateIl);

                analysePeptide(store.getters.peptideStatus, store);
            }
        }

        return {
            state,
            getters: peptideGetters,
            mutations: peptideMutations,
            actions: peptideActions
        }
    }
}

