import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", (event: MessageEvent) => {
    const result = computeTree(event.data.args);
    ctx.postMessage({
        type: "result",
        result: result
    });
});

function computeTree(
    [peptides, tree, taxaToPeptidesMapping]: [Peptide[], Tree, Map<NcbiId, Peptide[]>]
): TreeNode {
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
