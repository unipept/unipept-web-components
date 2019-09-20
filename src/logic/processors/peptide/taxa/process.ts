import PeptideContainer from '../../../data-management/PeptideContainer';
import {CountTable} from '../../../data-management/counts/CountTable';
import {OntologyType} from '../../../data-management/ontology/OntologyType';

export default function process(peptides: PeptideContainer)
{
    var countTable = new CountTable(OntologyType.NCBI_TAX);

    // TODO: calculate count table

    return countTable;
}