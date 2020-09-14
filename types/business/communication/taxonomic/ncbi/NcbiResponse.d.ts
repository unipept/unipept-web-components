import { NcbiRank } from "./../../../ontology/taxonomic/ncbi/NcbiRank";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
export default interface NcbiResponse {
    id: NcbiId;
    name: string;
    rank: NcbiRank;
    lineage: NcbiId[];
}
