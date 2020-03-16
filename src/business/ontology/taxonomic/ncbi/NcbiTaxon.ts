import Definition from "./../../Definition";

export type NcbiId = number;

export default class NcbiTaxon implements Definition {
    constructor(
        public readonly id: NcbiId,
        public readonly name: string,
        public readonly rank: string,
        public readonly lineage: NcbiId[]
    ) {}
}
