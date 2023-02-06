import { Peptide, NcbiId, NcbiTree } from "@/logic/ontology";
import { QueueManager } from "@/logic/util";
import { TreeNode } from "unipept-visualizations/types";

/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    public async computeHighlightedTree(
        peptides: Peptide[],
        tree: NcbiTree,
        taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
    ): Promise<TreeNode> {
        return QueueManager.getLongRunningQueue().pushTask<
            TreeNode,
            [Peptide[], NcbiTree, Map<NcbiId, Peptide[]>]
        >("computeHighlightedTree", [peptides, tree, taxaToPeptidesMapping]);
    }
}
