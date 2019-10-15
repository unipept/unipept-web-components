import {CountTable} from './CountTable';
import {GeneOntology} from '../ontology/go/GeneOntology';
import {Ontologies} from '../ontology/Ontologies';

export class GOCountTable extends CountTable<GeneOntology, string>
{
    getOntology(): GeneOntology {
        return Ontologies.geneOntology;
    }
}
