import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import ChangeListener from "./../ChangeListener";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";

export default class ProteomicsAssay extends Assay {
    protected amountOfPeptides: number = 0;

    constructor(
        protected readonly changeListeners: ChangeListener<Assay>[],
        public readonly id: string,
        protected searchConfiguration?: SearchConfiguration,
        protected peptides?: Peptide[],
        protected name?: string,
        protected date?: Date,
    ) {
        super(changeListeners, id, name, date);

        if (peptides) {
            this.amountOfPeptides = peptides.length;
        }
    }

    public getSearchConfiguration(): SearchConfiguration {
        return this.searchConfiguration;
    }

    public setSearchConfiguration(value: SearchConfiguration) {
        super.onUpdate("searchConfiguration", this.searchConfiguration, value);
        this.searchConfiguration = value;
    }

    public getPeptides(): Peptide[] {
        return this.peptides;
    }

    public setPeptides(peptides: Peptide[]): void {
        super.onUpdate("peptides", this.peptides, peptides);
        this.peptides = peptides;
    }

    public getAmountOfPeptides(): number {
        return this.amountOfPeptides;
    }

    public setAmountOfPeptides(amount: number): void {
        this.amountOfPeptides = amount;
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitProteomicsAssay(this);
    }
}
