import {PeptideProcessor} from "./PeptideProcessor";
import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../data-management/counts/CountTable';
import {OntologyType} from '../../data-management/ontology/OntologyType';

export class ECPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        var peptideCounts = processedPeptides.countTable.counts;
        var pept2dataResponse = processedPeptides.response;

        var ecCounts = new Map<OntologyId, Count>();
        var peptide2ec = new Map<Peptide, Set<OntologyId>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
        {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith("EC:"))
                .forEach(term => 
                    {
                        ecCounts.set(term, (ecCounts.get(term) || 0) + peptideCount)
                        
                        if(!peptide2ec.has(peptide))
                            peptide2ec.set(peptide, new Set())
                        peptide2ec.get(peptide).add(term)
                    });
        })

        return new CountTable(OntologyType.EC, ecCounts, undefined, peptide2ec);
    }
}
