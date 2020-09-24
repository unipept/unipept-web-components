import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";

export default class ProteomicsAssay extends Assay {
    protected amountOfPeptides: number = 0;

    private searchConfiguration: SearchConfiguration = new SearchConfiguration();
    private peptides: Peptide[] = [];
    // Which endpoint was used the last time this assay was analyzed?
    private endpoint: string = "";
    // Which version of the Unipept database was last used for the analysis of this assay?
    private databaseVersion: string = "";

    constructor(public id: string) {
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

    public getEndpoint(): string {
        return this.endpoint;
    }

    public setEndpoint(endpoint: string): void {
        const oldEndpoint = this.endpoint;
        this.endpoint = endpoint;
        if (this.endpoint !== oldEndpoint) {
            super.onUpdate("endpoint", oldEndpoint, endpoint);
        }
    }

    public getDatabaseVersion(): string {
        return this.databaseVersion;
    }

    public setDatabaseVersion(databaseVersion: string): void {
        const oldVersion = databaseVersion;
        this.databaseVersion = databaseVersion;
        if (this.databaseVersion !== oldVersion) {
            super.onUpdate("databaseVersion", oldVersion, databaseVersion);
        }
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitProteomicsAssay(this);
    }
}
