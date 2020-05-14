import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import { NcbiRank } from "./../ontology/taxonomic/ncbi/NcbiRank";
import { GoNamespace } from "./..//ontology/functional/go/GoNamespace";
import Pept2DataCommunicator from "./../communication/peptides/Pept2DataCommunicator";
import SearchConfiguration from "./../configuration/SearchConfiguration";
import NcbiTaxon, { NcbiId } from "./../ontology/taxonomic/ncbi/NcbiTaxon";
import { Ontology, OntologyIdType } from "./../ontology/Ontology";
import LcaCountTableProcessor from "./../processors/taxonomic/ncbi/LcaCountTableProcessor";
import NcbiOntologyProcessor from "./../ontology/taxonomic/ncbi/NcbiOntologyProcessor";
import GoCountTableProcessor from "./../processors/functional/go/GoCountTableProcessor";
import GoOntologyProcessor from "./../ontology/functional/go/GoOntologyProcessor";
import EcCountTableProcessor from "./../processors/functional/ec/EcCountTableProcessor";
import FunctionalCountTableProcessor from "./../processors/functional/FunctionalCountTableProcessor";
import FunctionalDefinition from "./../ontology/functional/FunctionalDefinition";
import OntologyProcessor from "./../ontology/OntologyProcessor";
import EcOntologyProcessor from "./../ontology/functional/ec/EcOntologyProcessor";
import InterproCountTableProcessor from "./../processors/functional/interpro/InterproCountTableProcessor";
import InterproOntologyProcessor from "./../ontology/functional/interpro/InterproOntologyProcessor";
import StringUtils from "./../misc/StringUtils";
import { PeptideDataResponse } from "./../communication/peptides/PeptideDataResponse";
import EcDefinition from "./../ontology/functional/ec/EcDefinition";
import GoDefinition from "./../ontology/functional/go/GoDefinition";
import InterproDefinition from "./../ontology/functional/interpro/InterproDefinition";
import CommunicationSource from "@/business/communication/source/CommunicationSource";

export default class PeptideExport {
    /**
     * Produces a CSV that contains one row per peptide (these rows are duplicated for peptides that occur multiple
     * times). Every row contains the LCA for a peptide, as well as it's associated lineage, and the top 3 most
     * occurring annotations for the EC-numbers, the three different GO-domains and InterPro-annotations.
     *
     * @param peptideCountTable Count table that contains all peptides and their associated counts that should be
     * present in the generated export.
     * @param searchConfiguration The particular configuration settings that are used for processing the peptides
     * present in the count table.
     * @param separator The delimiter used to separate columns in the CSV. Use comma for international format, and semi-
     * colon for the European version.
     * @param secondarySeparator The delimiter used to separate multiple functional annotations from each other. Some
     * columns (like the EC-number list) contain multiple items, which need to be separated from each other using a
     * character different from the default separator.
     * @param lineEnding The line terminator that should be used.
     */
    public static async exportSummaryAsCsv(
        peptideCountTable: CountTable<Peptide>,
        searchConfiguration: SearchConfiguration,
        communicationSource: CommunicationSource,
        separator: string = ",",
        secondarySeparator: string = ";",
        lineEnding: string = "\n"
    ): Promise<string> {
        const rows: string[] = [];
        rows.push(PeptideExport.getHeader().join(separator));

        const pept2DataCommunicator = communicationSource.getPept2DataCommunicator();
        await pept2DataCommunicator.process(peptideCountTable, searchConfiguration);

        const ncbiOntology = await PeptideExport.computeNcbiOntology(peptideCountTable, searchConfiguration, communicationSource);
        const goOntology = await PeptideExport.computeFunctionalOntology(
            new GoCountTableProcessor(peptideCountTable, searchConfiguration, communicationSource, 0),
            new GoOntologyProcessor(communicationSource)
        );
        const ecOntology = await PeptideExport.computeFunctionalOntology(
            new EcCountTableProcessor(peptideCountTable, searchConfiguration, communicationSource, 0),
            new EcOntologyProcessor(communicationSource)
        );
        const interproOntology = await PeptideExport.computeFunctionalOntology(
            new InterproCountTableProcessor(peptideCountTable, searchConfiguration, communicationSource, 0),
            new InterproOntologyProcessor(communicationSource)
        );

        const headerLength = PeptideExport.getHeader().length;

        for (const peptide of peptideCountTable.getOntologyIds()) {
            const row = [];

            row.push(peptide);

            const pept2DataResponse = pept2DataCommunicator.getPeptideResponse(peptide, searchConfiguration);

            if (!pept2DataResponse) {
                for (let i = 0; i < headerLength - 1; i++) {
                    row.push("");
                }
            } else {
                // First construct the taxonomical part of each output row.
                const lcaDefinition = ncbiOntology.getDefinition(pept2DataResponse.lca);
                row.push(lcaDefinition ? lcaDefinition.name : "");

                const processedLineage = pept2DataResponse.lineage.map(l => l ? ncbiOntology.getDefinition(l) : null);
                row.push(...processedLineage.map(l => l ? l.name : ""));

                // Now add information about the EC-numbers.
                // This list contains the (EC-code, protein count)-mapping, sorted descending on counts.
                const ecNumbers = await PeptideExport.getAnnotations(pept2DataResponse, x => x[0].startsWith("EC:"));
                row.push(
                    ecNumbers
                        .map(a => `${a[0].substr(3)} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.fa.counts.EC)})`)
                        .join(secondarySeparator)
                );

                const ecDefinitions: [EcDefinition, number][] = ecNumbers.map(c => [ecOntology.getDefinition(c[0]), c[1]]);
                row.push(
                    ecDefinitions.map(
                        c => `${c[0] ? c[0].name : ""} (${StringUtils.numberToPercent(c[1] / pept2DataResponse.fa.counts.EC)})`
                    ).join(secondarySeparator)
                );

                // Now process the GO-terms
                for (const ns of Object.values(GoNamespace)) {
                    const goTerms = await PeptideExport.getAnnotations(
                        pept2DataResponse,
                        x => x[0].startsWith("GO:") && goOntology.getDefinition(x[0]).namespace == ns
                    );

                    row.push(
                        goTerms
                            .map(a => `${a[0]} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.fa.counts.GO)})`)
                            .join(secondarySeparator)
                    );

                    const goDefinitions: [GoDefinition, number][] = goTerms.map(c => [goOntology.getDefinition(c[0]), c[1]]);
                    row.push(
                        goDefinitions.map(
                            c => `${c ? c[0].name : ""} (${StringUtils.numberToPercent(c[1] / pept2DataResponse.fa.counts.GO)})`
                        ).join(secondarySeparator));
                }

                // Now process the InterPro-terms
                const interproNumbers = await PeptideExport.getAnnotations(pept2DataResponse, x => x[0].startsWith("IPR:"));
                row.push(
                    interproNumbers
                        .map(a => `${a[0].substr(4)} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.fa.counts.IPR)})`)
                        .join(secondarySeparator)
                );

                const interproDefinitions: [InterproDefinition, number][] = interproNumbers.map(i => [interproOntology.getDefinition(i[0]), i[1]]);
                row.push(interproDefinitions.map(
                    i => `${i ? i[0].name : ""} (${StringUtils.numberToPercent(i[1] / pept2DataResponse.fa.counts.IPR)})`
                ).join(secondarySeparator));
            }

            const rowString = row.join(separator);
            // Duplicate row in case that the peptide is present more than once.
            for (let i = 0; i < peptideCountTable.getCounts(peptide); i++) {
                rows.push(rowString);
            }
        }

        return rows.join(lineEnding);
    }

    private static getAnnotations(
        pept2DataResponse: PeptideDataResponse,
        filterCondition: (x: [string, number]) => boolean
    ): [string, number][] {
        return (Object.entries(pept2DataResponse.fa.data) as [string, any][] as [string, number][])
            .filter(filterCondition)
            .sort((a, b) => {
                if (b[1] === a[1]) {
                    return a[0] < b[0] ? -1 : 1;
                }
                return b[1] - a[1]
            })
            .slice(0, 3);
    }

    /**
     * @return The default set of columns that's part of the generated export.
     */
    private static getHeader(): string[] {
        const headers: string[] = [];
        headers.push("peptide");
        headers.push("lca");
        headers.push(...Object.values(NcbiRank));
        headers.push("EC");
        headers.push("EC - names")
        headers.push(...Object.values(GoNamespace).map(ns => `GO (${ns})`));
        headers.push(...Object.values(GoNamespace).map(ns => `GO (${ns}) - names`));
        headers.push("InterPro");
        headers.push("InterPro - names");
        return headers;
    }

    /**
     * @param peptideCountTable The count table with all peptides for whom associated peptide counts must be looked up.
     * @param searchConfiguration Search settings needed to process the peptide count table.
     * @return An ontology that contains information about all NCBI-taxa that are associated with the given peptide
     * count table.
     */
    private static async computeNcbiOntology(
        peptideCountTable: CountTable<Peptide>,
        searchConfiguration: SearchConfiguration,
        communicationSource: CommunicationSource
    ): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const taxaProcessor = new LcaCountTableProcessor(peptideCountTable, searchConfiguration, communicationSource);
        const lcaCountTable = await taxaProcessor.getCountTable();

        const ncbiOntologyProcessor = new NcbiOntologyProcessor(communicationSource);
        return await ncbiOntologyProcessor.getOntology(lcaCountTable);
    }

    private static async computeFunctionalOntology<OntologyId extends OntologyIdType, OntologyDefinition extends FunctionalDefinition>(
        countProcessor: FunctionalCountTableProcessor<OntologyId, OntologyDefinition>,
        ontologyProcessor: OntologyProcessor<OntologyId, OntologyDefinition>
    ): Promise<Ontology<OntologyId, OntologyDefinition>> {
        const countTable = await countProcessor.getCountTable();
        return await ontologyProcessor.getOntology(countTable);
    }
}
