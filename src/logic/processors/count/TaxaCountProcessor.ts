import { TaxaCountTable } from "../../data-management/counts/TaxaCountTable";
import Tree from "../../data-management/Tree";

export namespace TaxaCountProcessor
{
    export async function process(taxaCountTable: TaxaCountTable) : Promise<Tree> {
        var ontologyIds = taxaCountTable.getOntologyIds();
        var ontology = taxaCountTable.getOntology();

        await ontology.fetchLineages(ontologyIds);
        let tree = new Tree(taxaCountTable);

        await ontology.fetchTaxaInfo(tree.taxa);
        tree.setTaxonNames(tree.taxa.map(id => ontology.getDefinition(id)));
        tree.sortTree();
        
        return tree;
    }
}
