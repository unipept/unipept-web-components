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

export type Pept2DataResponse = Map<string, PeptideData>;