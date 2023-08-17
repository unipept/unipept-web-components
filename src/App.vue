<template>
    <v-app>
        <v-main>
            <div v-if="loading">
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>
            <visualization-overview
                v-else
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
import { DataNodeLike } from "unipept-visualizations/types";
import VisualizationOverview from "@/components/analysis/VisualizationOverview.vue";

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
</script>
