/**
 * A Comparative is an item that can be compared between different assays. It's associated with a specific type of
 * annotation (taxonomic or functional).
 */
export default class Comparative {
    // Human readable name of the associated annotation.
    public readonly name: string;
    // A unique identifier for this comparative. Should be one of NCBI taxonomy, GO-term code or EC-number code.
    public readonly identifier: string;
    // The number of samples in which this specific annotation is present.
    public readonly sampleCount: number;

    constructor(name: string, identifier: string, sampleCount: number) {
        this.name = name;
        this.identifier = identifier;
        this.sampleCount = sampleCount;
    }
}
