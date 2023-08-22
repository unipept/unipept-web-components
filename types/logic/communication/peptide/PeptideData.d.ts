import PeptideDataResponse from "./PeptideDataResponse";
export default class PeptideData {
    readonly buffer: ArrayBuffer;
    static readonly LCA_OFFSET: number;
    static readonly LCA_SIZE: number;
    static readonly LINEAGE_OFFSET: number;
    static readonly RANK_COUNT: number;
    static readonly LINEAGE_SIZE: number;
    static readonly FA_COUNT_SIZE = 4;
    static readonly FA_ALL_COUNT_OFFSET: number;
    static readonly FA_EC_COUNT_OFFSET: number;
    static readonly FA_GO_COUNT_OFFSET: number;
    static readonly FA_IPR_COUNT_OFFSET: number;
    static readonly FA_POINTER_SIZE = 4;
    static readonly FA_EC_INDEX_OFFSET: number;
    static readonly FA_GO_INDEX_OFFSET: number;
    static readonly FA_IPR_INDEX_OFFSET: number;
    static readonly FA_DATA_START: number;
    private readonly dataView;
    constructor(buffer: ArrayBuffer);
    static createFromPeptideDataResponse(response: PeptideDataResponse): PeptideData;
    get faCounts(): {
        all: number;
        ec: number;
        go: number;
        ipr: number;
    };
    get lca(): number;
    get lineage(): number[];
    get ec(): any;
    private encodedNullOrNumberToString;
    get go(): any;
    get ipr(): any;
    toPeptideDataResponse(): PeptideDataResponse;
}
