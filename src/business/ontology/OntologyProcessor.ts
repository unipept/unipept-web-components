import { Ontology } from "@/business/ontology/Ontology";
import Definition from "@/business/ontology/Definition";
import { CountTable } from "@/business/counts/CountTable";

export default interface OntologyProcessor<OntologyId, DefinitionType extends Definition> {
    /**
     * Asynchronously fetches all ontology definitions for a specific count table. All unique id's that are present in
     * this count table are looked up and processed.
     *
     * @param table The CountTable in which a definition needs to be retrieved for every unique id.
     * @return A promise with all definitions fetched from the Unipept API.
     */
    getOntology(table: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;
}
