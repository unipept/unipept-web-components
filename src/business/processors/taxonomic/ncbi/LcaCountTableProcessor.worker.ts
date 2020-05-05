import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import { PeptideDataResponse } from "./../../../communication/peptides/PeptideDataResponse";
import { expose } from "threads";

expose(compute);

export default function compute(
    peptideCountTable: CountTable<Peptide>,
    peptideToResponseMap: Map<Peptide, PeptideDataResponse>
) {
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
