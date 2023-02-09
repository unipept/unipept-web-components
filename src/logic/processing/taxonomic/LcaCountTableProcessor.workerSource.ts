import PeptideData from "../../../logic/communication/peptide/PeptideData";
import PeptideDataSerializer from "../../../logic/communication/peptide/PeptideDataSerializer";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";

export default async function compute(
    [peptideCountTable, indexBuffer, dataBuffer]: [CountTable<Peptide>, ArrayBuffer, ArrayBuffer]
): Promise<[Map<NcbiId, number>, Map<NcbiId, Peptide[]>]> {
    const peptideToResponseMap = new ShareableMap<Peptide, PeptideData>(
        0, 0, new PeptideDataSerializer()
    );
    peptideToResponseMap.setBuffers(indexBuffer, dataBuffer);

    const countsPerLca = new Map<NcbiId, number>();
    const lca2Peptides = new Map<NcbiId, Peptide[]>();

    for (const peptide of peptideCountTable["counts"].keys()) {
        const peptideCount = peptideCountTable["counts"].get(peptide) || 0;
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const lcaTaxon = peptideData.lca;
        countsPerLca.set(lcaTaxon, (countsPerLca.get(lcaTaxon) || 0) + peptideCount);

        if (!lca2Peptides.has(lcaTaxon)) {
            lca2Peptides.set(lcaTaxon, []);
        }

        lca2Peptides.get(lcaTaxon)?.push(peptide);
    }

    return [countsPerLca, lca2Peptides];
}
