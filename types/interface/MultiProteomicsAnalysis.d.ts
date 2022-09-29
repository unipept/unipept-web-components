import PeptideData from "../logic/communication/peptide/PeptideData";
import EcCode from "../logic/ontology/functional/ec/EcCode";
import EcDefinition from "../logic/ontology/functional/ec/EcDefinition";
import GoCode from "../logic/ontology/functional/go/GoCode";
import GoDefinition from "../logic/ontology/functional/go/GoDefinition";
import InterproCode from "../logic/ontology/functional/interpro/InterproCode";
import InterproDefinition from "../logic/ontology/functional/interpro/InterproDefinition";
import Ontology from "../logic/ontology/Ontology";
import NcbiId from "../logic/ontology/taxonomic/NcbiId";
import NcbiTaxon from "../logic/ontology/taxonomic/NcbiTaxon";
import Peptide from "../logic/ontology/peptide/Peptide";
import { ProgressReport } from "./ProgressReport";
import { TreeNode } from "unipept-visualizations/types";
import Assay from "./Assay";
import { ShareableMap } from "shared-memory-datastructures";
import { CountTable, GoCountTableProcessor, EcCountTableProcessor, InterproCountTableProcessor, PeptideTrust } from "..";
export default interface MultiProteomicsAnalysisStatus {
    assay: Assay;
    progress: ProgressReport;
    analysisInProgress: boolean;
    analysisReady: boolean;
    filterProgress: ProgressReport;
    filterInProgress: boolean;
    filterReady: boolean;
    error: {
        status: boolean;
        message: string;
        object: Error | null;
    };
    originalData: {
        peptideCountTable: CountTable<Peptide>;
        goCountTableProcessor: GoCountTableProcessor;
        ecCountTableProcessor: EcCountTableProcessor;
        interproCountTableProcessor: InterproCountTableProcessor;
        tree: TreeNode;
        trust: PeptideTrust;
    };
    filteredData: {
        peptideCountTable: CountTable<Peptide>;
        goCountTableProcessor: GoCountTableProcessor;
        ecCountTableProcessor: EcCountTableProcessor;
        interproCountTableProcessor: InterproCountTableProcessor;
        percentage: number;
        trust: PeptideTrust;
    };
    pept2Data: ShareableMap<Peptide, PeptideData>;
    goOntology: Ontology<GoCode, GoDefinition>;
    ecOntology: Ontology<EcCode, EcDefinition>;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>;
    filterId: number;
    filterPercentage: number;
}
