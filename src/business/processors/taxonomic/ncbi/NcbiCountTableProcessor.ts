import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import Pept2DataCommunicator from "./../../../communication/peptides/Pept2DataCommunicator";

export default class NcbiCountTableProcessor {
    private countTable: CountTable<NcbiId>;
    private lca2Peptides: Map<NcbiId, Peptide[]>;

    constructor(
        private readonly peptideCountTable: CountTable<Peptide>,
        private readonly configuration: SearchConfiguration,
        private readonly percentage: number = 50
    ) {}

    public async getLcaCountTable(): Promise<CountTable<NcbiId>> {
        await this.compute();
        return this.countTable;
    }

    public async getLcaPeptideMapping(): Promise<Map<NcbiId, Peptide[]>> {
        await this.compute();
        return this.lca2Peptides;
    }

    protected async compute(): Promise<void> {
        if (this.countTable) {
            return;
        }

        await Pept2DataCommunicator.process(this.peptideCountTable, this.configuration);

        const countsPerLca = new Map<NcbiId, number>();
        this.lca2Peptides = new Map<NcbiId, Peptide[]>();

        for (const peptide of this.peptideCountTable.getOntologyIds()) {
            const peptideCount = this.peptideCountTable.getCounts(peptide);
            const peptideData = Pept2DataCommunicator.getPeptideResponse(peptide, this.configuration);

            const lcaTaxon = peptideData.lca;
            countsPerLca.set(lcaTaxon, (countsPerLca.get(lcaTaxon) || 0) + peptideCount);

            if (this.lca2Peptides.has(lcaTaxon)) {
                this.lca2Peptides.set(lcaTaxon, []);
            }

            this.lca2Peptides.get(lcaTaxon).push(peptide);
        }

        this.countTable = new CountTable<NcbiId>(countsPerLca);
    }
}
