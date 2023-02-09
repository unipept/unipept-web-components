export default interface DataSourceSingleItem {
    name: string;
    id: number | string;
    count: number;
    category: string;
    assayCount: number;
    assayCounts: Map<string, number>;
}
