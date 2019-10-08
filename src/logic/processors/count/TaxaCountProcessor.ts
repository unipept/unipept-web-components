import { TaxaCountTable } from "../../data-management/counts/TaxaCountTable";
import Tree from "../../data-management/Tree";

export namespace TaxaCountProcessor
{
    export async function process(taxaCountTable: TaxaCountTable) : Promise<Tree>
    {
        var ontologyIds = taxaCountTable.getOntologyIds();
        var ontology = taxaCountTable.getOntology();

        await ontology.getLineages(ontologyIds);
        let tree = new Tree(taxaCountTable);

        await ontology.getTaxaInfo(tree.taxa);
        tree.setTaxonNames(tree.taxa.map(id => ontology.getDefinition(id)));
        tree.sortTree();
        
        return tree;
    }
}