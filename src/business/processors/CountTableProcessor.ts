import { CountTable } from "./../counts/CountTable";

export default interface CountTableProcessor<OntologyId> {
    getCountTable(): Promise<CountTable<OntologyId>>;
}
