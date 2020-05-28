import StudyVisitor from "./StudyVisitor";
import Assay from "./../assay/Assay";
import ChangeListener from "./../ChangeListener";
import Visitable from "./../../visitor/Visitable";

export default class Study implements Visitable<StudyVisitor> {
    protected readonly assays: Assay[] = [];
    protected readonly changeListeners: ChangeListener<Study>[] = [];

    protected name: string = "";

    constructor(
        protected readonly id: string
    ) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public addChangeListener(listener: ChangeListener<Study>) {
        this.changeListeners.push(listener);
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        const oldName: string = this.name;
        this.name = name;
        if (oldName != name) {
            this.onUpdate( "name", oldName, name);
        }
    }

    public getAssays(): Assay[] {
        return this.assays;
    }

    public addAssay(assay: Assay): void {
        this.assays.push(assay);
        this.onUpdate("add-assay", null, assay);
    }

    public async removeAssay(assay: Assay) {
        const idx: number = this.assays.findIndex((val) => val.getId() === assay.getId());
        if (idx >= 0) {
            this.assays.splice(idx, 1);
        }
        this.onUpdate("delete-assay", assay, null);
    }

    public async accept(visitor: StudyVisitor): Promise<void> {
        await visitor.visitStudy(this);
    }

    protected onUpdate(field: string, oldValue: any, newValue: any): void {
        for (const changeListener of this.changeListeners) {
            changeListener.onChange(this, field, oldValue, newValue);
        }
    }
}
