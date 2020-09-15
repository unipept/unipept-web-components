import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import { ShareableMap } from "shared-memory-datastructures";
import PeptideData from "./../../../communication/peptides/PeptideData";
import PeptideDataSerializer from "./../../../communication/peptides/PeptideDataSerializer";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", (event: MessageEvent) => {
    const result = compute(event.data.args);
    ctx.postMessage({
        result: result
    });
});

function compute(
    [peptideCountTable, indexBuffer, dataBuffer]: [CountTable<Peptide>, SharedArrayBuffer, SharedArrayBuffer]
): [Map<NcbiId, number>, Map<NcbiId, Peptide[]>] {
    const peptideToResponseMap = new ShareableMap<Peptide, PeptideData>(
        0,
        0,
        new PeptideDataSerializer()
    );
    peptideToResponseMap.setBuffers(indexBuffer, dataBuffer);

    const countsPerLca = new Map<NcbiId, number>();
    const lca2Peptides = new Map<NcbiId, Peptide[]>();

    for (const peptide of peptideCountTable["counts"].keys()) {
        const peptideCount = peptideCountTable["counts"].get(peptide);
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const lcaTaxon = peptideData.lca;
        countsPerLca.set(lcaTaxon, (countsPerLca.get(lcaTaxon) || 0) + peptideCount);

        if (!lca2Peptides.has(lcaTaxon)) {
            lca2Peptides.set(lcaTaxon, []);
        }

        lca2Peptides.get(lcaTaxon).push(peptide);
    }

    return [countsPerLca, lca2Peptides];
}
