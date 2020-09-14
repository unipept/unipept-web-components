import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";
export default class BrowserStorageWriter extends BrowserAssayVisitor {
    visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void>;
    private toDateString;
}
