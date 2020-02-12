import Visitable from "./../../patterns/visitor/Visitable";
import StudyVisitor from "./visitors/StudyVisitor";
import Assay from "../assay/Assay";
import Entity from "../assay/Entity";

export default class Study implements Visitable<StudyVisitor>, Entity<string> {
    private readonly assays: Assay[] = [];
    private name: string;
    private id: string;

    public getId(): string {
        return this.id;
    }

    public setId(id: string) {
        this.id = id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getAssays(): Assay[] {
        return this.assays;
    }

    public setAssays(assays: Assay[]) {
        // We guarantee that the initial Assay-array in this object stays the same throughout the lifetime of this
        // object.
        this.assays.splice(0, this.assays.length);
        assays.push(...assays);
    }

    public async accept(visitor: StudyVisitor): Promise<void> {
        visitor.visitStudy(this);
    }
}
