import StudyVisitor from "./StudyVisitor";
import Assay from "./../assay/Assay";
import Visitable from "./../../visitor/Visitable";
export default class Study implements Visitable<StudyVisitor> {
    protected readonly id: string;
    protected readonly assays: Assay[];
    protected name: string;
    constructor(id?: string);
    getId(): string;
    getName(): string;
    setName(name: string): void;
    getAssays(): Assay[];
    addAssay(assay: Assay): void;
    removeAssay(assay: Assay): Promise<void>;
    accept(visitor: StudyVisitor): Promise<void>;
}
