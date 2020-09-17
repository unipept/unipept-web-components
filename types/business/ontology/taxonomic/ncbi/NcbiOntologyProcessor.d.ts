import OntologyProcessor from "./../../OntologyProcessor";
import NcbiTaxon, { NcbiId } from "./NcbiTaxon";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import CommunicationSource from "./../../../communication/source/CommunicationSource";
export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    private readonly comSource;
    static NCBI_ONTOLOGY_PARALLEL_LIMIT: number;
    private static queue;
    constructor(comSource: CommunicationSource);
    getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>>;
    getOntologyByIds(ids: NcbiId[]): Promise<Ontology<NcbiId, NcbiTaxon>>;
    getDefinition(id: NcbiId): Promise<NcbiTaxon>;
}
