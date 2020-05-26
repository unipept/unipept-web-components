import { spawn, Worker, Pool } from "threads";
import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";

/**
 * A highlighted tree is a variant of the Tree that's used to construct most visualisations, specifically aimed at
 * highlighting the nodes that are involved in some protein function.
 */
export default class HighlightedTreeProcessor {
    private static pool = Pool(
        () => spawn(new Worker("./HighlightTree.worker.ts")),
        4
    );

    public async computeHighlightedTree(
        peptides: Peptide[],
        tree: Tree,
        taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
    ): Promise<TreeNode> {
        return new Promise<TreeNode>((resolve, reject) => {
            HighlightedTreeProcessor.pool.queue(async(worker) => {
                try {
                    const result = await worker.computeTree(peptides, tree, taxaToPeptidesMapping);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            })
        });
    }
}
