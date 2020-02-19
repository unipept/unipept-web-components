import Visitable from "./../../patterns/visitor/Visitable";
import StudyVisitor from "./StudyVisitor";
import Assay from "../assay/Assay";
import Entity from "../assay/Entity";
import uuidv4 from "uuid/v4";
import ChangeListener from "./../ChangeListener";


export default class Study implements Visitable<StudyVisitor>, Entity<string> {
    protected readonly assays: Assay[] = [];
    protected name: string;
    protected id: string;
    protected changeListener: ChangeListener<Study>;

    constructor(changeListener: ChangeListener<Study>, id?: string, name?: string) {
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
        const oldName: string = this.name;
        this.name = name;
        this.changeListener.onChange(this, "name", oldName, name);
    }

    public getId(): string {
        return this.id;
    }

    public setId(id: string): void {
        const oldId: string = this.id;
        this.id = id;
        this.changeListener.onChange(this, "id", oldId, id);
    }

    public getAssays(): Assay[] {
        return this.assays;
    }

    public addAssay(assay: Assay): void {
        this.assays.push(assay);
        // TODO improve this
        this.changeListener.onChange(this, "assays", [], []);
    }

    public async removeAssay(assay: Assay) {
        const idx: number = this.assays.findIndex((val) => val.getId() === assay.getId());
        if (idx >= 0) {
            this.assays.splice(idx, 1);
        }
        // TODO Improve this
        this.changeListener.onChange(this, "assays", [], []);
    }

    public async accept(visitor: StudyVisitor): Promise<void> {
        await visitor.visitStudy(this);
    }
}
