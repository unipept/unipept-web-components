import StudyVisitor from "./StudyVisitor";
import Assay from "./../assay/Assay";
import Visitable from "./../../visitor/Visitable";
import { v4 as uuidv4 } from "uuid";

export default class Study implements Visitable<StudyVisitor> {
    protected readonly assays: Assay[] = [];

    protected name: string = "";

    constructor(
        protected readonly id: string = uuidv4()
    ) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
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

    public addAssay(assay: Assay): void {
        this.assays.push(assay);
    }

    public async removeAssay(assay: Assay) {
        const idx: number = this.assays.findIndex((val) => val.getId() === assay.getId());
        if (idx >= 0) {
            this.assays.splice(idx, 1);
        }
    }

    public async accept(visitor: StudyVisitor): Promise<void> {
        await visitor.visitStudy(this);
    }
}
