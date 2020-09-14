import ChangeListener from "./../ChangeListener";
import AssayVisitor from "./AssayVisitor";
import Visitable from "./../../visitor/Visitable";
export default abstract class Assay implements Visitable<AssayVisitor> {
    id: string;
    private name;
    private date;
    private changeListeners;
    protected constructor(id: string);
    addChangeListener(listener: ChangeListener<Assay>): void;
    getId(): string;
    getName(): string;
    setName(name: string): void;
    getDate(): Date;
    setDate(date: Date): void;
    protected onUpdate(field: string, oldValue: any, newValue: any): void;
    abstract accept(visitor: AssayVisitor): Promise<void>;
}
