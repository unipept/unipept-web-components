export type PeptideData = 
{
    lca: number, 
    lineage: [number], 
    fa: 
    {
        counts: 
        {
            all: number,
            EC: number;
            GO: number;
        },
        data: any
    }
}

type Response = Map<string, PeptideData>;

export class Pept2DataResponse
{
    public response: Response;

    constructor(response: Response = new Map<string, PeptideData>())
    {
        this.response = response;
    }

    setPeptideData(peptide: string, peptideData: PeptideData)
    {
        this.response.set(peptide, peptideData);
    }

    getPeptideData(peptide: string) : Readonly<PeptideData>
    {
        return this.response.get(peptide);
    }

    hasPeptide(peptide: string) : boolean
    {
        return this.response.has(peptide);
    }

    getResponse() : Readonly<Response>
    {
        return this.response;
    }
}
