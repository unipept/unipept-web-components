import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { Count } from "../../data-management/counts/CountTable";

export namespace FAPeptideProcessor
{
    export async function process(processedPeptides: ProcessedPeptideContainer, faPrefix: string, ontology: any, baseURL: string, createFACountTable: (ontologyCounts, ontology2peptide, peptide2ontology) => any): Promise<any> {
        const peptideCounts = processedPeptides.countTable;
        const pept2dataResponse = processedPeptides.response;

        const ontologyCounts = new Map<string, Count>();
        const ontology2peptide = new Map<string, Set<string>>();
        const peptide2ontology = new Map<string, string[]>();

        pept2dataResponse.forEach((data, peptide, _) => {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith(faPrefix))
                .forEach(term => {
                    ontologyCounts.set(term, (ontologyCounts.get(term) || 0) + peptideCount)
                });
        })

        // fetch ontology definitions
        let missingIds: Set<string> = await ontology.fetchDefinitions(Array.from(ontologyCounts.keys()), baseURL);

        // remove missingIds from ontologyCounts
        missingIds.forEach((id) => {
            ontologyCounts.delete(id);
        })

        // create peptide links
        pept2dataResponse.forEach((data, peptide, _) => {
            let fas = data.fa.data || [];

            if (!peptide2ontology.has(peptide)) {
                peptide2ontology.set(peptide, [])
            }

            Object.keys(fas)
                .filter(term => term.startsWith(faPrefix) && !missingIds.has(term))
                .forEach(term => {
                    peptide2ontology.get(peptide).push(term)

                    if (!ontology2peptide.has(term)) {
                        ontology2peptide.set(term, new Set())
                    }
                    ontology2peptide.get(term).add(peptide)
                });
        })

        let countTable = createFACountTable(ontologyCounts, ontology2peptide, peptide2ontology)
        return countTable;
    }
}