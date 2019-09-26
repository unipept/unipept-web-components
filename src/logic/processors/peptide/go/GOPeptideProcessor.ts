import {PeptideProcessor} from "../PeptideProcessor";
import {ProcessedPeptideContainer} from '../../../data-management/ProcessedPeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../../data-management/counts/CountTable';
import {OntologyType} from '../../../data-management/ontology/OntologyType';

export class GOPeptideProcessor implements PeptideProcessor
{
    process(processedPeptides: ProcessedPeptideContainer): CountTable 
    {
        var peptideCounts = processedPeptides.countTable.counts;
        var pept2dataResponse = processedPeptides.response;

        var goCounts = new Map<OntologyId, Count>();
        var peptide2go = new Map<Peptide, Set<OntologyId>>();

        return new CountTable(OntologyType.GO, goCounts, undefined, peptide2go);
    }
}