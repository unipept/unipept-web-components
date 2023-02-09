import { Peptide, NcbiId, NcbiTree } from "@/logic/ontology";
import { TreeNode } from "unipept-visualizations";
export default function compute([peptides, tree, taxaToPeptidesMapping]: [Peptide[], NcbiTree, Map<NcbiId, Peptide[]>]): Promise<TreeNode>;
