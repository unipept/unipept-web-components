import Visitable from "./../../patterns/visitor/Visitable";
import StudyVisitor from "src/logic/data-management/study/StudyVisitor";
import Assay from "../assay/Assay";
import Entity from "../assay/Entity";
import uuidv4 from "uuid/v4";
import ChangeListener from "@/logic/data-management/ChangeListener";

export default abstract class Study implements Visitable<StudyVisitor>, Entity<string> {
    protected readonly assays: Assay[] = [];
    protected name: string;
    protected id: string;
    protected changeListener: ChangeListener;

    constructor(changeListener: ChangeListener, id?: string, name?: string) {
        if (this.id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }
        this.name = name;
        this.changeListener = changeListener;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
        this.changeListener.onChange("name");
    }

    public getId(): string {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
        this.changeListener.onChange("id");
    }

    public getAssays(): Assay[] {
        return this.assays;
    }

    public addAssay(assay: Assay): void {
        this.assays.push(assay);
        this.changeListener.onChange("assays");
    }

    public async removeAssay(assay: Assay) {
        const idx: number = this.assays.findIndex((val) => val.getId() === assay.getId());
        if (idx >= 0) {
            this.assays.splice(idx, 1);
        }
        this.changeListener.onChange("assays");
    }

    public async accept(visitor: StudyVisitor): Promise<void> {
        await visitor.visitStudy(this);
    }
}
