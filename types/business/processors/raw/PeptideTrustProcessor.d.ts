import { CountTable, Peptide, PeptideData, PeptideTrust } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
export default class PeptideTrustProcessor {
    getPeptideTrust(countTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>): PeptideTrust;
}
