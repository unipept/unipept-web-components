import Peptide from "@/logic/ontology/peptide/Peptide";
export default class PrideCommunicator {
    readonly prideApiPeptideUrl: string;
    readonly prideBatchSize: number;
    constructor(prideApiPeptideUrl?: string, prideBatchSize?: number);
    getPeptides(accession: string): Promise<Peptide[]>;
    private getAmountOfPeptides;
    private getPeptidesFromPage;
}
