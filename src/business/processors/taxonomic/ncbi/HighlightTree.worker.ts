import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
import { expose } from "threads/worker";

expose({ computeTree })

export default function computeTree(
    peptides: Peptide[],
    tree: Tree,
    taxaToPeptidesMapping: Map<NcbiId, Peptide[]>
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
