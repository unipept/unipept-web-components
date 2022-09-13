import { NcbiId, NcbiRank } from "@/logic/ontology";

export default interface NcbiResponse {
    id: NcbiId,
    name: string,
    rank: NcbiRank,
    lineage: NcbiId[]
}
