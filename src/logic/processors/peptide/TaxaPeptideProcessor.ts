import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { TaxaCountTable } from "../../data-management/counts/TaxaCountTable";
import { Count } from "../../data-management/counts/CountTable";

export namespace TaxaPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): TaxaCountTable {
        var peptideCounts = processedPeptides.countTable;

        var lcaCounts = new Map<number, Count>();
        var lca2peptides = new Map<number, Set<string>>();

        processedPeptides.response.forEach((data, peptide, _) => {
            let lca = data.lca
            let peptideCount = peptideCounts.get(peptide)

            lcaCounts.set(lca, (lcaCounts.get(lca) || 0) + peptideCount)

            if (!lca2peptides.has(lca)) {
                lca2peptides.set(lca, new Set())
            }
            lca2peptides.get(lca).add(peptide)
        })
        
        return new TaxaCountTable(lcaCounts, lca2peptides)
    }
}
