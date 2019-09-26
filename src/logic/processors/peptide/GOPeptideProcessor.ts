import {PeptideProcessor} from "./PeptideProcessor";
import {ProcessedPeptideContainer} from '../../data-management/ProcessedPeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../data-management/counts/CountTable';
import {OntologyType} from '../../data-management/ontology/OntologyType';

export class GOPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        var peptideCounts = processedPeptides.countTable.counts;
        var pept2dataResponse = processedPeptides.response;

        var goCounts = new Map<OntologyId, Count>();
        var peptide2go = new Map<Peptide, Set<OntologyId>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
        {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith("GO:"))
                .forEach(term => 
                    {
                        goCounts.set(term, (goCounts.get(term) || 0) + peptideCount)
                        
                        if(!peptide2go.has(peptide))
                            peptide2go.set(peptide, new Set())
                        peptide2go.get(peptide).add(term)
                    });
        })

        return new CountTable(OntologyType.GO, goCounts, undefined, peptide2go);
    }
}
