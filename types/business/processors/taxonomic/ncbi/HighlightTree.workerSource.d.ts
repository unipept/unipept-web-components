import { NcbiId, TreeNode, Peptide, Tree } from "@/business";
export declare function compute([peptides, tree, taxaToPeptidesMapping]: [Peptide[], Tree, Map<NcbiId, Peptide[]>]): Promise<TreeNode>;
