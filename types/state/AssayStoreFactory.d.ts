import { CountTable, EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData, PeptideTrust, ProteomicsAssay, TreeNode } from "@/business";
import { ProgressReport } from "./../business/progress/ProgressReport";
import { ShareableMap } from "shared-memory-datastructures";
import { Module } from "vuex";
export declare type AssayAnalysisStatus = {
    assay: ProteomicsAssay;
    originalProgress: ProgressReport;
    filterProgress: ProgressReport;
    error: {
        status: boolean;
        message: string;
        object: Error;
    };
    analysisInProgress: boolean;
    analysisReady: boolean;
    filterInProgress: boolean;
    filterReady: boolean;
    originalData: {
        peptideCountTable: CountTable<Peptide>;
        goCountTableProcessor: GoCountTableProcessor;
        ecCountTableProcessor: EcCountTableProcessor;
        interproCountTableProcessor: InterproCountTableProcessor;
        ncbiCountTableProcessor: LcaCountTableProcessor;
        tree: TreeNode;
    };
    filteredData: {
        peptideCountTable: CountTable<Peptide>;
        goCountTableProcessor: GoCountTableProcessor;
        ecCountTableProcessor: EcCountTableProcessor;
        interproCountTableProcessor: InterproCountTableProcessor;
        percentage: number;
    };
    pept2Data: ShareableMap<Peptide, PeptideData>;
    peptideTrust: PeptideTrust;
    goOntology: Ontology<GoCode, GoDefinition>;
    ecOntology: Ontology<EcCode, EcDefinition>;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>;
    filterId: number;
    filterPercentage: number;
};
export declare type AssayStoreState = {
    assays: AssayAnalysisStatus[];
    activeAssay: AssayAnalysisStatus;
};
export default class AssayStoreFactory {
    constructor();
    constructAssayStore(): Module<AssayStoreState, any>;
}
