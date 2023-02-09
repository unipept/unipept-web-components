import Definition from "../Definition";
import EcCode from "../functional/ec/EcCode";
import GoCode from "../functional/go/GoCode";
import InterproCode from "../functional/interpro/InterproCode";
import NcbiId from "../taxonomic/NcbiId";
import UniprotAccessionId from "./UniprotAccessionId";
export default class ProteinDefinition implements Definition {
    readonly uniprotAccessionId: UniprotAccessionId;
    readonly name: string;
    readonly organism: NcbiId;
    readonly ecNumbers: EcCode[];
    readonly goTerms: GoCode[];
    readonly interproEntries: InterproCode[];
    constructor(uniprotAccessionId: UniprotAccessionId, name: string, organism: NcbiId, ecNumbers: EcCode[], goTerms: GoCode[], interproEntries: InterproCode[]);
}
