import { UniprotAccessionId, GoDefinition, EcDefinition, InterproDefinition } from "@/logic";
declare type MatchedProtein = {
    uniprotAccessionId: UniprotAccessionId;
    name: string;
    organism: string;
    functionalAnnotations: {
        go: GoDefinition[];
        ec: EcDefinition[];
        interpro: InterproDefinition[];
    };
    totalAnnotations: number;
};
export default MatchedProtein;
