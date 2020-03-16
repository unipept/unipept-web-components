export default class NCBITaxon {
    public readonly id: number;
    public name: string;
    public rank: string;
    public lineage: number[];

    constructor(id: number, name: string, rank: string, lineage: number[]) {
        this.id = id;
        this.name = name;
        this.rank = rank;
        this.lineage = lineage;
    }
}
