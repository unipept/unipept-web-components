import DataRepository from "./DataRepository";

export default abstract class Element {
    // The name associated with this element
    public name: string;
    // Determines the amount of peptides to which this element is assigned.
    public popularity: number;
    // How many proteins in the database are annotated with this Element?
    public proteinCount: number;

    constructor(name: string, popularity: number) {
        this.name = name;
        this.popularity = popularity;
    }

    public abstract async computeCrossPopularity(x: Element, dataRepository: DataRepository): Promise<number>;
    public abstract async getAffectedPeptides(dataRepository: DataRepository): Promise<string[]>;
}
