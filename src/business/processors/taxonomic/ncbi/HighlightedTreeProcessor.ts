import { QueueManager, NcbiId, Tree, Peptide, TreeNode } from "@/business";

/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    public async computeHighlightedTree(
        peptides: Peptide[],
        tree: Tree,
        taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
    ): Promise<TreeNode> {
        return QueueManager.getLongRunningQueue().pushTask<
            TreeNode,
            [Peptide[], Tree, Map<NcbiId, Peptide[]>]
        >("highlightedTree", [peptides, tree, taxaToPeptidesMapping]);
    }
}
