import { CountTable } from "@/business/counts/CountTable";
import Visitable from "@/logic/patterns/visitor/Visitable";

export default abstract class Assay implements Visitable<AssayVisitor> {
    protected constructor(
        public readonly changeListeners: ChangeListener<Assay>[],
        public readonly id: string,
        protected name?: string,
        protected date?: Date,
    ) {}

    public getId(): string {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        const oldName: string = this.name;
        this.name = name;
        this.onUpdate("name", oldName, name);
    }

    public getDate() {
        return this.date;
    }

    public setDate(date: Date) {
        const oldDate: Date = date;
        this.date = date;
        this.onUpdate("date", oldDate, date);
    }

    protected onUpdate(field: string, oldValue: any, newValue: any) {
        for (const changeListener of this.changeListeners) {
            changeListener.onChange(this, field, oldValue, newValue);
        }
    }

    abstract async accept(visitor: AssayVisitor): Promise<void>;
}

