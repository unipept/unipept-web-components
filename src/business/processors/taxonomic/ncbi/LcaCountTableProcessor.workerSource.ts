import { ShareableMap } from "shared-memory-datastructures";
import { CountTable } from "@/business/counts/CountTable";
import { Peptide } from "@/business/ontology/raw/Peptide";
import PeptideData from "@/business/communication/peptides/PeptideData";
import { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import PeptideDataSerializer from "@/business/communication/peptides/PeptideDataSerializer";

export async function compute(
    [peptideCountTable, indexBuffer, dataBuffer]: [CountTable<Peptide>, ArrayBuffer, ArrayBuffer]
): Promise<[Map<NcbiId, number>, Map<NcbiId, Peptide[]>]> {
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
