import { CountTable, EcCode, EcDefinition, GoCode, GoDefinition, GoNamespace, InterproCode, InterproDefinition, NcbiId, NcbiRank, NcbiTaxon, Ontology, Peptide, PeptideData, StringUtils } from "@/logic";
import { ShareableMap } from "shared-memory-datastructures";

export default class PeptideUtils {
    private static headers: string[] = [
        "peptide",
        "lca",
        ...Object.values(NcbiRank),
        "EC",
        "EC - names",
        ...Object.values(GoNamespace).map(ns => `GO (${ns})`),
        ...Object.values(GoNamespace).map(ns => `GO (${ns}) - names`),
        "interpro",
        "interpro - names"
    ];

    public static exportAsCsv = (
        peptideCountTable: CountTable<Peptide>,
        pept2data: ShareableMap<Peptide, PeptideData>,
        goOntology: Ontology<GoCode, GoDefinition>,
        ecOntology: Ontology<EcCode, EcDefinition>,
        iprOntology: Ontology<InterproCode, InterproDefinition>,
        ncbiOntology: Ontology<NcbiId, NcbiTaxon>,
        separator: string = ",",
        secondarySeparator: string = ";",
        lineEnding: string = "\n",
    ) => {
        const rows: string[] = [];

        // Add header
        rows.push(this.headers.join(separator));

        const headerLength = this.headers.length;

        for (const peptide of peptideCountTable.getOntologyIds()) {
            const row = [];

            row.push(peptide);

            const pept2DataResponse = pept2data.get(peptide);

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
                const ecNumbers = sortAnnotations(pept2DataResponse.ec);
                row.push(
                    ecNumbers
                        .map(a => `${a[0].substring(3)} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.faCounts.ec)})`)
                        .join(secondarySeparator)
                );

                const ecDefinitions: [EcDefinition, number][] = ecNumbers.map(c => [ecOntology.getDefinition(c[0])!, c[1]]);
                row.push(
                    ecDefinitions.map(
                        c => `${c[0] ? c[0].name : ""} (${StringUtils.numberToPercent(c[1] / pept2DataResponse.faCounts.ec)})`
                    ).join(secondarySeparator)
                );

                // Now process the GO-terms
                for (const ns of Object.values(GoNamespace)) {
                    const gos = pept2DataResponse.go;
                    const goAnnotations = Object.keys(gos).filter(
                        x => goOntology.getDefinition(x) && goOntology.getDefinition(x)?.namespace === ns
                    );

                    const goTerms: any = {};

                    for (const annotation of goAnnotations) {
                        goTerms[annotation] = gos[annotation];
                    }

                    const sortedTerms = sortAnnotations(goTerms);

                    row.push(
                        sortedTerms
                            .map(a => `${a[0]} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.faCounts.go)})`)
                            .join(secondarySeparator)
                    );

                    const goDefinitions: [GoDefinition, number][] = sortedTerms.map(c => [goOntology.getDefinition(c[0])!, c[1]]);
                    row.push(
                        goDefinitions.map(
                            c => `${c ? c[0].name : ""} (${StringUtils.numberToPercent(c[1] / pept2DataResponse.faCounts.go)})`
                        ).join(secondarySeparator));
                }

                // Now process the InterPro-terms
                const interproNumbers = sortAnnotations(pept2DataResponse.ipr);
                row.push(
                    interproNumbers
                        .map(a => `${a[0].substring(4)} (${StringUtils.numberToPercent(a[1] / pept2DataResponse.faCounts.ipr)})`)
                        .join(secondarySeparator)
                );

                const interproDefinitions: [InterproDefinition, number][] = interproNumbers.map(i => [iprOntology.getDefinition(i[0])!, i[1]]);
                row.push(interproDefinitions.map(
                    i => `${i && i[0] ? i[0].name : ""} (${StringUtils.numberToPercent(i[1] / pept2DataResponse.faCounts.ipr)})`
                ).join(secondarySeparator));
            }

            const rowString = row.join(separator);
            // Duplicate row in case that the peptide is present more than once.
            for (let i = 0; i < peptideCountTable.getCounts(peptide); i++) {
                rows.push(rowString);
            }
        }

        return rows.join(lineEnding);
    };
};

const sortAnnotations = (
    annotations: any
): [string, number][] => {
    return (Object.entries(annotations) as [string, any][] as [string, number][])
        .sort((a, b) => {
            if (b[1] === a[1]) {
                return a[0] < b[0] ? -1 : 1;
            }
            return b[1] - a[1]
        })
        .slice(0, 3);
}
