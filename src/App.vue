<template>
    <v-app>
        <v-main>
            <div v-if="loading">
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>
            <div v-else>
                <visualization-overview
                    :filter="0"
                    :go-count-table-processor="goProcessor!"
                    :go-ontology="goOntology!"
                    :ec-count-table-processor="ecProcessor!"
                    :ec-ontology="ecOntology!"
                    :interpro-count-table-processor="interproProcessor!"
                    :interpro-ontology="interproOntology!"
                    :filter-id="2"
                    :analysis-in-progress="loading"
                    :show-percentage="true"
                    :ec-tree="ecTree!"
                    :ncbi-tree="ncbiTree!"
                    :ncbi-ontology="ncbiOntology!"
                    :ncbi-count-table-processor="lcaProcessor!"
                />

                <go-summary-card
                    :analysis-in-progress="loading"
                    :go-processor="goProcessor!"
                    :go-ontology="goOntology!"
                    :ncbi-processor="lcaProcessor!"
                    :ncbi-tree="ncbiTree!"
                    :show-percentage="true"
                    :filter="5"
                    @filter-percentage-change="() => {}"
                />
            </div>

<!--            <div v-else>-->
<!--                <single-peptide-summary-->
<!--                    :go-link="true"-->
<!--                    :assay="singlePeptideStatus!"-->
<!--                    :ec-link="true"-->
<!--                    :interpro-link="true"-->
<!--                />-->
<!--                <single-peptide-analysis-->
<!--                    :assay="singlePeptideStatus!"-->
<!--                />-->
<!--            </div>-->

<!--            <matched-proteins-table-->
<!--                v-else-->
<!--                :assay="singlePeptideStatus!"-->
<!--            />-->
<!--            <lineage-table-->
<!--                v-else-->
<!--                :assay="singlePeptideStatus!"-->
<!--            />-->
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { SinglePeptideAnalysisStatus } from "@/interface";
import * as sample from "@/sample7.json";

import {
    computeEcTree,
    CountTable, EcCode, EcCountTableProcessor, EcDefinition,
    EcOntologyProcessor,
    EcProteinCountTableProcessor,
    EcResponseCommunicator, GoCode, GoCountTableProcessor, GoDefinition,
    GoOntologyProcessor,
    GoProteinCountTableProcessor,
    GoResponseCommunicator, InterproCode, InterproCountTableProcessor, InterproDefinition, InterproOntologyProcessor,
    InterproProteinCountTableProcessor,
    InterproResponseCommunicator, LcaCountTableProcessor,
    NcbiId,
    NcbiOntologyProcessor,
    NcbiResponseCommunicator, NcbiTaxon,
    NcbiTree, Ontology,
    Pept2DataCommunicator,
    ProteinProcessor,
    ProteinResponseCommunicator, QueueManager
} from "@/logic";
import Peptide from "@/logic/ontology/peptide/Peptide";
import EcSummaryCard from "@/components/cards/EcSummaryCard.vue";
import { DataNodeLike } from "unipept-visualizations";
import VisualizationOverview from "@/components/analysis/VisualizationOverview.vue";
import SinglePeptideAnalysis from "@/components/analysis/SinglePeptideAnalysis.vue";
import SinglePeptideSummary from "@/components/analysis/SinglePeptideSummary.vue";
import GoSummaryCard from "@/components/cards/GoSummaryCard.vue";

const loading = ref(true);

const unipeptApiUrl = "https://api.unipept.ugent.be";
const peptideDataBatchSize  = 100;
const cleavageBatchSize     = 10;
const parallelRequests = 5;
const goBatchSize           = 100;
const ecBatchSize           = 100;
const interproBatchSize     = 100;
const ncbiBatchSize         = 100;

const pept2DataCommunicator = new Pept2DataCommunicator(
    unipeptApiUrl,
    peptideDataBatchSize,
    cleavageBatchSize,
    parallelRequests
);
// MetaProteomics

NcbiResponseCommunicator.setup(unipeptApiUrl, ncbiBatchSize);
const ncbiCommunicator = new NcbiResponseCommunicator();

GoResponseCommunicator.setup(unipeptApiUrl, goBatchSize);
const goCommunicator = new GoResponseCommunicator();

EcResponseCommunicator.setup(unipeptApiUrl, ecBatchSize);
const ecCommunicator = new EcResponseCommunicator();

InterproResponseCommunicator.setup(unipeptApiUrl, interproBatchSize);
const interproCommunicator = new InterproResponseCommunicator();

const goOntology: Ref<Ontology<GoCode, GoDefinition> | undefined> = ref();
const ecOntology: Ref<Ontology<EcCode, EcDefinition> | undefined> = ref();
const interproOntology: Ref<Ontology<InterproCode, InterproDefinition> | undefined> = ref();

const goProcessor: Ref<GoCountTableProcessor | undefined> = ref();
const ecProcessor: Ref<EcCountTableProcessor | undefined> = ref();
const interproProcessor: Ref<InterproCountTableProcessor | undefined> = ref();

const ecTree: Ref<DataNodeLike | undefined> = ref();

const ncbiTree: Ref<NcbiTree | undefined> = ref();
const ncbiOntology: Ref<Ontology<NcbiId, NcbiTaxon> | undefined> = ref();
const lcaProcessor: Ref<LcaCountTableProcessor | undefined> = ref();

QueueManager.initializeQueue(4);

const startAnalysis = async function() {
    loading.value = true;

    const peptides = sample.peptides;
    const equateIl = false;

    const peptideMap = new Map<Peptide, number>();
    for (const peptide of peptides) {
        peptideMap.set(peptide, (peptideMap.get(peptide) || 0) + 1);
    }

    const peptideCountTable = new CountTable<Peptide>(peptideMap);

    const [pept2Data, trust] = await pept2DataCommunicator.process(peptideCountTable, false, equateIl);

    const goCountTableProcessor = new GoCountTableProcessor(peptideCountTable, pept2Data, goCommunicator);
    await goCountTableProcessor.compute();
    goProcessor.value = goCountTableProcessor;

    const goOntologyProcessor = new GoOntologyProcessor(goCommunicator);
    goOntology.value = await goOntologyProcessor.getOntology(goCountTableProcessor.getCountTable());

    const interproCountTableProcessor = new InterproCountTableProcessor(peptideCountTable, pept2Data, interproCommunicator);
    await interproCountTableProcessor.compute();
    interproProcessor.value = interproCountTableProcessor;

    const interproOntologyProcessor = new InterproOntologyProcessor(interproCommunicator);
    interproOntology.value = await interproOntologyProcessor.getOntology(interproCountTableProcessor.getCountTable());

    const ecCountTableProcessor = new EcCountTableProcessor(peptideCountTable, pept2Data, ecCommunicator);
    await ecCountTableProcessor.compute();
    ecProcessor.value = ecCountTableProcessor;

    const ecOntologyProcessor = new EcOntologyProcessor(ecCommunicator);
    ecOntology.value = await ecOntologyProcessor.getOntology(ecCountTableProcessor.getCountTable());

    const lcaCountTableProcessor = new LcaCountTableProcessor(peptideCountTable, pept2Data);
    await lcaCountTableProcessor.compute();
    lcaProcessor.value = lcaCountTableProcessor;

    const ncbiOntologyProcessor = new NcbiOntologyProcessor(ncbiCommunicator);
    ncbiOntology.value = await ncbiOntologyProcessor.getOntology(lcaCountTableProcessor.getCountTable());

    ncbiTree.value = new NcbiTree(
        lcaCountTableProcessor.getCountTable(), ncbiOntology.value, lcaCountTableProcessor.getAnnotationPeptideMapping()
    );

    ecTree.value = computeEcTree(
        ecCountTableProcessor.getCountTable(),
        ecOntology.value,
    );

    loading.value = false;
}

startAnalysis();



// Single peptide analysis
// NcbiResponseCommunicator.setup(unipeptApiUrl, ncbiBatchSize);
// const ncbiCommunicator = new NcbiResponseCommunicator();
//
// GoResponseCommunicator.setup(unipeptApiUrl, goBatchSize);
// const goCommunicator = new GoResponseCommunicator();
//
// EcResponseCommunicator.setup(unipeptApiUrl, ecBatchSize);
// const ecCommunicator = new EcResponseCommunicator();
//
// InterproResponseCommunicator.setup(unipeptApiUrl, interproBatchSize);
// const interproCommunicator = new InterproResponseCommunicator();
//
// ProteinResponseCommunicator.setup(unipeptApiUrl);
// const proteinCommunicator = new ProteinResponseCommunicator();
//
// const singlePeptideStatus: Ref<SinglePeptideAnalysisStatus | null> = ref(null);
//
// QueueManager.initializeQueue(4);
//
// const startAnalysis = async function() {
//     loading.value = true;
//
//     const peptide = "AAALTER";
//     const equateIl = false;
//
//     const peptideMap = new Map<Peptide, number>();
//     peptideMap.set(peptide, 1);
//
//     const peptideCountTable = new CountTable<Peptide>(peptideMap);
//
//     const [pept2Data, trust] = await pept2DataCommunicator.process(peptideCountTable, false, equateIl);
//
//     const proteinProcessor = new ProteinProcessor(proteinCommunicator);
//     await proteinProcessor.compute(peptide, equateIl);
//
//     const ncbiCounts = new Map<NcbiId, number>();
//     for (const protein of proteinProcessor.getProteins()) {
//         ncbiCounts.set(protein.organism, 1);
//     }
//
//     ncbiCounts.set(proteinProcessor.getLca(), 1);
//
//     for (const organismId of proteinProcessor.getCommonLineage()) {
//         ncbiCounts.set(organismId, 1);
//     }
//
//     const ncbiOntologyProcessor = new NcbiOntologyProcessor(ncbiCommunicator);
//     const ncbiOntology = await ncbiOntologyProcessor.getOntology(new CountTable<NcbiId>(ncbiCounts));
//
//     const taxaCounts = new Map<NcbiId, number>();
//
//     for (const protein of proteinProcessor.getProteins()) {
//         taxaCounts.set(protein.organism, (taxaCounts.get(protein.organism) || 0) + 1);
//     }
//
//     const taxaCountTable = new CountTable<NcbiId>(taxaCounts);
//
//     const taxaTree = new NcbiTree(taxaCountTable, ncbiOntology);
//
//     const goProteinProcessor = new GoProteinCountTableProcessor(peptide, equateIl, goCommunicator);
//     await goProteinProcessor.compute(proteinProcessor);
//
//     const goOntologyProcessor = new GoOntologyProcessor(goCommunicator);
//     const goOntology = await goOntologyProcessor.getOntology(goProteinProcessor.getCountTable());
//
//     const ecProteinProcessor = new EcProteinCountTableProcessor(peptide, equateIl, ecCommunicator);
//     await ecProteinProcessor.compute(proteinProcessor);
//
//     const ecOntologyProcessor = new EcOntologyProcessor(ecCommunicator);
//     const ecOntology = await ecOntologyProcessor.getOntology(ecProteinProcessor.getCountTable());
//
//     const ecTree = computeEcTree(ecProteinProcessor.getCountTable(), ecOntology);
//
//     const interproProteinProcessor = new InterproProteinCountTableProcessor(peptide, equateIl, interproCommunicator);
//     await interproProteinProcessor.compute(proteinProcessor);
//
//     const interproOntologyProcessor = new InterproOntologyProcessor(interproCommunicator);
//     const interproOntology = await interproOntologyProcessor.getOntology(interproProteinProcessor.getCountTable());
//
//     singlePeptideStatus.value = {
//         peptide: peptide,
//         equateIl: equateIl,
//         analysisInProgress: false,
//         progress: {
//             steps: [],
//             currentStep: 0,
//             currentValue: 0,
//             eta: 0,
//             logs: []
//         },
//         error: {
//             status: false,
//             message: "",
//             object: null
//         },
//         peptideData: pept2Data.get(peptide)!,
//         proteinProcessor: proteinProcessor,
//         goProteinCountTableProcessor: goProteinProcessor,
//         goOntology: goOntology,
//         ecProteinCountTableProcessor: ecProteinProcessor,
//         ecOntology: ecOntology,
//         interproProteinCountTableProcessor: interproProteinProcessor,
//         interproOntology: interproOntology,
//         ncbiOntology: ncbiOntology,
//         taxaTree: taxaTree,
//         ecTree: ecTree
//     }
//
//     loading.value = false;
// }
//
// startAnalysis();

</script>
