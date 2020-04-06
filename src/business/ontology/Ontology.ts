import Definition from "./Definition";
import { GoCode } from "./functional/go/GoDefinition";
import { EcCode } from "./functional/ec/EcDefinition";
import { InterproCode } from "./functional/interpro/InterproDefinition";
import { NcbiId } from "./taxonomic/ncbi/NcbiTaxon";

export type OntologyIdType = (GoCode | EcCode | InterproCode | NcbiId);

export class Ontology<OntologyId, DefinitionType extends Definition> {
    constructor(
        private readonly definitions = new Map<OntologyId, DefinitionType>()
    ) {}

    getDefinition(id: OntologyId) : Readonly<DefinitionType> | undefined {
        return this.definitions.get(id);
    }
}
