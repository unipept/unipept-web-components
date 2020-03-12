import { NcbiRank } from "@/business/ontology/taxonomic/ncbi/NcbiRank";
import { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";

export default interface NcbiResponse {
    id: NcbiId,
    name: string,
    rank: NcbiRank,
    lineage: NcbiId[]
}
