import PeptideData from "../../../logic/communication/peptide/PeptideData";
import FunctionalDefinition from "../../../logic/ontology/functional/FunctionalDefinition";
import Ontology from "../../../logic/ontology/Ontology";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiTaxon from "../../../logic/ontology/taxonomic/NcbiTaxon";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
export default class FunctionalSummaryProcessor {
    /**
     * Produce a summary of all information associated with a specific functional annotation. The output of this
     * function is primarily intended for export.
     *
     * @param element The functional annotation for which a summary should be made.
     * @param peptideTable A count table for the peptides that are annotated with the given functional definition.
     * @param pept2data A mapping between the different peptides and all of their associated data.
     * @param ncbiOntology An Ontology that maps taxon id's onto the corresponding taxon objects. All of the taxa id's
     * that are present in the pept2data table should be available in this ontology.
     */
    summarizeFunctionalAnnotation(element: FunctionalDefinition, peptideTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>, ncbiOntology: Ontology<NcbiId, NcbiTaxon>): Promise<string[][]>;
}