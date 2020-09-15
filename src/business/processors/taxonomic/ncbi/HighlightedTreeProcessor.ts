import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import Worker from "worker-loader?inline=fallback!./HighlightTree.worker";

/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    // private static pool = Pool(
    //     () => spawn(new Worker("./HighlightTree.worker.ts")),
    //     4
    // );
    private static worker = new Worker();

    public async computeHighlightedTree(
        peptides: Peptide[],
        tree: Tree,
        taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
    ): Promise<TreeNode> {
        return new Promise<TreeNode>((resolve, reject) => {
            HighlightedTreeProcessor.worker.addEventListener("message", (event: MessageEvent) => {
                resolve(event.data.result);
            });

            HighlightedTreeProcessor.worker.postMessage({
                args: [peptides, tree, taxaToPeptidesMapping]
            });

            // HighlightedTreeProcessor.pool.queue(async(worker) => {
            //     try {
            //         const result = await worker.computeTree(peptides, tree, taxaToPeptidesMapping);
            //         resolve(result);
            //     } catch (err) {
            //         reject(err);
            //     }
            // })
        });
    }
}
