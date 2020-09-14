export default class MultiAssayDataSourceItem {
    readonly name: string;
    readonly id: number | string;
    readonly count: number;
    readonly category: string;
    readonly assayCount: number;
    readonly countPerAssayId: Map<string, number>;
    constructor(name: string, id: number | string, count: number, category: string, assayCount: number, countPerAssayId: Map<string, number>);
}
