import { EcCode, EcDefinition, EcProteinCountTableProcessor, GoCode, GoDefinition, GoProteinCountTableProcessor, InterproCode, InterproDefinition, InterproProteinCountTableProcessor, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData } from "@/logic";
import { ProteinProcessor } from "@/logic/processing/protein";
import { ProgressReport } from "./ProgressReport";
export default interface SinglePeptideAnalysisStatus {
    peptide: Peptide;
    equateIl: boolean;
    progress: ProgressReport;
    analysisInProgress: boolean;
    error: {
        status: boolean;
        message: string;
        object: Error | null;
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
}
