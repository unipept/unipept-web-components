import Definition from "./../Definition";
import { NcbiId } from "./../taxonomic/ncbi/NcbiTaxon";
import { EcCode } from "./../functional/ec/EcDefinition";
import { GoCode } from "./../functional/go/GoDefinition";
import { InterproCode } from "./../functional/interpro/InterproDefinition";

export type UniprotAccessionId = string;

export default class ProteinDefinition implements Definition {
    constructor(
        public readonly uniprotAccessionId: UniprotAccessionId,
        public readonly name: string,
        public readonly organism: NcbiId,
        public readonly ecNumbers: EcCode[],
        public readonly goTerms: GoCode[],
        public readonly interproEntries: InterproCode[]
    ) {}
}
