export type PeptideDataResponse = {
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
};
