import { PeptideData, PeptideDataSerializer } from "@/logic/communication";
import { FunctionalCode, Peptide } from "@/logic/ontology";
import { ShareableMap } from "shared-memory-datastructures";

async function compute(
    [
        peptideCounts,
        indexBuffer,
        dataBuffer,
        percentage,
        termPrefix,
        proteinCountProperty
    ]: [
        Map<Peptide, number>,
        ArrayBuffer,
        ArrayBuffer,
        number,
        string,
        string
    ],
): Promise<[Map<FunctionalCode, number>, Map<FunctionalCode, Peptide[]>, number]> {
    const peptideToResponseMap = new ShareableMap<Peptide, PeptideData>(
        0,
        0,
        new PeptideDataSerializer()
    );
    peptideToResponseMap.setBuffers(indexBuffer, dataBuffer);

    // First we count the amount of peptides per unique code. Afterwards, we can fetch definitions for all these
    // terms and split them on namespace.
    const countsPerCode = new Map();
    // Keeps track of how many peptides are associated with at least one annotation
    let annotatedCount = 0;

    const item2Peptides: Map<FunctionalCode, Peptide[]> = new Map();

    for (const [peptide, peptideCount] of peptideCounts) {
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        // @ts-ignore
        const proteinCount = peptideData.faCounts[proteinCountProperty];
        // @ts-ignore
        const terms = peptideData[termPrefix];

        for (const [term, proteinCountOfTerm] of Object.entries(terms) as [string, number][]) {
            if ((proteinCountOfTerm / proteinCount) * 100 > percentage) {
                countsPerCode.set(term, (countsPerCode.get(term) || 0) + peptideCount);
            }

            if (!item2Peptides.has(term)) {
                item2Peptides.set(term, []);
            }
            
            // @ts-ignore
            item2Peptides.get(term).push(peptide);
        }

        // If there is at least one protein that belongs to this peptide annotated with an annotation of the
        // kind we're currently investigating, we should increase the annotation count.
        if (proteinCount > 0) {
            annotatedCount += peptideCount;
        }
    }

    // Counts per code is guaranteed to be sorted by count (note that JS Maps return values in the order they were
    // inserted!)
    const sortedCounts: Map<FunctionalCode, number> = new Map([...countsPerCode].sort(
        ([code1, count1], [code2, count2]) => count2 - count1
    ));

    return [sortedCounts, item2Peptides, annotatedCount];
}

export default compute;
