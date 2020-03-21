import FunctionalCountTableProcessor from "./../FunctionalCountTableProcessor";
import InterproDefinition, { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { CountTable } from "./../../../counts/CountTable";
import SearchConfiguration from "./../../../configuration/SearchConfiguration";
import { Ontology } from "./../../../ontology/Ontology";
import InterproOntologyProcessor from "./../../../ontology/functional/interpro/InterproOntologyProcessor";
import { InterproNamespace } from "./../../../ontology/functional/interpro/InterproNamespace";

export default class InterproCountTableProcessor extends FunctionalCountTableProcessor<InterproCode, InterproDefinition> {
    constructor(
        readonly peptideCountTable: CountTable<Peptide>,
        readonly configuration: SearchConfiguration,
        readonly percentage: number = 50
    ) {
        super(
            peptideCountTable,
            configuration,
            percentage,
            item => item.fa.counts.IPR, "IPR:"
        );
    }

    protected async getOntology(
        countTable: CountTable<InterproCode>
    ): Promise<Ontology<InterproCode, InterproDefinition>> {
        const ontologyProcessor = new InterproOntologyProcessor();
        return await ontologyProcessor.getOntology(countTable);
    }

    protected getNamespaces(): InterproNamespace[] {
        return Object.values(InterproNamespace);
    }
}
