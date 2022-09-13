import { Definition, Ontology } from "../ontology";
import OntologyCode from "../ontology/OntologyCode";
import CountTable from "./CountTable";

export default interface OntologyProcessor<OntologyId extends OntologyCode, DefinitionType extends Definition> {
    /**
     * Asynchronously fetches all ontology definitions for a specific count table. All unique id's that are present in
     * this count table are looked up and processed.
     *
     * @param table The CountTable in which a definition needs to be retrieved for every unique id.
     * @return A promise with all definitions fetched from the Unipept API.
     */
    getOntology(table: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;

    getOntologyByIds(ids: OntologyId[]): Promise<Ontology<OntologyId, DefinitionType>>;

    /**
     * Asynchronously fetches the definition for a specific ontology id. When multiple definitions should be fetched, it
     * is advised to use the getOntology function instead as network requests are grouped and optimised. Note if this
     * id has been requested before, it has already been cached and will be returned without performing any
     * communication over the network.
     *
     * @param id Indicates for which ontology id the definition should be fetched.
     * @return All static information known about the given ontology id, returned as a definition. Returns undefined
     * if the given id is not known for this ontology.
     */
    getDefinition(id: OntologyId): Promise<DefinitionType | undefined>;
}
