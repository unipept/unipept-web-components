import AssayVisitor from "./../../../entities/assay/AssayVisitor";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";

export default abstract class BrowserAssayVisitor implements AssayVisitor {
    public constructor(protected readonly browserStorage: Storage) {}

    public abstract async visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void>;
}
