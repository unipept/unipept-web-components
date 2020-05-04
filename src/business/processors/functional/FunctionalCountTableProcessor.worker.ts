import { Peptide } from "./../../ontology/raw/Peptide";
import { PeptideDataResponse } from "./../../communication/peptides/PeptideDataResponse";
import { CountTable } from "./../../counts/CountTable";
import { OntologyIdType } from "./../../ontology/Ontology";
import { expose } from "threads/worker";

expose(compute);

async function compute(
    peptideCountTable: CountTable<Peptide>,
    peptideToResponseMap: Map<Peptide, PeptideDataResponse>,
    percentage: number,
    termPrefix: string,
    proteinCountProperty: string,
): Promise<[Map<OntologyIdType, number>, Map<OntologyIdType, Peptide[]>, number]> {
    // First we count the amount of peptides per unique code. Afterwards, we can fetch definitions for all these
    // terms and split them on namespace.
    const countsPerCode = new Map();
    // Keeps track of how many peptides are associated with at least one annotation
    let annotatedCount = 0;

    const item2Peptides = new Map();

    for (const peptide of peptideCountTable["counts"].keys()) {
        const peptideCount = peptideCountTable["counts"].get(peptide);
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const proteinCount = peptideData.fa.counts[proteinCountProperty];

        const uniqueTerms = Object.keys(peptideData.fa.data).filter(
            code => code.startsWith(termPrefix)
        );

        for (const term of uniqueTerms) {
            const proteinCountOfTerm: number = peptideData.fa.data[term];
            if ((proteinCountOfTerm / proteinCount) * 100 > percentage) {
                countsPerCode.set(term, (countsPerCode.get(term) || 0) + peptideCount);
            }

            if (!item2Peptides.has(term)) {
                item2Peptides.set(term, []);
            }
            item2Peptides.get(term).push(peptide);
        }

        if (uniqueTerms.length > 0) {
            annotatedCount += peptideCount;
        }
    }

    return [countsPerCode, item2Peptides, annotatedCount];
}

