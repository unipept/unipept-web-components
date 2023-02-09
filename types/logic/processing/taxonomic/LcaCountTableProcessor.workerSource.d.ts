import Peptide from "../../../logic/ontology/peptide/Peptide";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import CountTable from "../CountTable";
export default function compute([peptideCountTable, indexBuffer, dataBuffer]: [CountTable<Peptide>, ArrayBuffer, ArrayBuffer]): Promise<[Map<NcbiId, number>, Map<NcbiId, Peptide[]>]>;
