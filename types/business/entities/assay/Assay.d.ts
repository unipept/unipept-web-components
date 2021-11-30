import AssayVisitor from "./AssayVisitor";
import Visitable from "./../../visitor/Visitable";
export default abstract class Assay implements Visitable<AssayVisitor> {
    id: string;
    private name;
    private date;
    protected constructor(id?: string);
    getId(): string;
    getName(): string;
    setName(name: string): void;
    getDate(): Date;
    setDate(date: Date): void;
    abstract accept(visitor: AssayVisitor): Promise<void>;
}
