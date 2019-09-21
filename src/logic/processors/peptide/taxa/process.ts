import PeptideContainer from '../../../data-management/PeptideContainer';
import {CountTable, OntologyId, Peptide, Count} from '../../../data-management/counts/CountTable';
import {OntologyType} from '../../../data-management/ontology/OntologyType';
import MPAConfig from '../../../data-management/MPAConfig';
import {preparePeptides} from '../common';
import {postJSON, stringTitleize} from "../../../utils";

const BATCH_SIZE = 100;
const API_ENDPOINT = "/mpa/pept2data";

export default async function process(peptides: PeptideContainer, config: MPAConfig)
{
    var originalPeptides = await peptides.getPeptides();
    var preparedPeptides = preparePeptides(originalPeptides, config);
    const peptideList = Array.from(preparedPeptides.keys());

    // TODO: this should only request the lca's for all peptides, but because this endpoint doesn't exist yet we request it via pept2data
    var lcaCounts = new Map<OntologyId, Count>();
    var lca2peptides = new Map<OntologyId, Set<Peptide>>();
    var peptide2lca = new Map<Peptide, Set<OntologyId>>();

    for (let i = 0; i < peptideList.length; i += BATCH_SIZE) 
    {
        const data = JSON.stringify({
            peptides: peptideList.slice(i, i + BATCH_SIZE),
            equate_il: config.il,
            missed: config.missed,
        });

        const lcaResult = await postJSON(API_ENDPOINT, data);

        lcaResult.peptides.forEach(p => 
            {
                lcaCounts.set(p.lca, (lcaCounts.get(p.lca) || 0) + 1)

                if(!lca2peptides.has(p.lca))
                    lca2peptides.set(p.lca, new Set())
                lca2peptides.get(p.lca).add(p.sequence)

                peptide2lca.set(p.sequence, p.lca)
            }
        );
    }

    return new CountTable(OntologyType.NCBI_TAX, lcaCounts, lca2peptides, peptide2lca);
}