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
    public async summarizeFunctionalAnnotation(
        element: FunctionalDefinition,
        peptideTable: CountTable<Peptide>,
        pept2data: ShareableMap<Peptide, PeptideData>,
        ncbiOntology: Ontology<NcbiId, NcbiTaxon>,
        definitionExtractor: (peptideData: PeptideData) => FunctionalDefinition[]
    ): Promise<string[][]> {
        const processedPeptides: string[][] = peptideTable.getOntologyIds().map(peptide => {
            const peptideCount = peptideTable.getCounts(peptide);
            const peptideData =  pept2data.get(peptide);

            const items = definitionExtractor(peptideData!);
            // @ts-ignore
            const itemProteinCount = element.code in items ? items[element.code] : 0

            // @ts-ignore
            const totalCount = peptideData.faCounts.all;

            return [
                peptide,
                peptideCount,
                totalCount,
                itemProteinCount,
                100 * (itemProteinCount / totalCount),
                ncbiOntology.getDefinition(peptideData!.lca)?.name
            ]
        })

        return [[
            "peptide",
            "spectral count",
            "matching proteins",
            "matching proteins with " + element.code,
            "percentage proteins with " + element.code,
            "lca"
        ]].concat(processedPeptides);
    }
}
