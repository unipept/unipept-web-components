import Definition from "./../Definition";
import { NcbiId } from "./../taxonomic/ncbi/NcbiTaxon";
import { EcCode } from "./../functional/ec/EcDefinition";
import { GoCode } from "./../functional/go/GoDefinition";
import { InterproCode } from "./../functional/interpro/InterproDefinition";
export declare type UniprotAccessionId = string;
export default class ProteinDefinition implements Definition {
    readonly uniprotAccessionId: UniprotAccessionId;
    readonly name: string;
    readonly organism: NcbiId;
    readonly ecNumbers: EcCode[];
    readonly goTerms: GoCode[];
    readonly interproEntries: InterproCode[];
    constructor(uniprotAccessionId: UniprotAccessionId, name: string, organism: NcbiId, ecNumbers: EcCode[], goTerms: GoCode[], interproEntries: InterproCode[]);
}
