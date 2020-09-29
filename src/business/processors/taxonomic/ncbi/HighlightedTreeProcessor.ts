import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import Worker from "worker-loader?inline=fallback!./HighlightTree.worker";
import { QueueManager } from "@/business";

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
        return QueueManager.getLongRunningQueue().pushTask<TreeNode>(() => {
            return new Promise<TreeNode>((resolve) => {
                const worker = new Worker();

                worker.addEventListener("message", (event: MessageEvent) => {
                    worker.terminate();
                    resolve(event.data.result);
                });

                worker.postMessage({
                    args: [peptides, tree, taxaToPeptidesMapping]
                });
            });
        })
    }
}
