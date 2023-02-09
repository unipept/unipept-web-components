import Definition from "../Definition";
import EcCode from "../functional/ec/EcCode";
import GoCode from "../functional/go/GoCode";
import InterproCode from "../functional/interpro/InterproCode";
import NcbiId from "../taxonomic/NcbiId";
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
