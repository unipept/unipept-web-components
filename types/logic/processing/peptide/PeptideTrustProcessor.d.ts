import { PeptideData } from "@/logic/communication";
import { Peptide } from "@/logic/ontology";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import PeptideTrust from "./PeptideTrust";
export default class PeptideTrustProcessor {
    getPeptideTrust(countTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>): PeptideTrust;
}
