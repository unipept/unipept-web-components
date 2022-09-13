import { EcCode, GoCode, InterproCode, NcbiId, UniprotAccessionId } from "@/logic/ontology"

export interface ProteinResponse {
    uniprotAccessionId: UniprotAccessionId,
    name: string,
    organism: NcbiId,
    ecNumbers: EcCode[],
    goTerms: GoCode[],
    interproEntries: InterproCode[]
}

export interface MetaProteinResponse {
    lca: NcbiId,
    common_lineage: NcbiId[],
    proteins: ProteinResponse[]
}
