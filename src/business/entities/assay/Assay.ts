import AssayVisitor from "./AssayVisitor";
import Visitable from "./../../visitor/Visitable";
import { v4 as uuidv4 } from "uuid";

export default abstract class Assay implements Visitable<AssayVisitor> {
    private name: string = "";
    private date: Date = new Date();

    protected constructor(
        public id: string = uuidv4()
    ) {}

    public getId(): string {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getDate() {
        return this.date;
    }

    public setDate(date: Date) {
        this.date = date;
    }

    abstract accept(visitor: AssayVisitor): Promise<void>;
}

