import {NCBITaxonomy} from './taxa/NCBITaxonomy'
import {GeneOntology} from './go/GeneOntology'
import {ECOntology} from './ec/ECOntology'


export class OntologyManager
{
    private _ecOntology: ECOntology;
    private _geneOntology: GeneOntology;
    private _ncbiTaxonomy: NCBITaxonomy;

    constructor()
    {
        this.initOntologies();
    }

    async initOntologies()
    {
        // TODO: might be better to fetch all data once and init all ontologies here, instead of letting the ontologies fetch data seperately
        await Promise.all([
            this._ecOntology.fetchDefinitions(),
            this._geneOntology.fetchDefinitions(),
            this._ncbiTaxonomy.fetchDefinitions()
        ])
    }
}
