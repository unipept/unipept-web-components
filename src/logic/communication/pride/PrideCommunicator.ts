import Peptide from "@/logic/ontology/peptide/Peptide";

export default class PrideCommunicator {
    constructor(
        public readonly prideApiPeptideUrl: string = "https://www.ebi.ac.uk/pride/ws/archive/v2/peptideevidences",
        public readonly prideBatchSize: number = 1000
    ) {}

    public async getPeptides(accession: string): Promise<Peptide[]> {
        const peptides: string[] = [];

        const amountOfPeptides = await this.getAmountOfPeptides(accession);

        const lastPage = Math.floor(amountOfPeptides / this.prideBatchSize);
        // TODO: Should be <=, but the API is broken
        for (let page = 0; page < lastPage; ++page) {
            peptides.push(...await this.getPeptidesFromPage(accession, page));
        }

        return peptides;
    }

    private async getAmountOfPeptides(accession: string): Promise<number> {
        return fetch(`${this.prideApiPeptideUrl}?assayAccession=${accession}&pageSize=1&page=0`)
            .then(response => response.json())
            .then(data => {
                return data.page.totalElements;
            });
    }

    private async getPeptidesFromPage(accession: string, page: number): Promise<Peptide[]> {
        return fetch(`${this.prideApiPeptideUrl}?assayAccession=${accession}&pageSize=1000&page=${page}`)
            .then(response => response.json())
            .then(data => data._embedded.peptideevidences.map((peptide: any) => peptide.peptideSequence));
    }
}
