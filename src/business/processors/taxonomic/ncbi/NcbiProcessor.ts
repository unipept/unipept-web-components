import { Peptide } from "@/business/ontology/raw/Peptide";
import { CountTable } from "@/business/counts/CountTable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import NcbiNode from "@/business/processors/taxonomic/ncbi/NcbiNode";

export default class NcbiProcessor {
    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly configuration: SearchConfiguration,
        private readonly percentage: number = 50
    ) {}

    // public async getTree(): Promise<NcbiNode> {
    //
    // }

    protected async compute(): Promise<void> {

    }
}
