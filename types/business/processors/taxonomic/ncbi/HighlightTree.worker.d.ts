import TreeNode from "./../../../ontology/taxonomic/TreeNode";
import { Peptide } from "./../../../ontology/raw/Peptide";
import Tree from "./../../../ontology/taxonomic/Tree";
import { NcbiId } from "./../../../ontology/taxonomic/ncbi/NcbiTaxon";
export default function computeTree(peptides: Peptide[], tree: Tree, taxaToPeptidesMapping: Map<NcbiId, Peptide[]>): TreeNode;
