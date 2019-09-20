import {Ontology} from './Ontology'
import {OntologyType} from './OntologyType'

export class NCBIOntologyTaxonomy extends Ontology
{
    constructor()
    {
        super(OntologyType.NCBI_TAX)
    }

    init(): void {
        throw new Error("Method not implemented.");
    }
}
