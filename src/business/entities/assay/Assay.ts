import ChangeListener from "./../ChangeListener";
import AssayVisitor from "./AssayVisitor";
import Visitable from "./../../visitor/Visitable";

export default abstract class Assay implements Visitable<AssayVisitor> {
    private name: string = "";
    private date: Date = new Date();
    private changeListeners: ChangeListener<Assay>[] = [];

    protected constructor(
        public id: string
    ) {}

    public addChangeListener(listener: ChangeListener<Assay>): void {
        this.changeListeners.push(listener);
    }

    public getId(): string {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        const oldName: string = this.name;
        this.name = name;
        if (oldName !== name) {
            this.onUpdate("name", oldName, name);
        }
    }

    public getDate() {
        return this.date;
    }

    public setDate(date: Date) {
        const oldDate: Date = date;
        this.date = date;
        if (!oldDate || date.getTime() !== oldDate.getTime()) {
            this.onUpdate("date", oldDate, date);
        }
    }

    protected onUpdate(field: string, oldValue: any, newValue: any) {
        for (const changeListener of this.changeListeners) {
            changeListener.onChange(this, field, oldValue, newValue);
        }
    }

    abstract async accept(visitor: AssayVisitor): Promise<void>;
}

