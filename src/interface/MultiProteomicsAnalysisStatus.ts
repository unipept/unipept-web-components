import PeptideData from "../logic/communication/peptide/PeptideData"
import EcCode from "../logic/ontology/functional/ec/EcCode"
import EcDefinition from "../logic/ontology/functional/ec/EcDefinition"
import GoCode from "../logic/ontology/functional/go/GoCode"
import GoDefinition from "../logic/ontology/functional/go/GoDefinition"
import InterproCode from "../logic/ontology/functional/interpro/InterproCode"
import InterproDefinition from "../logic/ontology/functional/interpro/InterproDefinition"
import Ontology from "../logic/ontology/Ontology"
import NcbiId from "../logic/ontology/taxonomic/NcbiId"
import NcbiTaxon from "../logic/ontology/taxonomic/NcbiTaxon"
import Peptide from "../logic/ontology/peptide/Peptide"
import { ProgressReport } from "./ProgressReport"
import NcbiTree from "../logic/ontology/taxonomic/NcbiTree"
import Assay from "./Assay"
import { ShareableMap } from "shared-memory-datastructures"
import {
    CountTable,
    EcCountTableProcessor,
    GoCountTableProcessor,
    InterproCountTableProcessor,
    LcaCountTableProcessor, PeptideTrust
} from "@/logic";

export default interface MultiProteomicsAnalysisStatus {
    assay: Assay

    equateIl: boolean,
    filterDuplicates: boolean,
    cleavageHandling: boolean,

    progress: ProgressReport
    analysisInProgress: boolean
    analysisReady: boolean

    filterProgress: ProgressReport
    filterInProgress: boolean
    filterReady: boolean

    error: {
        status: boolean
        message: string
        object: Error | null
    }

    // Keeps track of the original, unfiltered version of the data.
    data: {
        peptideCountTable: CountTable<Peptide>
        goCountTableProcessor: GoCountTableProcessor
        ecCountTableProcessor: EcCountTableProcessor
        interproCountTableProcessor: InterproCountTableProcessor
        lcaCountTableProcessor: LcaCountTableProcessor
        tree: NcbiTree
        trust: PeptideTrust
    }

    // All the different count tables and associated actions, according to the currently active filtering parameters.
    filteredData: {
        peptideCountTable: CountTable<Peptide>
        goCountTableProcessor: GoCountTableProcessor
        ecCountTableProcessor: EcCountTableProcessor
        interproCountTableProcessor: InterproCountTableProcessor
        // Percentage that was used to filter all of the above count tables on.
        percentage: number
        trust: PeptideTrust
    }

    pept2Data: ShareableMap<Peptide, PeptideData>,
    goOntology: Ontology<GoCode, GoDefinition>
    ecOntology: Ontology<EcCode, EcDefinition>,
    interproOntology: Ontology<InterproCode, InterproDefinition>,
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>,

    // ID of the rank by which we want to filter the results
    filterId: number,

    // Minimum threshold of items by which we want to filter (must be a number between 0 and 100)
    filterPercentage: number
};
