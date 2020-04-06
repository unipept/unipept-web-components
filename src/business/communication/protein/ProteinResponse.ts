import { UniprotAccessionId } from "@/business/ontology/protein/ProteinDefinition";
import { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { GoCode } from "@/business/ontology/functional/go/GoDefinition";
import { InterproCode } from "@/business/ontology/functional/interpro/InterproDefinition";

export default interface ProteinResponse {
    uniprotAccessionId: UniprotAccessionId,
    name: string,
    organism: NcbiId,
    ecNumbers: EcCode[],
    goTerms: GoCode[],
    interproEntries: InterproCode[]
}
