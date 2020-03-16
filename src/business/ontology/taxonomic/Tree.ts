import TreeNode from "./TreeNode";
import NcbiTaxon, { NcbiId } from "./ncbi/NcbiTaxon";
import { CountTable } from "./../../counts/CountTable";
import { Ontology } from "./../Ontology";

export default class Tree {
    public root: TreeNode;
    public taxa: number[] = [];
    public nodes = new Map<number, TreeNode>();

    /**
     * Constructs a tree based upon the taxonomic id's found in the given taxaCountTable.
     *
     * @param taxaCountTable A count table that maps taxon id's onto their occurrences.
     * @param taxaOntology Ontology that allows to retrieve definitions for taxon id's.
     * @param id Taxonomic id of the root.
     * @param name Name of the root.
     */
    constructor(
        taxaCountTable: CountTable<NcbiId>,
        taxaOntology: Ontology<NcbiId, NcbiTaxon>,
        id: NcbiId = -1,
        name: string = "Organism"
    ) {
        this.root = new TreeNode(id, name);

        for (const ontologyId of taxaCountTable.getOntologyIds()) {
            let currentNode = this.root;
            const taxonDefinition = taxaOntology.getDefinition(ontologyId);

            for (const lineageTaxId of taxonDefinition.lineage.filter(t => t !== null)) {
                let newNode = currentNode.getChild(lineageTaxId);
                if (newNode === null) {
                    newNode = new TreeNode(lineageTaxId);
                    this.addChild(currentNode, newNode);
                }
                currentNode = newNode;
            }
            currentNode.data.self_count = taxaCountTable.getCounts(ontologyId);
        }

        this.nodes.set(id, this.root);
    }

    /**
     * @return The root node.
     */
    public getRoot(): TreeNode {
        return this.root;
    }

    /**
     * Adds a child Node to a given Node of the tree. Also updates the set of nodes and taxa that are present in the
     * tree.
     *
     * @param node The node to which we want to add the child.
     * @param child The child we want to add.
     */
    private addChild(node: TreeNode, child: TreeNode) {
        this.nodes.set(child.id, child);
        this.taxa.push(child.id);
        node.addChild(child);
    }

    /**
     * @return A list of NCBI taxon id's that are present in this tree.
     */
    public getTaxa(): NcbiId[] {
        return this.taxa;
    }
}
