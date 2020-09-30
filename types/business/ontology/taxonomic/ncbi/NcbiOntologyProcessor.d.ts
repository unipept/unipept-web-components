import { CountTable, Ontology, OntologyProcessor, NcbiTaxon, NcbiId, CommunicationSource } from "@/business";
export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    private readonly comSource;
    constructor(comSource: CommunicationSource);
    getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>>;
    getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>>;
    getDefinition(id: NcbiId): Promise<NcbiTaxon>;
}
