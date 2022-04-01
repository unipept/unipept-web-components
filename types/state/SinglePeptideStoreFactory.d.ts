import { AnalysisSource, EcCode, EcDefinition, EcProteinCountTableProcessor, GoCode, GoDefinition, GoProteinCountTableProcessor, InterproCode, InterproDefinition, InterproProteinCountTableProcessor, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData, ProgressReport, ProteinProcessor, Tree } from "@/business";
import { Module } from "vuex";
import { DataNodeLike } from "unipept-visualizations";
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
    peptideData: PeptideData;
    proteinProcessor: ProteinProcessor;
    goProteinCountTableProcessor: GoProteinCountTableProcessor;
    ecProteinCountTableProcessor: EcProteinCountTableProcessor;
    interproProteinCountTableProcessor: InterproProteinCountTableProcessor;
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>;
    goOntology: Ontology<GoCode, GoDefinition>;
    ecOntology: Ontology<EcCode, EcDefinition>;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
    taxaTree: Tree;
    ecTree: DataNodeLike;
};
export declare type SinglePeptideStoreState = {
    peptideStatus: SinglePeptideAnalysisStatus;
    analysisSource: AnalysisSource;
};
export default class SinglePeptideStoreFactory {
    constructor();
    constructSinglePeptideStoreFactory(endpoint: string): Module<SinglePeptideStoreState, any>;
}
