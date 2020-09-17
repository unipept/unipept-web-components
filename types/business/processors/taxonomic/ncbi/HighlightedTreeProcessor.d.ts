import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    static HIGHLIGHT_TREE_PARALLEL_LIMIT: number;
    private static queue;
    computeHighlightedTree(peptides: Peptide[], tree: Tree, taxaToPeptidesMapping: Map<NcbiId, Peptide[]>): Promise<TreeNode>;
}
