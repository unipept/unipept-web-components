import Assay from "./Assay";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import AssayVisitor from "./AssayVisitor";
import { Peptide } from "./../../ontology/raw/Peptide";
export default class ProteomicsAssay extends Assay {
    id: string;
    protected amountOfPeptides: number;
    private searchConfiguration;
    private peptides;
    private endpoint;
    private databaseVersion;
    constructor(id: string);
    getSearchConfiguration(): SearchConfiguration;
    setSearchConfiguration(value: SearchConfiguration): void;
    getPeptides(): Peptide[];
    setPeptides(peptides: Peptide[]): void;
    getAmountOfPeptides(): number;
    setAmountOfPeptides(amount: number): void;
    getEndpoint(): string;
    setEndpoint(endpoint: string): void;
    getDatabaseVersion(): string;
    setDatabaseVersion(databaseVersion: string): void;
    accept(visitor: AssayVisitor): Promise<void>;
}
