import AssayVisitor from "./../../../entities/assay/AssayVisitor";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
export default abstract class BrowserAssayVisitor implements AssayVisitor {
    protected readonly browserStorage: Storage;
    constructor(browserStorage: Storage);
    abstract visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void>;
}
