import { Peptide, NcbiId, NcbiTree } from "@/logic/ontology";
import { DataNodeLike, TreeNode } from "unipept-visualizations";

export default async function compute(
    [peptides, tree, taxaToPeptidesMapping]: [Peptide[], NcbiTree, Map<NcbiId, Peptide[]>]
): Promise<TreeNode> {
    return callRecursivelyPostOrder(tree.root, (t: DataNodeLike, c: any) => {
        const included = c.some((x: any) => x.included) ||
            (
                taxaToPeptidesMapping.has(t.id!) &&
                taxaToPeptidesMapping.get(t.id!)!.some(pept => peptides.includes(pept))
            );

        t.extra.included = included;
        return t;
    });
}

function callRecursivelyPostOrder(node: DataNodeLike, f: (Node: any, any: any) => any): any {
    let childResults = [];
    if (node.children) {
        childResults = node.children.map(c => callRecursivelyPostOrder(c, f));
    }
    return f(node, childResults);
}
