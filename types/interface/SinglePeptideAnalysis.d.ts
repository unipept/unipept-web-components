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
import EcProteinCountTableProcessor from "../logic/processing/functional/ec/EcProteinCountTableProcessor";
import GoProteinCountTableProcessor from "../logic/processing/functional/go/GoProteinCountTableProcessor";
import InterproProteinCountTableProcessor from "../logic/processing/functional/interpro/InterproProteinCountTableProcessor";
import ProteinProcessor from "../logic/processing/protein/ProteinProcessor";
import Peptide from "../logic/ontology/peptide/Peptide";
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