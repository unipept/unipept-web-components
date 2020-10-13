import Definition from "./Definition";
import { GoCode } from "./functional/go/GoDefinition";
import { EcCode } from "./functional/ec/EcDefinition";
import { InterproCode } from "./functional/interpro/InterproDefinition";
import { NcbiId } from "./taxonomic/ncbi/NcbiTaxon";
import { UniprotAccessionId } from "./protein/ProteinDefinition";
export declare type OntologyIdType = (GoCode | EcCode | InterproCode | NcbiId | UniprotAccessionId);
export declare class Ontology<OntologyId, DefinitionType extends Definition> {
    private readonly definitions;
    constructor(definitions?: Map<OntologyId, DefinitionType>);
    getDefinition(id: OntologyId): Readonly<DefinitionType> | undefined;
    getOntologyIds(): OntologyId[];
    toMap(): Map<OntologyId, DefinitionType>;
}
