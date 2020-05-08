import { Peptide } from "./../../ontology/raw/Peptide";
import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import { CountTable } from "./../../counts/CountTable";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import Pept2DataCommunicator from "./../../communication/peptides/Pept2DataCommunicator";
import NcbiOntologyProcessor from "./../../ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import CommunicationSource from "./../../communication/source/CommunicationSource";

export default class FunctionalSummaryProcessor {
    /**
     * Produce a summary of all information associated with a specific functional annotation. The output of this
     * function is primarily intended for export.
     *
     * @param element The functional annotation for which a summary should be made.
     * @param peptideTable A count table for the peptides that are annotated with the given functional definition.
     * @param configuration The configuration that's currently being used
     */
    public async summarizeFunctionalAnnotation(
        element: FunctionalDefinition,
        peptideTable: CountTable<Peptide>,
        configuration: SearchConfiguration,
        communicationSource: CommunicationSource
    ): Promise<string[][]> {
        await Pept2DataCommunicator.process(peptideTable, configuration);

        const ontologyProcessor = new NcbiOntologyProcessor(communicationSource);

        const processedPeptides: string[][] = peptideTable.getOntologyIds().map(peptide => {
            let peptideCount = peptideTable.getCounts(peptide);
            let peptideData = Pept2DataCommunicator.getPeptideResponse(peptide, configuration);
            let ecProteinCount = element.code in peptideData.fa.data? peptideData.fa.data[element.code] : 0

            return [
                peptide,
                peptideCount,
                peptideData.fa.counts.all,
                ecProteinCount,
                100 * (ecProteinCount / peptideData.fa.counts.all),
                ontologyProcessor.getDefinition(peptideData.lca)
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
