import FAElement from '../functional-annotations/FAElement';
import { ProcessedPeptideContainer } from '../data-management/ProcessedPeptideContainer';
import { Ontologies } from '../data-management/ontology/Ontologies';

export namespace DataSourceCommon
{
    export function getFASummary(faElement: FAElement, processedPeptideContainer: ProcessedPeptideContainer = undefined): string[][]
    {
        if(processedPeptideContainer)
        {
            return [[
                "peptide",
                "spectral count",
                "matching proteins",
                "matching proteins with " + faElement.code,
                "percentage proteins with " + faElement.code,
                "lca"
            ]]
                .concat(faElement.affectedPeptides
                    .map(peptide => {

                        let peptideCount = processedPeptideContainer.countTable.get(peptide)
                        let peptideData = processedPeptideContainer.response.get(peptide)
                        let ecProteinCount = peptideData.fa.data.hasOwnProperty(faElement.code)? peptideData.fa.data[faElement.code] : 0

                        return [
                            peptide, 
                            peptideCount, 
                            peptideData.fa.counts.all, 
                            ecProteinCount, 
                            100 * (ecProteinCount / peptideData.fa.counts.all),
                            Ontologies.ncbiTaxonomy.getDefinition(peptideData.lca).name
                        ] as string[]
                    }));
        }

        return []
    }
}