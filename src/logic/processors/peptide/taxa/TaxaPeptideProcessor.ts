import {PeptideProcessor} from "../PeptideProcessor";
import {ProcessedPeptideContainer} from '../../../data-management/ProcessedPeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../../data-management/counts/CountTable';
import {OntologyType} from '../../../data-management/ontology/OntologyType';

export class TaxaPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        var peptideCounts = processedPeptides.countTable.counts;
        var pept2dataResponse = processedPeptides.response;

        var lcaCounts = new Map<OntologyId, Count>();
        var lca2peptides = new Map<OntologyId, Set<Peptide>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
            {
                let lca = data.lca.toString()
                let peptideCount = peptideCounts.get(peptide)

                lcaCounts.set(lca, (lcaCounts.get(lca) || 0) + peptideCount)

                if(!lca2peptides.has(lca))
                    lca2peptides.set(lca, new Set())
                lca2peptides.get(lca).add(peptide)
            })
        
        return new CountTable(OntologyType.NCBI_TAX, lcaCounts, lca2peptides)
    }
}