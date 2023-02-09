import NcbiResponse from "../../../logic/communication/taxonomic/NcbiResponse";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
import NcbiTaxon from "../../../logic/ontology/taxonomic/NcbiTaxon";
export default function compute([ids, responseMap, withLineage]: [NcbiId[], Map<NcbiId, NcbiResponse>, boolean]): Promise<Map<NcbiId, NcbiTaxon>>;
