import TreeNode from "./TreeNode";
import NcbiTaxon, { NcbiId } from "./ncbi/NcbiTaxon";
import { CountTable } from "./../../counts/CountTable";
import { Ontology } from "./../Ontology";
import { Peptide } from "./../raw/Peptide";
export default class Tree {
    root: TreeNode;
    taxa: number[];
    nodes: Map<number, TreeNode>;
    private taxaToPeptidesMapping;
    /**
     * Constructs a tree based upon the taxonomic id's found in the given taxaCountTable.
     *
     * @param taxaCountTable A count table that maps taxon id's onto their occurrences.
     * @param taxaOntology Ontology that allows to retrieve definitions for taxon id's.
     * @param taxaToPeptidesMapping Maps each taxon id onto the list of peptides with which it is associated.
     * @param id Taxonomic id of the root.
     * @param name Name of the root.
     */
    constructor(taxaCountTable: CountTable<NcbiId>, taxaOntology: Ontology<NcbiId, NcbiTaxon>, taxaToPeptidesMapping?: Map<NcbiId, Peptide[]>, id?: NcbiId, name?: string);
    /**
     * @return The root node.
     */
    getRoot(): TreeNode;
    /**
     * Adds a child Node to a given Node of the tree. Also updates the set of nodes and taxa that are present in the
     * tree.
     *
     * @param node The node to which we want to add the child.
     * @param child The child we want to add.
     */
    private addChild;
    /**
     * @return A list of NCBI taxon id's that are present in this tree.
     */
    getTaxa(): NcbiId[];
    /**
     * Sorts all children of the tree by name of the organism
     */
    sortTree(): void;
    /**
     * Composes a list of sequences that were added to a node with a given taxon id.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getOwnSequences(nodeId: number | TreeNode): Peptide[];
    /**
     * Composes a list of sequences that were added to a node with a given taxon id or any of its children.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getAllSequences(nodeId: number | TreeNode): string[];
}
