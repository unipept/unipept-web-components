export type Pept2DataApiResponse  = {
    sequence: string,
    lca: number,
    lineage: number[],
    fa:
        {
            counts:
                {
                    all: number,
                    EC: number,
                    GO: number,
                    IPR: number
                },
            data: any
        }
};
