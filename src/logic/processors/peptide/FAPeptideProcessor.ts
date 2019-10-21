import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { Count } from "../../data-management/counts/CountTable";

export namespace FAPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer, faPrefix: string, createFACountTable: (ontologyCounts, ontology2peptide, peptide2ontology) => any): any {
        var peptideCounts = processedPeptides.countTable;
        var pept2dataResponse = processedPeptides.response;

        var ontologyCounts = new Map<string, Count>();
        var ontology2peptide = new Map<string, Set<string>>();
        var peptide2ontology = new Map<string, string[]>();

        pept2dataResponse.forEach((data, peptide, _) => {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith(faPrefix))
                .forEach(term => {
                    ontologyCounts.set(term, (ontologyCounts.get(term) || 0) + peptideCount)
                        
                    if (!peptide2ontology.has(peptide)) {
                        peptide2ontology.set(peptide, [])
                    }
                    peptide2ontology.get(peptide).push(term)

                    if (!ontology2peptide.has(term)) {
                        ontology2peptide.set(term, new Set())
                    }
                    ontology2peptide.get(term).add(peptide)
                });
        })

        return createFACountTable(ontologyCounts, ontology2peptide, peptide2ontology);
    }
}