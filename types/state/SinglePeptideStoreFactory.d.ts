import { AnalysisSource, EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData, ProgressReport } from "@/business";
import { Module } from "vuex";
import { ShareableMap } from "shared-memory-datastructures";
export declare type SinglePeptideAnalysisStatus = {
    peptide: Peptide;
    equateIl: boolean;
    progress: ProgressReport;
    analysisInProgress: boolean;
    error: {
        status: boolean;
        message: string;
        object: Error;
    };
    peptideData: ShareableMap<Peptide, PeptideData>;
    ncbiCountTableProcessor: LcaCountTableProcessor;
    goCountTableProcessor: GoCountTableProcessor;
    ecCountTableProcessor: EcCountTableProcessor;
    interproCountTableProcessor: InterproCountTableProcessor;
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>;
    goOntology: Ontology<GoCode, GoDefinition>;
    ecOntology: Ontology<EcCode, EcDefinition>;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
};
export declare type SinglePeptideStoreState = {
    peptideStatus: SinglePeptideAnalysisStatus;
    analysisSource: AnalysisSource;
};
export default class SinglePeptideStoreFactory {
    constructor();
    constructSinglePeptideStoreFactory(endpoint: string): Module<SinglePeptideStoreState, any>;
}
