import Element from "../data-source/Element";
import DataRepository from "../data-source/DataRepository";

export default abstract class FAElement extends Element {
    public readonly code: string;
    // How many of the total amount of peptides is associated with this GO-term?
    public readonly fractionOfPepts: number;
    public readonly affectedPeptides: string[];

    protected constructor(
        code: string,
        name: string,
        popularity: number,
        fractionOfPepts: number,
        affectedPeptides: string[]
    ) {
        super(name, popularity);
        this.code = code;
        this.popularity = popularity;
        this.fractionOfPepts = fractionOfPepts;
        this.affectedPeptides = affectedPeptides;
    }

    public async computeCrossPopularity(x: Element, dataRepository: DataRepository): Promise<number> {
        // We need to count how many of the affected peptides of the element x are also annotated with this GO-term.
        const otherAffectedPeptides: string[] = await x.getAffectedPeptides(dataRepository);
        // Count how many items from x's affected peptides are also part of these affected peptides.
        // TODO If we are certain that all affected peptides are always sorted, we can implement a more efficient
        // approach to this problem
        return otherAffectedPeptides.reduce((acc: number, current: string) => acc + (this.affectedPeptides.includes(current) ? 1 : 0), 0);
    }

    public async getAffectedPeptides(dataRepository: DataRepository): Promise<string[]> {
        return this.affectedPeptides;
    }
}
