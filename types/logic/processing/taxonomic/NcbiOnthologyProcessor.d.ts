import { NcbiResponseCommunicator } from "@/logic/communication";
import { NcbiId, NcbiTaxon, Ontology } from "@/logic/ontology";
import CountTable from "../CountTable";
import OntologyProcessor from "../OntologyProcessor";
export default class NcbiOntologyProcessor implements OntologyProcessor<NcbiId, NcbiTaxon> {
    private readonly ncbiCommunicator;
    constructor(ncbiCommunicator: NcbiResponseCommunicator);
    getOntology(table: CountTable<NcbiId>): Promise<Ontology<NcbiId, NcbiTaxon>>;
    /**
     * @param ids The NCBI id's for which all associated taxa information should be retrieved.
     * @param withLineage Should all taxa that are a child of one of the given NCBI id's also be retrieved?
     */
    getOntologyByIds(ids: NcbiId[], withLineage?: boolean): Promise<Ontology<NcbiId, NcbiTaxon>>;
    getDefinition(id: NcbiId): Promise<NcbiTaxon | undefined>;
}
