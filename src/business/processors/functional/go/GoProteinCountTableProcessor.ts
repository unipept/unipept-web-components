import GoDefinition, { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { GoNamespace } from "./../../../ontology/functional/go/GoNamespace";
import GoOntologyProcessor from "./../../../ontology/functional/go/GoOntologyProcessor";
import FunctionalProteinCountTableProcessor from "./../FunctionalProteinCountTableProcessor";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { Ontology } from "./../../../ontology/Ontology";
import { Peptide } from "./../../../ontology/raw/Peptide";

export default class GoProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<GoCode, GoDefinition>{
    constructor(
        peptide: Peptide,
        equateIl: boolean
    ) {
        super(peptide, equateIl)
    }

    protected getAnnotationsFromProtein(p: ProteinDefinition): GoCode[] {
        return p.goTerms;
    }

    protected getNamespaces(): FunctionalNamespace[] {
        return Object.values(GoNamespace);
    }

    protected async getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>> {
        const ontologyProcessor = new GoOntologyProcessor();
        return await ontologyProcessor.getOntology(countTable);
    }
}
