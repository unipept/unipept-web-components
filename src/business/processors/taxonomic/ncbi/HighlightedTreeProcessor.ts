import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import Worker from "worker-loader?inline=fallback!./HighlightTree.worker";
import async, { AsyncQueue } from "async";

/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    public static HIGHLIGHT_TREE_PARALLEL_LIMIT: number = 4;
    private static queue: AsyncQueue<any>;

    public async computeHighlightedTree(
        peptides: Peptide[],
        tree: Tree,
        taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
    ): Promise<TreeNode> {
        if (!HighlightedTreeProcessor.queue) {
            HighlightedTreeProcessor.queue = async.queue((
                task: {data: [Peptide[], Tree, Map<NcbiId, Peptide[]>]},
                callback: (a: any) => void
            ) => {
                const worker = new Worker();

                worker.addEventListener("message", (event: MessageEvent) => {
                    callback(event.data.result);
                });

                worker.postMessage({
                    args: task.data
                });
            }, HighlightedTreeProcessor.HIGHLIGHT_TREE_PARALLEL_LIMIT);
        }

        return new Promise<TreeNode>((resolve) => {
            HighlightedTreeProcessor.queue.push({
                data: [peptides, tree, taxaToPeptidesMapping]
            }, resolve);
        });
    }
}
