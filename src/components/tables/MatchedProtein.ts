import { UniprotAccessionId, GoDefinition, EcDefinition, InterproDefinition } from "@/logic";

// TODO: check if this can be replaced by the existing ProteinDefinition class
type MatchedProtein = {
    uniprotAccessionId: UniprotAccessionId,
    name: string,
    organism: string,
    functionalAnnotations: {
        go: GoDefinition[],
        ec: EcDefinition[],
        interpro: InterproDefinition[]
    },
    totalAnnotations: number
};

export default MatchedProtein;
