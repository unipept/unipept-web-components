import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiRank from "../../../logic/ontology/taxonomic/NcbiRank";

export default interface NcbiResponse {
    id: NcbiId,
    name: string,
    rank: NcbiRank,
    lineage: NcbiId[]
}
