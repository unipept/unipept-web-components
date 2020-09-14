import { Peptide } from "./../../ontology/raw/Peptide";
import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Pept2DataCommunicator from "./../../communication/peptides/Pept2DataCommunicator";
import NcbiOntologyProcessor from "./../../ontology/taxonomic/ncbi/NcbiOntologyProcessor";
export default class FunctionalSummaryProcessor {
    /**
     * Produce a summary of all information associated with a specific functional annotation. The output of this
     * function is primarily intended for export.
     *
     * @param element The functional annotation for which a summary should be made.
     * @param peptideTable A count table for the peptides that are annotated with the given functional definition.
     * @param configuration The configuration that's currently being used
     * @param pept2DataCommunicator A Pept2DataCommunicator that processed the given peptideTable before.
     * @param ncbiOntologyProcessor A valid NcbiOntologyProcessor that processed the given peptideTable before.
     */
    summarizeFunctionalAnnotation(element: FunctionalDefinition, peptideTable: CountTable<Peptide>, configuration: SearchConfiguration, pept2DataCommunicator: Pept2DataCommunicator, ncbiOntologyProcessor: NcbiOntologyProcessor): Promise<string[][]>;
}
