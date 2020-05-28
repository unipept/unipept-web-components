import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";

export default class ProteomicsAssay extends Assay {
    protected amountOfPeptides: number = 0;

    private searchConfiguration: SearchConfiguration = new SearchConfiguration();
    private peptides: Peptide[] = [];

    constructor(public readonly id: string) {
        super(id);
    }

    public getSearchConfiguration(): SearchConfiguration {
        return this.searchConfiguration;
    }

    public setSearchConfiguration(value: SearchConfiguration) {
        const oldConfig = this.searchConfiguration;
        this.searchConfiguration = value;

        if (oldConfig.toString() !== value.toString()) {
            super.onUpdate("searchConfiguration", oldConfig, value);
        }
    }

    public getPeptides(): Peptide[] {
        return this.peptides;
    }

    public setPeptides(peptides: Peptide[]): void {
        const oldPeptides = this.peptides;
        this.amountOfPeptides = peptides.length;
        this.peptides = peptides;

        const equalPeptides: boolean =
            oldPeptides &&
            oldPeptides.length === peptides.length &&
            (oldPeptides === peptides || oldPeptides.every(
                (oldPept, idx) => oldPept === peptides[idx])
            );

        if  (equalPeptides) {
            super.onUpdate("peptides", oldPeptides, peptides);
        }
    }

    public getAmountOfPeptides(): number {
        return this.amountOfPeptides;
    }

    public setAmountOfPeptides(amount: number): void {
        const oldAmount = this.amountOfPeptides;
        this.amountOfPeptides = amount;
        if (this.amountOfPeptides !== amount) {
            super.onUpdate("amountOfPeptides", oldAmount, amount);
        }
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitProteomicsAssay(this);
    }
}
