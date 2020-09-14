import Definition from "./../../Definition";
export declare type NcbiId = number;
export default class NcbiTaxon implements Definition {
    readonly id: NcbiId;
    readonly name: string;
    readonly rank: string;
    readonly lineage: NcbiId[];
    constructor(id: NcbiId, name: string, rank: string, lineage: NcbiId[]);
}
