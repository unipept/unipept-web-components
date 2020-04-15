import TreeNode from "./TreeNode";
import NcbiTaxon, { NcbiId } from "./ncbi/NcbiTaxon";
import { CountTable } from "./../../counts/CountTable";
import { Ontology } from "./../Ontology";
import { Peptide } from "./../raw/Peptide";

export default class Tree {
    public root: TreeNode;
    public taxa: number[] = [];
    public nodes = new Map<number, TreeNode>();

    private taxaToPeptidesMapping: Map<NcbiId, Peptide[]>;

    /**
     * Constructs a tree based upon the taxonomic id's found in the given taxaCountTable.
     *
     * @param taxaCountTable A count table that maps taxon id's onto their occurrences.
     * @param taxaOntology Ontology that allows to retrieve definitions for taxon id's.
     * @param taxaToPeptidesMapping Maps each taxon id onto the list of peptides with which it is associated.
     * @param id Taxonomic id of the root.
     * @param name Name of the root.
     */
    constructor(
        taxaCountTable: CountTable<NcbiId>,
        taxaOntology: Ontology<NcbiId, NcbiTaxon>,
        taxaToPeptidesMapping?: Map<NcbiId, Peptide[]>,
        id: NcbiId = -1,
        name: string = "Organism"
    ) {
        this.root = new TreeNode(id, name);
        this.taxaToPeptidesMapping = taxaToPeptidesMapping;

        for (const ontologyId of taxaCountTable.getOntologyIds().sort()) {
            let currentNode = this.root;
            const taxonDefinition = taxaOntology.getDefinition(ontologyId);

            for (const lineageTaxId of taxonDefinition.lineage) {
                // TODO check out what we should do with negative id's here?
                if (lineageTaxId !== null  && lineageTaxId !== -1 && taxaOntology.getDefinition(lineageTaxId)) {
                    let newNode = currentNode.getChild(lineageTaxId);
                    if (newNode === null) {
                        const definition = taxaOntology.getDefinition(lineageTaxId);
                        newNode = new TreeNode(lineageTaxId, definition.name, definition.rank);
                        this.addChild(currentNode, newNode);
                    }
                    currentNode = newNode;
                }
            }
            currentNode.data.self_count = taxaCountTable.getCounts(ontologyId);
        }

        this.nodes.set(id, this.root);
        this.root.getCounts();
        this.sortTree();
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

    /**
     * Sorts all children of the tree by name of the organism
     */
    public sortTree(): void {
        this.root.callRecursively( function() {
            this.children.sort(function(a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        });
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon id.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getOwnSequences(nodeId: number | TreeNode): Peptide[] {
        let id: number;
        if (nodeId instanceof TreeNode) {
            id = nodeId.id;
        } else {
            id = nodeId;
        }

        return this.taxaToPeptidesMapping.get(id) || [];
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon id or any of its children.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getAllSequences(nodeId: number | TreeNode): string[] {
        let node: TreeNode;
        if (nodeId instanceof TreeNode) {
            node = nodeId;
        } else {
            node = this.nodes.get(nodeId);
        }

        let s = this.getOwnSequences(node) || [];
        for (let i = 0; i < node.children.length; i++) {
            s = s.concat(this.getAllSequences(node.children[i].id));
        }

        return s;
    }

}
