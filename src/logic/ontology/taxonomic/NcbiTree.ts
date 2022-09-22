import CountTable from "../../../logic/processing/CountTable";
import Ontology from "../Ontology";
import Peptide from "../peptide/Peptide";
import NcbiId from "./NcbiId";
import NcbiTaxon from "./NcbiTaxon";
import NcbiTreeNode from "./NcbiTreeNode";

export default class NcbiTree {
    public root: NcbiTreeNode;
    public taxa: number[] = [];
    public nodes = new Map<number, NcbiTreeNode>();

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
        id: NcbiId = 1,
        name: string = "Organism"
    ) {
        this.root = new NcbiTreeNode(id, name);
        this.taxaToPeptidesMapping = taxaToPeptidesMapping ? taxaToPeptidesMapping : new Map<NcbiId, Peptide[]>();

        for (const ontologyId of taxaCountTable.getOntologyIds().sort()) {
            let currentNode = this.root;
            const taxonDefinition = taxaOntology.getDefinition(ontologyId);

            if (!taxonDefinition) {
                continue;
            }

            for (const lineageTaxId of taxonDefinition.lineage) {
                // TODO check out what we should do with negative id's here?
                if (lineageTaxId !== null  && lineageTaxId !== -1 && taxaOntology.getDefinition(lineageTaxId)) {
                    let newNode = currentNode.getChild(lineageTaxId);
                    if (newNode === null) {
                        const definition = taxaOntology.getDefinition(lineageTaxId) || { 
                            name: "Unknown", rank: "Unknown"
                        };
                        newNode = new NcbiTreeNode(lineageTaxId, definition.name, definition.rank);
                        this.addChild(currentNode, newNode);
                    }
                    currentNode = newNode;
                }
            }
            currentNode.selfCount = taxaCountTable.getCounts(ontologyId);
        }

        this.nodes.set(id, this.root);
        this.root.getCounts();
        this.sortTree();
    }

    /**
     * @return The root node.
     */
    public getRoot(): NcbiTreeNode {
        return this.root;
    }

    /**
     * Adds a child Node to a given Node of the tree. Also updates the set of nodes and taxa that are present in the
     * tree.
     *
     * @param node The node to which we want to add the child.
     * @param child The child we want to add.
     */
    private addChild(node: NcbiTreeNode, child: NcbiTreeNode) {
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
        this.root.callRecursively(function(node: NcbiTreeNode) {
            node.children.sort(function(a: NcbiTreeNode, b: NcbiTreeNode) {
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
    getOwnSequences(nodeId: number | NcbiTreeNode): Peptide[] {
        let id: number;
        if (nodeId instanceof NcbiTreeNode) {
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
    getAllSequences(nodeId: number | NcbiTreeNode): string[] {
        let node: NcbiTreeNode;
        if (nodeId instanceof NcbiTreeNode) {
            node = nodeId;
        } else {
            node = this.nodes.get(nodeId)!;
        }

        let s = this.getOwnSequences(node) || [];

        if (node) {
            for (let i = 0; i < node.children.length; i++) {
                s = s.concat(this.getAllSequences(node.children[i].id));
            }
        }

        return s;
    }
}
