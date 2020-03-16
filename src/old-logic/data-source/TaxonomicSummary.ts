export default class TaxonomicSummary {
    public readonly sequence: string;
    public readonly lcaName: string;
    public readonly lineageNames: string[];

    public constructor(sequence: string, lcaName: string, lineageNames: string[]) {
        this.sequence = sequence;
        this.lcaName = lcaName;
        this.lineageNames = lineageNames;
    }
}
