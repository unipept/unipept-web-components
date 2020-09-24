import { Peptide } from "./../../ontology/raw/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import { GoCode } from "./../../ontology/functional/go/GoDefinition";
import PeptideData from "./../../communication/peptides/PeptideData";
import PeptideDataSerializer from "./../../communication/peptides/PeptideDataSerializer";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", async(event: MessageEvent) => {
    await compute(event.data.args);
});

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
        SharedArrayBuffer,
        SharedArrayBuffer,
        number,
        string,
        string
    ],
): Promise<void> {
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

    const item2Peptides = new Map();

    for (const [peptide, peptideCount] of peptideCounts) {
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const proteinCount = peptideData.faCounts[proteinCountProperty];
        const terms = peptideData[termPrefix];

        for (const [term, proteinCountOfTerm] of Object.entries(terms) as [string, number][]) {
            if ((proteinCountOfTerm / proteinCount) * 100 > percentage) {
                countsPerCode.set(term, (countsPerCode.get(term) || 0) + peptideCount);
            }

            if (!item2Peptides.has(term)) {
                item2Peptides.set(term, []);
            }
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
    const sortedCounts: Map<GoCode, number> = new Map([...countsPerCode].sort(
        ([code1, count1], [code2, count2]) => count2 - count1
    ));

    ctx.postMessage({
        type: "result",
        result: [sortedCounts, item2Peptides, annotatedCount]
    });
}
