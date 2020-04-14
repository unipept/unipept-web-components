import { NcbiId } from "./../../ontology/taxonomic/ncbi/NcbiTaxon";
import { EcCode } from "./../../ontology/functional/ec/EcDefinition";
import { GoCode } from "./../../ontology/functional/go/GoDefinition";
import { InterproCode } from "./../../ontology/functional/interpro/InterproDefinition";
import { UniprotAccessionId } from "./../../ontology/protein/ProteinDefinition";

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

