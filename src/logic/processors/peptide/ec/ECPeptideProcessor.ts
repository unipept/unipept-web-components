import {PeptideProcessor} from "../PeptideProcessor";
import {ProcessedPeptideContainer} from '../../../data-management/ProcessedPeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../../data-management/counts/CountTable';
import {OntologyType} from '../../../data-management/ontology/OntologyType';

export class ECPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        var peptideCounts = processedPeptides.countTable.counts;
        var pept2dataResponse = processedPeptides.response;

        var ecCounts = new Map<OntologyId, Count>();
        var peptide2ec = new Map<Peptide, Set<OntologyId>>();

        return new CountTable(OntologyType.EC, ecCounts, undefined, peptide2ec);
    }
}