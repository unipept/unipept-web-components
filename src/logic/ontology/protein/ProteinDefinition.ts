import Definition from "../Definition";
import { EcCode } from "../functional";
import { GoCode } from "../functional";
import { InterproCode } from "../functional";
import { NcbiId } from "../taxonomic";
import UniprotAccessionId from "./UniprotAccessionId";

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
