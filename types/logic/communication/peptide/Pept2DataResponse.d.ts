type Pept2DataResponse = {
    sequence: string;
    lca: number;
    lineage: number[];
    fa: {
        counts: {
            all: number;
            EC: number;
            GO: number;
            IPR: number;
        };
        data: any;
    };
};
export default Pept2DataResponse;
