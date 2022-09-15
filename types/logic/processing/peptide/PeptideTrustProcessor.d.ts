import PeptideData from "../../../logic/communication/peptide/PeptideData";
import Peptide from "../../../logic/ontology/peptide/Peptide";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "../CountTable";
import PeptideTrust from "./PeptideTrust";
export default class PeptideTrustProcessor {
    getPeptideTrust(countTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>): PeptideTrust;
}
