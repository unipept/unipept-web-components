import EcCode from "../../../logic/ontology/functional/ec/EcCode";
import GoCode from "../../../logic/ontology/functional/go/GoCode";
import InterproCode from "../../../logic/ontology/functional/interpro/InterproCode";
import UniprotAccessionId from "../../../logic/ontology/protein/UniprotAccessionId";
import NcbiId from "../../../logic/ontology/taxonomic/NcbiId";
export interface ProteinResponse {
    uniprotAccessionId: UniprotAccessionId;
    name: string;
    organism: NcbiId;
    ecNumbers: EcCode[];
    goTerms: GoCode[];
    interproEntries: InterproCode[];
}
export interface MetaProteinResponse {
    lca: NcbiId;
    common_lineage: NcbiId[];
    proteins: ProteinResponse[];
}
