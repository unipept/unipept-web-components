export default class MultiAssayDataSourceItem {
    constructor(
        public readonly name: string,
        public readonly id: number | string,
        public readonly count: number,
        // Used for filtering based upon category later on.
        public readonly category: string,
        // In how many assays does this annotation occur?
        public readonly assayCount: number,
        // Maps an assay id onto the amount of peptides associated with this annotation for this particular assay.
        public readonly countPerAssayId: Map<string, number>
    ) {}
}
