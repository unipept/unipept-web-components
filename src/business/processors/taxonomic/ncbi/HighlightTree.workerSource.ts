import { NcbiId, Peptide, Tree, TreeNode } from "@/business";
import { DataNodeLike } from "unipept-visualizations";

export async function compute(
    [peptides, tree, taxaToPeptidesMapping]: [Peptide[], Tree, Map<NcbiId, Peptide[]>]
): Promise<TreeNode> {
    return callRecursivelyPostOrder(tree.root, (t: DataNodeLike, c: any) => {
        const included = c.some(x => x.included) ||
            (
                taxaToPeptidesMapping.has(t.id) &&
                taxaToPeptidesMapping.get(t.id).some(pept => peptides.includes(pept))
            );

        t.extra.included = included;
        return t;
    });
}

function callRecursivelyPostOrder(node: DataNodeLike, f: (Node, any) => any): any {
    let childResults = [];
    if (node.children) {
        childResults = node.children.map(c => callRecursivelyPostOrder(c, f));
    }
    return f(node, childResults);
}
