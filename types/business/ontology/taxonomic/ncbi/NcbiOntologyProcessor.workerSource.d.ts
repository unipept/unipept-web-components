import NcbiTaxon, { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import NcbiResponse from "@/business/communication/taxonomic/ncbi/NcbiResponse";
export declare function computeNcbiOntology([ids, responseMap, withLineage]: [NcbiId[], Map<NcbiId, NcbiResponse>, boolean]): Promise<Map<NcbiId, NcbiTaxon>>;
