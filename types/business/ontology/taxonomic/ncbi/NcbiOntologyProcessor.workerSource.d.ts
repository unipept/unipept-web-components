import NcbiTaxon, { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import NcbiResponse from "@/business/communication/taxonomic/ncbi/NcbiResponse";
export declare function computeNcbiOntology([ids, responseMap]: [NcbiId[], Map<NcbiId, NcbiResponse>]): Promise<Map<NcbiId, NcbiTaxon>>;
