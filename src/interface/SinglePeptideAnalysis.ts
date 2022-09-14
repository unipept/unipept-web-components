import { EcCode, EcDefinition, EcProteinCountTableProcessor, GoCode, GoDefinition, GoProteinCountTableProcessor, InterproCode, InterproDefinition, InterproProteinCountTableProcessor, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData, ProteinProcessor } from "@/logic"
import { ProgressReport } from "./ProgressReport"

export default interface SinglePeptideAnalysisStatus {
    peptide: Peptide
    equateIl: boolean

    progress: ProgressReport
    analysisInProgress: boolean

    error: {
        // Did an error occur?
        status: boolean
        // Message that describes what went wrong during the analysis of this peptide
        message: string
        // Original Error-object that caused the problem in the first place.
        object: Error | null
    }

    peptideData: PeptideData

    proteinProcessor: ProteinProcessor

    goProteinCountTableProcessor: GoProteinCountTableProcessor
    ecProteinCountTableProcessor: EcProteinCountTableProcessor
    interproProteinCountTableProcessor: InterproProteinCountTableProcessor

    // These ontologies are guaranteed to contain all references that are associated with either the normal peptide
    // count tables, as well as the protein count tables.
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>
    goOntology: Ontology<GoCode, GoDefinition>
    ecOntology: Ontology<EcCode, EcDefinition>
    interproOntology: Ontology<InterproCode, InterproDefinition>

    // Tree for all taxa that are associated with the proteins that correspond to the current peptide.
    // taxaTree: Tree,

    // Tree for the Enzyme Commission numbers
    // ecTree: DataNodeLike
}
