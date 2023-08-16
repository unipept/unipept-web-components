<template>
    <v-app>
        <v-main>
            <div v-if="loading">
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>
            <interpro-summary-card
                v-else
                :filter="0"
                :interpro-ontology="interproOntology!"
                :analysis-in-progress="loading"
                :show-percentage="true"
                :interpro-processor="interproProcessor!"
                :ncbi-tree="ncbiTree!"
                :ncbi-processor="ncbiProcessor"
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
    CountTable, EcCountTableProcessor,
    EcOntologyProcessor,
    EcProteinCountTableProcessor,
    EcResponseCommunicator, GoCountTableProcessor,
    GoOntologyProcessor,
    GoProteinCountTableProcessor,
    GoResponseCommunicator, InterproCode, InterproCountTableProcessor, InterproDefinition, InterproOntologyProcessor,
    InterproProteinCountTableProcessor,
    InterproResponseCommunicator, LcaCountTableProcessor,
    NcbiId,
    NcbiOntologyProcessor,
    NcbiResponseCommunicator,
    NcbiTree, Ontology,
    Pept2DataCommunicator,
    ProteinProcessor,
    ProteinResponseCommunicator, QueueManager
} from "@/logic";
import Peptide from "@/logic/ontology/peptide/Peptide";
import InterproSummaryCard from "@/components/cards/InterproSummaryCard.vue";

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

const interproOntology: Ref<Ontology<InterproCode, InterproDefinition> | undefined> = ref();
const interproProcessor: Ref<InterproCountTableProcessor | undefined> = ref();
const ncbiTree: Ref<NcbiTree | undefined> = ref();
const ncbiProcessor: Ref<LcaCountTableProcessor | undefined> = ref();

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
    console.log(pept2Data.get("FFNAENVK")?.faCounts);

    const goCountTableProcessor = new GoCountTableProcessor(peptideCountTable, pept2Data, goCommunicator);
    await goCountTableProcessor.compute();

    const goOntologyProcessor = new GoOntologyProcessor(goCommunicator);
    const goOntology = await goOntologyProcessor.getOntology(goCountTableProcessor.getCountTable());
    console.log(goOntology);

    const interproCountTableProcessor = new InterproCountTableProcessor(peptideCountTable, pept2Data, interproCommunicator);
    await interproCountTableProcessor.compute();
    interproProcessor.value = interproCountTableProcessor;

    const interproOntologyProcessor = new InterproOntologyProcessor(interproCommunicator);
    interproOntology.value = await interproOntologyProcessor.getOntology(interproCountTableProcessor.getCountTable());

    const ecCountTableProcessor = new EcCountTableProcessor(peptideCountTable, pept2Data, ecCommunicator);
    await ecCountTableProcessor.compute();

    const ecOntologyProcessor = new EcOntologyProcessor(ecCommunicator);
    const ecOntology = await ecOntologyProcessor.getOntology(ecCountTableProcessor.getCountTable());
    console.log(ecOntology);

    const lcaCountTableProcessor = new LcaCountTableProcessor(peptideCountTable, pept2Data);
    await lcaCountTableProcessor.compute();
    ncbiProcessor.value = lcaCountTableProcessor;

    const ncbiOntologyProcessor = new NcbiOntologyProcessor(ncbiCommunicator);
    const ncbiOntology = await ncbiOntologyProcessor.getOntology(lcaCountTableProcessor.getCountTable());

    ncbiTree.value = new NcbiTree(
        lcaCountTableProcessor.getCountTable(), ncbiOntology, lcaCountTableProcessor.getAnnotationPeptideMapping()
    );

    loading.value = false;
}

startAnalysis();
</script>
