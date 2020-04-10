import FunctionalProteinCountTableProcessor
    from "./../FunctionalProteinCountTableProcessor";
import EcDefinition, { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../../ontology/Ontology";
import { EcNamespace } from "./../../../ontology/functional/ec/EcNamespace";
import EcOntologyProcessor from "./../../../ontology/functional/ec/EcOntologyProcessor";

export default class EcProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<EcCode, EcDefinition> {
    protected getAnnotationsFromProtein(p: ProteinDefinition): EcCode[] {
        return p.ecNumbers;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(EcNamespace);
    }

    protected async getOntology(countTable: CountTable<EcCode>): Promise<Ontology<EcCode, EcDefinition>> {
        const processor = new EcOntologyProcessor();
        return await processor.getOntology(countTable);
    }
}
