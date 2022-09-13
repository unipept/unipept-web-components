import Definition from "../Definition";
import { EcCode } from "../functional";
import { GoCode } from "../functional";
import { InterproCode } from "../functional";
import { NcbiId } from "../taxonomic";
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
