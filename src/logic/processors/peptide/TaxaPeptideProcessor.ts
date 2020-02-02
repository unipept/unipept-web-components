import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { TaxaCountTable } from "../../data-management/counts/TaxaCountTable";
import { Count } from "../../data-management/counts/CountTable";
import { Ontologies } from "../../data-management/ontology/Ontologies";

export namespace TaxaPeptideProcessor
{
    export async function process(processedPeptides: ProcessedPeptideContainer, baseURL: string): Promise<TaxaCountTable> {
        const peptideCounts = processedPeptides.countTable;

        const lcaCounts = new Map<number, Count>();
        const lca2peptides = new Map<number, Set<string>>();

        processedPeptides.response.forEach((data, peptide, _) => {
            const lca = data.lca
            const peptideCount = peptideCounts.get(peptide)

            lcaCounts.set(lca, (lcaCounts.get(lca) || 0) + peptideCount)

            if (!lca2peptides.has(lca)) {
                lca2peptides.set(lca, new Set())
            }
            lca2peptides.get(lca).add(peptide)
        })

        const missingIds: Set<number> = await Ontologies.ncbiTaxonomy.fetchTaxaInfo(Array.from(lcaCounts.keys()), baseURL);

        missingIds.forEach(id => {
            lcaCounts.delete(id)
            lca2peptides.delete(id)
        })
        
        return new TaxaCountTable(lcaCounts, lca2peptides)
    }
}
