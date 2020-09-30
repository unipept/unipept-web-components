import { NcbiId, TreeNode, Peptide, Tree } from "@/business";

export async function compute(
    [peptides, tree, taxaToPeptidesMapping]: [Peptide[], Tree, Map<NcbiId, Peptide[]>]
): Promise<TreeNode> {
    return callRecursivelyPostOrder(tree.root, (t: TreeNode, c: any) => {
        const included = c.some(x => x.included) ||
            (
                taxaToPeptidesMapping.has(t.id) &&
                taxaToPeptidesMapping.get(t.id).some(pept => peptides.includes(pept))
            );

        return Object.assign(Object.assign({}, t), { included: included, children: c });
    });
}

function callRecursivelyPostOrder(node: TreeNode, f: (Node, any) => any): any {
    let childResults = [];
    if (node.children) {
        childResults = node.children.map(c => callRecursivelyPostOrder(c, f));
    }
    return f(node, childResults);
}
