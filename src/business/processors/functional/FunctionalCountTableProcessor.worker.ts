import { Peptide } from "./../../ontology/raw/Peptide";
import { OntologyIdType } from "./../../ontology/Ontology";
import { expose } from "threads";
import { ShareableMap } from "shared-memory-datastructures";
import { GoCode } from "./../../ontology/functional/go/GoDefinition";

expose({ compute, mergeResultMaps });

export async function mergeResultMaps(
    countsPerCodeMaps: Map<OntologyIdType, number>[],
    item2PeptidesMaps: Map<OntologyIdType, Peptide[]>[]
): Promise<[Map<OntologyIdType, number>, Map<OntologyIdType, Peptide[]>]> {
    const countsResult = countsPerCodeMaps[0];

    for (const map of countsPerCodeMaps.slice(1)) {
        for (const [code, value] of map) {
            countsResult.set(code, (countsResult.get(code) || 0) + value);
        }
    }

    const item2PeptidesResult = item2PeptidesMaps[0];

    for (const map of item2PeptidesMaps.slice(1)) {
        for (const [code, value] of map) {
            const existingResult = item2PeptidesResult.get(code) || [];
            existingResult.push(...value);
            item2PeptidesResult.set(code, existingResult);
        }
    }

    return [countsResult, item2PeptidesResult];
}

export async function compute(
    peptideCounts: Map<Peptide, number>,
    indexBuffer: SharedArrayBuffer,
    dataBuffer: SharedArrayBuffer,
    percentage: number,
    termPrefix: string,
    proteinCountProperty: string,
): Promise<[Map<OntologyIdType, number>, Map<OntologyIdType, Peptide[]>, number]> {
    const start = new Date().getTime();

    const peptideToResponseMap = new ShareableMap<Peptide, string>(0, 0);
    peptideToResponseMap.setBuffers(indexBuffer, dataBuffer);

    // First we count the amount of peptides per unique code. Afterwards, we can fetch definitions for all these
    // terms and split them on namespace.
    const countsPerCode = new Map();
    // Keeps track of how many peptides are associated with at least one annotation
    let annotatedCount = 0;

    const item2Peptides = new Map();

    for (const [peptide, peptideCount] of peptideCounts) {
        const peptideResponse = peptideToResponseMap.get(peptide);

        if (!peptideResponse) {
            continue;
        }

        const peptideData = JSON.parse(peptideResponse);

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

    // Counts per code is guaranteed to be sorted by count (note that JS Maps return values in the order they were
    // inserted!)
    const sortedCounts: Map<GoCode, number> = new Map([...countsPerCode].sort(
        ([code1, count1], [code2, count2]) => count2 - count1
    ));

    const end = new Date().getTime();
    console.log("Functional count table took: " + (end - start) / 1000 + "s");

    return [sortedCounts, item2Peptides, annotatedCount];
}
