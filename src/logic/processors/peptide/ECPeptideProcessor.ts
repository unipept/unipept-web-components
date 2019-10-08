import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';
import {Count} from '../../data-management/counts/CountTable';
import { ECCountTable } from '../../data-management/counts/ECCountTable';

export namespace ECPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): ECCountTable 
    {
        var peptideCounts = processedPeptides.countTable;
        var pept2dataResponse = processedPeptides.response;

        var ecCounts = new Map<string, Count>();
        var ec2peptide = new Map<string, Set<string>>();
        var peptide2ec = new Map<string, string[]>();

        pept2dataResponse.response.forEach((data, peptide, _) => 
        {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith("EC:"))
                .forEach(term => 
                    {
                        ecCounts.set(term, (ecCounts.get(term) || 0) + peptideCount)
                        
                        if(!peptide2ec.has(peptide))
                        {
                            peptide2ec.set(peptide, [])
                        }
                        peptide2ec.get(peptide).push(term)

                        if(!ec2peptide.has(term))
                        {
                            ec2peptide.set(term, new Set())
                        }
                        ec2peptide.get(term).add(peptide)
                    });
        })

        return new ECCountTable(ecCounts, ec2peptide, peptide2ec);
    }
}
