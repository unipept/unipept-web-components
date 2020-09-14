import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import NcbiResponse from "./../../../communication/taxonomic/ncbi/NcbiResponse";
export declare function process(ids: NcbiId[], responseMap: Map<NcbiId, NcbiResponse>): Map<NcbiId, NcbiTaxon>;
